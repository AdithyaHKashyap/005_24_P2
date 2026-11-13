# 03 — System Architecture
## IT Helpdesk Ticket Router

## 1. Technology decision (provisional)
**Proposed:** React + Node.js + Express + MongoDB (MERN).

**Important:** The source brief also says “Flask backend and SQLite database” in Question 10. Faculty/team must confirm one stack before implementation. Do not build two backends by accident.

Python may be used as a standalone academic DFA/Regex comparison script if the production backend is MERN. If Flask is selected, Python can host the validation and dispatch services directly.

## 2. High-level architecture
```text
Reporter / Handler / Admin Browser
              |
           React UI
              |
       HTTPS REST API
              |
      Node.js + Express
              |
  +-----------+------------+
  | Auth / Role Middleware |
  +-----------+------------+
              |
  +-----------v------------+
  | Report Workflow Service|
  | 1. Validate            |
  | 2. Classify            |
  | 3. Route lookup        |
  | 4. Dispatch            |
  | 5. Persist decision    |
  +-----------+------------+
              |
      MongoDB Database
              |
  Reports / Users / Teams /
  Routing Rules / Events /
  Audit Logs
```

## 3. Backend modules
- `auth`: login, token/session handling, role checks.
- `reports`: create, read, search and status changes.
- `validation`: DFA, Regex and agreement check.
- `classification`: five-category rules and precedence.
- `routing`: routing table lookup and rule administration.
- `dispatch`: eligibility, round-robin, capacity, backup and escalation.
- `queue`: waiting/fallback queue and deterministic ordering.
- `handlers`: availability and workload.
- `analytics`: summary and distribution queries.
- `audit`: immutable history of important decisions.

## 4. Report processing sequence
1. Authenticate user and verify permission.
2. Validate required request fields.
3. Validate identifier with DFA and Regex.
4. Reject malformed identifier with a field-level reason.
5. Classify report into exactly one category.
6. Determine priority from approved input/policy.
7. Look up routing rule.
8. If no route exists, persist to central fallback queue with reason.
9. Apply emergency/critical override if policy says so.
10. Build eligible team/handler candidates.
11. Exclude unavailable candidates and candidates at capacity.
12. Select a candidate according to the approved preferred-team/round-robin policy.
13. Atomically reserve capacity and create one active assignment.
14. If no candidate exists, queue or escalate according to policy.
15. Persist report, decision events and audit event.
16. Return report ID and outcome to UI.

## 5. Concurrency and data integrity
- Dispatch runs on the server only.
- Use a MongoDB transaction or atomic conditional update to reserve capacity.
- Ensure only one active assignment per report.
- Use idempotency keys for report creation where practical.
- Use unique indexes for report IDs and route keys.
- Use stable queue sorting: priority rank, submission time, report ID.
- Reconcile stored workload counts against active assignments.
- Do not rely on a browser-side or in-memory counter as the source of truth.

## 6. Security
- Hash passwords using a reputable password hashing library.
- Enforce role checks on every protected endpoint.
- Validate and sanitise request data.
- Store secrets in environment variables.
- Configure CORS to trusted frontend origins.
- Rate-limit login and public report creation.
- Do not expose stack traces or secrets in responses.
- Audit routing edits, reassignments and administrative actions.

## 7. Suggested repository layout
```text
it-helpdesk-ticket-router/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   └── package.json
├── scripts/
│   └── dfa_regex_demo.py
├── tests/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

## 8. Deployment
- Deploy React frontend and API separately or behind one reverse proxy.
- Use a managed MongoDB service or local MongoDB for development.
- Configure secrets separately per environment.
- Provide a health-check endpoint.
- Seed safe demo accounts, routing rules, handlers and sample tickets.
- Never include real passwords or production secrets in the repository.
