export const TNM9_SOURCE = {
  label: 'IASLC TNM 9th edition / AJCC version 9',
  url: 'https://www.iaslc.org/research-education/publications-resources-guidelines/staging-cards-thoracic-oncology-9th-edition',
  note: 'Stage grouping is derived only from explicitly selected T/N/M categories. Missing descriptors are never inferred.',
};

export const T_OPTIONS = ['T1a','T1b','T1c','T2a','T2b','T3','T4'];
export const N_OPTIONS = ['N0','N1','N2a','N2b','N3'];
export const M_OPTIONS = ['M0','M1a','M1b','M1c1','M1c2'];

const M0_STAGE = {
  T1a: { N0:'IA1', N1:'IIA', N2a:'IIB', N2b:'IIIA', N3:'IIIB' },
  T1b: { N0:'IA2', N1:'IIA', N2a:'IIB', N2b:'IIIA', N3:'IIIB' },
  T1c: { N0:'IA3', N1:'IIA', N2a:'IIB', N2b:'IIIA', N3:'IIIB' },
  T2a: { N0:'IB', N1:'IIB', N2a:'IIIA', N2b:'IIIB', N3:'IIIB' },
  T2b: { N0:'IIA', N1:'IIB', N2a:'IIIA', N2b:'IIIB', N3:'IIIB' },
  T3:  { N0:'IIB', N1:'IIIA', N2a:'IIIA', N2b:'IIIB', N3:'IIIC' },
  T4:  { N0:'IIIA', N1:'IIIA', N2a:'IIIB', N2b:'IIIB', N3:'IIIC' },
};

export function calculateStage({ t, n, m }) {
  if (!t || !n || !m) return { ok:false, stage:null, reason:'Thiếu T, N hoặc M.' };
  if (!T_OPTIONS.includes(t) || !N_OPTIONS.includes(n) || !M_OPTIONS.includes(m)) return { ok:false, stage:null, reason:'Descriptor chưa được hỗ trợ trong calculator demo.' };
  if (m === 'M1a' || m === 'M1b') return { ok:true, stage:'IVA', reason:'M1a/M1b → stage IVA trong TNM 9.' };
  if (m === 'M1c1' || m === 'M1c2') return { ok:true, stage:'IVB', reason:'M1c1/M1c2 → stage IVB trong TNM 9.' };
  const stage = M0_STAGE[t]?.[n] || null;
  return stage ? { ok:true, stage, reason:'Stage group theo bảng IASLC TNM 9.' } : { ok:false, stage:null, reason:'Không tìm thấy stage group cho tổ hợp đã chọn.' };
}

export function formatTnm(input) {
  if (!input?.t || !input?.n || !input?.m) return 'Chưa đủ T/N/M';
  return `c${input.t} ${input.n} ${input.m}`;
}
