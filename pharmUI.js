/* =============================================
   PharmFlow v4 — pharmUI.js
   전체 UI: 검색, 필터, 야간모드, Five Rights,
   고위험 경고, 반려, Lock, EMR 시뮬, 라인차트,
   감사로그, 약사 대시보드, 간호사 메모
   ============================================= */
let curTab = 0, pharmPage = 0, pipeFilter = -1, compCollapsed = false, nightMode = false, searchQuery = '', typeFilter = 'ALL';
const PAGE_SIZE = 8;

// ─── Autocomplete DB ───
const WARD_ROOMS = { 'ICU': [101, 110], 'CCU': [101, 110], 'SICU': [101, 110], 'MICU': [101, 110], 'ER': [201, 220], 'OR': [101, 110], 'PACU': [101, 110], 'NICU': [101, 110], '소아과': [801, 820], '40병동': [401, 430], '41병동': [411, 430], '42병동': [421, 440], '51병동': [501, 530], '52병동': [521, 540], '62병동': [601, 630], '71병동': [701, 730], '72병동': [721, 740], '81병동': [801, 830], '82병동': [821, 840] };
const WARD_LIST = Object.keys(WARD_ROOMS);
const MED_LIST = [{ name: 'Norepinephrine 8mg', route: 'IV' }, { name: 'Dopamine 200mg', route: 'IV' }, { name: 'Vasopressin 20U', route: 'IV' }, { name: 'Epinephrine 1mg', route: 'IV' }, { name: 'Insulin Regular 50U', route: 'IV' }, { name: 'Insulin Glargine 20U', route: 'SC' }, { name: 'Morphine 5mg', route: 'IV' }, { name: 'Pethidine 50mg', route: 'IM' }, { name: 'Fentanyl 100mcg', route: 'IV' }, { name: 'KCl 40mEq', route: 'IV' }, { name: 'NaCl 3% 500ml', route: 'IV' }, { name: 'Vancomycin 1g', route: 'IV' }, { name: 'Vancomycin 1.5g', route: 'IV' }, { name: 'Meropenem 1g', route: 'IV' }, { name: 'Piperacillin/Tazobactam 4.5g', route: 'IV' }, { name: 'Ceftriaxone 1g', route: 'IV' }, { name: 'Ceftriaxone 2g', route: 'IV' }, { name: 'Cefazolin 1g', route: 'IV' }, { name: 'Ciprofloxacin 400mg', route: 'IV' }, { name: 'Heparin 5000U', route: 'IV' }, { name: 'Enoxaparin 40mg', route: 'SC' }, { name: 'Warfarin 2mg', route: 'PO' }, { name: 'Aspirin 100mg', route: 'PO' }, { name: 'Clopidogrel 75mg', route: 'PO' }, { name: 'Phenytoin 300mg', route: 'IV' }, { name: 'Levetiracetam 500mg', route: 'IV' }, { name: 'Phenobarbital 20mg/kg', route: 'IV' }, { name: 'tPA 90mg', route: 'IV' }, { name: 'Cisplatin 75mg/m²', route: 'IV' }, { name: 'Rituximab 375mg', route: 'IV' }, { name: 'Ondansetron 8mg', route: 'IV' }, { name: 'Furosemide 20mg', route: 'IV' }, { name: 'Furosemide 40mg', route: 'PO' }, { name: 'Metformin 500mg', route: 'PO' }, { name: 'Amlodipine 5mg', route: 'PO' }, { name: 'Atorvastatin 20mg', route: 'PO' }, { name: 'Pantoprazole 40mg', route: 'PO' }, { name: 'Midazolam 2mg', route: 'IV' }, { name: 'Propofol 200mg', route: 'IV' }, { name: 'Dexamethasone 5mg', route: 'IV' }, { name: 'Albumin 20% 100ml', route: 'IV' }, { name: 'TPN 1000ml', route: 'IV' }, { name: 'Celecoxib 200mg', route: 'PO' }, { name: 'Mannitol 200ml', route: 'IV' }, { name: 'Acyclovir 10mg/kg', route: 'IV' }, { name: 'Ampicillin 50mg/kg', route: 'IV' }, { name: 'Tamsulosin 0.4mg', route: 'PO' }, { name: 'Metformin 1000mg', route: 'PO' }];
const DIAG_LIST = ['패혈증(Sepsis)', '패혈성 쇼크', 'DKA', '급성심근경색(AMI)', '심부전(Heart Failure)', '뇌졸중(Stroke)', '뇌출혈', '간질(Epilepsy)', 'DVT(심부정맥혈전증)', '폐색전증(PE)', '폐렴', 'MRSA 폐렴', '요로감염', '급성복통', '충수염', '장폐색', '당뇨병', '고혈압', '만성신부전', '위장관출혈', '간경변', '유방암', '폐암', '대장암', '혈액암', '열성경련', '저칼륨혈증', '심인성 쇼크', '급성 폐부종', '두개내압 상승', '뇌부종', '신생아 경련', '세균성 뇌막염', '단순포진 뇌염', 'C. diff 감염', '요로패혈증'];
const TYPE_COLORS = { STAT: '#ff6b6b', VERBAL: '#ffa94d', DISCHARGE: '#cc5de8', PRE_OP: '#20c997', FIRST_DOSE: '#51cf66', PRN: '#ffd43b', REGULAR: '#74c0fc' };
const PREP_COLORS = { ATC: '#45aaf2', INJ: '#4a9eff', STERILE: '#cc5de8', NARC: '#ff6b6b', MANUAL: '#a0aec0' };
const REJECT_REASONS = ['처방 오류', '약물 부족', '의사 재확인 필요', 'DUR 추가검토', '기타'];

// ─── Utils ───
const $ = id => document.getElementById(id);
function tAgo(d) { const m = Math.floor((Date.now() - d.getTime()) / 60000); return m < 1 ? '방금' : m + '분 전' }
function fTime(d) { return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) }
function ini(n) { return n.charAt(0) }
function toast(m, t) { const e = $('toast'); e.textContent = m; e.className = 'toast ' + (t || 'info'); setTimeout(() => e.classList.add('show'), 10); setTimeout(() => e.classList.remove('show'), 3000) }
function hl(text, q) { if (!q) return text; const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'); return text.replace(re, '<mark>$1</mark>') }

// ─── Tab / Clock / Night Mode ───
function switchTab(i) { curTab = i; document.querySelectorAll('.tab').forEach((t, j) => t.classList.toggle('on', j === i)); document.querySelectorAll('.view').forEach((v, j) => v.classList.toggle('on', j === i)); renderAll() }
function updateClock() { const n = new Date(); $('cDate').textContent = n.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }); $('cTime').textContent = n.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
function toggleNight() { nightMode = !nightMode; document.body.classList.toggle('night', nightMode); $('nightBtn').textContent = nightMode ? '☀️ 주간' : '🌙 야간'; if (nightMode) { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(); const g = ac.createGain(); o.connect(g); g.connect(ac.destination); o.frequency.setValueAtTime(800, ac.currentTime); g.gain.setValueAtTime(0.1, ac.currentTime); o.start(); o.stop(ac.currentTime + 0.15) } catch (e) { } } }

// ─── Pharmacist selector ───
function onPharmSelect() { const v = $('pharmSel').value; currentPharmacist = PHARMACISTS.find(p => p.id === v) || PHARMACISTS[0] }

