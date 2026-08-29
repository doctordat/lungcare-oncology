export const BIOMARKERS = [
  'EGFR',
  'ALK',
  'ROS1',
  'BRAF V600E',
  'KRAS G12C',
  'MET exon 14',
  'RET',
  'NTRK',
  'HER2 / ERBB2',
  'PD-L1',
];

export function getDoctorBlockers(state) {
  const d = state.doctorReview;
  const blockers = [];
  if (!d.diagnosisConfirmed) blockers.push('Chưa xác nhận chẩn đoán mô bệnh học.');
  if (!d.pathologyReviewed) blockers.push('Chưa review mô bệnh học / độ đầy đủ mẫu.');
  if (!d.stagingReviewed) blockers.push('Chưa hoàn tất review staging.');
  if (d.n2Status === 'suspected' && !d.nodalConfirmationPlan.trim()) {
    blockers.push('N2 đang nghi ngờ nhưng chưa ghi kế hoạch xác nhận hạch.');
  }
  if (d.diseaseExtent === 'advanced' && d.biomarkerStatus !== 'complete') {
    blockers.push('Bệnh tiến xa nhưng biomarker / PD-L1 chưa hoàn tất.');
  }
  if (!d.mdtDecision.trim()) blockers.push('Chưa ghi kết luận MDT.');
  if (!d.plan.trim()) blockers.push('Chưa có kế hoạch bàn giao cho bệnh nhân.');
  return blockers;
}

export function getDataCompleteness(state) {
  const d = state.doctorReview;
  const checks = [
    d.diagnosisConfirmed,
    d.pathologyReviewed,
    d.stagingReviewed,
    Boolean(d.diseaseExtent),
    d.n2Status !== 'suspected' || Boolean(d.nodalConfirmationPlan.trim()),
    d.diseaseExtent !== 'advanced' || d.biomarkerStatus === 'complete',
    Boolean(d.mdtDecision.trim()),
    Boolean(d.plan.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function clinicalPrompts(state) {
  const d = state.doctorReview;
  const prompts = [];
  if (!d.diagnosisConfirmed) {
    prompts.push({ level: 'warning', title: 'Tissue first', text: 'Ưu tiên xác nhận mô bệnh học trước khi đi sâu vào nhánh điều trị.' });
  }
  if (d.n2Status === 'suspected') {
    prompts.push({ level: 'warning', title: 'N2 cần xác nhận', text: 'Nếu tình trạng hạch làm thay đổi chiến lược, cần ghi rõ kế hoạch xác nhận xâm lấn phù hợp.' });
  }
  if (d.diseaseExtent === 'advanced' && d.biomarkerStatus !== 'complete') {
    prompts.push({ level: 'warning', title: 'Thiếu biomarker', text: 'Không chốt nhánh điều trị toàn thân khi dữ liệu driver alterations / PD-L1 còn thiếu.' });
  }
  if (state.patient.redFlags?.length) {
    prompts.push({ level: 'danger', title: 'Có red flag', text: 'Ưu tiên đánh giá triệu chứng khẩn trước luồng ung thư thường quy.' });
  }
  if (!prompts.length) {
    prompts.push({ level: 'success', title: 'Không có blocker dữ liệu lớn', text: 'Có thể tiếp tục tổng hợp MDT với dữ liệu hiện tại; vẫn cần bác sĩ xác nhận.' });
  }
  return prompts;
}

export const EVIDENCE_NOTES = [
  {
    label: 'TNM 9',
    text: 'Prototype tham chiếu cấu trúc IASLC TNM 9th edition; staging hiển thị trong demo không thay thế staging chính thức.',
  },
  {
    label: 'Biomarker',
    text: 'Checklist biomarker dùng để theo dõi độ đầy đủ dữ liệu. Ứng dụng không tự chọn thuốc hoặc phác đồ.',
  },
];
