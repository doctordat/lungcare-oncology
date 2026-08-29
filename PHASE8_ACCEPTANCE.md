# Phase 8 acceptance checklist

- Schema v9 migrates existing cases with a default treatmentContext without losing prior data.
- Stage IV requires completed biomarker status and explicit driver classification before routing is considered ready.
- Stage IV with driverStatus=present routes to the ASCO 2026.3.3 driver-positive lane and requires a named driver.
- Stage IV with driverStatus=none routes to the ASCO 2026.3.3 no-driver lane.
- Stage III requires explicit MDT resectability assessment and routes only to resectable/unresectable multimodality lanes.
- Treatment intent, fitness, contraindication/comorbidity/organ-function review are mandatory blockers.
- Changing TNM, biomarker status, driver status, resectability, intent, fitness or contraindication review invalidates prior treatment-routing sign-off.
- Final MDT release remains blocked until clinician treatment-routing review is complete.
- No drug, dose, regimen, order or autonomous treatment recommendation is generated.

Evidence provenance:
- ASCO Stage IV NSCLC Living Guidelines v2026.3.3, updated 2026-07-24, with and without driver alterations.
- ASCO Management of Stage III NSCLC guideline and rapid recommendation updates for multidisciplinary resectability/multimodality routing.