// ─── Pipeline ───
function renderPipeline() { const counts = RX_STATUS.map(s => prescriptions.filter(r => r.status === s.key).length); $('pipeline').innerHTML = RX_STATUS.slice(0, 7).map((s, i) => `<div class="pp-s ${counts[i] > 0 ? 'hi' : ''} ${pipeFilter === i ? 'active' : ''}" onclick="togglePipeFilter(${i})"><div class="pp-n">${counts[i]}</div><div class="pp-l">${s.label}</div></div>` + (i < 6 ? '<span class="pp-a">→</span>' : '')).join('') }
function togglePipeFilter(i) { pipeFilter = pipeFilter === i ? -1 : i; pharmPage = 0; renderAll() }

// ─── Alert Banner ───
function renderAlerts() { const alerts = checkAllAlerts(); const ban = $('alertBan'); if (!alerts.length) { ban.className = 'alert-ban safe'; ban.innerHTML = '<span class="al-safe">✅ 현재 위험 경고 없음</span>'; return } const sorted = [...alerts.filter(a => a.level === 'DANGER'), ...alerts.filter(a => a.level === 'WARN'), ...alerts.filter(a => a.level === 'INFO')]; const show = sorted.slice(0, 2); const extra = sorted.length - 2; ban.className = 'alert-ban danger'; let html = show.map((a, i) => `<span class="al-item ${a.level === 'DANGER' ? 'al-d' : 'al-w'}">${a.level === 'DANGER' ? '🔴' : '🟠'} [${i + 1}순위] ${a.msg}</span>`).join(' '); if (extra > 0) html += `<button class="al-more" onclick="showAlertModal()">+${extra}건 더보기</button>`; ban.innerHTML = html }
function showAlertModal() { const alerts = checkAllAlerts(); const s = [...alerts.filter(a => a.level === 'DANGER'), ...alerts.filter(a => a.level === 'WARN'), ...alerts.filter(a => a.level === 'INFO')]; $('modalC').innerHTML = `<h2>⚠️ 전체 경고 (${s.length}건)</h2>${s.map(a => `<div class="ah-item ${a.level === 'DANGER' ? 'ah-d' : 'ah-w'}">${a.level === 'DANGER' ? '🔴' : '🟠'} ${a.msg}</div>`).join('')}<div class="modal-actions"><button class="modal-btn cancel" onclick="closeModal()">닫기</button></div>`; $('modal').classList.add('on') }

// ─── Stats ───
function renderStats() { const s = getStats(); $('statsBar').innerHTML = [['🔴', s.danger, '위험경고'], ['🟠', s.warn, '주의경고'], ['🚨', s.urgent, '긴급대기'], ['📋', s.regular, '일반대기'], ['⏳', s.dispensing, '조제중'], ['🚗', s.delivering, '배송중'], ['✅', s.completed, '오늘완료']].map(x => `<div class="st"><span class="st-i">${x[0]}</span><b>${x[1]}</b><span class="st-l">${x[2]}</span></div>`).join('') }

// ─── Pharmacist View ───
function getQueueItems() {
  let q = prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) <= 4);
  if (pipeFilter >= 0) q = q.filter(r => statusIdx(r) === pipeFilter);
  if (typeFilter !== 'ALL') { if (typeFilter === 'HIGH_ALERT') q = q.filter(r => r.drugRisk >= 15); else q = q.filter(r => r.type === typeFilter) }
  if (searchQuery) { const sq = searchQuery.toLowerCase(); q = q.filter(r => r.patient.toLowerCase().includes(sq) || r.meds.join(' ').toLowerCase().includes(sq)) }
  return sortByPriority(q);
}
function renderPharmacist() {
  recalcAllScores(); const sorted = getQueueItems(); const allSorted = sortByPriority(prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) <= 4));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)); if (pharmPage >= totalPages) pharmPage = totalPages - 1;
  const start = pharmPage * PAGE_SIZE; const pageItems = sorted.slice(start, start + PAGE_SIZE);
  $('pharmQueue').innerHTML = pageItems.length ? pageItems.map((rx, i) => { const globalRank = allSorted.findIndex(r => r.id === rx.id) + 1; return rxCard(rx, globalRank) }).join('') : '<div class="q-empty">처방 큐가 비어 있습니다</div>';
  $('pharmQCt').textContent = sorted.length + '건';
  $('pager').innerHTML = sorted.length > PAGE_SIZE ? `<button class="pg-btn" onclick="pharmPage--;renderPharmacist()" ${pharmPage <= 0 ? 'disabled' : ''}>◀ 이전</button><span class="pg-info">${pharmPage + 1} / ${totalPages} 페이지 (총 ${sorted.length}건)</span><button class="pg-btn" onclick="pharmPage++;renderPharmacist()" ${pharmPage >= totalPages - 1 ? 'disabled' : ''}>다음 ▶</button>` : '';
  const completed = prescriptions.filter(r => statusIdx(r) >= 5 || r.status === 'CONFIRMED').sort((a, b) => (b.confirmedAt || b.receivedAt) - (a.confirmedAt || a.receivedAt));
  const cEl = $('pharmComp'); cEl.className = 'comp-bd' + (compCollapsed ? ' collapsed' : '');
  cEl.innerHTML = completed.length ? completed.slice(0, 12).map(rx => { const si = statusIdx(rx); const ty = RX_TYPES[rx.type] || RX_TYPES.REGULAR; return `<div class="cmp-c"><div class="av" style="background:${ty.color};width:24px;height:24px;font-size:10px">${ini(rx.patient)}</div><div style="flex:1"><div style="font-size:11px;font-weight:700">${rx.patient}</div><div style="font-size:9px;color:var(--t2)">${rx.meds[0]}${rx.nurseNote ? ' · 📝' + rx.nurseNote : ''}</div></div><span class="s-bdg s${Math.max(0, si)}" style="font-size:9px">${si >= 0 ? RX_STATUS[si].icon : '📦'}</span></div>` }).join('') : '<div class="q-empty" style="width:100%">없음</div>';
  $('pharmCompCt').textContent = completed.length + '건';
  renderSidePanel();
}
function rxCard(rx, rank) {
  const si = statusIdx(rx); const ty = RX_TYPES[rx.type] || RX_TYPES.REGULAR; const rt = ROUTES[rx.route] || ROUTES.PO; const pm = PREP_METHODS[rx.prepMethod] || PREP_METHODS.MANUAL;
  const mins = elapsed(rx); const isAlerted = (rx.type === 'STAT' && mins >= 15) || (rx.drugRisk >= 20 && mins >= 10); const isWarn = (rx.type === 'DISCHARGE' && mins >= 30) || (rx.type === 'VERBAL' && mins >= 20);
  const blinkCls = isAlerted ? 'blink-red' : isWarn ? 'blink-orange' : ''; const rankCls = rank <= 3 ? 'r1' : rank <= 8 ? 'r2' : 'r3';
  let lockH = ''; if (rx.lockedBy) lockH = `<span class="lock-bdg">🔒 ${rx.lockedBy}</span>`;
  let syncH = ''; if (rx.syncStatus === 'SYNCED') syncH = '<span title="EMR 연동됨" style="font-size:10px">🟢</span>'; else if (rx.syncStatus === 'CONFLICT') syncH = '<span title="데이터 충돌" style="font-size:10px">🟡</span>';
  const etaH = rx.type === 'DISCHARGE' && rx.eta ? `<span class="rx-eta">⏱${Math.max(0, Math.ceil((rx.eta.getTime() - Date.now()) / 60000))}분</span>` : '';
  const voH = rx.type === 'VERBAL' && !rx.isVerbalConfirmed ? '<span class="rx-vo">📋 서면확인 대기</span>' : '';
  const actionBtn = getActionBtn(rx); const rejectBtn = `<button class="btn b-rej" onclick="event.stopPropagation();showRejectModal(${rx.id})" title="반려">✕</button>`;
  const drugText = hl(rx.meds.join(' + '), searchQuery); const nameText = hl(rx.patient, searchQuery);
  return `<div class="rx ${blinkCls} ${nightMode && rx.type === 'STAT' ? 'night-stat' : ''}" onclick="showDetail(${rx.id})"><div class="rx-rank"><div class="rank-n ${rankCls}">#${rank}</div></div><div class="rx-body"><div class="rx-top"><div class="rx-pt"><div class="av" style="background:${ty.color}">${ini(rx.patient)}</div><div><div class="pt-nm">${nameText} ${syncH}</div><div class="pt-wd">${rx.ward} ${rx.room}</div></div></div><div class="badges">${lockH}<span class="bdg" style="background:${ty.color}22;color:${ty.color};border:1px solid ${ty.color}44">${ty.label}</span><span class="bdg" style="background:${rt.color}22;color:${rt.color};border:1px solid ${rt.color}44">${rt.label}</span><span class="bdg" style="background:${pm.color}22;color:${pm.color};border:1px solid ${pm.color}44">${pm.icon} ${pm.label}</span>${rx.drugRisk >= 15 ? '<span class="bdg ha">⚠ 고위험</span>' : ''}</div></div><div class="rx-drug">${drugText}</div><div class="rx-drug-detail">${rx.route} · ${tAgo(rx.receivedAt)} 접수 ${etaH} ${voH}</div><div class="rx-bot"><div class="rx-meta"><span class="s-bdg s${si}">${RX_STATUS[si].icon} ${RX_STATUS[si].label}</span></div><div class="rx-act" onclick="event.stopPropagation()">${actionBtn} ${rejectBtn}</div></div></div></div>`
}
function getActionBtn(rx) { const si = statusIdx(rx); const map = { 0: ['📋 처방 검토', 'b-blue'], 1: ['🔍 DUR 완료', 'b-blue'], 2: ['✅ 조제 지시', 'b-green', 'five'], 3: ['🏷️ 조제 완료', 'b-orange', 'high'], 4: ['🚀 배송 출발', 'b-blue'], 5: ['📦 도착 확인', 'b-green'] }; if (!map[si]) return ''; const [label, cls, special] = map[si]; if (special === 'five') return `<button class="btn ${cls}" onclick="showFiveRights(${rx.id})">${label}</button>`; if (special === 'high' && rx.drugRisk >= 20) return `<button class="btn ${cls}" onclick="showHighAlert(${rx.id})">${label}</button>`; return `<button class="btn ${cls}" onclick="doAdvance(${rx.id})">${label}</button>` }

