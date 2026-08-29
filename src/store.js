import { SCHEMA_VERSION, createDemoCase, createDemoState } from './data.js';

const STORAGE_KEY = 'lungcare.phase1.state';
const BACKUP_KEY = 'lungcare.phase1.backup';

function normalizeCase(rawCase) {
  return createDemoCase(rawCase || {});
}

function legacyCase(raw) {
  return normalizeCase({
    id: raw.patient?.id || 'DEMO-LC-001',
    workflow: raw.workflow,
    patient: raw.patient,
    intake: raw.intake,
    doctorReview: raw.doctorReview,
    patientEducation: raw.patientEducation,
    events: raw.events,
  });
}

function normalizeState(raw) {
  const base = createDemoState();
  if (!raw || typeof raw !== 'object') return base;

  let cases;
  let migratedFromLegacy = false;
  if (Array.isArray(raw.cases) && raw.cases.length) {
    cases = raw.cases.map(normalizeCase);
  } else {
    migratedFromLegacy = true;
    const primary = legacyCase(raw);
    cases = [primary, ...base.cases.slice(1)];
  }

  const requestedActive = raw.activeCaseId;
  const activeCaseId = cases.some(item => item.id === requestedActive) ? requestedActive : cases[0].id;
  const merged = {
    schemaVersion: SCHEMA_VERSION,
    activeRole: raw.activeRole ?? base.activeRole,
    activeCaseId,
    ui: { ...base.ui, ...(raw.ui || {}) },
    cases,
  };

  if ((raw.schemaVersion || 0) < SCHEMA_VERSION || migratedFromLegacy) {
    merged.cases = merged.cases.map((item, index) => index === 0 ? addEvent(item, {
      type: 'STATE_MIGRATED',
      role: 'system',
      text: `Đã migration dữ liệu lên schema v${SCHEMA_VERSION} và mô hình multi-case.`,
    }) : item);
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

export function addEvent(caseState, { type, role, text }) {
  return {
    ...caseState,
    workflow: { ...caseState.workflow, updatedAt: new Date().toISOString() },
    events: [
      ...(caseState.events || []),
      { id: crypto.randomUUID(), type, role, text, at: new Date().toISOString() },
    ],
  };
}
