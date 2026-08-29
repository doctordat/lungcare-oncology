# Phase 22 — Doctor Clinical Cockpit

- Doctor workspace surfaces one scan-first cockpit for emergency/toxicity signals, current treatment, imaging response, genomics and treatment decision context.
- Cockpit reuses existing patient-reported tracking, medication safety and structured biomarker data; it does not create duplicate sources of truth for those domains.
- Current treatment monitoring is clinician-entered and stored per case under `clinicalMonitoring.currentTreatment`.
- CT/imaging assessments append to `clinicalMonitoring.imaging`; prior imaging entries are preserved as a timeline.
- Imaging response is clinician-entered. The app does not measure lesions or auto-calculate RECIST.
- Structured positive biomarkers and PD-L1 TPS are displayed from `doctorReview.biomarkerResults` when available.
- Patient urgent symptoms and severe toxicity/adherence signals are promoted above routine clinical workflow.
- The demo clinical synthesis is explicitly labeled as rule-based demo synthesis, not an AI diagnosis or medical order.
- No autonomous diagnosis, prescription, dose, regimen selection or EHR write is introduced.
- Mobile/tablet layout degrades to a single-column cockpit without hiding priority signals.