function renderSidePanel() {
  const alerts = checkAllAlerts();
  $('sideAlerts').innerHTML = alerts.length ? alerts.slice(0, 5).map(a => `<div class="sa-item ${a.level === 'DANGER' ? 'sa-d' : 'sa-w'}">${a.level === 'DANGER' ? '🔴' : '🟠'} ${a.msg}</div>`).join('') : '<div style="color:var(--t3);font-size:11px;padding:8px">경고 없음 ✅</div>';
  const byPrep = {}; Object.keys(PREP_METHODS).forEach(k => byPrep[k] = 0); prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) <= 4).forEach(r => { if (byPrep[r.prepMethod] !== undefined) byPrep[r.prepMethod]++ });
  $('sidePrep').innerHTML = Object.entries(PREP_METHODS).map(([k, v]) => `<div class="sp-item"><span>${v.icon} ${v.label}</span><b>${byPrep[k] || 0}</b></div>`).join('');
  // Pharmacist stats
  $('sidePharm').innerHTML = PHARMACISTS.map(p => `<div class="sp-item"><span>${p.id === currentPharmacist.id ? '👉 ' : ' '}${p.name} ${p.title}</span><b>${pharmacistStats[p.id] || 0}건</b></div>`).join('');
  // Score mini
  const sd = [0, 0, 0, 0]; prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) < 5).forEach(rx => { const s = rx.priorityScore; if (s >= 80) sd[3]++; else if (s >= 60) sd[2]++; else if (s >= 40) sd[1]++; else sd[0]++ });
  $('sidePri').innerHTML = [['🔴', '긴급', sd[3]], ['🟠', '높음', sd[2]], ['🟡', '보통', sd[1]], ['⚪', '낮음', sd[0]]].map(x => `<div class="sp-item"><span>${x[0]} ${x[1]}</span><b>${x[2]}</b></div>`).join('');
}
function toggleComp() { compCollapsed = !compCollapsed; $('pharmComp').classList.toggle('collapsed', compCollapsed) }
function setTypeFilter(t) { typeFilter = t; pharmPage = 0; document.querySelectorAll('.tf-btn').forEach(b => b.classList.toggle('on', b.dataset.f === t)); renderPharmacist() }
function onSearch() { searchQuery = $('searchInput').value.trim(); pharmPage = 0; renderPharmacist() }
function clearSearch() { $('searchInput').value = ''; searchQuery = ''; pharmPage = 0; renderPharmacist() }

// ─── Five Rights Modal ───
function showFiveRights(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  if (!lockRx(id)) { toast('현재 다른 약사가 처리 중입니다', 'warn'); return }
  const labels = ['올바른 환자', '올바른 약물', '올바른 용량', '올바른 경로', '올바른 시간'];
  const vals = [`${rx.patient} / ${rx.ward} ${rx.room}`, rx.meds.join(', '), rx.meds.map(m => { const p = m.match(/[\d.]+\s*(mg|g|U|mEq|ml|mcg|mg\/kg|mg\/m²)/i); return p ? p[0] : '확인필요' }).join(', '), ROUTES[rx.route]?.fullName || rx.route, rx.type === 'STAT' ? '즉시' : '예정'];
  $('modalC').innerHTML = `<h2>✅ Five Rights Check</h2><p style="font-size:11px;color:var(--t2);margin-bottom:12px">조제 전 아래 5개 항목을 모두 확인해주세요.</p>${labels.map((l, i) => `<label class="fr-item"><input type="checkbox" class="fr-cb" onchange="chkFiveRights()"><span class="fr-l">☐ ${l}</span><span class="fr-v">${vals[i]}</span></label>`).join('')}<div class="modal-actions"><button class="modal-btn success" id="frBtn" disabled onclick="confirmFiveRights(${Number(id)})">모두 확인 완료</button><button class="modal-btn cancel" onclick="cancelFiveRights(${Number(id)})">취소</button></div>`;
  $('modal').classList.add('on');
}
function chkFiveRights() { const cbs = document.querySelectorAll('.fr-cb'); const all = [...cbs].every(c => c.checked); $('frBtn').disabled = !all }
function confirmFiveRights(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  rx.fiveRightsCheckedBy = currentPharmacist.name; rx.fiveRightsCheckedAt = new Date();
  doAdvance(id); unlockRx(id); closeModal(); toast(`${rx.patient} Five Rights 확인 완료 → 조제중`, 'ok');
}
function cancelFiveRights(id) { unlockRx(id); closeModal() }

