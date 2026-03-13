/* =============================================
   PharmFlow v4 — pharmAlgorithm.js
   AI 우선순위 엔진 + 경고 + Five Rights +
   Lock + 반려 + 감사 기록
   ============================================= */

// ─── A~E 점수 계산 (기존 로직 유지) ───
function getTypeScore(rx) { return (RX_TYPES[rx.type] || RX_TYPES.REGULAR).score }
function getMedRiskScore(rx) { return Math.min(25, rx.drugRisk || 0) }
function getLocationScore(rx) { return Math.min(20, getWardScore(rx.ward)) }
function getWaitScore(rx) {
  const mins = (Date.now() - rx.receivedAt.getTime()) / 60000;
  if (rx.type === 'STAT') return Math.min(15, Math.floor(mins / 5) * 3);
  if (rx.type === 'VERBAL' || rx.type === 'DISCHARGE') return Math.min(12, Math.floor(mins / 10) * 3);
  return Math.min(8, Math.floor(mins / 15) * 2);
}
function getClinicalUrgencyScore(rx) {
  let s = 0;
  if (rx.durResult === 'WARN') s = Math.max(s, 5);
  if (rx.scheduledTime) { const d = (rx.scheduledTime.getTime() - Date.now()) / 60000; if (d > 0 && d <= 30) s = Math.max(s, 5) }
  if (rx.surgeryTime) { const d = (rx.surgeryTime.getTime() - Date.now()) / 60000; if (d > 0 && d <= 60) s = Math.max(s, 5) }
  return s;
}
function calculatePriorityScore(rx) { return Math.min(100, getTypeScore(rx) + getMedRiskScore(rx) + getLocationScore(rx) + getWaitScore(rx) + getClinicalUrgencyScore(rx)) }
function recalcAllScores() { prescriptions.forEach(rx => { if (rx.status !== 'REJECTED') rx.priorityScore = calculatePriorityScore(rx) }) }
function scoreColor(s) { if (s >= 80) return '#ff4757'; if (s >= 60) return '#ff9f43'; if (s >= 40) return '#fed330'; return '#8892a4' }
function scoreLevelClass(s) { if (s >= 80) return 'lv-crit'; if (s >= 60) return 'lv-high'; if (s >= 40) return 'lv-med'; return 'lv-low' }

// ─── 경고 시스템 ───
const ALERT_THRESHOLDS = [
  { check: rx => rx.type === 'STAT' && statusIdx(rx) < 3 && elapsed(rx) >= 15, level: 'DANGER', msg: r => `${r.patient} STAT처방 ${Math.floor(elapsed(r))}분 초과!` },
  { check: rx => rx.drugRisk >= 20 && statusIdx(rx) < 3 && elapsed(rx) >= 10, level: 'DANGER', msg: r => `${r.patient} 고위험약물 ${Math.floor(elapsed(r))}분 대기!` },
  { check: rx => rx.type === 'DISCHARGE' && statusIdx(rx) < 3 && elapsed(rx) >= 30, level: 'WARN', msg: r => `${r.patient} 퇴원처방 ${Math.floor(elapsed(r))}분 지연` },
  { check: rx => rx.type === 'VERBAL' && statusIdx(rx) < 3 && elapsed(rx) >= 20, level: 'WARN', msg: r => `${r.patient} 구두오더 ${Math.floor(elapsed(r))}분 지연` },
  { check: rx => rx.status === 'ARRIVED' && elapsed(rx) >= 30 && (Date.now() - (rx._arrivedTime || rx.receivedAt.getTime())) / 60000 >= 30, level: 'WARN', msg: r => `${r.patient} 병동도착 미수령 30분 초과` },
  { check: rx => rx.type === 'REGULAR' && statusIdx(rx) < 3 && elapsed(rx) >= 60, level: 'INFO', msg: r => `${r.patient} 정기처방 ${Math.floor(elapsed(r))}분 지연` }
];
function statusIdx(rx) { if (rx.status === 'REJECTED') return -1; return STATUS_MAP[rx.status] ? STATUS_MAP[rx.status].idx : 0 }
function elapsed(rx) { return (Date.now() - rx.receivedAt.getTime()) / 60000 }
function checkAllAlerts() {
  const alerts = [];
  prescriptions.forEach(rx => { if (rx.status === 'REJECTED') return; ALERT_THRESHOLDS.forEach(t => { if (t.check(rx)) alerts.push({ rxId: rx.id, level: t.level, msg: t.msg(rx) }) }) });
  return alerts;
}

// ─── 상태 전진 (감사 로그 포함) ───
function advanceRx(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx || rx.status === 'REJECTED') return null;
  const curIdx = statusIdx(rx); if (curIdx >= RX_STATUS.length - 1) return null;
  const fromStatus = rx.status;
  rx.status = RX_STATUS[curIdx + 1].key;
  rx.processedBy = currentPharmacist.name;
  if (rx.status === 'CONFIRMED') { completedToday++; rx.confirmedAt = new Date() }
  if (rx.status === 'ARRIVED') rx._arrivedTime = Date.now();
  addAudit(rx.id, rx.patient, fromStatus, rx.status, currentPharmacist.name);
  pharmacistStats[currentPharmacist.id] = (pharmacistStats[currentPharmacist.id] || 0) + 1;
  return rx;
}

