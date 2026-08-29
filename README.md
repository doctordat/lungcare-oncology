# LungCare Oncology

Clinical decision-support prototype for lung cancer evaluation and longitudinal care.

> Prototype only. Recommendations are decision support and require clinician confirmation. This application does not replace clinician judgment, multidisciplinary review, HIS/EMR, or autonomously sign medical orders.

## Phase 1 — role workspaces

The app now uses one shared case state across three role-specific workspaces:

1. **Nurse** — capture intake data, symptoms and handoff notes.
2. **Doctor** — review staging inputs, missing pathology data and document the management plan.
3. **Patient** — view the released plan and acknowledge that instructions were read.

The primary end-to-end workflow is:

`NURSE_INTAKE → READY_FOR_DOCTOR → DOCTOR_REVIEW → PLAN_READY → PATIENT_ACKNOWLEDGED`

Each transition is recorded as an event in the local activity timeline. Role switching persists the current form state before navigation.

## Structure

- `index.html` — minimal application shell
- `styles.css` — shared clinical UI design system
- `src/app.js` — router, interaction wiring and recovery UI
- `src/data.js` — synthetic demo case and schema version
- `src/store.js` — local persistence, normalization and migration
- `src/workflow.js` — single workflow state machine and role tasks
- `src/views/` — role-specific and shared view components

## Current safety / technical limits

- Public demo with synthetic data only
- Demo login is not production authentication
- No backend, HIS/EMR integration or server-side audit trail
- Clinical staging and treatment logic remain simplified and must be replaced by validated, versioned guideline logic with provenance and testing before clinical use
- LocalStorage is used only to exercise workflow persistence and migration behavior

## Manual Phase 1 acceptance flow

1. Open the Nurse login and enter the demo workspace.
2. Complete intake and hand off the case.
3. Switch to Doctor, start the review, confirm both review checks, save and release the plan.
4. Switch to Patient and acknowledge the released instructions.
5. Refresh or switch roles during the flow and confirm entered data persists.