// ─── High Alert Modal ───
function showHighAlert(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  const cat = getDrugAlertCategory(rx.meds.join(' ')); const info = cat ? HIGH_ALERT_CATEGORIES[cat] : { label: '고위험 약물', warnings: ['용량 재확인 필수', '2인 확인 권장'] };
  $('modalC').innerHTML = `<h2>⚠️ 고위험 약물 조제 확인</h2><p style="font-size:11px;color:var(--t2);margin-bottom:8px">이 약물은 <b style="color:var(--ur)">고위험약물(High Alert)</b>로 분류되어 있습니다.</p><div style="background:var(--bg2);padding:10px;border-radius:6px;margin-bottom:10px"><div style="font-size:13px;font-weight:700">${rx.meds.join(' + ')} ${rx.route}</div><div style="font-size:10px;color:var(--yl);margin-top:3px">위험 분류: ${info.label}</div></div><div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--yl);margin-bottom:6px">⚠️ 주의사항:</div>${info.warnings.map(w => `<div style="font-size:11px;color:var(--t2);padding:2px 0">• ${w}</div>`).join('')}</div><div class="fg"><label style="font-size:10px;color:var(--t2)">확인자</label><select class="fs" id="haPharm">${PHARMACISTS.map(p => `<option value="${p.id}">${p.name} ${p.title}</option>`).join('')}</select></div><div class="modal-actions"><button class="modal-btn success" onclick="confirmHighAlert(${Number(id)})">조제 완료 확인</button><button class="modal-btn cancel" onclick="closeModal()">취소</button></div>`;
  $('modal').classList.add('on');
}
function confirmHighAlert(id) { doAdvance(id); closeModal(); toast('고위험 약물 조제 완료 확인', 'ok') }

// ─── Reject Modal ───
function showRejectModal(id) {
  $('modalC').innerHTML = `<h2>❌ 처방 반려</h2><div class="fg"><label>반려 사유 *</label><select class="fs" id="rejReason">${REJECT_REASONS.map(r => `<option>${r}</option>`).join('')}</select></div><div class="fg"><label>추가 메모 (선택)</label><input class="fi" id="rejNote" placeholder="반려 사유 상세"></div><div class="modal-actions"><button class="modal-btn cancel" style="background:#ff475722;color:var(--ur);border-color:#ff475744" onclick="confirmReject(${Number(id)})">반려 확인</button><button class="modal-btn cancel" onclick="closeModal()">취소</button></div>`;
  $('modal').classList.add('on');
}
function confirmReject(id) { const rx = rejectRx(id, $('rejReason').value, $('rejNote').value); if (rx) { closeModal(); toast(`${rx.patient} 처방이 반려되었습니다`, 'warn'); renderAll() } }

// ─── Detail Modal (rank fix: always global) ───
function showDetail(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  const ty = RX_TYPES[rx.type] || RX_TYPES.REGULAR; const rt = ROUTES[rx.route] || ROUTES.PO; const pm = PREP_METHODS[rx.prepMethod] || PREP_METHODS.MANUAL; const si = statusIdx(rx);
  const allSorted = sortByPriority(prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) <= 4));
  const rank = allSorted.findIndex(r => r.id === rx.id) + 1; const reason = getReason(rx); const mins = Math.floor(elapsed(rx));
  let targetH = ''; if (rx.type === 'STAT') targetH = `<div class="modal-row"><span class="label">목표 처리</span><span>30분 이내 (잔여 ${Math.max(0, 30 - mins)}분)</span></div>`;
  let etaH = ''; if (rx.eta) { const rem = Math.max(0, Math.ceil((rx.eta.getTime() - Date.now()) / 60000)); etaH = `<div class="modal-row"><span class="label">예상 완료</span><span>${fTime(rx.eta)} (${rem > 0 ? rem + '분' : '곧'})</span></div>` }
  let syncH = ''; if (rx.emrOrderId) syncH = `<div class="modal-row"><span class="label">EMR ID</span><span>${rx.emrOrderId}</span></div>`;
  const actionBtn = getActionBtn(rx);
  $('modalC').innerHTML = `<h2>👤 ${rx.patient} | ${rx.ward} ${rx.room}</h2><div class="modal-section"><h3>📋 처방 정보</h3><div class="modal-row"><span class="label">처방유형</span><span class="bdg" style="background:${ty.color}22;color:${ty.color};border:1px solid ${ty.color}44;font-size:11px">${ty.label}</span></div><div class="modal-row"><span class="label">약물명</span><span style="font-weight:700;font-size:14px">${rx.meds.join(' + ')} ${rt.label}</span></div><div class="modal-row"><span class="label">조제방식</span><span>${pm.icon} ${pm.label}</span></div><div class="modal-row"><span class="label">위험도</span><span>${rx.drugRisk >= 20 ? '🔴 고위험' : rx.drugRisk >= 10 ? '🟡 주의' : '⚪ 일반'} (${rx.drugRisk}점)</span></div>${syncH}</div><div class="modal-section"><h3>🩺 임상 정보</h3>${rx.diagnosis ? `<div class="modal-row"><span class="label">진단명</span><span>${rx.diagnosis}</span></div>` : ''}<div class="modal-reason">💡 ${reason}<br><span style="font-size:9px;color:var(--t3)">[AI 자동 생성]</span></div></div><div class="modal-section"><h3>⏱️ 시간 정보</h3><div class="modal-row"><span class="label">접수</span><span>${mins}분 전 (${fTime(rx.receivedAt)})</span></div><div class="modal-row"><span class="label">AI 우선순위</span><span style="font-weight:700">#${rank || '-'} (${rx.priorityScore}점)</span></div>${targetH}${etaH}</div><div class="modal-section"><h3>⚠️ 검토 결과</h3><div class="modal-row"><span class="label">DUR</span><span>${rx.durResult === 'PASS' ? '✅ 이상 없음' : rx.durResult === 'WARN' ? '⚠️ 상호작용 주의' : '⏳ 대기중'}</span></div><div class="modal-row"><span class="label">Five Rights</span><span>${rx.fiveRightsCheckedBy ? `✅ ${rx.fiveRightsCheckedBy} (${fTime(rx.fiveRightsCheckedAt)})` : '-'}</span></div></div><div class="modal-actions">${actionBtn ? `<div onclick="closeModal()">${actionBtn}</div>` : ''}<button class="modal-btn cancel" onclick="closeModal()">닫기</button></div>`;
  $('modal').classList.add('on');
}
function getReason(rx) { const l = rx.meds.join(' ').toLowerCase(); if (rx.type === 'STAT') { if (['norepinephrine', 'dopamine', 'vasopressin', 'epinephrine'].some(d => l.includes(d))) return '패혈성 쇼크 / 저혈압으로 즉각 혈압 유지 필요.'; if (['phenytoin', 'phenobarbital', 'levetiracetam'].some(d => l.includes(d))) return '발작/경련 즉각 조절 필요. 항경련제 긴급 투여.'; if (l.includes('tpa') || l.includes('alteplase')) return '급성 허혈성 뇌졸중 골든타임 내 혈전 용해 필요.'; if (['morphine', 'pethidine', 'fentanyl'].some(d => l.includes(d))) return '급성 통증 즉각 조절 필요.'; if (l.includes('heparin')) return 'DVT/PE 의심. 항응고 치료 즉시 시작 필요.'; if (l.includes('insulin')) return 'DKA/고혈당 위기. 인슐린 즉시 투여 필요.'; if (l.includes('furosemide')) return '급성 폐부종으로 이뇨제 긴급 투여 필요.'; if (l.includes('ceftriaxone')) return '세균 감염 응급 치료. 항생제 즉시 투여 필요.'; return '응급 상황. 즉각적인 약물 투여 필요.' } if (rx.type === 'VERBAL') return '의사 구두 지시. 24시간 내 서면 확인 필수.'; if (rx.type === 'DISCHARGE') return '퇴원 후 자가 복용 약물. 퇴원 전 조제 완료 필요.'; if (rx.type === 'PRE_OP') return '수술 전 처치 약물. 수술 시간에 맞춰 투여 필요.'; if (rx.type === 'FIRST_DOSE') { if (['vancomycin', 'meropenem', 'ceftriaxone', 'ampicillin'].some(d => l.includes(d))) return '감염 치료 첫 투약. 알레르기 반응 모니터링 필요.'; if (CHEMO_DRUGS.some(d => l.includes(d))) return '항암제 첫 투약. 과민반응 모니터링 필요.'; return '첫 투약. 초기 반응 모니터링 주의.' } if (rx.diagnosis) return `${rx.diagnosis} 치료를 위한 ${(RX_TYPES[rx.type] || {}).label || ''} 처방.`; return '지속 치료 중인 정기 처방.' }
function closeModal() { $('modal').classList.remove('on') }
$('modal')?.addEventListener('click', e => { if (e.target.id === 'modal') closeModal() });

