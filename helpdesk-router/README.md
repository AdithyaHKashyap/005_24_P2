# IT Helpdesk Ticket Router

A modern, production-grade IT Helpdesk Ticket Router designed as a **Notion-inspired minimalist operations workspace**. The application accepts structured incident reports, performs real-time identifier validation using a Deterministic Finite Automaton (DFA) and regular expression, classifies issues into exactly five categories, consults an explicit MongoDB routing table, checks team availability and capacity (max 8 open tickets per team), and dispatches tickets using round-robin and priority override rules.

---

## 1. Key Features & Interfaces

The frontend is built as a distraction-free, responsive SaaS workspace with warm neutrals, Inter typography, and light/dark theme support:

* **Operations Home:**
  * High-level operational overview with 4 KPI callout cards (*Active Tickets*, *Resolution Rate*, *Central Fallback Queue*, *Waiting Queue*).
  * Recent activity feed and real-time team workload utilization tracks.
  * Instant alert banner when tickets require manual fallback routing.
* **My Tickets Database:**
  * Notion-style database table with instant search (press `/` shortcut).
  * Multi-property filter bar for **Category** (*Hardware, Software, Network, Access, Other*), **Priority** (*High, Med, Low*), and **Status** (*Pending, Assigned, In Progress, Resolved*).
  * Filter tabs: *All Tickets*, *Needs Attention*, and *Resolved*.
  * Built-in pagination with configurable page sizes.
  * **Slide-over Ticket Drawer:** Clicking any row opens an inspector panel displaying ticket details, quick status updates (*Assigned $\to$ In Progress $\to$ Resolved*), and a complete chronological event lifecycle timeline.
* **Submit Report:**
  * Minimalist, centered form with silent real-time validation.
  * As the user types, the structured identifier (`DEPT-ISSUE-PRIORITY`, e.g., `CS-101-H`) is verified silently against the DFA and Regex, surfacing an immediate green verification badge or format guidance.
  * Zero academic laboratory clutter or theory diagrams in the user interface.
* **Handler Workspace:**
  * Dedicated workbench with tabs for **HD1**, **HD2**, **HD3**, **HD4**, and **Level-2 Escalation**.
  * Real-time capacity meter enforcing the 8 open ticket limit (e.g. `5 of 8 open tickets — 62%`) with amber threshold warnings and red overflow guards.
  * Team availability toggle switch (Active / Paused).
  * Deterministic queue ordering (High priority first, then oldest submission time).
* **Routing Database:**
  * Explicit routing matrix stored in MongoDB (40 rules mapping department and category to operational zones and preferred helpdesk teams).
  * **Central Fallback Queue:** Catches tickets with unmapped issue codes or unknown departments, with a one-click operator reassignment action.
  * **Escalations and Overrides Log:** Audit trail for emergency Level-2 bypasses and capacity overflow re-routes.
* **Service Analytics:**
  * Executive ITSM analytics without visual clutter.
  * Category volume distribution bars with exact counts and percentages.
  * Zonal density breakdown across *North Block*, *South Block*, *Admin Block*, and *Library Wing*.
  * Clean SVG Resolution Ratio donut chart.
* **Settings:**
  * Theme switcher: **Light (Warm Neutral)**, **Dark (Obsidian)**, and System match.
  * One-click demo data seeder (loads 14 realistic support tickets).
  * Workspace data reset button.

---

## 2. Core Architecture & Algorithms

All algorithms are deterministic, pure, and thoroughly tested:

1. **Ticket Identifier Grammar (DFA & Regex):**
   * Pattern: Exactly 8 characters `^[A-Z]{2}-[0-9]{3}-[HML]$` (e.g. `CS-101-H`).
   * State Machine: $q_0 \to q_8$ (accepting) with dead state $X$ on any invalid character.
   * DFA and Regex produce 100% identical outcomes across all valid and invalid inputs.
2. **5-Category Issue Classification:**
   * Numerical issue code base ranges:
     * `100–199` $\to$ Hardware
     * `200–299` $\to$ Software
     * `300–399` $\to$ Network
     * `400–499` $\to$ Access
     * `500–599` $\to$ Other
   * Keyword pattern matching with strict conflict resolution precedence:
     $$\text{Network} > \text{Access} > \text{Hardware} > \text{Software} > \text{Other}$$
3. **Explicit Database Routing & Capacity Management:**
   * 4 Tier-1 teams (`HD1`, `HD2`, `HD3`, `HD4`) with a strict maximum capacity of **8 open tickets** each.
   * 1 Tier-2 escalation team (`L2`) with capacity of 10.
   * Round-robin scheduling rotates across the eligible pool for the matched route.
   * Teams at capacity ($\ge 8$) or marked unavailable are automatically skipped in favor of configured backup teams.
   * High-priority Network outages immediately bypass Tier-1 and route directly to Level-2 (`L2`).
   * When all eligible teams are full, tickets are placed in a priority-sorted Waiting Queue.

---

## 3. Technology Stack

* **Backend:** Node.js, Express.js.
* **Database:** MongoDB, Mongoose ODM (`mongodb://127.0.0.1:27017/helpdesk`).
* **Frontend:** Modern reactive single-page architecture with Notion-inspired design tokens, Inter & IBM Plex Mono typography, and CSS variables.
* **Icons & Visuals:** Pure SVG iconography, accessible status pills, and CSS/SVG charts.

---

## 4. Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer)
* [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### Installation & Startup

1. Open your terminal in the `helpdesk-router` directory:
   ```bash
   cd helpdesk-router
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:4000
   ```

5. Click **"Load Demo"** in the topbar to populate 14 realistic tickets and explore all views.

---

## 5. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/state` | Returns all tickets, rejects, team loads, and routing rules |
| `POST` | `/api/tickets` | Validates identifier (DFA/Regex), classifies, routes, and creates report |
| `PATCH` | `/api/tickets/:id` | Updates ticket status (`Assigned`, `In Progress`, `Resolved`) |
| `POST` | `/api/tickets/:id/reassign` | Reassigns ticket to target team with audit event |
| `PATCH` | `/api/teams/:id` | Updates team availability (`avail: boolean`) or capacity (`cap: number`) |
| `GET` | `/api/routing-rules` | Returns active department and category routing rules |
| `PATCH` | `/api/routing-rules/:id`| Updates preferred team or backup configuration for a rule |
| `POST` | `/api/demo` | Seeds 14 realistic sample tickets across all categories |
| `POST` | `/api/reset` | Resets all tickets and restores default team capacities |

---

## 6. Project Structure

```text
helpdesk-router/
├── engine.js          # Pure algorithmic engine (DFA, Regex, Classification, Conflict Precedence)
├── server.js          # Express server, Mongoose models, dispatch logic, REST APIs
├── package.json       # Project dependencies (Express, Mongoose)
├── README.md          # Project documentation and user guide
└── public/
    └── index.html     # Notion-inspired workspace frontend (Home, Tickets, Submit, Handler, Routing, Analytics, Settings)
```
