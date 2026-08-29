# Phase 17 — Structured biomarker editor

- [ ] Doctor workspace exposes structured status for EGFR, ALK, ROS1, BRAF V600E, KRAS G12C, MET exon 14, RET, NTRK and HER2/ERBB2.
- [ ] Positive molecular results require an explicit alteration/variant/fusion string.
- [ ] PD-L1 has its own resulted state and TPS field; TPS must be 0–100.
- [ ] Legacy booleans migrate visually as `resulted_unknown`; no positive/negative result is inferred.
- [ ] Structured results are stored per case under `doctorReview.biomarkerResults`.
- [ ] Compatibility fields are synchronized so existing routing continues to function: `biomarkerStatus`, legacy checklist, `driverStatus`, and `driverName`.
- [ ] Workup becomes `complete` only when all molecular markers are positive/negative and PD-L1 is resulted.
- [ ] Any structured biomarker save clears clinician treatment sign-off.
- [ ] A structured fingerprint is included in legacy biomarker context so changes such as PD-L1 TPS or alteration text stale prior clinician decisions/releases.
- [ ] Editor does not select a drug, regimen, dose or order.

Evidence context: ASCO Stage IV NSCLC Living Guidelines v2026.3.3 (2026-07-24) state biomarker availability is required at treatment decision-making; CAP/IASLC/AMP material is used only as older molecular testing structure background.