// ─── 간호사 수령 확인 ───
function nurseConfirmRx(id, note) {
  const rx = prescriptions.find(r => r.id === id); if (!rx || rx.status !== 'ARRIVED') return null;
  const from = rx.status; rx.status = 'CONFIRMED'; completedToday++;
  rx.confirmedAt = new Date(); rx.nurseNote = note || null;
  rx.confirmedNurse = currentNurse.name + currentNurse.title;
  rx.nursingChecklist = rx.drugRisk >= 15;
  nurseStats[currentNurse.id] = (nurseStats[currentNurse.id] || 0) + 1;
  addAudit(rx.id, rx.patient, from, 'CONFIRMED', currentNurse.name);
  return rx;
}

// ─── 반려 처리 ───
function rejectRx(id, reason, note) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return null;
  const from = rx.status; rx.status = 'REJECTED';
  rx.rejectReason = reason; rx.rejectNote = note || '';
  rx.rejectedBy = currentPharmacist.name; rx.rejectedAt = new Date();
  addAudit(rx.id, rx.patient, from, 'REJECTED', currentPharmacist.name);
  return rx;
}

// ─── Lock 처리 ───
function lockRx(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return false;
  if (rx.lockedBy && rx.lockedAt && (Date.now() - rx.lockedAt.getTime()) < 5 * 60000 && rx.lockedBy !== currentPharmacist.name) return false;
  rx.lockedBy = currentPharmacist.name; rx.lockedAt = new Date(); return true;
}
function unlockRx(id) { const rx = prescriptions.find(r => r.id === id); if (rx) { rx.lockedBy = null; rx.lockedAt = null } }

// ─── 의사 처방 제출 ───
function submitDoctorRx(data) {
  const now = new Date(); const rx = createRx({ ...data, receivedAt: now, status: 'ORDERED' });
  prescriptions.push(rx); rx.priorityScore = calculatePriorityScore(rx);
  addAudit(rx.id, rx.patient, 'NEW', 'ORDERED', '의사');
  setTimeout(() => { if (rx.status === 'ORDERED') { rx.status = 'DUR_CHECK'; rx.durResult = Math.random() > 0.10 ? 'PASS' : 'WARN'; addAudit(rx.id, rx.patient, 'ORDERED', 'DUR_CHECK', '시스템'); setTimeout(() => { if (rx.status === 'DUR_CHECK') { rx.status = 'PHARMACIST_REVIEW'; addAudit(rx.id, rx.patient, 'DUR_CHECK', 'PHARMACIST_REVIEW', '시스템'); if (typeof renderAll === 'function') renderAll() } }, 1500); if (typeof renderAll === 'function') renderAll() } }, 2000);
  return rx;
}

// ─── 정렬 ───
function sortByPriority(arr) { return arr.slice().sort((a, b) => { if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore; return a.receivedAt - b.receivedAt }) }

// ─── 통계 ───
function getStats() {
  const alerts = checkAllAlerts();
  return {
    danger: alerts.filter(a => a.level === 'DANGER').length,
    warn: alerts.filter(a => a.level === 'WARN').length,
    urgent: prescriptions.filter(r => ['STAT', 'VERBAL', 'DISCHARGE', 'PRE_OP'].includes(r.type) && statusIdx(r) >= 0 && statusIdx(r) < 3).length,
    regular: prescriptions.filter(r => !['STAT', 'VERBAL', 'DISCHARGE', 'PRE_OP'].includes(r.type) && statusIdx(r) >= 0 && statusIdx(r) < 3).length,
    dispensing: prescriptions.filter(r => r.status === 'DISPENSING' || r.status === 'FINAL_CHECK').length,
    delivering: prescriptions.filter(r => r.status === 'DELIVERING').length,
    completed: completedToday, alerts
  };
}
function getAdminStats() {
  const byType = {}; Object.keys(RX_TYPES).forEach(t => byType[t] = { total: 0, inQueue: 0, done: 0 });
  prescriptions.filter(r => r.status !== 'REJECTED').forEach(rx => { if (byType[rx.type]) { byType[rx.type].total++; if (statusIdx(rx) >= 6) byType[rx.type].done++; else byType[rx.type].inQueue++ } });
  const byWard = {}; prescriptions.filter(r => r.status !== 'REJECTED').forEach(rx => { if (!byWard[rx.ward]) byWard[rx.ward] = { count: 0, totalWait: 0 }; byWard[rx.ward].count++; byWard[rx.ward].totalWait += elapsed(rx) });
  Object.values(byWard).forEach(w => w.avgWait = Math.round(w.totalWait / w.count));
  const byPrep = {}; Object.keys(PREP_METHODS).forEach(k => byPrep[k] = 0);
  prescriptions.filter(r => r.status !== 'REJECTED').forEach(rx => { if (byPrep[rx.prepMethod] !== undefined) byPrep[rx.prepMethod]++ });
  const scoreDistribution = [0, 0, 0, 0];
  prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) < 6).forEach(rx => { const s = rx.priorityScore; if (s >= 80) scoreDistribution[3]++; else if (s >= 60) scoreDistribution[2]++; else if (s >= 40) scoreDistribution[1]++; else scoreDistribution[0]++ });
  const byHour = {}; prescriptions.forEach(rx => { const h = rx.receivedAt.getHours(); byHour[h] = (byHour[h] || 0) + 1 });
  return { byType, byWard, byPrep, scoreDistribution, byHour };
}
