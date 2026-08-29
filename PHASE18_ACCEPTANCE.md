# Phase 18 — Structured biomarker-driven recommendation engine

- [ ] Stage IV routing derives driver-positive / no-driver / pending from `doctorReview.biomarkerResults` when structured results exist.
- [ ] Legacy `driverStatus` is fallback-only for cases without structured biomarker results.
- [ ] Structured molecular workup requires every supported driver marker to be final (`positive` or `negative`) and PD-L1 to have a valid TPS 0–100 before Stage IV can be locked.
- [ ] Positive structured results require explicit alteration/variant/fusion text.
- [ ] PD-L1 TPS is bucketed only for clinician-facing comparison context: `<1`, `1–49`, `>=50`.
- [ ] PD-L1 bucket does not auto-select a drug, regimen, dose, order, or prescription.
- [ ] Driver-positive cards display the clinician-entered structured driver alteration(s).
- [ ] No-driver cards carry PD-L1 TPS/bucket context for comparison while retaining clinician review requirements.
- [ ] Decision fingerprint includes structured molecular snapshot, derived driver state and PD-L1 context.
- [ ] Changing alteration, molecular status or PD-L1 TPS makes prior decision/release snapshots stale.
- [ ] Unsupported histology remains blocked from NSCLC lanes.
- [ ] Evidence provenance remains ASCO Stage IV Living Guideline v2026.3.3 (updated 2026-07-24) for Stage IV lanes.
- [ ] No EHR write or autonomous treatment action is introduced.
