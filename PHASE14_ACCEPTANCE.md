# Phase 14 — Versioned patient plan release

- [ ] No release without saved clinician decision.
- [ ] No release without clinician decision sign-off.
- [ ] No release when decision fingerprint is stale.
- [ ] No release without MDT conclusion and patient-facing plan.
- [ ] Release appends an immutable `planReleases[]` snapshot with decision ID, guideline provenance, MDT conclusion, plan, timestamp and version.
- [ ] A new release never overwrites an older release.
- [ ] Patient workspace renders only the current release snapshot, not mutable Doctor form text.
- [ ] If clinical context/decision changes after release, the old release is retained for audit but hidden as the current patient plan until a new version is released.
- [ ] Patient acknowledgement resets for every new release.
- [ ] Blank numeric vitals remain missing instead of coercing to zero.
- [ ] Demo remains localStorage-only; no EHR write, e-signature, prescription or autonomous treatment decision.
