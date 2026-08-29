# Phase 27 — Doctor Escalation Inbox + Shared Team Handoff

- Nurse `Escalated` creates or updates one structured shared escalation record instead of only an activity text event.
- Structured handoff preserves source signal, nurse note and verification status for identity, symptoms, medications and red flags.
- Doctor workspace shows a dedicated escalation inbox for unresolved handoffs.
- Opening an escalation shows current treatment, adherence/toxicity, escalated signal, nurse note and verification state.
- Doctor can acknowledge the handoff without closing it.
- Doctor can add a note and close the handoff after review.
- Acknowledgement and resolution append activity events without changing clinician treatment-decision state.
- Existing Nurse triage, urgent-call, treatment, imaging, biomarker and decision sources of truth remain unchanged.
- No autonomous diagnosis, prescription, dose, regimen change or EHR write is introduced.
- Static localStorage demo remains same-browser only until backend/team sync is added.
