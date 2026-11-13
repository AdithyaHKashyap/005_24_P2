# IT Helpdesk Ticket Router — Project Planning Pack

**Version:** 2.0  
**Status:** Pre-development baseline  
**Based on:** The three project-brief photographs supplied in the conversation.

## What is included
1. `01_PRD.md` — product requirements and acceptance criteria.
2. `02_DESIGN.md` — page-by-page UI/UX specification.
3. `03_ARCHITECTURE.md` — system design, modules and repository structure.
4. `04_DATA_MODEL.md` — database collections, fields, indexes and integrity.
5. `05_API_SPEC.md` — REST endpoints and example payloads.
6. `06_ALGORITHMS.md` — DFA, Regex, classification, routing and dispatch rules.
7. `07_TEST_PLAN.md` — 25 test cases and end-to-end demonstration.
8. `08_IMPLEMENTATION_PLAN.md` — build phases, deliverables and team split.
9. `09_DECISIONS_AND_ASSUMPTIONS.md` — unresolved questions to approve before coding.

## Critical clarification from the brief
The brief contains a technology-stack conflict:
- Question 8 and the final suggested technology stack say **MERN Stack**.
- Question 10 says **Flask backend and SQLite database**.

This pack uses **MERN provisionally** because MERN is named more than once. This is not a confirmed faculty decision. Get written/verbal confirmation before creating the project. If Flask + SQLite is required, update the architecture, data model and API implementation choices.

## Recommended working rule
Treat this pack as the project's single planning reference. When a decision changes, update `09_DECISIONS_AND_ASSUMPTIONS.md` first, then update affected specifications. Do not start parallel implementation until the routing policy, classification map and technology stack are agreed.

## Suggested first action
Read `09_DECISIONS_AND_ASSUMPTIONS.md` and settle the blocking questions. Then approve the PRD and architecture.