// ─── Doctor View ───
let selectedType = 'REGULAR';
function initDocForm() { $('dWd').innerHTML = '<option value="">선택...</option>' + WARD_LIST.map(w => `<option value="${w}">${w}</option>`).join(''); const ts = $('typeSel'); ts.innerHTML = Object.entries(RX_TYPES).map(([k, v]) => `<button type="button" class="type-btn ${k === selectedType ? 'on' : ''}" style="${k === selectedType ? `border-color:${v.color};background:${v.color}22;color:${v.color}` : ''}" onclick="selectType('${k}')" data-type="${k}">${v.label}</button>`).join('') }
function selectType(t) { selectedType = t; const ty = RX_TYPES[t]; document.querySelectorAll('.type-btn').forEach(b => { const k = b.dataset.type; const c = RX_TYPES[k]; b.classList.toggle('on', k === t); b.style.borderColor = k === t ? c.color : ''; b.style.background = k === t ? c.color + '22' : ''; b.style.color = k === t ? c.color : '' }); $('docWarnStat').classList.toggle('show', t === 'STAT'); $('docWarnVerbal').classList.toggle('show', t === 'VERBAL'); $('docWarnPreop').classList.toggle('show', t === 'PRE_OP'); $('surgTimeRow').style.display = t === 'PRE_OP' ? '' : 'none' }
function onWardChange() { const wd = $('dWd').value; const rm = $('dRm'); if (!wd || !WARD_ROOMS[wd]) { rm.innerHTML = '<option>—</option>'; return } const [s, e] = WARD_ROOMS[wd]; rm.innerHTML = ''; for (let i = s; i <= e; i++) { const o = document.createElement('option'); o.value = wd.includes('병동') ? i + '호' : '' + i; o.textContent = o.value; rm.appendChild(o) } }
function updatePrepDisplay() { const rt = $('dRt').value; const med = ($('dMed').value || '').toLowerCase(); let p = 'ATC'; if (NARCOTIC_DRUGS.some(d => med.includes(d))) p = 'NARC'; else if (CHEMO_DRUGS.some(d => med.includes(d))) p = 'STERILE'; else if (med.includes('tpn') || med.includes('kcl') || med.includes('albumin')) p = 'STERILE'; else if (rt !== 'PO') p = 'INJ'; $('dPrep').textContent = (PREP_METHODS[p] || PREP_METHODS.MANUAL).icon + ' ' + (PREP_METHODS[p] || PREP_METHODS.MANUAL).label }
function acFilter(inputId, listId, items) { const val = $(inputId).value.toLowerCase(); const list = $(listId); if (!val) { list.classList.remove('on'); return } const isMed = typeof items[0] === 'object' && items[0].name; let matches = isMed ? items.filter(m => m.name.toLowerCase().includes(val)).slice(0, 10) : items.filter(s => s.toLowerCase().includes(val)).slice(0, 10); if (!matches.length) { list.classList.remove('on'); return } list.innerHTML = matches.map(m => isMed ? `<div class="ac-item" onclick="acSelect('${inputId}','${listId}','${m.name}','${m.route}')">${m.name} <span class="ac-sub">${m.route}</span></div>` : `<div class="ac-item" onclick="acSelectSimple('${inputId}','${listId}',this.textContent)">${m}</div>`).join(''); list.classList.add('on') }
function acSelect(i, l, n, r) { $(i).value = n; $(l).classList.remove('on'); $('dRt').value = r; updatePrepDisplay() }
function acSelectSimple(i, l, v) { $(i).value = v; $(l).classList.remove('on') }
document.addEventListener('click', e => { document.querySelectorAll('.ac-list').forEach(l => { if (!l.parentElement.contains(e.target)) l.classList.remove('on') }) });
function submitDoc() { const pt = $('dPt').value.trim(), wd = $('dWd').value, rm = $('dRm').value, diag = $('dDiag').value.trim(), medStr = $('dMed').value.trim(), rt = $('dRt').value; if (!pt || !wd || !rm || !medStr) { toast('모든 필수 항목을 입력해주세요', 'warn'); return } const meds = medStr.split(',').map(m => m.trim()).filter(Boolean); const btn = $('docSubmitBtn'); btn.disabled = true; btn.textContent = '⏳ 약제부 전송 중...'; setTimeout(() => { submitDoctorRx({ patient: pt, ward: wd, room: rm, diagnosis: diag, type: selectedType, meds, route: rt }); $('docLog').innerHTML = `<div class="dl-e">✅ ${fTime(new Date())} — ${pt} (${wd} ${rm}) ${(RX_TYPES[selectedType] || {}).label} 처방 전송됨</div>` + $('docLog').innerHTML;['dPt', 'dDiag', 'dMed'].forEach(x => $(x).value = ''); btn.disabled = false; btn.textContent = '📤 약제부로 처방 전송'; toast(`${pt} 처방이 전송되었습니다`, 'ok'); populateWards(); renderAll() }, 1500) }

