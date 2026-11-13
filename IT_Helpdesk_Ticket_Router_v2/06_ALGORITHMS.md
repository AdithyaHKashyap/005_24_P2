# 06 — Algorithms and Core Rules
## IT Helpdesk Ticket Router

## 1. Identifier format from the brief
The photographed brief specifies a pattern equivalent to:

`DEPT-ISSUE-PRIORITY`

The example format used in this plan is:
`CS-101-H`

- Exactly two uppercase letters.
- Hyphen.
- Exactly three digits.
- Hyphen.
- One priority character: H, M or L.

**Total length: 8 characters.**

### Regex
```regex
^[A-Z]{2}-[0-9]{3}-[HML]$
```

### DFA states
- q0: start.
- q1: first uppercase letter.
- q2: second uppercase letter.
- q3: first hyphen.
- q4: first digit.
- q5: second digit.
- q6: third digit.
- q7: second hyphen.
- q8: H, M or L — accepting state.
- Any invalid transition goes to a dead/reject state. Any character after q8 is rejected.

DFA and Regex must be tested against the same input set. Do not use a length of 9; the sample pattern is 8 characters.

## 2. Classification
Exactly five categories:
1. Hardware
2. Software
3. Network
4. Access
5. Other

The supplied images do not provide a complete official issue-code mapping. The team must create and approve a mapping table before coding. Sample mappings such as 101 → Hardware must be treated as examples only until approved.

Classification requirements:
- Every valid report returns exactly one category.
- Unknown but valid issue codes return Other if that is the approved policy.
- Overlapping keyword/code rules use a documented precedence.
- Store the matched rule and rule version for explainability.

## 3. Routing table
Recommended logical route key: `(departmentCode, category)`.

Each route should define:
- Department.
- Category.
- Zone.
- Preferred team.
- Ordered backup teams.
- Escalation destination.
- Active/inactive state.

An example route table used during discussion is illustrative and must be confirmed. Do not treat it as an official institution routing policy.

## 4. Dispatch algorithm
The brief specifies four teams, round-robin dispatch, a maximum of eight open tickets per team, availability checks and Level-2 escalation.

Recommended process:
1. Reject invalid identifiers before dispatch.
2. Prevent a second active assignment for the same report.
3. Find the route for department/category.
4. Apply approved emergency/critical priority override.
5. Build candidate teams from preferred team and ordered backups.
6. Exclude unavailable teams.
7. Exclude teams whose open-ticket count is at capacity.
8. Select the next eligible candidate using the approved round-robin rule.
9. Atomically reserve capacity and create one active assignment.
10. If no eligible team exists, place in waiting queue or escalate to Level-2 according to approved policy.
11. Record the route, selected team, reason and timestamp.

## 5. Resolve the routing/round-robin interaction
The routing table and round-robin must not contradict each other.

Recommended interpretation:
- Routing table decides which team(s) are eligible for a department/category/zone.
- Round-robin rotates among that route's eligible team pool.
- Preferred team is tried first according to the agreed rotation; backups are tried in their configured order.
- If no candidate is eligible, queue or escalate.

If faculty expects global round-robin across all four teams, document that instead. Do not silently ignore the preferred team in the routing table.

## 6. Priority and queue policy
The brief requires a priority override for emergency/critical cases but does not fully specify the exact rule.

Proposed queue order:
1. Critical/emergency (if approved).
2. High.
3. Medium.
4. Low.
5. Earlier submission time first.
6. Report ID ascending as deterministic tie-breaker.

Confirm whether the project uses only H/M/L or also a separate Critical level.

## 7. Status lifecycle
Proposed states:
- Pending: submitted but awaiting routing/assignment.
- Assigned: allocated to a team/handler.
- In Progress: work started.
- Resolved: issue completed.

Every status transition must record old state, new state, actor, timestamp and optional note. Reopening/resubmission rules require approval.
