# 05 — REST API Specification
## Proposed API contract

Base URL: `/api/v1`  
Format: JSON  
Authentication: protected endpoints require an authenticated session/token and role authorisation.

## Authentication
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/login` | Sign in | Public |
| POST | `/auth/logout` | Sign out | Authenticated |
| GET | `/auth/me` | Current user and role | Authenticated |

## Reports
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/reports` | Validate, classify, route and create report | Reporter |
| GET | `/reports` | List/filter reports | Role-filtered |
| GET | `/reports/:reportId` | Report details | Owner/handler/admin |
| GET | `/reports/:reportId/events` | Assignment/status timeline | Owner/handler/admin |
| PATCH | `/reports/:reportId/status` | Update status | Assigned handler/admin |
| POST | `/reports/:reportId/reassign` | Reassign with reason | Routing admin |

## Handlers
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/handlers` | List handlers | Role-filtered |
| PATCH | `/handlers/:id/availability` | Set availability | Handler/admin |
| PATCH | `/handlers/:id/capacity` | Change capacity | Admin |
| GET | `/handlers/:id/workload` | Current workload | Handler/admin |

## Routing and queues
| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/routing-rules` | View routing table | Admin/authorised handler |
| POST | `/routing-rules` | Add route | Routing admin |
| PATCH | `/routing-rules/:id` | Update route | Routing admin |
| GET | `/queues/fallback` | View unknown-route queue | Routing admin |
| GET | `/queues/escalated` | View escalated reports | Routing admin/Level-2 |

## Analytics
- `GET /analytics/summary`
- `GET /analytics/categories`
- `GET /analytics/zones`
- `GET /analytics/statuses`

## Example report creation request
```json
{
  "departmentCode": "CS",
  "identifier": "CS-101-H",
  "description": "Desktop in the computer lab does not start",
  "priority": "High"
}
```

The server must derive/verify category, zone and assignment. Do not trust client-supplied `category`, `team`, `handler`, `zone` or `status`.

## Example response (illustrative)
```json
{
  "reportId": "ITR-2026-000123",
  "validation": {
    "dfaAccepted": true,
    "regexAccepted": true,
    "valid": true
  },
  "category": "Hardware",
  "routing": {
    "outcome": "assigned",
    "zone": "Lab",
    "teamCode": "A",
    "reason": "Matched configured routing rule"
  },
  "status": "Assigned"
}
```

## Error response convention
```json
{
  "error": {
    "code": "INVALID_IDENTIFIER",
    "message": "Identifier does not match the required format.",
    "details": []
  }
}
```

Use appropriate HTTP status codes, pagination, server-side filtering and validation. Never return stack traces or sensitive configuration.
