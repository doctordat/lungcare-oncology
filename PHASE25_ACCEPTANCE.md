# Phase 25 — AI Clinical Timeline / What Changed

- Doctor workspace shows one chronological timeline derived from existing treatment, imaging, toxicity, symptom, urgent triage and clinician decision data.
- Timeline is read-only synthesis; it does not replace or duplicate the underlying sources of truth.
- High-priority toxicity, urgent symptoms, triage and progression events are visually promoted.
- A “What changed since last visit?” strip summarizes recent events around the latest treatment/imaging/decision anchor.
- Imaging response remains clinician-entered; no lesion measurement or RECIST calculation is introduced.
- Treatment decisions remain clinician-owned; no autonomous prescription, dose, regimen selection or treatment change is introduced.
- The UI explicitly labels the summary as demo synthesis rather than AI diagnosis or medical order.
- Timeline degrades to a mobile single-column layout without hiding priority events.
