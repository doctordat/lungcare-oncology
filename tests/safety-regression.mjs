import test from 'node:test';
import assert from 'node:assert/strict';
import { caseUrgent, nurseUrgent, patientSymptomUrgent, pendingPatientSymptomUrgent } from '../src/safety.mjs';

test('blank SpO2 is missing, not urgent zero',()=>{assert.equal(nurseUrgent({spo2:'',dyspnea:'',redFlags:{}}),false)});
test('SpO2 below 90 is urgent',()=>{assert.equal(nurseUrgent({spo2:89,dyspnea:'',redFlags:{}}),true)});
test('red flag is urgent',()=>{assert.equal(nurseUrgent({spo2:'',dyspnea:'',redFlags:{majorHemoptysis:true}}),true)});
test('unsubmitted patient draft does not count as queue urgent',()=>{assert.equal(patientSymptomUrgent({hemoptysis:true,submittedAt:null}),false)});
test('pending patient draft can be classified before submit timestamp',()=>{assert.equal(pendingPatientSymptomUrgent({hemoptysis:true}),true)});
test('submitted severe dyspnea is urgent',()=>{assert.equal(patientSymptomUrgent({dyspnea:'Tăng nhiều',submittedAt:'2026-08-29T00:00:00Z'}),true)});
test('case urgency uses centralized intake and submitted patient signals',()=>{assert.equal(caseUrgent({intake:{spo2:''},patientEducation:{symptomReport:{chestPain:true,submittedAt:'2026-08-29T00:00:00Z'}}}),true)});
