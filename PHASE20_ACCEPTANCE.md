# Phase 20 — Safety & regression hardening

- [ ] One centralized source defines nurse/patient/case urgency predicates.
- [ ] Blank SpO2 remains missing and never becomes an urgent numeric zero.
- [ ] Submitted patient red flags drive team queue urgency consistently.
- [ ] Patient symptom submission uses the same urgent predicate family as queue/clinical overview.
- [ ] Safety regression tests cover blank SpO2, low SpO2, red flags, unsubmitted drafts, submitted severe dyspnea and case urgency.
- [ ] GitHub Pages deployment runs the safety regression suite before publishing.
- [ ] A failing safety regression test blocks deployment.
- [ ] No treatment selection, prescription, dose, EHR write or autonomous clinical action is added.
