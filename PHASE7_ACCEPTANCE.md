# Phase 7 acceptance

Clinical staging checks based on IASLC TNM 9 stage-group table:

- T1a N0 M0 -> IA1
- T2b N0 M0 -> IIA
- T3 N2a M0 -> IIIA
- T3 N2b M0 -> IIIB
- T4 N3 M0 -> IIIC
- any supported T/N with M1a or M1b -> IVA
- any supported T/N with M1c1 or M1c2 -> IVB
- missing T, N, or M -> no stage calculated
- changing T/N/M after a saved calculation clears the previous calculated stage and clinician staging review

Doctor overview must surface SBAR, medication-safety completeness, patient symptom update, structured TNM result, and urgent prompts.

Existing schema v7 cases without structured T/N/M must migrate with blank structured staging fields rather than inferred descriptors.
