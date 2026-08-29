# Phase 11 acceptance

- Every saved clinician treatment decision appends a new immutable structured snapshot to `treatmentContext.decisionHistory`.
- A snapshot includes a unique id, selected option id/title, rationale, alternatives note, guideline source/update, pathway key, context fingerprint, and decision timestamp.
- Saving a new decision never overwrites or removes previous structured snapshots.
- `treatmentContext.decision` remains the current decision pointer used by workflow/stale checks.
- Existing schema v10 cases migrate to schema v11 with an empty decision history; no historical decision is fabricated.
- Timeline audit events remain additive and complement the structured history.

This is still a localStorage demo, not a regulated audit log. A production audit trail requires authenticated actors, server-side append-only storage, timestamps from a trusted server, permissions, and tamper-evident controls.
