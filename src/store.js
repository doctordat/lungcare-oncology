import { SCHEMA_VERSION, createDemoState } from './data.js';

const STORAGE_KEY = 'lungcare.phase1.state';
const BACKUP_KEY = 'lungcare.phase1.backup';

function normalizeState(raw) {
  const base = createDemoState();
  if (!raw || typeof raw !== 'object') return base;

  const mergedDoctor = {
    ...base.doctorReview,
    ...(raw.doctorReview || {}),
    biomarkers: {
      ...base.doctorReview.biomarkers,
      ...((raw.doctorReview || {}).biomarkers || {}),
    },
  };

  const merged = {
    ...base,
    ...raw,
    ui: { ...base.ui, ...(raw.ui || {}) },
    workflow: { ...base.workflow, ...(raw.workflow || {}) },
    patient: { ...base.patient, ...(raw.patient || {}) },
    intake: { ...base.intake, ...(raw.intake || {}) },
    doctorReview: mergedDoctor,
    patientEducation: { ...base.patientEducation, ...(raw.patientEducation || {}) },
    events: Array.isArray(raw.events) ? raw.events : base.events,
  };

  if (merged.schemaVersion < SCHEMA_VERSION) {
    merged.schemaVersion = SCHEMA_VERSION;
    merged.events = [
      ...merged.events,
      {
        id: crypto.randomUUID(),
        type: 'STATE_MIGRATED',
        role: 'system',
        text: `Đã migration dữ liệu lên schema v${SCHEMA_VERSION}.`,
        at: new Date().toISOString(),
      },
    ];
  }
  return merged;
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { state: createDemoState(), recovered: false, error: null };

  try {
    return { state: normalizeState(JSON.parse(raw)), recovered: false, error: null };
  } catch (error) {
    localStorage.setItem(BACKUP_KEY, raw);
    return {
      state: createDemoState(),
      recovered: true,
      error: 'Dữ liệu cũ bị lỗi định dạng. App đã tạo lại state demo và giữ một bản backup cục bộ.',
    };
  }
}

export function saveState(state) {
  const normalized = normalizeState({ ...state, schemaVersion: SCHEMA_VERSION });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetState() {
  const fresh = createDemoState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function addEvent(state, { type, role, text }) {
  return {
    ...state,
    workflow: { ...state.workflow, updatedAt: new Date().toISOString() },
    events: [
      ...state.events,
      { id: crypto.randomUUID(), type, role, text, at: new Date().toISOString() },
    ],
  };
}
