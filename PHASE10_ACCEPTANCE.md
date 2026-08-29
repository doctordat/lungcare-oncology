# Phase 10 acceptance

- Recommendation cards remain option classes; no dose, prescription, order, or automatic regimen selection.
- Clinician must select one recommendation card and enter a rationale before saving a treatment decision.
- Saved decision snapshots option id, pathway key, guideline label/update, rationale, alternatives note, timestamp, and a fingerprint of staging/pathology/biomarker/treatment-safety context.
- A saved decision is considered stale whenever its current clinical context fingerprint differs from the saved fingerprint.
- Stale decisions display a prominent warning and block final doctor plan release.
- Re-saving the clinician decision creates a new current snapshot and adds a timeline audit event.
- Treatment routing sign-off is disabled until a non-stale clinician decision exists.
- Schema v10 migrates existing v9 cases with an empty decision audit object; no prior decision is fabricated.

This remains clinical decision support and a localStorage demo. Clinician/MDT retains responsibility for treatment selection and real-world orders.
