# Phase 13 acceptance

- Doctor workspace renders one MDT review packet for the active case.
- Packet includes pathology, TNM 9, N2 status, biomarker status, SBAR, medication safety, patient update, treatment context, guideline lane, clinician decision, provenance, MDT conclusion, and patient-facing plan.
- Missing data is shown explicitly; the packet does not infer or fabricate missing clinical facts.
- Red flag / urgent patient updates are surfaced before routine MDT readiness.
- Readiness chips show whether pathology, TNM, biomarker, routing, clinician decision, and safety review are currently ready.
- Copy MDT packet copies a plain-text summary for demo workflow use.
- No prescription, dose, order, or autonomous treatment choice is generated.

This remains a localStorage clinical decision-support demo, not an EHR handoff or signed medical record.
