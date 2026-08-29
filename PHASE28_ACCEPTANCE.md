# Phase 28 — Shared Care Plan Actions

- Doctor can create structured care-coordination actions for Patient, Nurse, or Doctor.
- Each action stores owner, title, note, optional follow-up time, status, creator, created time, and completion time.
- Patient and Nurse can complete only actions assigned to their role; Doctor can complete Doctor-owned actions.
- Create and complete actions append activity events.
- The module is visible across Patient, Nurse, and Doctor workspaces and reuses the active case as the source of truth.
- The UI explicitly states that this is care coordination, not an order set.
- No medication order, dose, regimen selection, autonomous clinical decision, or EHR write is added.
- Static localStorage demo limitations remain; real cross-device team task sync requires backend/auth.
