# Phase 16 — Biomarker structure + consistency guardrails

- [ ] Legacy biomarker booleans are treated only as checklist/test-completeness signals, never positive/negative molecular results.
- [ ] A normalized biomarker snapshot maps legacy `true` to `resulted_unknown`, with `result: null`.
- [ ] PD-L1 legacy completion never invents a TPS value.
- [ ] NSCLC treatment routing rejects SCLC and unsupported histology.
- [ ] Stage IV routing is blocked when disease extent is not recorded as advanced/metastatic.
- [ ] Stage I–III plus `advanced` disease extent raises an explicit consistency blocker.
- [ ] `biomarkerStatus=complete` is blocked when the existing biomarker checklist is incomplete.
- [ ] `driverStatus=present` requires an explicit alteration name.
- [ ] `driverStatus=none` cannot be locked before biomarker workup is complete.
- [ ] Decision fingerprints include the normalized biomarker snapshot, so biomarker-context changes invalidate prior decisions/releases.
- [ ] ASCO Stage IV treatment provenance remains Living Guideline v2026.3.3 (2026-07-24).
- [ ] CAP/IASLC/AMP molecular-testing material is labeled as older evidence and never misrepresented as a 2026 guideline.
- [ ] No drug, dose, order, autonomous recommendation, EHR write, or inferred molecular result is produced.
