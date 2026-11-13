# 02 — UI/UX Design Specification
## IT Helpdesk Ticket Router

**Design status:** Functional specification; visual styling can be applied after workflows are approved.

## 1. Design principles
- Make the next action obvious for each role.
- Show why a report was routed, queued or escalated.
- Keep forms short and provide inline validation.
- Use consistent status/priority labels.
- Do not rely on colour alone to communicate status.
- Design responsive layouts: cards on mobile, dense tables on desktop.

## 2. Navigation / sitemap
- `/login` — sign in.
- `/reports/new` — submit a new issue.
- `/dashboard` — reporter dashboard.
- `/reports/:reportId` — report details and event timeline.
- `/handler` — handler dashboard.
- `/routing` — routing management (admin role).
- `/analytics` — analytics dashboard (authorised roles).

Navigation items must be role-aware. A reporter must not see admin-only navigation.

## 3. Shared application shell
- Top bar: application name, current user's name/role, profile and sign-out.
- Side navigation on desktop; compact menu on mobile.
- Main content: page title, short explanatory text and page actions.
- Consistent loading skeleton, empty state, error state and success feedback.
- Breadcrumbs on detail/admin pages where useful.

## 4. Page specifications

### A. Report Submission Page
**Purpose:** Capture a report and return a clear outcome.

Fields:
- Reporter name and contact (pre-fill from account where possible).
- Department (configured dropdown).
- Structured identifier.
- Issue description.
- Issue code only if it is not already encoded in the identifier.
- Priority/urgency (use approved values).

Interactions:
1. Required fields are checked before submit.
2. Identifier validation runs and shows valid/invalid plus reason.
3. Show detected category and matched classification rule.
4. On submit, show generated report ID.
5. Show one outcome: Assigned, Pending in fallback queue, Waiting for capacity, or Escalated.
6. Show zone/team/handler only if confirmed by the server.
7. Preserve entered data after recoverable network errors.

States: idle, editing, validating, invalid, ready, submitting, assigned, queued, escalated, server error.

### B. Reporter Dashboard
Components:
- Summary cards: total, pending, assigned, resolved.
- Search by report ID.
- Reports table: report ID, submitted date, category, priority, status, assigned team/handler.
- Report detail link and status timeline.
- Empty state with a clear “Submit a report” action.

Permissions: a reporter sees only their own reports unless a broader permission is explicitly granted.

### C. Handler Dashboard
Components:
- Workload summary: open, in progress and resolved.
- Assigned reports list.
- Filters: status, category, zone, priority.
- Columns: report ID, category, zone, priority, submitted time, status.
- Report detail panel with description and assignment history.
- Status update action with valid transition choices.
- Availability control and capacity display if permitted.

Rules: a handler cannot edit routing rules; handlers cannot assign reports to themselves unless the final role policy allows it.

### D. Routing Management Dashboard
Components:
- Routing table: department, category, zone, preferred team, ordered backups, active state.
- Team/handler load: open count, capacity, availability.
- Fallback queue and escalation queue.
- Assignment history with reason and timestamp.
- Priority override decisions.
- Admin actions with confirmation and audit trail.

### E. Analytics Dashboard
Components:
- Reports by category.
- Reports by zone.
- Resolved vs unresolved.
- Filters by date, category, zone and priority.
- Charts with labels and text/table alternatives.
- All figures must come from database queries, not hard-coded demo values.

## 5. Report detail page
Show:
- Unique report ID and created time.
- Reporter and department.
- Identifier validation result (DFA and Regex).
- Category and matched classification rule.
- Priority and policy applied.
- Routing key and matched routing rule.
- Zone, team/handler or queue destination.
- Current status.
- Chronological event history (submission, validation, classification, routing, assignment, reassignment, status changes).

## 6. Status and priority presentation
Proposed statuses:
- Pending — awaiting routing/assignment.
- Assigned — assigned to a team/handler.
- In Progress — work has started.
- Resolved — issue completed.

Priority values should be the exact values approved for the project. If using Low/Medium/High, display both text and a visual indicator. If Critical is introduced, document how it differs from High.

## 7. Error and edge-case UX
- Invalid identifier: show expected format and the exact failed part.
- Unknown route: say “Report placed in central fallback queue” and explain why.
- Team full/unavailable: show waiting, backup assignment or escalation outcome.
- Duplicate submission: return the existing report reference where idempotency applies.
- Permission denied: explain that the user lacks access without revealing restricted data.
- Server/network error: retain form values and offer retry.

## 8. Accessibility
- Persistent labels for every input.
- Logical keyboard order and visible focus.
- Buttons have clear action labels.
- Tables have meaningful column headers.
- Charts include accessible summaries.
- Validation feedback is associated with the relevant field.
- Status and priority are never indicated by colour alone.

## 9. Responsive behaviour
- Mobile: single-column form, summary cards wrap, report rows become cards or an explicitly scrollable table.
- Tablet: two-column dashboard where practical.
- Desktop: full navigation, summary cards and data tables.
- Avoid fixed page widths and controls that require hover to discover.
