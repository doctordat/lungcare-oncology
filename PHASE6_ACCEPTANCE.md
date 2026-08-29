# Phase 6 acceptance checklist

- Create a synthetic demo case from Doctor or Nurse worklist.
- Search cases by name, ID, or diagnosis.
- Assign doctor and nurse to the active case.
- Close a case and verify it leaves the open queue.
- Open the Archived filter and reopen the case.
- Patient urgent symptom/message increments unread alerts; opening the case as Doctor/Nurse clears the unread count.
- Existing Phase 5 cases migrate to schema v7 with default assignment/archive/alert fields.
- Blank SpO2 is not treated as SpO2 <90 solely because of numeric coercion.

This remains a localStorage demo. No cross-device communication or real clinical notification is implied.
