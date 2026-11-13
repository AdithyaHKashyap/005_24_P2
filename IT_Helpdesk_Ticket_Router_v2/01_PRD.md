# 01 — Product Requirements Document (PRD)
## IT Helpdesk Ticket Router

| Field | Value |
|---|---|
| Version | 2.0 |
| Status | Draft for team/faculty approval |
| Product type | Responsive web application |
| Primary outcome | Validated, classified, routed and tracked IT helpdesk reports |

## 1. Executive summary
The IT Helpdesk Ticket Router is a web application for submitting IT issues and automatically directing each valid report to an appropriate helpdesk team. It validates a structured identifier using a Deterministic Finite Automaton (DFA) and an equivalent regular expression, classifies the issue into exactly five categories, consults an explicit routing table, checks handler availability and capacity, and assigns, queues or escalates the report. Users and handlers can track progress through role-specific dashboards.

## 2. Problem and opportunity
Manual helpdesk assignment can cause delays, inconsistent categorisation and uneven team workloads. A centralised workflow makes validation consistent, makes routing decisions explainable, avoids assigning work to unavailable or full teams, and gives reporters visibility into progress.

## 3. Goals
- Validate the required ticket identifier format with both DFA and Regex.
- Demonstrate that DFA and Regex produce identical outcomes for the test corpus.
- Classify each accepted report into exactly one of five categories.
- Use an explicit, configurable routing/dispatch table.
- Support four helpdesk teams and a maximum of eight open tickets per team, as specified in the brief.
- Check handler/team availability and capacity before assignment.
- Support priority override, backup/fallback handling and Level-2 escalation.
- Prevent duplicate active assignments.
- Provide the five interfaces required by the brief.
- Persist reports, assignment decisions and status history.
- Prepare at least 15 documented test cases; this plan provides 25.

## 4. Users and roles
### Reporter / staff member
Submits an issue, receives a unique report ID, searches for a report and views its status and assigned team/handler.

### Helpdesk handler
Views assigned work, filters by category/zone/priority/status, updates status and changes own availability if permitted.

### Routing administrator
Views routing rules, team loads, backups, fallback queue and escalations. Maintains routing configuration if authorised.

### System administrator
Manages accounts, roles, departments, teams and system configuration.

## 5. Scope

### In scope
- Report submission form.
- Structured identifier validation (DFA + Regex).
- Five-category classification.
- Explicit department/category-to-zone/team routing.
- Round-robin/backup dispatch according to the final approved policy.
- Four teams; capacity of eight open reports per team.
- Availability and capacity checking.
- Priority override and Level-2 escalation.
- Unknown-route fallback queue.
- Duplicate prevention and deterministic queue ordering.
- Reporter, handler, routing management and analytics dashboards.
- Persistent database storage and event history.
- Responsive interface and deployment-ready project.

### Out of scope for first version
- AI/ML-based classification.
- Mobile native app.
- Email/SMS/WhatsApp notifications unless separately requested.
- Complex SLA calendars and working-hour calculations.
- Multi-tenant support.
- Automatic integrations with college ERP or external ticketing systems.

## 6. Functional requirements

| ID | Requirement | Expected behaviour |
|---|---|---|
| FR-01 | Submit report | Collect reporter details, department, identifier, issue details and urgency/priority. |
| FR-02 | Validate identifier | Run DFA and Regex; reject malformed identifiers and show the reason. |
| FR-03 | Compare validators | DFA and Regex must agree for all validation test inputs. |
| FR-04 | Classify report | Assign exactly one of Hardware, Software, Network, Access or Other. |
| FR-05 | Resolve conflicts | Apply documented, deterministic classification precedence when rules overlap. |
| FR-06 | Routing lookup | Match the approved routing key and return zone, preferred team and backup route. |
| FR-07 | Dispatch | Select an eligible team/handler using approved scheduling rules. |
| FR-08 | Capacity check | Do not assign new work to a team already at its open-ticket capacity. |
| FR-09 | Availability check | Do not assign new work to unavailable handlers/teams. |
| FR-10 | Priority override | Apply the emergency/critical rule approved for this project. |
| FR-11 | Fallback/escalation | Unknown routes go to a visible central fallback queue; no eligible handler results in queue or Level-2 escalation according to policy. |
| FR-12 | Duplicate protection | A report can have no more than one active assignment. |
| FR-13 | Queue ordering | Process waiting reports using a deterministic priority/time/tie-break rule. |
| FR-14 | Status tracking | Track Pending, Assigned, In Progress and Resolved states. |
| FR-15 | Reporter dashboard | Show totals, status counts, report search, status and assigned handler/team. |
| FR-16 | Handler dashboard | Show assigned reports and allow authorised status/availability updates. |
| FR-17 | Routing dashboard | Show routing table, loads, backups, queue and escalation decisions. |
| FR-18 | Analytics dashboard | Show zone/category distributions and resolved/unresolved counts/charts. |
| FR-19 | Persistence | Save reports and all material assignment/status decisions. |
| FR-20 | Auditability | Record who/what changed a report, route, assignment or status and when. |

## 7. Business rules
1. Exactly five categories are permitted: Hardware, Software, Network, Access and Other.
2. `Other` is a valid classification. It is not the same as an unknown route.
3. A malformed identifier is rejected before classification or dispatch.
4. An unknown routing key is retained in a central fallback queue with a reason; it is not silently discarded.
5. The brief specifies four helpdesk teams and a maximum of eight open tickets per team.
6. A team at capacity or marked unavailable is ineligible for new assignments.
7. High/emergency priority behaviour must follow the policy approved by the team/faculty. Do not assume all High tickets must go to Level-2 without confirmation.
8. Every assignment, reassignment, queue or escalation outcome must have a recorded reason.
9. Queue ordering must be deterministic when reports arrive together.
10. The server, not the browser, makes the final classification and assignment decision.

## 8. Non-functional requirements
- Responsive desktop, tablet and mobile layout.
- Role-based access control for protected pages and API routes.
- Server-side validation for all important inputs.
- Passwords stored only as secure password hashes.
- Secrets stored in environment variables and excluded from Git.
- Clear API errors without exposing stack traces or secrets.
- Assignment/capacity updates protected against concurrent requests.
- Accessible labels, keyboard navigation, visible focus and status text (not colour alone).
- Pagination and filtering for report lists.
- UTC timestamps stored consistently and localised for display.
- Setup guide, sample data and reproducible demo accounts.

## 9. Acceptance criteria
The product is acceptable when:
- Valid examples are accepted and malformed examples rejected.
- DFA and Regex agree on the same test corpus.
- Every valid report receives exactly one category.
- A configured route produces the expected zone/team decision.
- Unknown routes enter fallback with a reason.
- Unavailable/full teams are not assigned new reports.
- No team exceeds the configured open-ticket capacity.
- Priority override follows the approved rule.
- Duplicate/concurrent requests cannot create multiple active assignments.
- Status changes persist and appear on relevant dashboards.
- Analytics reflect persisted report data.
- At least 15 tests pass.
- The full demonstration works: submit → validate → classify → route → assign/queue/escalate → update status → resolve.

## 10. Risks
- The brief's MERN vs Flask/SQLite conflict can cause rework.
- Missing official issue-code/category mapping can cause inconsistent classification.
- Round-robin may conflict with the preferred team in the routing table unless its meaning is defined.
- A simplistic in-memory capacity counter can over-assign during simultaneous requests; database-level protection is required.
- The emergency priority rule is not fully specified in the brief.