// ─── Nurse View (전면 개선) ───
let nurseFilter = 'ALL', nurseCompCollapsed = true;
function onNurseSelect() { const v = $('nurseSel').value; currentNurse = NURSES.find(n => n.id === v) || NURSES[0] }
function populateWards() { const ws = [...new Set(prescriptions.map(r => r.ward))].sort(); $('wSel').innerHTML = '<option value="all">전체 병동</option>' + ws.map(w => `<option value="${w}">${w}</option>`).join('') }
function setNurseFilter(f) { nurseFilter = f; document.querySelectorAll('.nf-btn').forEach(b => b.classList.toggle('on', b.dataset.f === f)); renderNurse() }
function getETA(rx) {
  const si = statusIdx(rx); const mins = Math.floor(elapsed(rx));
  const prepTimes = { ATC: 10, INJ: 15, STERILE: 30, NARC: 20, MANUAL: 15 };
  if (si <= 1) { return Math.max(2, 25 - mins) }
  if (si === 2) { return Math.max(2, 20 - Math.min(mins, 10)) }
  if (si === 3) { const pt = prepTimes[rx.prepMethod] || 15; return Math.max(2, pt - Math.min(mins, pt - 2)) + 5 }
  if (si === 4) { return 5 }
  if (si === 5) { return Math.max(1, 8 - Math.min(mins, 5)) }
  if (si === 6) { return 0 }
  return 0;
}
function getQueueRank(rx) {
  const allQueue = sortByPriority(prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 0 && statusIdx(r) <= 4));
  const idx = allQueue.findIndex(r => r.id === rx.id); return idx >= 0 ? idx + 1 : 0;
}
function getStatusMsg(rx) {
  const si = statusIdx(rx); const rank = getQueueRank(rx); const eta = getETA(rx);
  const rankC = rank <= 3 ? 'var(--ur)' : rank <= 8 ? 'var(--yl)' : 'var(--t3)';
  const rankH = rank > 0 ? ` | <span style="color:${rankC};font-weight:700">약제부 큐 #${rank}</span>` : '';
  if (si <= 1) return `<span style="color:var(--t3)">📝 처방 접수됨 | 조제 대기 중</span>`;
  if (si === 2) return `<span style="color:var(--bl)">👨‍⚕️ 약사 검토 중${rankH}</span>`;
  if (si === 3) return `<span style="color:var(--yl)">⚗️ 조제 중${rankH}</span>`;
  if (si === 4) return `<span style="color:var(--gn)">✅ 감사 중${rankH}</span>`;
  if (si === 5) return `<span style="color:var(--bl)">🚗 배송 중 | 예상 도착 ${eta}분</span>`;
  if (si === 6) return `<span style="color:var(--gn);font-weight:700">📦 병동 도착 — 수령 확인 필요!</span>`;
  if (si === 7) return `<span style="color:var(--gn)">💊 수령 완료</span>`;
  return '';
}
function getETADisplay(rx) {
  const si = statusIdx(rx); if (si >= 6) return si === 6 ? '<span style="color:var(--gn);font-weight:700">지금 바로 수령 가능</span>' : '';
  const eta = getETA(rx);
  if (eta <= 10) return `<span style="color:var(--gn)">🟢 곧 도착 (${eta}분)</span>`;
  if (eta <= 30) return `<span style="color:var(--yl)">🟡 약 ${eta}분 후 도착</span>`;
  return `<span style="color:var(--t3)">⚪ 약 ${eta}분 후 도착</span>`;
}
function renderNurse() {
  const sel = $('wSel').value;
  let f = prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 1);
  if (sel !== 'all') f = f.filter(r => r.ward === sel);
  // filters
  if (nurseFilter === 'PICKUP') f = f.filter(r => r.status === 'ARRIVED');
  else if (nurseFilter === 'DELIVERING') f = f.filter(r => r.status === 'DELIVERING');
  else if (nurseFilter === 'PROCESSING') f = f.filter(r => statusIdx(r) >= 1 && statusIdx(r) <= 4);
  else if (nurseFilter === 'DONE') f = f.filter(r => r.status === 'CONFIRMED');
  f = sortByPriority(f);
  // header stats (병동 기준, 필터 전 전체)
  let allWard = prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 1);
  if (sel !== 'all') allWard = allWard.filter(r => r.ward === sel);
  const nWait = allWard.filter(r => r.status === 'ARRIVED').length;
  const nDeliv = allWard.filter(r => r.status === 'DELIVERING').length;
  const nProc = allWard.filter(r => statusIdx(r) >= 1 && statusIdx(r) <= 4).length;
  const nDone = allWard.filter(r => r.status === 'CONFIRMED').length;
  $('nStatsBar').innerHTML = `<div class="ns-i">📋 총${allWard.length}</div><div class="ns-i">⏳ 대기${nWait}</div><div class="ns-i">🚗 배송${nDeliv}</div><div class="ns-i">⚗️ 조제${nProc}</div><div class="ns-i">✅ 완료${nDone}</div>`;
  $('nInfo').textContent = `${f.length}건`;
  const el = $('nList');
  if (!f.length) { el.innerHTML = '<div class="q-empty" style="padding:40px;width:100%">처방 없음</div>'; renderNurseSide(sel); return }
  el.innerHTML = f.map(rx => {
    const si = statusIdx(rx); const ty = RX_TYPES[rx.type] || RX_TYPES.REGULAR; const rt = ROUTES[rx.route] || ROUTES.PO;
    // progress bar
    let prog = ''; for (let i = 0; i < RX_STATUS.length; i++) { prog += `<div class="dot ${i < si ? 'done' : i === si ? 'cur' : ''}"></div>`; if (i < RX_STATUS.length - 1) prog += `<div class="ln ${i < si ? 'done' : i === si ? 'cur' : ''}"></div>` }
    // labels under dots
    const progLabels = ['접수', 'DUR', '검토', '조제', '감사', '배송', '도착', '완료'];
    let progL = progLabels.map((l, i) => `<span class="pl ${i === si ? 'pl-cur' : i < si ? 'pl-done' : ''}">${l}</span>`).join('');
    // status message
    const statusMsg = getStatusMsg(rx); const etaDisp = getETADisplay(rx);
    // side color
    const bc = si >= 7 ? 'var(--gn)' : si === 6 ? '#27d98c' : si >= 5 ? 'var(--bl)' : si >= 3 ? 'var(--yl)' : rx.type === 'STAT' ? 'var(--ur)' : 'var(--gry)';
    // arrived long
    const arrivedLong = rx.status === 'ARRIVED' && rx._arrivedTime && (Date.now() - rx._arrivedTime) / 60000 >= 30;
    const isArrived = rx.status === 'ARRIVED';
    // verbal
    const voH = rx.type === 'VERBAL' && !rx.isVerbalConfirmed ? `<button class="btn b-sm b-vo" onclick="event.stopPropagation();showVerbalConfirm(${rx.id})">📋 서면 확인</button>` : (rx.type === 'VERBAL' && rx.isVerbalConfirmed ? `<span class="bdg" style="background:#27d98c22;color:var(--gn);border:1px solid #27d98c44;font-size:9px">✅ 서면확인 완료</span>` : '');
    // buttons
    let rcvBtn = ''; if (isArrived) rcvBtn = `<button class="btn b-green b-lg" onclick="event.stopPropagation();showNurseConfirm(${rx.id})">✅ 수령 확인</button>`;
    return `<div class="nc ${isArrived ? 'nc-arrived' : ''} ${arrivedLong ? 'blink-orange' : ''} ${nightMode && rx.type === 'STAT' ? 'nc-stat-night' : ''}"><div class="nc-bar" style="background:${bc}"></div><div class="nc-body"><div class="nc-top"><div class="nc-pt"><div class="av" style="background:${ty.color};width:36px;height:36px;font-size:13px">${ini(rx.patient)}</div><div><div class="nc-nm">👤 ${rx.patient} · ${rx.ward} ${rx.room}${arrivedLong ? ' <span class="bdg ha" style="animation:blO 1s infinite;font-size:9px">🔔 즉시 수령 요망</span>' : ''}</div><div class="nc-drug">💊 ${rx.meds.join(' + ')} ${rt.label} ${rx.drugRisk >= 15 ? '<span class="bdg ha" style="font-size:9px">⚠️ 고위험</span>' : ''}</div>${rx.diagnosis ? `<div class="nc-diag">진단: ${rx.diagnosis}</div>` : ''}</div></div><div class="nc-badges"><span class="bdg" style="background:${ty.color}22;color:${ty.color};border:1px solid ${ty.color}44">${ty.label}</span>${voH}</div></div><div class="nc-sep"></div><div class="nc-status"><div>${statusMsg}</div><div style="margin-top:2px">⏱ 접수 ${tAgo(rx.receivedAt)} | ${etaDisp}</div></div><div class="nc-sep"></div><div class="nc-prog-wrap"><div class="n-prog">${prog}</div><div class="nc-prog-labels">${progL}</div></div>${rcvBtn ? `<div class="nc-sep"></div><div class="nc-actions">${rcvBtn}</div>` : ''}</div></div>`
  }).join('');
  renderNurseSide(sel);
}
function renderNurseSide(ward) {
  let allWard = prescriptions.filter(r => r.status !== 'REJECTED' && statusIdx(r) >= 1);
  if (ward && ward !== 'all') allWard = allWard.filter(r => r.ward === ward);
  // summary
  const nArr = allWard.filter(r => r.status === 'ARRIVED').length;
  const nDel = allWard.filter(r => r.status === 'DELIVERING').length;
  const nDisp = allWard.filter(r => statusIdx(r) >= 1 && statusIdx(r) <= 4).length;
  const nOrd = allWard.filter(r => statusIdx(r) < 2).length;
  const nDone = allWard.filter(r => r.status === 'CONFIRMED').length;
  $('nsSummary').innerHTML = [['📦', nArr, '수령 대기'], ['🚗', nDel, '배송 중'], ['⚗️', nDisp, '조제 중'], ['📝', nOrd, '처방 접수'], ['✅', nDone, '오늘 완료']].map(x => `<div class="sp-item"><span>${x[0]} ${x[2]}</span><b>${x[1]}</b></div>`).join('');
  // top 3 urgent
  const urgent = sortByPriority(allWard.filter(r => statusIdx(r) >= 0 && statusIdx(r) <= 5)).slice(0, 3);
  $('nsUrgent').innerHTML = urgent.length ? urgent.map((rx, i) => { const ty = RX_TYPES[rx.type] || RX_TYPES.REGULAR; return `<div class="ns-mini"><span class="rank-n ${i < 1 ? 'r1' : i < 3 ? 'r2' : 'r3'}" style="width:22px;height:22px;font-size:9px">#${i + 1}</span><div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rx.patient}</div><div style="font-size:9px;color:var(--t2)">${rx.meds[0]} · ${RX_STATUS[statusIdx(rx)].label}</div></div><span style="font-size:9px;color:var(--t3)">${tAgo(rx.receivedAt)}</span></div>` }).join('') : '<div style="font-size:10px;color:var(--t3);padding:4px">없음</div>';
  // uncollected alerts
  const uncollected = allWard.filter(r => r.status === 'ARRIVED' && r._arrivedTime && (Date.now() - r._arrivedTime) / 60000 >= 30);
  $('nsUncollected').innerHTML = uncollected.length ? uncollected.map(rx => `<div class="sa-item sa-w" style="font-size:10px">🔔 ${rx.patient} — ${Math.floor((Date.now() - rx._arrivedTime) / 60000)}분 미수령</div>`).join('') : '<div style="font-size:10px;color:var(--t3);padding:4px">미수령 알림 없음 ✅</div>';
  // completed history
  const completed = allWard.filter(r => r.status === 'CONFIRMED').sort((a, b) => (b.confirmedAt || b.receivedAt) - (a.confirmedAt || a.receivedAt));
  const cEl = $('nsHistBd'); cEl.className = 'comp-bd' + (nurseCompCollapsed ? ' collapsed' : '');
  cEl.innerHTML = completed.length ? completed.map(rx => `<div class="cmp-c" style="flex:0 0 100%"><div class="av" style="background:${(RX_TYPES[rx.type] || RX_TYPES.REGULAR).color};width:24px;height:24px;font-size:10px">${ini(rx.patient)}</div><div style="flex:1"><div style="font-size:10px;font-weight:700">${rx.patient} · ${rx.meds[0]}</div><div style="font-size:9px;color:var(--t2)">${rx.confirmedAt ? fTime(rx.confirmedAt) : '-'} · ${rx.confirmedNurse || '-'}${rx.nurseNote ? ` · 📝${rx.nurseNote}` : ''}</div></div></div>`).join('') : '<div style="font-size:10px;color:var(--t3);padding:4px;width:100%">없음</div>';
  $('nsHistCt').textContent = completed.length + '건';
}
function toggleNurseComp() { nurseCompCollapsed = !nurseCompCollapsed; $('nsHistBd').classList.toggle('collapsed', nurseCompCollapsed) }
// ─── Verbal Confirm Modal ───
function showVerbalConfirm(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  $('modalC').innerHTML = `<h2>📋 구두오더 서면 확인</h2><p style="font-size:11px;color:var(--t2);margin-bottom:12px">${rx.patient} — ${rx.meds.join(', ')}</p><div class="modal-section" style="background:var(--bg2);border-radius:6px;padding:10px"><div class="modal-row"><span class="label">확인 간호사</span><span style="font-weight:700">${currentNurse.name} ${currentNurse.title}</span></div><div class="modal-row"><span class="label">확인 시간</span><span>${fTime(new Date())}</span></div></div><div class="modal-actions"><button class="modal-btn success" onclick="confirmVerbal(${Number(id)})">확인</button><button class="modal-btn cancel" onclick="closeModal()">취소</button></div>`;
  $('modal').classList.add('on');
}
function confirmVerbal(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  rx.isVerbalConfirmed = true; rx.verbalConfirmedBy = currentNurse.name + currentNurse.title; rx.verbalConfirmedAt = new Date();
  closeModal(); toast(`${rx.patient} 구두오더 서면 확인 완료`, 'ok'); renderAll();
}
// ─── Nurse Confirm (with high-alert checklist) ───
function showNurseConfirm(id) {
  const rx = prescriptions.find(r => r.id === id); if (!rx) return;
  if (rx.drugRisk >= 15) {
    const labels = ['환자 이름 및 등록번호 확인', '약물명 및 용량 재확인', `투여경로 확인 (${rx.route})`, '투여 속도 확인', '알레르기 이력 확인', '2인 확인 완료 (고위험 약물 필수)'];
    $('modalC').innerHTML = `<h2>💊 투약 전 안전 체크리스트</h2><p style="font-size:11px;color:var(--t2);margin-bottom:8px">고위험 약물: <b style="color:var(--ur)">${rx.meds.join(', ')} ${rx.route}</b></p>${labels.map(l => `<label class="fr-item"><input type="checkbox" class="ncl-cb" onchange="chkNurseCL()"><span class="fr-l">☐ ${l}</span></label>`).join('')}<div class="fg" style="margin-top:8px"><label>투약 메모 (선택)</label><input class="fi" id="nurseNoteIn" placeholder="예: 혈압 80/50 확인 후 투약"></div><div class="modal-actions"><button class="modal-btn success" id="nclBtn" disabled onclick="doNurseConfirm(${Number(id)})">모두 확인 후 수령 완료</button><button class="modal-btn cancel" onclick="closeModal()">취소</button></div>`;
  } else {
    $('modalC').innerHTML = `<h2>✅ 수령 확인</h2><p style="font-size:11px;color:var(--t2);margin-bottom:8px">${rx.patient} — ${rx.meds.join(', ')}</p><div class="fg"><label>투약 메모 (선택)</label><input class="fi" id="nurseNoteIn" placeholder="예: 혈압 80/50 확인 후 투약"></div><div class="modal-actions"><button class="modal-btn success" onclick="doNurseConfirm(${Number(id)})">수령 확인 완료</button><button class="modal-btn cancel" onclick="closeModal()">취소</button></div>`;
  }
  $('modal').classList.add('on');
}
function chkNurseCL() { const cbs = document.querySelectorAll('.ncl-cb'); const all = [...cbs].every(c => c.checked); $('nclBtn').disabled = !all }


