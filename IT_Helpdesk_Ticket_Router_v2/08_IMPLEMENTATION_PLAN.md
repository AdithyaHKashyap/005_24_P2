# 08 — Implementation Plan
## Build sequence and team coordination

## Phase 0 — Requirements approval
Deliverables:
- Confirm MERN vs Flask/SQLite.
- Confirm exact identifier format and field ownership.
- Approve department list and issue-code/category mapping.
- Approve routing table, zones, teams and backups.
- Approve priority override and overflow policy.
- Approve roles and status transitions.

Exit gate: blocking decisions in `09_DECISIONS_AND_ASSUMPTIONS.md` are resolved.

## Phase 1 — Repository and foundation
- Create Git repository and agreed folder structure.
- Set up frontend/backend projects.
- Configure linting, formatting, environment variables and error handling.
- Connect database.
- Create health endpoint and base application shell.

Deliverable: app starts locally and database connection is verified.

## Phase 2 — Core academic algorithms
- Implement DFA.
- Implement equivalent Regex.
- Create a shared test corpus and prove agreement.
- Implement five-category classification and precedence.
- Implement routing lookup.
- Implement dispatch, availability, capacity, backup, queue and escalation.

Deliverable: independently tested core logic.

## Phase 3 — Persistence and API
- Create database models and indexes.
- Implement authentication and role middleware.
- Implement report creation/detail/list endpoints.
- Persist assignment and status events.
- Implement handler, routing and analytics endpoints.

Deliverable: API tested independently of the UI.

## Phase 4 — Frontend interfaces
1. Report submission page.
2. Reporter dashboard and report detail.
3. Handler dashboard.
4. Routing management dashboard.
5. Analytics dashboard.

Deliverable: responsive pages connected to real APIs.

## Phase 5 — Integration and quality
- Test complete submission-to-resolution flow.
- Test all 25 baseline cases.
- Test permissions and invalid inputs.
- Test duplicate and concurrent dispatch.
- Test capacity boundary (7, 8, 9 open reports).
- Verify analytics against stored data.

Deliverable: stable demonstrable application.

## Phase 6 — Deployment and presentation
- Prepare `.env.example` and setup instructions.
- Seed safe demo users, handlers, routes and sample reports.
- Deploy frontend, backend and database.
- Prepare screenshots, test evidence and demo script.
- Rehearse fallback, unavailable-handler, overflow and emergency scenarios.

## Suggested four-member split
| Member | Primary responsibility | Shared integration point |
|---|---|---|
| 1 | DFA, Regex, classification and unit tests | Agreed validation/classification contract |
| 2 | Routing, dispatch, capacity, queue and escalation | Agreed route/dispatch service contract |
| 3 | Backend APIs, database, authentication and integration | API and data model |
| 4 | React UI, dashboards, responsive design | API contracts and shared components |

If the team has fewer members, combine adjacent workstreams. All members should use the same agreed field names, enums and API contracts.
