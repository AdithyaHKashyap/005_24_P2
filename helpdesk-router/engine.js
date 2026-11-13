// Part A (BCS503) and routing-pool logic (BCS502). Pure functions, no database access.
const DEPTS = { CS: 'North Block', EE: 'North Block', ME: 'South Block', CE: 'South Block', AD: 'Admin Block', HR: 'Admin Block', FN: 'Admin Block', LB: 'Library Wing' };
const ZONES = ['North Block', 'South Block', 'Admin Block', 'Library Wing'];
const CATS = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
const ORDER = ['Network', 'Access', 'Hardware', 'Software', 'Other']; // deterministic conflict rule
const TEAM_IDS = ['HD1', 'HD2', 'HD3', 'HD4'];
const PW = { H: 0, M: 1, L: 2 };
const KW = {
  Network: /\b(wi-?fi|network|internet|lan|vpn|outage|router|switch|ethernet)\b/i,
  Access: /\b(password|login|log in|access|account|locked|permission|credential)s?\b/i,
  Hardware: /\b(laptop|computer|pc|screen|monitor|keyboard|mouse|printer|battery|disk|ram|hardware)s?\b/i,
  Software: /\b(install\w*|software|licen[sc]e|app|update|crash\w*|office)s?\b/i,
};

// Equivalent regular expression for DEPT[2-alpha]-ISSUE[3-digit]-PRIORITY[H/M/L]
const RX = /^[A-Z]{2}-[0-9]{3}-[HML]$/;

// DFA: q0..q7 plus accepting q8; any other move goes to the dead state 'X'
const EXP = ['the first department letter (A–Z)', 'the second department letter (A–Z)', '“-” after the department', 'the first issue digit', 'the second issue digit', 'the third issue digit', '“-” after the issue code', 'a priority letter: H, M or L', 'the end of the identifier'];
const isA = c => c >= 'A' && c <= 'Z', isD = c => c >= '0' && c <= '9';
function dfaStep(s, c) {
  if (s === 0 || s === 1) return isA(c) ? s + 1 : 'X';
  if (s === 2 || s === 6) return c === '-' ? s + 1 : 'X';
  if (s >= 3 && s <= 5) return isD(c) ? s + 1 : 'X';
  if (s === 7) return 'HML'.includes(c) ? 8 : 'X';
  return 'X';
}
function dfaRun(s) {
  let q = 0;
  for (let i = 0; i < s.length; i++) {
    const n = dfaStep(q, s[i]);
    if (n === 'X') return { ok: false, reason: `Unexpected “${s[i]}” at position ${i + 1}; expected ${EXP[q]}` };
    q = n;
  }
  return q === 8 ? { ok: true } : { ok: false, reason: s ? `Incomplete identifier; expected ${EXP[q]}` : 'Identifier is empty' };
}

function classify(issue, desc) {
  const n = +issue, base = n >= 100 && n < 600 ? CATS[Math.floor(n / 100) - 1] : null;
  if (!base) return { category: null, reason: `Issue code ${issue} is not in the code map (100–599)` };
  const m = new Set([base]);
  for (const c of ORDER.slice(0, 4)) if (KW[c].test(desc)) m.add(c);
  const hit = ORDER.find(c => m.has(c));
  return { category: hit, reason: m.size > 1 ? `Patterns [${[...m].join(', ')}] matched → ${hit} by priority order` : `Issue code ${issue} → ${hit}` };
}

// Routing table: (category, zone) -> pool of two helpdesks, served round-robin
const pool = (cat, zone) => {
  const i = CATS.indexOf(cat), j = ZONES.indexOf(zone);
  return [TEAM_IDS[i % 4], TEAM_IDS[(i + 1 + j % 3) % 4]];
};

module.exports = { DEPTS, ZONES, CATS, TEAM_IDS, PW, RX, dfaRun, classify, pool };
