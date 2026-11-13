# 09 — Decisions and Assumptions Register
## Resolve before implementation

| ID | Open question | Recommended default | Why it matters |
|---|---|---|---|
| D01 | MERN or Flask + SQLite? | MERN provisionally; ask faculty | The brief contradicts itself. |
| D02 | Is identifier exactly `AA-999-H`? | Two uppercase letters, hyphen, three digits, hyphen, H/M/L; 8 characters | Determines DFA and Regex. |
| D03 | Is the structured identifier also the report's unique ID? | Keep generated `reportId` separate unless faculty says otherwise | Avoid identifier collisions and ambiguity. |
| D04 | What is the official issue-code mapping? | Obtain/approve a table; do not invent | Classification correctness depends on it. |
| D05 | What departments and zones are valid? | Use an approved configuration list | Routing keys depend on it. |
| D06 | How does round-robin interact with preferred team? | Rotate only among eligible teams in the matched route's pool | Prevents routing table from being ignored. |
| D07 | Does every High ticket go to Level-2? | Confirm; do not assume | The brief says emergency/critical override but does not define every priority case. |
| D08 | What if preferred team is full/unavailable? | Try ordered backups, then queue/escalate | Defines fallback behaviour. |
| D09 | Capacity of 8 applies to team or individual handler? | Team, as the brief states; confirm | Changes data model and dispatch logic. |
| D10 | Are there only H/M/L priorities or a separate Critical level? | Use H/M/L unless approved otherwise | Affects validation, UI and queue ordering. |
| D11 | Who can change handler availability/capacity? | Handler changes own availability; admin controls capacity | Security and permissions. |
| D12 | What statuses and transitions are allowed? | Pending → Assigned → In Progress → Resolved | Controls status API and UI. |
| D13 | Can a resolved report be reopened? | No, unless explicitly approved | Avoids undefined lifecycle. |
| D14 | What reporter details are compulsory? | Collect only name/contact needed for the project | Avoid unnecessary personal data. |
| D15 | Is authentication required for reporters? | Use login if required by faculty; otherwise define safe submission identity | Affects scope and access control. |

## Approval record
For every decision, record:
- Decision ID.
- Selected option.
- Reason.
- Approved by (faculty/team).
- Date.
- Documents/code that need updating.

## Assumptions currently used in this pack
- MERN is provisional, not confirmed.
- The sample identifier `CS-101-H` has eight characters.
- Exactly five categories are required.
- Four teams and eight open tickets per team come from the brief.
- Example department/category routing rows discussed earlier are illustrative, not official policy.
- Priority override, route pool and backup order require approval.
