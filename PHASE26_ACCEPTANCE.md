# Phase 26 — Nurse Triage Command Center

- Nurse workspace surfaces a prioritized queue derived from existing urgent calls, toxicity, symptom check-ins and pre-visit updates.
- Priority order promotes urgent calls/red-flag symptoms first, then severe toxicity, then routine symptom/pre-visit updates.
- Queue items expose clear states: New, Reviewing, Escalated and Resolved.
- Opening an item shows current treatment, adherence/toxicity and the patient-reported context needed for verification.
- Nurse can verify identity, symptoms, medication context and red flags during review.
- Nurse triage updates append an activity event and do not create a duplicate clinical source of truth.
- Escalation supports care coordination only; treatment decisions remain clinician-owned.
- No autonomous diagnosis, prescription, treatment modification or EHR write is added.
- The module remains local-browser demo functionality until a backend and real team messaging are implemented.
