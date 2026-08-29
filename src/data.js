export const SCHEMA_VERSION = 2;

export function createDemoState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    activeRole: null,
    workflow: {
      state: 'NURSE_INTAKE',
      updatedAt: new Date().toISOString(),
    },
    patient: {
      id: 'DEMO-LC-001',
      synthetic: true,
      name: 'Nguyễn Văn Minh',
      age: 62,
      sex: 'Nam',
      smokingPackYears: 35,
      ecog: 1,
      diagnosis: 'Nghi NSCLC',
      tnm: 'cT2b N2 M0',
      stage: 'Giai đoạn IIIB (demo)',
      redFlags: [],
    },
    intake: {
      spo2: 96,
      heartRate: 82,
      dyspnea: 'Nhẹ khi gắng sức',
      pain: 2,
      note: 'Ho kéo dài, đau ngực nhẹ, sụt 4 kg/2 tháng.',
      completed: false,
    },
    doctorReview: {
      stagingReviewed: false,
      pathologyReviewed: false,
      plan: 'Chờ hoàn tất đánh giá mô bệnh học/hạch trung thất và hội chẩn MDT.',
      completed: false,
    },
    patientEducation: {
      acknowledged: false,
    },
    events: [
      {
        id: crypto.randomUUID(),
        type: 'CASE_CREATED',
        role: 'system',
        text: 'Khởi tạo ca bệnh demo.',
        at: new Date().toISOString(),
      },
    ],
  };
}
