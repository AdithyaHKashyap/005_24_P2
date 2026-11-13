# Requirements Traceability Matrix (RTM)

**Project:** IT Helpdesk Ticket Router  
**Baseline Documentation:** `IT_Helpdesk_Ticket_Router_v2` (`01_PRD.md` through `09_DECISIONS_AND_ASSUMPTIONS.md`)  
**Existing Prototype Inspected:** `helpdesk-router/` (`server.js`, `engine.js`, `public/index.html`)

---

## 1. Traceability Table

| Req ID | Requirement Description | Source Doc | Existing Prototype Status | Production Target Architecture | Verification Test |
|---|---|---|---|---|---|
| **FR-01** | Report Submission (Reporter name, dept, identifier, issue code/description, priority) | `01_PRD.md` §6, `02_DESIGN.md` §4A | Basic form in `helpdesk-router/public/index.html` | React form with real-time DFA validation, category preview, error banners | T01–T08, E2E Demo |
| **FR-02** | Structured Identifier Validation (DFA + Regex) | `01_PRD.md` §6, `06_ALGORITHMS.md` §1 | Implemented in `helpdesk-router/engine.js` (`dfaRun`, `RX`) | Dual validation: Node.js server engine + standalone Python script (`scripts/dfa_regex_demo.py`) | T01–T08 |
| **FR-03** | Validator Agreement (DFA and Regex agree on all inputs) | `01_PRD.md` §6, `07_TEST_PLAN.md` T01–T08 | Implemented in JS unit tests | Node.js test suite (`jest`/`mocha`) & Python test runner proving 100% agreement | T01–T08 |
| **FR-04** | 5-Category Classification (Hardware, Software, Network, Access, Other) | `01_PRD.md` §6, `06_ALGORITHMS.md` §2 | Implemented in `engine.js` (`classify`) with issue code 100–599 & keywords | Formalised classifier service with explainable match logging and database rule linkage | T09–T13 |
| **FR-05** | Conflict Resolution Precedence | `01_PRD.md` §6, `06_ALGORITHMS.md` §2 | `ORDER = ['Network', 'Access', 'Hardware', 'Software', 'Other']` | Explicit precedence engine returning matched rules array and winning category | T14 |
| **FR-06** | Explicit Routing Table Lookup | `01_PRD.md` §6, `04_DATA_MODEL.md` §4 | Algorithmic in `engine.js` (formula-based `pool`) | Persistent `routingRules` MongoDB collection with admin CRUD APIs | T15, T16 |
| **FR-07** | Dispatch Scheduling (Round-robin among eligible pool) | `01_PRD.md` §6, `06_ALGORITHMS.md` §4 | Round-robin with state stored in `Meta` collection | State-backed round-robin pointer per route key with deterministic backup traversal | T17, T18 |
| **FR-08** | Capacity Enforcement (Max 8 open tickets per team) | `01_PRD.md` §6, `06_ALGORITHMS.md` §4 | Checked via `eligible()` and team `cap: 8` | Atomic MongoDB reservation preventing race condition overflows | T19, T20, T23 |
| **FR-09** | Handler/Team Availability Enforcement | `01_PRD.md` §6, `05_API_SPEC.md` | Checked via team `avail: boolean` | `handlers` & `teams` availability toggle via API, excluding unavailable handlers | T18 |
| **FR-10** | Priority Override (Emergency / Critical / High Network) | `01_PRD.md` §6, `06_ALGORITHMS.md` §6 | High network -> L2 in `server.js` | Configurable priority policy (Critical / High Network -> Level-2 emergency bypass) | T21 |
| **FR-11** | Fallback & Escalation Queues | `01_PRD.md` §6, `06_ALGORITHMS.md` §4 | Fallback on unmapped dept/code; overflow -> L2 / waiting | Central Fallback Queue (unknown routes) & Escalated Queue (L2 / overflow) | T16, T20 |
| **FR-12** | Duplicate Assignment Protection | `01_PRD.md` §6, `04_DATA_MODEL.md` §8 | String search on `Ticket.findOne` | Database unique constraints + atomic assignment lock (`assignmentEvents`) | T22 |
| **FR-13** | Deterministic Queue Ordering | `01_PRD.md` §6, `06_ALGORITHMS.md` §6 | `qcmp` (priority weight then ticket ID) | Priority rank (Critical > High > Medium > Low) -> createdAt ASC -> reportId ASC | T20 |
| **FR-14** | Status Lifecycle Tracking | `01_PRD.md` §6, `06_ALGORITHMS.md` §7 | Pending, Assigned, In Progress, Resolved in `server.js` | Strict state transitions with `statusEvents` audit trail and timestamp capture | T24 |
| **FR-15** | Reporter Dashboard | `01_PRD.md` §6, `02_DESIGN.md` §4B | Merged in prototype HTML | Dedicated responsive view with search, filter, and ticket detail timeline modal | E2E Demo |
| **FR-16** | Handler Dashboard | `01_PRD.md` §6, `02_DESIGN.md` §4C | Basic handler card in prototype | Handler workload view, availability switch, status transition action | T24 |
| **FR-17** | Routing Management Dashboard | `01_PRD.md` §6, `02_DESIGN.md` §4D | Basic team toggle in prototype | Routing table manager, team load indicators, queue inspection, override logs | T15, T16 |
| **FR-18** | Analytics Dashboard | `01_PRD.md` §6, `02_DESIGN.md` §4E | Simple stat boxes in prototype | Category breakdown, zone distribution, resolved vs unresolved charts | T25 |
| **FR-19** | Persistent Storage & Event History | `01_PRD.md` §6, `04_DATA_MODEL.md` | Single `Ticket` doc with log string array | Normalized MongoDB schema: `users`, `handlers`, `reports`, `routingRules`, `events` | T24, T25 |
| **FR-20** | Auditability & Access Control | `01_PRD.md` §6, `04_DATA_MODEL.md` §7 | No auth in prototype | JWT-based authentication + role middleware (`reporter`, `handler`, `admin`) | Security Test |