// ─── Admin View ───
function renderAdmin() { const s = getAdminStats(); renderDonutChart('donutChart', s.byType); renderBarChart('barChart', s.byWard); renderScoreDist('scoreDist', s.scoreDistribution); renderPrepStats('prepStats', s.byPrep); renderLineChart('lineChart', s.byHour); renderAuditLog(); const alerts = checkAllAlerts(); $('alertHistory').innerHTML = alerts.length ? alerts.map(a => `<div class="ah-item ${a.level === 'DANGER' ? 'ah-d' : 'ah-w'}">${a.level === 'DANGER' ? '🔴' : '🟠'} ${a.msg}</div>`).join('') : '<div style="color:var(--t3);font-size:12px">경고 없음 ✅</div>' }
function renderDonutChart(id, byType) { const el = $(id); const total = Object.values(byType).reduce((s, v) => s + v.total, 0) || 1; const entries = Object.entries(byType).filter(([, v]) => v.total > 0); let cum = 0; const segs = entries.map(([k, v]) => { const pct = v.total / total * 100; const start = cum; cum += pct; return { key: k, pct, start, color: TYPE_COLORS[k] || '#888', label: (RX_TYPES[k] || {}).label || k, count: v.total } }); el.innerHTML = `<div class="donut" style="background:conic-gradient(${segs.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ')})"><div class="donut-hole"><b>${total}</b><span>전체</span></div></div><div class="donut-leg">${segs.map(s => `<div class="dl-i"><span class="dl-c" style="background:${s.color}"></span>${s.label}: ${s.count}</div>`).join('')}</div><div class="analysis">💡 분석: STAT 처방이 전체의 ${Math.round((segs.find(s => s.key === 'STAT')?.count || 0) / total * 100)}%입니다. 응급 비율이 높을수록 인력 강화가 필요합니다.</div>` }
function renderBarChart(id, byWard) { const el = $(id); const entries = Object.entries(byWard).sort((a, b) => b[1].avgWait - a[1].avgWait); const max = Math.max(...entries.map(([, v]) => v.avgWait), 1); el.innerHTML = entries.map(([w, v]) => { let color = '#74c0fc'; if (w.includes('ICU') || w === 'ER' || w === 'CCU') color = '#ff6b6b'; else if (w.includes('OR') || w === 'PACU' || w === 'NICU') color = '#ffa94d'; else if (w.includes('소아')) color = '#51cf66'; return `<div class="bar-row"><span class="bar-l">${w}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, v.avgWait / max * 100)}%;background:${color}"></div></div><span class="bar-v">${v.avgWait}분</span></div>` }).join('') + `<div class="analysis">💡 평균 대기 30분 초과 병동은 인력 재배치를 권장합니다.</div>` }
function renderScoreDist(id, dist) { const el = $(id); const labels = ['<40 (낮음)', '40-59 (보통)', '60-79 (높음)', '80+ (긴급)']; const colors = ['#a0aec0', '#ffd43b', '#ffa94d', '#ff6b6b']; const max = Math.max(...dist, 1); el.innerHTML = labels.map((l, i) => `<div class="bar-row"><span class="bar-l" style="min-width:100px">${l}</span><div class="bar-track"><div class="bar-fill" style="width:${dist[i] / max * 100}%;background:${colors[i]}"></div></div><span class="bar-v">${dist[i]}건</span></div>`).join('') + `<div class="analysis">💡 고위험(80+) ${dist[3]}건. ${dist[3] > 0 ? '즉각 조치 필요.' : '안정적으로 관리 중.'}</div>` }
function renderPrepStats(id, byPrep) { $(id).innerHTML = Object.entries(PREP_METHODS).map(([k, v]) => `<div class="ps-item"><span class="ps-icon" style="background:${PREP_COLORS[k] || v.color}22;color:${PREP_COLORS[k] || v.color}">${v.icon}</span><div><div style="font-weight:700;font-size:18px">${byPrep[k] || 0}</div><div style="font-size:10px;color:var(--t2)">${v.label}</div></div></div>`).join('') + `<div class="analysis">💡 주사조제(${byPrep.INJ || 0})와 무균조제(${byPrep.STERILE || 0}) 비율 모니터링 필요.</div>` }
function renderLineChart(id, byHour) {
  const el = $(id); if (!el) return; const curH = new Date().getHours(); const hours = []; for (let h = 6; h <= 23; h++)hours.push(h); for (let h = 0; h <= 5; h++)hours.push(h); const maxV = Math.max(...hours.map(h => byHour[h] || 0), 1); const w = 500, ht = 120, px = 14, py = 10; const pts = hours.map((h, i) => { const x = px + i * (w - 2 * px) / (hours.length - 1); const y = ht - py - (byHour[h] || 0) / maxV * (ht - 2 * py); return { h, x, y, v: byHour[h] || 0 } }); const line = pts.map((p, i) => i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`).join(''); const peak = pts.reduce((a, b) => a.v > b.v ? a : b);
  el.innerHTML = `<svg viewBox="0 0 ${w} ${ht + 20}" style="width:100%;height:auto"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a9eff" stop-opacity="0.3"/><stop offset="100%" stop-color="#4a9eff" stop-opacity="0"/></linearGradient></defs><path d="${line} L${pts[pts.length - 1].x},${ht - py} L${pts[0].x},${ht - py} Z" fill="url(#lg)"/><path d="${line}" fill="none" stroke="#4a9eff" stroke-width="2"/>${pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="${p.h === curH ? 5 : 2.5}" fill="${p.h === curH ? '#ff6b6b' : '#4a9eff'}" stroke="${p.h === curH ? '#fff' : 'none'}" stroke-width="${p.h === curH ? 2 : 0}"/>`).join('')}${pts.filter((_, i) => i % 3 === 0).map(p => `<text x="${p.x}" y="${ht + 12}" text-anchor="middle" fill="#5d6b7e" font-size="8">${p.h}시</text>`).join('')}</svg><div class="analysis">💡 피크 시간대: ${peak.h}시 (${peak.v}건). 해당 시간대 약사 배치 강화를 권장합니다.</div>`
}
function renderAuditLog() { const el = $('auditLogList'); if (!el) return; el.innerHTML = auditLog.length ? auditLog.slice(0, 30).map(a => `<div class="audit-item"><span class="audit-time">${fTime(a.time)}</span><span class="audit-who">${a.pharmacist}</span><span>${a.patient}: ${a.from}→${a.to}</span></div>`).join('') : '<div style="color:var(--t3);font-size:11px">기록 없음</div>' }

// ─── EMR Simulation ───
function simulateEMR() { const names = ['김현수', '이지영', '박성호']; const types = ['STAT', 'REGULAR', 'FIRST_DOSE']; const meds = [['Vancomycin 1g'], ['Aspirin 100mg'], ['Ceftriaxone 2g']]; const wards = ['ICU', '40병동', 'ER']; const routes = ['IV', 'PO', 'IV']; const cnt = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < cnt; i++) { const rx = submitDoctorRx({ patient: names[i % 3] + Math.floor(Math.random() * 100), ward: wards[i % 3], room: i % 3 === 1 ? '405호' : '10' + (3 + i), diagnosis: '', type: types[i % 3], meds: meds[i % 3], route: routes[i % 3] }); rx.emrOrderId = 'ORD-2026-' + String(Math.floor(Math.random() * 99999)).padStart(5, '0'); rx.syncStatus = 'SYNCED'; rx.lastSyncAt = new Date() } toast(`EMR에서 ${cnt}건 신규 처방 수신`, 'ok'); populateWards(); renderAll() }

