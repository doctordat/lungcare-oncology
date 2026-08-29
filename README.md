# LungCare Oncology

Clinical decision support prototype for lung cancer evaluation and longitudinal care.

> Prototype only. Recommendations are decision support and require clinician confirmation. This application does not replace clinician judgment, multidisciplinary review, HIS/EMR, or autonomously sign medical orders.

## Current demo

Open `index.html` in a browser. The current prototype includes:

- Structured patient intake: age, smoking exposure, ECOG, symptoms and imaging
- Suspected NSCLC / SCLC / unknown-pathology branches
- Simplified cTNM estimation for demonstration
- Suggested pathology, nodal staging and molecular-testing next steps
- Management-next-step cards with MDT escalation
- Synthetic example case preloaded for testing
- Responsive single-page UI with no backend dependency

## Important limitations

The staging and management rules in this demo are intentionally simplified for product prototyping. Before any clinical deployment, replace demo rules with validated, versioned guideline logic; add provenance/citations; auditability; test coverage; privacy/security controls; and clinician governance.
