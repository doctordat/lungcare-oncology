# Phase 12 acceptance

- Doctor workspace shows immutable treatment decision history for the active case.
- Every version displays option id, rationale, pathway, guideline update date, and decision time.
- Each historical snapshot is compared with the current clinical context.
- Changed fields are listed explicitly, including old and current values.
- When the current decision context has changed, saving a replacement decision is blocked until the clinician confirms change-impact review.
- Existing decision history remains append-only; Phase 12 does not mutate prior snapshots.
- No dose, prescription, order, or autonomous treatment choice is generated.

This remains a localStorage clinical decision-support demo, not an EHR or electronic signature system.
