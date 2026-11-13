# 07 — Test Plan
## Minimum requirement: 15 documented test cases

This plan contains 25 baseline tests. Confirm expected behaviour against the final approved rules.

| ID | Module | Input/scenario | Expected result |
|---|---|---|---|
| T01 | DFA/Regex | `CS-101-H` | Both accept |
| T02 | DFA/Regex | `IT-202-M` | Both accept |
| T03 | DFA/Regex | `EC-303-L` | Both accept |
| T04 | DFA/Regex | `C-101-H` | Both reject |
| T05 | DFA/Regex | `CS-12-H` | Both reject |
| T06 | DFA/Regex | `CS-101-X` | Both reject |
| T07 | DFA/Regex | `cs-101-h` | Both reject |
| T08 | DFA/Regex | `CS-101-HX` | Both reject |
| T09 | Classification | Known Hardware mapping | Hardware |
| T10 | Classification | Known Software mapping | Software |
| T11 | Classification | Known Network mapping | Network |
| T12 | Classification | Known Access mapping | Access |
| T13 | Classification | Valid unmapped issue code | Other, if approved |
| T14 | Classification | Two rules match | Documented precedence wins |
| T15 | Routing | Configured department/category | Expected zone and eligible team |
| T16 | Routing | Unknown route key | Central fallback queue with reason |
| T17 | Dispatch | Preferred team available and below capacity | Assigned according to policy |
| T18 | Dispatch | Preferred team unavailable | Backup or queue/escalation |
| T19 | Dispatch | Team already has 8 open reports | Team is skipped |
| T20 | Dispatch | All teams at capacity | Queue or Level-2 escalation |
| T21 | Priority | Emergency/critical report | Approved override is applied |
| T22 | Duplicate | Same report dispatched twice | No duplicate active assignment |
| T23 | Concurrency | Two reports compete for final capacity slot | Capacity is not exceeded |
| T24 | Status | Handler updates Assigned → In Progress | Persisted and visible to reporter |
| T25 | Analytics | Report becomes Resolved | Resolved count/chart updates |

## End-to-end demonstration script
1. Sign in as a reporter.
2. Submit a valid identifier and issue description.
3. Show DFA and Regex acceptance.
4. Show detected category and priority.
5. Show routing-table match and zone.
6. Show team assignment, fallback or escalation reason.
7. Sign in as the assigned handler.
8. Change status to In Progress, then Resolved.
9. Return to reporter dashboard and verify status.
10. Open analytics and verify the resolved count changed.

## Test evidence to capture
- Input and expected result.
- Actual result.
- Pass/fail.
- Screenshot or log reference.
- Test date and tester.
