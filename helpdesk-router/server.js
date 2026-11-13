const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const E = require('./engine');

const { Schema, model } = mongoose;
const opts = { id: false, versionKey: false };

const EventSchema = new Schema({
  type: { type: String, default: 'update' },
  label: String,
  note: String,
  time: { type: Date, default: Date.now }
}, { _id: false });

const AttachmentSchema = new Schema({
  name: String,
  type: String,
  size: Number,
  data: String // Base64 data URI
}, { _id: false });

const Ticket = model('Ticket', new Schema({
  id: { type: String, unique: true },
  name: String,
  email: String,
  code: String,
  dept: String,
  issue: String,
  priority: String,
  desc: String,
  zone: String,
  category: String,
  status: { type: String, default: 'Pending' },
  team: { type: String, default: null },
  queue: { type: String, default: null },
  log: [String],
  events: [EventSchema],
  attachments: [AttachmentSchema],
  validation: String,
  created: { type: Date, default: Date.now },
  assigned: Date,
  resolved: Date,
}, opts));

const Team = model('Team', new Schema({
  id: { type: String, unique: true },
  avail: { type: Boolean, default: true },
  cap: { type: Number, default: 8 }
}, opts));

const RoutingRule = model('RoutingRule', new Schema({
  dept: String,
  category: String,
  zone: String,
  preferred: String,
  backups: [String],
  isActive: { type: Boolean, default: true }
}, opts));

const Meta = model('Meta', new Schema({
  key: { type: String, unique: true },
  val: Schema.Types.Mixed
}, opts));

const Reject = model('Reject', new Schema({
  code: String,
  reason: String,
  time: { type: Date, default: Date.now }
}, opts));

