# Architectural Decisions and Assumptions Register

**Project:** IT Helpdesk Ticket Router  
**Status:** Submitted for Approval (Stage 0 Gate)

---

## 1. Summary of Identified Conflicts and Analysis

### Conflict 1: MERN Stack vs. Flask + SQLite
- **Source Conflict:** Question 8 and the final suggested tech stack in the academic brief specify **MERN Stack** (MongoDB, Express, React, Node.js). Question 10 in the same brief states **Flask backend and SQLite database**.
- **Analysis:**
  - The existing prototype in `helpdesk-router/` already runs on **Node.js + Express + MongoDB** (Mongoose).
  - The brief mentions MERN in multiple sections (Q8, Suggested Tech Stack, Final Presentation).
  - Python is strictly required for the academic Automata (DFA & Regex) validation deliverable.
- **Proposed Resolution (Decision D01):**
  - **Adopt the MERN Stack** for the production web application (Node.js/Express REST API + MongoDB persistence + React responsive frontend).
  - **Preserve the academic Python requirement** by providing a dedicated, fully tested Python script (`scripts/dfa_regex_demo.py`) that implements the exact identical DFA, Regex, and test suite, proving 100% agreement between Python, Node.js, and Regex engines.
  - This satisfies both the MERN requirement and the academic Python evaluation requirement without conflict.

---

### Conflict 2: In-Memory / Formula Routing vs. Explicit Database Routing Table
- **Source Conflict:** PRD FR-06, FR-17 and Architecture require an **explicit, configurable routing table** with administration UI. The current prototype (`engine.js`) hardcodes a mathematical modulo index formula `pool(cat, zone)`.
- **Proposed Resolution (Decision D04/D05):**
  - Implement an explicit `routingRules` collection in MongoDB with fields: `departmentCode`, `category`, `zone`, `preferredTeamCode`, `backupTeamCodes` (ordered array), `isActive`.
  - Provide seed data for all departments (`CS`, `EE`, `ME`, `CE`, `AD`, `HR`, `FN`, `LB`) and categories (`Hardware`, `Software`, `Network`, `Access`, `Other`).
  - Provide admin endpoints to view and modify routing rules via the Routing Management Dashboard.

---

### Conflict 3: Ticket Identifier Structure & Length
- **Source Conflict:** The brief specifies `DEPT-ISSUE-PRIORITY`, with example `CS-101-H`.
- **Analysis:**
  - Format: Two uppercase letters (`[A-Z]{2}`), hyphen (`-`), three digits (`[0-9]{3}`), hyphen (`-`), priority (`[HML]`).
  - Total exact length: **8 characters** (e.g. `CS-101-H`).
  - DFA states: $q_0 \to q_8$ (9 states total: $q_0$ initial, $q_8$ accepting, plus dead state $X$).
- **Proposed Resolution (Decision D02):**
  - Strictly enforce length 8 and regex `^[A-Z]{2}-[0-9]{3}-[HML]$`.
  - Separate system-generated unique ID (`TKT-0001` / `ITR-2026-000123`) from the submitted ticket identifier (`CS-101-H`) to avoid collision across multiple reports for the same machine/room.

---

### Conflict 4: Classification Rule Precedence and Scope
- **Source Conflict:** Reports can match both issue code ranges and description keywords (e.g., issue code 101 [Hardware] with description "Wi-Fi not working" [Network]).
- **Proposed Resolution (Decision D04):**
  - Issue Code primary ranges:
    - `100–199` $\to$ Hardware
    - `200–299` $\to$ Software
    - `300–399` $\to$ Network
    - `400–499` $\to$ Access
    - `500–599` $\to$ Other
  - If description keywords match additional categories, apply the strict precedence order:
    $$\text{Network} > \text{Access} > \text{Hardware} > \text{Software} > \text{Other}$$
  - The decision event and audit log record all matched categories and the precedence rule applied for explainability.

---

### Conflict 5: Helpdesk Team Topology, Capacity & Round-Robin Interaction
- **Source Conflict:** The brief specifies 4 helpdesk teams (`HD1`, `HD2`, `HD3`, `HD4`) with max capacity 8 open tickets each, plus Level-2 escalation team (`L2`), and round-robin scheduling.
- **Proposed Resolution (Decision D06/D08/D09):**
  - 4 Tier-1 Teams: `HD1`, `HD2`, `HD3`, `HD4` (capacity: 8 open tickets each).
  - 1 Tier-2 Team: `L2` (escalation capacity: 10).
  - Round-robin rotates only across the *eligible pool* defined by the matched routing rule for `(departmentCode, category)`.
  - If the preferred team is at capacity (= 8) or unavailable, dispatch falls back to configured backup teams.
  - If all eligible teams are unavailable or at capacity, the report is escalated to `L2` or placed in the priority-sorted waiting queue.

---

### Conflict 6: Priority Override Policy
- **Source Conflict:** The brief mandates emergency/critical priority overrides, but does not specify every edge case.
- **Proposed Resolution (Decision D07/D10):**
  - High (`H`) priority Network outages immediately bypass Tier-1 and route directly to Level-2 (`L2`) escalation team.
  - Waiting queue orders by: Priority weight ($H=0, M=1, L=2$) $\to$ submission timestamp (oldest first) $\to$ ticket ID ascending (deterministic tie-breaker).

---

## 2. Decision Matrix Table

| ID | Decision Item | Recommended Option | Status |
|---|---|---|---|
| **D01** | Production Tech Stack | **MERN Stack** (MongoDB + Express + React + Node.js) with companion **Python DFA/Regex Suite** | Pending Approval |
| **D02** | Ticket Identifier Format | Exactly 8 chars: `^[A-Z]{2}-[0-9]{3}-[HML]$` | Recommended |
| **D03** | System ID vs Identifier | System ID (`TKT-XXXX`) separate from device identifier (`CS-101-H`) | Recommended |
| **D04** | Issue Code & Precedence | 100-599 base mapping + Precedence: Network > Access > Hardware > Software > Other | Recommended |
| **D05** | Departments & Zones | CS/EE (North), ME/CE (South), AD/HR/FN (Admin), LB (Library) | Recommended |
| **D06** | Round-Robin Scope | Rotates within the route's designated team pool, preserving routing specificity | Recommended |
| **D07** | Priority Override | High-priority Network issues escalate directly to Level-2 (`L2`) | Recommended |
| **D08** | Fallback / Overflow | Backup teams $\to$ Level-2 escalation $\to$ Priority Waiting Queue | Recommended |
| **D09** | Capacity Limit | 8 open tickets (`Assigned`, `In Progress`) per Tier-1 team (`HD1`..`HD4`) | Recommended |
| **D10** | Priority Levels | Standard H / M / L matching the 8-char identifier grammar | Recommended |
| **D11** | Availability Controls | Handlers can toggle own availability; Admins control capacity & routing | Recommended |
| **D12** | Status Lifecycle | `Pending` $\to$ `Assigned` $\to$ `In Progress` $\to$ `Resolved` (one-way progression) | Recommended |
| **D13** | Ticket Reopening | Resolved tickets are immutable; new issue requires new submission | Recommended |
| **D14** | Reporter Information | Name, email/contact, department, identifier, issue description, priority | Recommended |
| **D15** | Authentication Mode | Role-based JWT auth for Reporter, Handler, Routing Admin, System Admin | Recommended |
