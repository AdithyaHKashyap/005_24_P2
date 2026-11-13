# IT Helpdesk Ticket Router

**Academic & Enterprise Hackathon Project**  
**Architecture:** Node.js, Express, MongoDB (Mongoose), Minimalist Notion-Inspired Workspace  
**Status:** Production Ready & Live on `http://localhost:4000`

---

## Quick Start (Run in 30 Seconds)

```bash
cd helpdesk-router
npm install
npm start
```
Then open: **[http://localhost:4000](http://localhost:4000)**

Click **"Load Demo"** in the topbar to immediately populate 14 realistic tickets across all 5 categories, test the slide-over drawer, inspect the 40 MongoDB routing rules, and monitor team capacities (max 8 open tickets).

---

## Directory Overview

* [`helpdesk-router/`](file:///c:/Users/haris/Desktop/Hackathon/helpdesk-router) — Production application (backend, MongoDB models, dispatch engine, Notion-inspired frontend).
  * [`helpdesk-router/server.js`](file:///c:/Users/haris/Desktop/Hackathon/helpdesk-router/server.js) — REST API, Mongoose schemas (`Ticket`, `Team`, `RoutingRule`, `Reject`), dispatch logic.
  * [`helpdesk-router/engine.js`](file:///c:/Users/haris/Desktop/Hackathon/helpdesk-router/engine.js) — Pure algorithmic engine: DFA validator ($q_0 \to q_8$), equivalent Regex, 5-category classifier with precedence.
  * [`helpdesk-router/public/index.html`](file:///c:/Users/haris/Desktop/Hackathon/helpdesk-router/public/index.html) — Premium Notion-style minimalist workspace (Home, My Tickets, Submit Report, Handler Desk, Routing Database, Analytics, Settings).
* [`docs/`](file:///c:/Users/haris/Desktop/Hackathon/docs) — Architecture, design specifications, and audit documents:
  * [`docs/NOTION_INSPIRED_DESIGN.md`](file:///c:/Users/haris/Desktop/Hackathon/docs/NOTION_INSPIRED_DESIGN.md) — Comprehensive UI/UX redesign specification.
  * [`docs/UI_AND_SYSTEM_AUDIT.md`](file:///c:/Users/haris/Desktop/Hackathon/docs/UI_AND_SYSTEM_AUDIT.md) — Multi-agent system audit & database inspection report.
  * [`docs/REQUIREMENTS_TRACEABILITY.md`](file:///c:/Users/haris/Desktop/Hackathon/docs/REQUIREMENTS_TRACEABILITY.md) — Requirements traceability matrix (FR-01 to FR-20).
  * [`docs/DECISIONS.md`](file:///c:/Users/haris/Desktop/Hackathon/docs/DECISIONS.md) — Architectural decisions and conflict resolutions register.
  * [`docs/BUILD_STATUS.md`](file:///c:/Users/haris/Desktop/Hackathon/docs/BUILD_STATUS.md) — Task and build progress log.
* [`IT_Helpdesk_Ticket_Router_v2/`](file:///c:/Users/haris/Desktop/Hackathon/IT_Helpdesk_Ticket_Router_v2) — Baseline requirements pack (PRD, Design, Architecture, Data Model, API Spec, Algorithms, Test Plan).

---

## Verified Core Requirements

1. **DFA & Regex Identifier Validation:** Exactly 8 characters `^[A-Z]{2}-[0-9]{3}-[HML]$` (DFA $q_0 \to q_8$ and Regex agree on all inputs).
2. **Exactly 5 Issue Categories:** Hardware, Software, Network, Access, Other (with strict precedence: Network > Access > Hardware > Software > Other).
3. **Explicit Database Routing Table:** 40 MongoDB rules mapping department and category to zones, preferred teams, and backups.
4. **4 Helpdesk Teams with 8-Ticket Capacity Limit:** Teams HD1–HD4 strictly capped at 8 open tickets; Level-2 escalation capped at 10.
5. **Round-Robin Scheduling & Priority Overrides:** Round-robin allocation within the eligible route pool; High-priority Network issues route directly to Level-2.
6. **Central Fallback & Waiting Queues:** Handles unmapped requests with one-click operator reassignment.
7. **Notion-Inspired Workspace UI:** Warm neutral palette, collapsible sidebar, search (`/`), property filters, slide-over ticket drawer, light/dark themes, and zero academic clutter.