// ─── Actions ───
function doAdvance(id) { id = Number(id); const rx = advanceRx(id); if (rx) { toast(`${rx.patient} → ${STATUS_MAP[rx.status]?.label || rx.status}`, 'ok'); renderAll() } }
function doNurseConfirm(id) { id = Number(id); const note = $('nurseNoteIn')?.value || ''; const rx = nurseConfirmRx(id, note); if (rx) { closeModal(); toast(`${rx.patient} — 수령 확인 완료!`, 'ok'); renderAll() } }

// ─── Render All ───
function renderAll() { recalcAllScores(); renderPipeline(); renderStats(); renderAlerts(); renderPharmacist(); renderNurse(); if (curTab === 3) renderAdmin() }

// ─── Init ───
function initApp() { initSampleData(); recalcAllScores(); populateWards(); initDocForm(); updateClock(); setInterval(updateClock, 1000); setInterval(() => { recalcAllScores(); renderAll() }, 30000); $('pharmSel').innerHTML = PHARMACISTS.map(p => `<option value="${p.id}">${p.name} ${p.title}</option>`).join(''); $('nurseSel').innerHTML = NURSES.map(n => `<option value="${n.id}">${n.name} ${n.title}</option>`).join(''); renderAll() }
document.addEventListener('DOMContentLoaded', initApp);
