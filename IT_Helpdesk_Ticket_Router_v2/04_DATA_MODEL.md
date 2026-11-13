# 04 — Data Model
## Proposed MongoDB schema

The schemas below are a logical starting point. Field names may be adjusted during implementation, but preserve the relationships and constraints.

## 1. `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Display name |
| `email` | String | Unique login |
| `passwordHash` | String | Never store plaintext |
| `role` | Enum | reporter, handler, routing_admin, system_admin |
| `departmentCode` | String | Optional department |
| `handlerId` | ObjectId | Optional handler profile reference |
| `isActive` | Boolean | Account enabled |
| `createdAt`, `updatedAt` | Date | Timestamps |

## 2. `handlers`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | Reference to users |
| `teamCode` | String | A/B/C/D or configured code |
| `zone` | String | Handler's operational zone |
| `categories` | Array | Categories handled |
| `isAvailable` | Boolean | Availability |
| `capacity` | Number | Default 8 per brief, subject to confirmation |
| `createdAt`, `updatedAt` | Date | Timestamps |

## 3. `reports`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `reportId` | String | Unique human-readable ID |
| `reporterId` | ObjectId | User reference |
| `departmentCode` | String | Department |
| `identifier` | String | Structured identifier |
| `issueCode` | String | Extracted or supplied issue code |
| `description` | String | User's problem description |
| `priority` | Enum | Approved priority values |
| `category` | Enum | Exactly five allowed categories |
| `validation` | Object | DFA result, Regex result, final result, reason |
| `classification` | Object | Matched rule and rule version |
| `routing` | Object | Route key, zone, preferred team, selected team, decision reason |
| `status` | Enum | Pending, Assigned, In Progress, Resolved |
| `assignedTeamCode` | String/null | Current team |
| `assignedHandlerId` | ObjectId/null | Current handler |
| `createdAt`, `updatedAt` | Date | Timestamps |
| `resolvedAt` | Date/null | Resolution time |

## 4. `routingRules`
- `departmentCode`
- `category`
- `zone`
- `preferredTeamCode`
- `backupTeamCodes` (ordered array)
- `isActive`
- `priorityPolicyKey`
- `createdAt`, `updatedAt`

Use a unique compound index on the approved route key (initially department + category).

## 5. `assignmentEvents`
- `reportId`
- `teamCode`
- `handlerId` (optional)
- `eventType`: assigned, reassigned, queued, escalated, unassigned
- `reason`
- `actorId` (user or system)
- `createdAt`

## 6. `statusEvents`
- `reportId`
- `fromStatus`
- `toStatus`
- `changedBy`
- `note`
- `createdAt`

## 7. `auditLogs`
- `actorId`
- `action`
- `entityType`
- `entityId`
- `before` and `after` snapshots where appropriate
- `createdAt`

## 8. Indexes and integrity rules
- Unique: `users.email`.
- Unique: `reports.reportId`.
- Unique: `routingRules` route key.
- Query indexes: reporter + createdAt; assigned handler + status; status + priority + createdAt; category + zone.
- At most one active assignment per report.
- Capacity must be checked atomically during assignment.
- Keep assignment/status events append-only.
- Reconcile workload counts against active reports; do not trust a stale counter.
- Restrict access to reporter details based on role.
