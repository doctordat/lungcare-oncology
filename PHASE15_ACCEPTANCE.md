# Phase 15 — Longitudinal oncology follow-up

- [ ] Doctor workspace has a longitudinal follow-up panel.
- [ ] Saving a follow-up appends a new immutable snapshot; older snapshots remain unchanged.
- [ ] Each snapshot records timestamp, follow-up type, note, active patient-plan version and symptom snapshot.
- [ ] Follow-up save also appends a case timeline event.
- [ ] Multiple follow-ups render newest-first without replacing prior entries.
- [ ] A later patient-plan release does not rewrite older follow-up snapshots.
- [ ] Missing plan version is stored explicitly as null rather than inferred.
- [ ] Demo remains localStorage-only; no EHR write or autonomous clinical action.