// Server-Sent Events (SSE) Client Pool for Live Real-Time Multi-Client Sync
const sseClients = new Set();
function broadcastSync(event = 'sync', data = {}) {
  const payload = `data: ${JSON.stringify({ event, ...data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Serialise writes so concurrent requests preserve deterministic ordering and capacity integrity
let chain = Promise.resolve();
const exclusive = fn => {
  const r = chain.then(fn);
  chain = r.catch(() => {});
  return r;
};

const ACTIVE = ['Assigned', 'In Progress'];
const openCount = id => Ticket.countDocuments({ team: id, status: { $in: ACTIVE } });
const eligible = async id => {
  const m = await Team.findOne({ id });
  return !!m && m.avail && (await openCount(id)) < m.cap;
};
const qcmp = (a, b) => E.PW[a.priority] - E.PW[b.priority] || a.id.localeCompare(b.id);

function addEvent(t, type, label, note) {
  if (!t.events) t.events = [];
  t.events.push({ type, label, note, time: new Date() });
}

async function dispatch(t) {
  let p = null;
  // Look up explicit routing rule from database first
  const rule = await RoutingRule.findOne({ dept: t.dept, category: t.category, isActive: true });
  if (rule && rule.preferred) {
    p = [rule.preferred, ...(rule.backups || [])];
  } else {
    p = E.pool(t.category, t.zone);
  }

  const key = `${t.category}-${E.ZONES.indexOf(t.zone)}`;
  const L = [];
  let pick = null;

  // 1. High priority Network emergency override to Level-2
  if (t.priority === 'H' && t.category === 'Network' && await eligible('L2')) {
    pick = 'L2';
    const msg = 'Priority override: high-priority network issue routed directly to Level-2';
    L.push(msg);
    addEvent(t, 'override', 'Priority Override Applied', msg);
  }

  // 2. Round-robin within the eligible pool
  if (!pick) {
    const m = await Meta.findOne({ key: 'rr' });
    const s = (m && m.val && m.val[key]) || 0;
    const poolCandidates = p.slice(0, 2);
    for (let k = 0; k < poolCandidates.length && !pick; k++) {
      const id = poolCandidates[(s + k) % poolCandidates.length];
      if (await eligible(id)) {
        pick = id;
        const msg = `Round-robin allocation in pool ${poolCandidates.join(' / ')} → ${id}`;
        L.push(msg);
        addEvent(t, 'dispatch', 'Round-Robin Assignment', msg);
        await Meta.updateOne({ key: 'rr' }, { $set: { ['val.' + key]: (s + k + 1) % poolCandidates.length } }, { upsert: true });
      }
    }
  }

  // 3. Fallback to backup helpdesk teams
  if (!pick) {
    for (const id of E.TEAM_IDS) {
      if (!p.includes(id) && await eligible(id)) {
        pick = id;
        const msg = `Pool full or unavailable → assigned to backup ${id}`;
        L.push(msg);
        addEvent(t, 'backup', 'Backup Team Fallback', msg);
        break;
      }
    }
  }

  // 4. Overflow escalation to Level-2
  if (!pick && await eligible('L2')) {
    pick = 'L2';
    const msg = 'Tier-1 capacity full → overflow escalated to Level-2';
    L.push(msg);
    addEvent(t, 'escalate', 'Escalated to Level-2', msg);
  }

  // 5. Place in Waiting Queue if all teams are at capacity
  if (!pick) {
    if (t.queue !== 'waiting') {
      const msg = 'All eligible teams at maximum capacity (8 tickets) → placed in Waiting Queue';
      t.log.push(msg);
      addEvent(t, 'queue', 'Queued in Waiting Queue', msg);
    }
    Object.assign(t, { queue: 'waiting', team: null, status: 'Pending' });
    return t.save();
  }

  Object.assign(t, { team: pick, queue: null, status: 'Assigned', assigned: new Date() });
  t.log.push(...L);
  return t.save();
}

const promote = async () => {
  const waiting = (await Ticket.find({ queue: 'waiting' })).sort(qcmp);
  for (const t of waiting) {
    await dispatch(t);
  }
};

async function submit(f) {
  const name = (f.name || '').trim();
  const desc = (f.desc || '').trim();
  const code = (f.code || '').trim().toUpperCase();

  if (!name || !desc) {
    return { ok: false, reason: 'Name and description are required.' };
  }

  const r = E.dfaRun(code);
  if (!r.ok || !E.RX.test(code)) {
    await Reject.create({ code, reason: r.reason });
    broadcastSync('reject', { code, reason: r.reason });
    return { ok: false, reason: r.reason };
  }

  const dup = await Ticket.findOne({ code, name, desc, status: { $ne: 'Resolved' } });
  if (dup) {
    return { ok: false, reason: `Duplicate report: an open ticket already exists (${dup.id}).` };
  }

  const [dept, issue, pr] = code.split('-');
  const c = E.classify(issue, desc);
  const seq = (await Meta.findOneAndUpdate({ key: 'seq' }, { $inc: { val: 1 } }, { upsert: true, new: true })).val;

  const t = new Ticket({
    id: 'TKT-' + String(seq).padStart(4, '0'),
    name,
    email: f.email || '',
    code,
    dept,
    issue,
    priority: pr,
    desc,
    zone: E.DEPTS[dept] || null,
    category: c.category,
    attachments: Array.isArray(f.attachments) ? f.attachments : [],
    log: [c.reason],
    events: [
      { type: 'created', label: 'Ticket Submitted', note: `Submitted by ${name} (${dept})`, time: new Date() },
      { type: 'validated', label: 'Identifier Validated', note: 'DFA and Regex agreement verified format AA-999-H', time: new Date() },
      { type: 'classified', label: 'Classification Complete', note: c.reason, time: new Date() }
    ],
    validation: 'Accepted (DFA and Regex agree)'
  });

  if (Array.isArray(f.attachments) && f.attachments.length > 0) {
    addEvent(t, 'attachment', 'File Attached', `${f.attachments.length} attachment(s) uploaded (${f.attachments.map(a => a.name).join(', ')})`);
  }

  if (!t.zone || !t.category) {
    t.queue = 'fallback';
    const reason = !t.zone
      ? `Unknown department "${dept}" → routed to Central Fallback Queue`
      : `Unmapped issue code "${issue}" → routed to Central Fallback Queue`;
    t.log.push(reason);
    addEvent(t, 'fallback', 'Routed to Fallback Queue', reason);
    await t.save();
  } else {
    await dispatch(t);
  }

  broadcastSync('ticket_created', { ticketId: t.id });
  return { ok: true, ticket: t.toObject() };
}

const seedTeams = async force => {
  await Promise.all([...E.TEAM_IDS, 'L2'].map(id =>
    Team.updateOne(
      { id },
      { [force ? '$set' : '$setOnInsert']: { avail: true, cap: id === 'L2' ? 10 : 8 } },
      { upsert: true }
    )
  ));
};

const seedRoutingRules = async force => {
  const count = await RoutingRule.countDocuments();
  if (count === 0 || force) {
    if (force) await RoutingRule.deleteMany();
    const rules = [];
    for (const [dept, zone] of Object.entries(E.DEPTS)) {
      for (const cat of E.CATS) {
        const poolTeams = E.pool(cat, zone);
        rules.push({
          dept,
          category: cat,
          zone,
          preferred: poolTeams[0],
          backups: [poolTeams[1], ...E.TEAM_IDS.filter(id => !poolTeams.includes(id))],
          isActive: true
        });
      }
    }
    await RoutingRule.insertMany(rules);
  }
};

const app = express();
app.use(express.json({ limit: '10mb' })); // Support base64 file attachments up to 10MB
app.use(express.static(path.join(__dirname, 'public')));

const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ ok: false, reason: e.message }));

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write('data: {"event":"connected"}\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

app.get('/api/state', wrap(async (req, res) => {
  const [tickets, teams, rejects, rules] = await Promise.all([
    Ticket.find().sort({ created: -1 }).lean(),
    Team.find().lean(),
    Reject.find().sort({ time: -1 }).limit(50).lean(),
    RoutingRule.find().sort({ dept: 1, category: 1 }).lean()
  ]);
  res.json({
    tickets,
    rejects,
    teams: Object.fromEntries(teams.map(t => [t.id, { avail: t.avail, cap: t.cap }])),
    routingRules: rules
  });
}));

// Export Tickets as Clean CSV
app.get('/api/tickets/export/csv', wrap(async (req, res) => {
  const tickets = await Ticket.find().sort({ created: -1 }).lean();
  const headers = ['ID', 'Identifier', 'Reporter', 'Email', 'Department', 'Zone', 'Category', 'Priority', 'Status', 'AssignedTeam', 'Queue', 'Created', 'Resolved'];
  const rows = tickets.map(t => [
    t.id,
    t.code,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    t.email || '',
    t.dept,
    t.zone || '',
    t.category || '',
    t.priority,
    t.status,
    t.team || '',
    t.queue || '',
    t.created ? new Date(t.created).toISOString() : '',
    t.resolved ? new Date(t.resolved).toISOString() : ''
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="helpdesk-tickets.csv"');
  res.send(csv);
}));

app.post('/api/tickets', wrap(async (req, res) => {
  const r = await exclusive(() => submit(req.body || {}));
  res.status(r.ok ? 201 : 400).json(r);
}));

app.patch('/api/tickets/:id', wrap(async (req, res) => {
  const st = req.body.status;
  if (!['Assigned', 'In Progress', 'Resolved'].includes(st)) {
    return res.status(400).json({ ok: false, reason: 'Invalid status transition' });
  }
  const t = await exclusive(async () => {
    const t = await Ticket.findOne({ id: req.params.id });
    if (!t) return null;
    const oldSt = t.status;
    const note = req.body.note ? `: ${req.body.note}` : '';

    // Handle reopening from Resolved
    if (oldSt === 'Resolved' && st !== 'Resolved') {
      t.resolved = null;
      addEvent(t, 'reopen', `Ticket Reopened (${st})`, `Reopened from Resolved state to ${st}${note}`);
      t.log.push(`Ticket reopened: Resolved → ${st}`);
    } else {
      addEvent(t, 'status', `Status changed to ${st}`, `Transitioned from ${oldSt} to ${st}${note}`);
      t.log.push(`Status updated: ${oldSt} → ${st}`);
    }

    t.status = st;
    if (st === 'Resolved') {
      t.resolved = new Date();
      if (req.body.resolutionSummary) {
        addEvent(t, 'resolution', 'Resolution Summary', req.body.resolutionSummary);
      }
    }

    await t.save();
    if (st === 'Resolved') await promote();
    broadcastSync('ticket_updated', { ticketId: t.id, status: st });
    return t;
  });
  t ? res.json({ ok: true, ticket: t }) : res.status(404).json({ ok: false, reason: 'Ticket not found' });
}));

app.post('/api/tickets/:id/reassign', wrap(async (req, res) => {
  const targetTeam = req.body.team;
  if (![...E.TEAM_IDS, 'L2'].includes(targetTeam)) {
    return res.status(400).json({ ok: false, reason: 'Invalid target team' });
  }
  const t = await exclusive(async () => {
    const t = await Ticket.findOne({ id: req.params.id });
    if (!t) return null;
    const prevDesc = t.team ? `Team ${t.team}` : t.queue ? `${t.queue} queue` : 'Unassigned';
    t.team = targetTeam;
    t.queue = null;
    t.status = 'Assigned';
    t.assigned = new Date();
    const reason = req.body.reason || 'Manual reassignment by operator';
    const msg = `Reassigned from ${prevDesc} to ${targetTeam} (${reason})`;
    t.log.push(msg);
    addEvent(t, 'reassign', `Reassigned to ${targetTeam}`, msg);
    await t.save();
    broadcastSync('ticket_reassigned', { ticketId: t.id, team: targetTeam });
    return t;
  });
  t ? res.json({ ok: true, ticket: t }) : res.status(404).json({ ok: false, reason: 'Ticket not found' });
}));

app.patch('/api/teams/:id', wrap(async (req, res) => {
  const b = req.body;
  const u = {};
  if (typeof b.avail === 'boolean') u.avail = b.avail;
  if (Number.isInteger(b.cap) && b.cap >= 0) u.cap = b.cap;
  await exclusive(async () => {
    await Team.updateOne({ id: req.params.id }, u);
    await promote();
    broadcastSync('team_updated', { teamId: req.params.id });
  });
  res.json({ ok: true });
}));

app.get('/api/routing-rules', wrap(async (req, res) => {
  const rules = await RoutingRule.find().sort({ dept: 1, category: 1 }).lean();
  res.json({ ok: true, rules });
}));

app.patch('/api/routing-rules/:id', wrap(async (req, res) => {
  const { preferred, backups, isActive } = req.body;
  const u = {};
  if (preferred) u.preferred = preferred;
  if (Array.isArray(backups)) u.backups = backups;
  if (typeof isActive === 'boolean') u.isActive = isActive;
  await RoutingRule.findByIdAndUpdate(req.params.id, u);
  broadcastSync('rules_updated', { ruleId: req.params.id });
  res.json({ ok: true });
}));

app.post('/api/demo', wrap(async (req, res) => {
  let n = 0;
  for (const it of (req.body.items || [])) {
    await exclusive(() => submit(it));
    n++;
  }
  broadcastSync('demo_seeded', { count: n });
  res.json({ ok: true, count: n });
}));

app.post('/api/reset', wrap(async (req, res) => {
  await exclusive(async () => {
    await Promise.all([
      Ticket.deleteMany(),
      Reject.deleteMany(),
      Meta.deleteMany()
    ]);
    await seedTeams(true);
    await seedRoutingRules(true);
    broadcastSync('reset_completed', {});
  });
  res.json({ ok: true });
}));

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/helpdesk')
  .then(async () => {
    await seedTeams(false);
    await seedRoutingRules(false);
    app.listen(PORT, () => console.log(`Helpdesk Router running on http://localhost:${PORT}`));
  })
  .catch(e => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
