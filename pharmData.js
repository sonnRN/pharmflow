/* =============================================
   PharmFlow v4 — pharmData.js
   데이터 상수, 타입 정의, 45명 환자, EMR 필드,
   감사로그, 약사 시스템, API stub
   ============================================= */

// ─── 처방 유형 ───
const RX_TYPES = {
  STAT:      { key:'STAT',      label:'응급(STAT)',   color:'#ff4757', score:35 },
  VERBAL:    { key:'VERBAL',    label:'구두오더',     color:'#ff9f43', score:30 },
  DISCHARGE: { key:'DISCHARGE', label:'퇴원처방',     color:'#a55eea', score:25 },
  PRE_OP:    { key:'PRE_OP',    label:'수술전처방',   color:'#2bcbba', score:25 },
  FIRST_DOSE:{ key:'FIRST_DOSE',label:'첫투약',       color:'#20bf6b', score:20 },
  PRN:       { key:'PRN',       label:'PRN',          color:'#fed330', score:15 },
  REGULAR:   { key:'REGULAR',   label:'정기처방',     color:'#4a9eff', score:10 }
};

// ─── 처방 상태 (REJECTED 추가) ───
const RX_STATUS = [
  { key:'ORDERED',           label:'OCS입력',    icon:'📝', idx:0 },
  { key:'DUR_CHECK',         label:'DUR검토',    icon:'🔍', idx:1 },
  { key:'PHARMACIST_REVIEW', label:'약사검토',    icon:'👨‍⚕️', idx:2 },
  { key:'DISPENSING',        label:'조제중',      icon:'⚗️', idx:3 },
  { key:'FINAL_CHECK',       label:'감사완료',    icon:'✅', idx:4 },
  { key:'DELIVERING',        label:'배송중',      icon:'🚀', idx:5 },
  { key:'ARRIVED',           label:'병동도착',    icon:'📦', idx:6 },
  { key:'CONFIRMED',         label:'수령완료',    icon:'💊', idx:7 }
];
const STATUS_MAP = {};
RX_STATUS.forEach(s => STATUS_MAP[s.key] = s);
STATUS_MAP['REJECTED'] = { key:'REJECTED', label:'반려됨', icon:'❌', idx:-1 };

// ─── 투여경로 ───
const ROUTES = {
  PO:{ label:'PO', color:'#20bf6b', fullName:'경구' },
  IV:{ label:'IV', color:'#4a9eff', fullName:'정맥주사' },
  IM:{ label:'IM', color:'#a55eea', fullName:'근육주사' },
  SC:{ label:'SC', color:'#2bcbba', fullName:'피하주사' }
};

// ─── 조제방식 ───
const PREP_METHODS = {
  ATC:    { label:'ATC조제',  icon:'🤖', color:'#45aaf2' },
  INJ:    { label:'주사조제',  icon:'💉', color:'#4a9eff' },
  STERILE:{ label:'무균조제',  icon:'🧪', color:'#a55eea' },
  NARC:   { label:'마약조제',  icon:'🔐', color:'#ff4757' },
  MANUAL: { label:'수작업',    icon:'✋', color:'#8892a4' }
};

// ─── 약사 목록 ───
const PHARMACISTS = [
  { id:'P001', name:'김민준', title:'수석약사' },
  { id:'P002', name:'이수현', title:'약사' },
  { id:'P003', name:'박지호', title:'약사' },
  { id:'P004', name:'최은정', title:'약사' }
];
let currentPharmacist = PHARMACISTS[0];

// ─── 간호사 목록 ───
const NURSES = [
  {id:'n1', name:'김간호', title:'(책임)'},
  {id:'n2', name:'이간호', title:'(주임)'},
  {id:'n3', name:'박간호', title:''},
  {id:'n4', name:'최간호', title:''},
  {id:'n5', name:'정간호', title:''}
];
let currentNurse = NURSES[0];
let nurseStats = {};
NURSES.forEach(n=>nurseStats[n.id]=0);

// ─── 병동/환경 점수 ───
const WARD_SCORES = {
  'ICU':20,'CCU':20,'SICU':20,'MICU':20,
  'ER':18,'응급실':18,'OR':16,'PACU':16,'수술실':16,'회복실':16,
  'NICU':18,'신생아실':18,'소아과':12,
  'default_general':8,'rehab':5,'재활':5
};

// ─── 고위험 약물 DB ───
const HIGH_ALERT_DRUGS = {
  'warfarin':25,'heparin':25,'enoxaparin':25,'lmwh':25,
  'norepinephrine':25,'dopamine':25,'vasopressin':25,'epinephrine':25,
  'insulin':20,'morphine':20,'pethidine':20,'fentanyl':20,'hydromorphone':20,'oxycodone':20,
  'cisplatin':20,'carboplatin':20,'doxorubicin':20,'paclitaxel':20,'taxol':20,
  'rituximab':20,'cyclophosphamide':20,'methotrexate':20,'fluorouracil':20,
  'kcl':18,'potassium chloride':18,'nacl 3%':18,
  'tpa':25,'alteplase':25,
  'phenytoin':15,'valproate':15,'phenobarbital':15,'levetiracetam':15,
  'vancomycin':15,'meropenem':15,'piperacillin':15,'imipenem':15,'colistin':15,
  'midazolam':15,'propofol':15,'ketamine':15,'mannitol':10,'acyclovir':10
};
const GENERAL_ANTIBIOTICS = ['ceftriaxone','cefazolin','amoxicillin','ampicillin','azithromycin','ciprofloxacin','levofloxacin','metronidazole','clindamycin','doxycycline'];
const CHEMO_DRUGS = ['cisplatin','carboplatin','doxorubicin','paclitaxel','taxol','rituximab','cyclophosphamide','methotrexate','fluorouracil','vincristine','etoposide','irinotecan','oxaliplatin','gemcitabine','bevacizumab'];
const NARCOTIC_DRUGS = ['morphine','pethidine','fentanyl','hydromorphone','oxycodone','codeine','remifentanil','sufentanil'];

// ─── 고위험 약물 경고 카테고리 ───
const HIGH_ALERT_CATEGORIES = {
  anticoagulant:{label:'항응고제',warnings:['출혈 위험 확인','용량 정확도 재확인','INR/aPTT 수치 확인','해독제(Protamine/Vit K) 준비']},
  vasopressor:{label:'승압제 (혈관작용제)',warnings:['희석 농도 확인','투여 속도 확인','중심정맥관 확인','2인 확인 권장']},
  insulin:{label:'인슐린',warnings:['혈당 수치 확인','단위(U) 오독 주의','인슐린 종류 재확인','저혈당 대비 포도당 준비']},
  narcotic:{label:'마약성 진통제',warnings:['마약 관리대장 기록','이중 잠금 확인','호흡 억제 모니터링','Naloxone 준비']},
  chemo:{label:'항암제',warnings:['무균 환경 확인','보호구(PPE) 착용','용량 체표면적(BSA) 재계산','extravasation 키트 준비']},
  electrolyte:{label:'전해질 농축액',warnings:['희석 후 투여 필수','투여 속도 엄수','심전도 모니터링 확인','혈중 농도 모니터링']}
};

function getDrugAlertCategory(medName){
  const l=medName.toLowerCase();
  if(['warfarin','heparin','enoxaparin'].some(d=>l.includes(d)))return'anticoagulant';
  if(['norepinephrine','dopamine','vasopressin','epinephrine'].some(d=>l.includes(d)))return'vasopressor';
  if(l.includes('insulin'))return'insulin';
  if(NARCOTIC_DRUGS.some(d=>l.includes(d)))return'narcotic';
  if(CHEMO_DRUGS.some(d=>l.includes(d)))return'chemo';
  if(['kcl','nacl 3%','potassium'].some(d=>l.includes(d)))return'electrolyte';
  return null;
}

// ─── 조제방식 / 약물 점수 ───
function autoDetectPrepMethod(medName,route){
  const l=medName.toLowerCase();
  if(NARCOTIC_DRUGS.some(d=>l.includes(d)))return'NARC';
  if(CHEMO_DRUGS.some(d=>l.includes(d)))return'STERILE';
  if(l.includes('tpn')||l.includes('nacl 3%')||l.includes('kcl')||l.includes('albumin'))return'STERILE';
  if(l.includes('pca'))return'NARC';
  if(route==='PO')return'ATC';
  if(route==='IV'||route==='IM'||route==='SC')return'INJ';
  return'MANUAL';
}
function getDrugRiskScore(medName){
  const l=medName.toLowerCase();
  for(const[drug,score]of Object.entries(HIGH_ALERT_DRUGS)){if(l.includes(drug))return score}
  if(GENERAL_ANTIBIOTICS.some(ab=>l.includes(ab)))return 10;
  return 0;
}
function getWardScore(ward){
  const u=ward.toUpperCase();
  for(const[key,score]of Object.entries(WARD_SCORES)){if(u.includes(key.toUpperCase()))return score}
  if(u.includes('병동'))return 8;return 8;
}

// ─── 전역 상태 ───
let prescriptions=[];let nextId=1;let alertLog=[];let completedToday=0;
let auditLog=[];
let pharmacistStats={};
PHARMACISTS.forEach(p=>pharmacistStats[p.id]=0);

// ─── 감사 로그 기록 ───
function addAudit(rxId,patient,fromStatus,toStatus,pharmacist){
  auditLog.unshift({rxId,patient,from:fromStatus,to:toStatus,pharmacist:pharmacist||currentPharmacist.name,time:new Date()});
  if(auditLog.length>100)auditLog.length=100;
}

// ─── 처방 생성 ───
function createRx(data){
  const rx={
    id:nextId++,patient:data.patient,ward:data.ward,room:data.room,
    diagnosis:data.diagnosis||'',type:data.type,meds:data.meds,route:data.route,
    status:data.status||'ORDERED',receivedAt:data.receivedAt,
    prepMethod:autoDetectPrepMethod(data.meds.join(' '),data.route),
    isVerbalConfirmed:false,durResult:null,priorityScore:0,
    eta:data.type==='DISCHARGE'?new Date(data.receivedAt.getTime()+25*60000):null,
    surgeryTime:data.surgeryTime||null,scheduledTime:data.scheduledTime||null,
    // Lock
    lockedBy:null,lockedAt:null,
    // Rejection
    rejectReason:null,rejectNote:null,rejectedBy:null,rejectedAt:null,
    // Five Rights
    fiveRightsCheckedBy:null,fiveRightsCheckedAt:null,
    // Nurse
    nurseNote:null,confirmedAt:null,confirmedNurse:null,
    verbalConfirmedBy:null,verbalConfirmedAt:null,nursingChecklist:false,
    // Pharmacist
    processedBy:null,
    // EMR fields
    emrOrderId:null,patientId:null,doctorId:null,doctorName:null,
    wardCode:null,hl7MessageId:null,syncStatus:'LOCAL',lastSyncAt:null
  };
  rx.drugRisk=Math.max(...rx.meds.map(m=>getDrugRiskScore(m)));
  return rx;
}

// ─── 45명 초기 데이터 ───
function initSampleData(){
  const now=Date.now();const m=n=>new Date(now-n*60000);
  const samples=[
    // ICU (4)
    {patient:'김태호',ward:'ICU',room:'101',type:'STAT',meds:['Norepinephrine 8mg'],route:'IV',receivedAt:m(8),diagnosis:'패혈증(Sepsis)',status:'ORDERED'},
    {patient:'이수진',ward:'ICU',room:'103',type:'STAT',meds:['Insulin Regular 50U'],route:'IV',receivedAt:m(5),diagnosis:'DKA',status:'ORDERED'},
    {patient:'박철민',ward:'ICU',room:'105',type:'VERBAL',meds:['KCl 40mEq'],route:'IV',receivedAt:m(12),diagnosis:'저칼륨혈증',status:'DUR_CHECK'},
    {patient:'최영희',ward:'ICU',room:'102',type:'REGULAR',meds:['Vancomycin 1g'],route:'IV',receivedAt:m(25),diagnosis:'MRSA 폐렴',status:'PHARMACIST_REVIEW'},
    // ER (3)
    {patient:'정민준',ward:'ER',room:'201',type:'STAT',meds:['Phenytoin 300mg'],route:'IV',receivedAt:m(3),diagnosis:'간질중첩증',status:'ORDERED'},
    {patient:'한소연',ward:'ER',room:'203',type:'STAT',meds:['Morphine 5mg'],route:'IV',receivedAt:m(7),diagnosis:'급성복통',status:'DUR_CHECK'},
    {patient:'오지훈',ward:'ER',room:'205',type:'FIRST_DOSE',meds:['Meropenem 1g'],route:'IV',receivedAt:m(15),diagnosis:'패혈증 의심',status:'PHARMACIST_REVIEW'},
    // 40병동 (6)
    {patient:'김철수',ward:'40병동',room:'401호',type:'DISCHARGE',meds:['Metformin 500mg','Amlodipine 5mg'],route:'PO',receivedAt:m(35),diagnosis:'',status:'PHARMACIST_REVIEW'},
    {patient:'이영희',ward:'40병동',room:'405호',type:'VERBAL',meds:['Pethidine 50mg'],route:'IM',receivedAt:m(22),diagnosis:'',status:'DUR_CHECK'},
    {patient:'박민준',ward:'40병동',room:'408호',type:'REGULAR',meds:['Ceftriaxone 2g'],route:'IV',receivedAt:m(18),diagnosis:'',status:'PHARMACIST_REVIEW'},
    {patient:'최수진',ward:'40병동',room:'412호',type:'PRN',meds:['Furosemide 20mg'],route:'IV',receivedAt:m(10),diagnosis:'',status:'ORDERED'},
    {patient:'정태양',ward:'40병동',room:'403호',type:'FIRST_DOSE',meds:['Warfarin 2mg'],route:'PO',receivedAt:m(20),diagnosis:'',status:'DUR_CHECK'},
    {patient:'강하늘',ward:'40병동',room:'415호',type:'DISCHARGE',meds:['Aspirin 100mg','Atorvastatin 20mg'],route:'PO',receivedAt:m(40),diagnosis:'',status:'DISPENSING'},
    // 51병동 (5)
    {patient:'윤서현',ward:'51병동',room:'501호',type:'PRE_OP',meds:['Midazolam 2mg'],route:'IV',receivedAt:m(45),diagnosis:'',status:'DISPENSING',surgeryTime:new Date(now+50*60000)},
    {patient:'임재원',ward:'51병동',room:'505호',type:'STAT',meds:['Heparin 5000U'],route:'IV',receivedAt:m(6),diagnosis:'DVT 의심',status:'ORDERED'},
    {patient:'신지아',ward:'51병동',room:'508호',type:'REGULAR',meds:['Vancomycin 1.5g'],route:'IV',receivedAt:m(30),diagnosis:'',status:'DISPENSING'},
    {patient:'황민서',ward:'51병동',room:'512호',type:'PRN',meds:['Fentanyl PCA 조제'],route:'IV',receivedAt:m(20),diagnosis:'술후통증',status:'PHARMACIST_REVIEW'},
    {patient:'배준혁',ward:'51병동',room:'515호',type:'DISCHARGE',meds:['Celecoxib 200mg','Pantoprazole 40mg'],route:'PO',receivedAt:m(15),diagnosis:'',status:'DUR_CHECK'},
    // 62병동 (3)
    {patient:'한지원',ward:'62병동',room:'621호',type:'STAT',meds:['Cisplatin 75mg/m²'],route:'IV',receivedAt:m(10),diagnosis:'',status:'PHARMACIST_REVIEW'},
    {patient:'오서연',ward:'62병동',room:'615호',type:'REGULAR',meds:['Ondansetron 8mg'],route:'IV',receivedAt:m(25),diagnosis:'',status:'DELIVERING'},
    {patient:'문경훈',ward:'62병동',room:'618호',type:'FIRST_DOSE',meds:['Rituximab 375mg'],route:'IV',receivedAt:m(35),diagnosis:'',status:'DISPENSING'},
    // 71병동 (3)
    {patient:'류하린',ward:'71병동',room:'701호',type:'STAT',meds:['tPA 90mg'],route:'IV',receivedAt:m(4),diagnosis:'뇌졸중(Stroke)',status:'ORDERED'},
    {patient:'성민재',ward:'71병동',room:'705호',type:'VERBAL',meds:['Levetiracetam 500mg'],route:'IV',receivedAt:m(18),diagnosis:'',status:'PHARMACIST_REVIEW'},
    {patient:'나은지',ward:'71병동',room:'708호',type:'DISCHARGE',meds:['Aspirin 100mg','Clopidogrel 75mg'],route:'PO',receivedAt:m(50),diagnosis:'',status:'DELIVERING'},
    // 소아과 (1)
    {patient:'조하준',ward:'소아과',room:'801호',type:'STAT',meds:['Phenobarbital 20mg/kg'],route:'IV',receivedAt:m(9),diagnosis:'열성경련',status:'DUR_CHECK'},
    // ─── 추가 20명 ───
    // CCU (3)
    {patient:'홍길동',ward:'CCU',room:'101',type:'STAT',meds:['Dopamine 200mg'],route:'IV',receivedAt:m(11),diagnosis:'심인성 쇼크',status:'ORDERED'},
    {patient:'강민서',ward:'CCU',room:'103',type:'STAT',meds:['Furosemide 40mg'],route:'IV',receivedAt:m(6),diagnosis:'급성 폐부종',status:'DUR_CHECK'},
    {patient:'윤채원',ward:'CCU',room:'105',type:'REGULAR',meds:['Aspirin 100mg'],route:'PO',receivedAt:m(30),diagnosis:'급성심근경색 후',status:'PHARMACIST_REVIEW'},
    // NICU (2)
    {patient:'정소율',ward:'NICU',room:'101',type:'STAT',meds:['Phenobarbital 20mg/kg'],route:'IV',receivedAt:m(5),diagnosis:'신생아 경련',status:'ORDERED'},
    {patient:'박서준',ward:'NICU',room:'103',type:'FIRST_DOSE',meds:['Ampicillin 50mg/kg'],route:'IV',receivedAt:m(20),diagnosis:'신생아 패혈증 의심',status:'PHARMACIST_REVIEW'},
    // OR (2)
    {patient:'이준혁',ward:'OR',room:'101',type:'PRE_OP',meds:['Propofol 200mg'],route:'IV',receivedAt:m(15),diagnosis:'전신마취 유도',status:'DUR_CHECK',surgeryTime:new Date(now+30*60000)},
    {patient:'김소희',ward:'OR',room:'103',type:'PRE_OP',meds:['Cefazolin 1g'],route:'IV',receivedAt:m(10),diagnosis:'수술 전 예방적 항생제',status:'DUR_CHECK',surgeryTime:new Date(now+40*60000)},
    // 42병동 (3)
    {patient:'최지훈',ward:'42병동',room:'421호',type:'VERBAL',meds:['Mannitol 200ml'],route:'IV',receivedAt:m(25),diagnosis:'두개내압 상승',status:'PHARMACIST_REVIEW'},
    {patient:'박지은',ward:'42병동',room:'425호',type:'DISCHARGE',meds:['Levetiracetam 500mg'],route:'PO',receivedAt:m(45),diagnosis:'',status:'DISPENSING'},
    {patient:'오현우',ward:'42병동',room:'430호',type:'REGULAR',meds:['Dexamethasone 5mg'],route:'IV',receivedAt:m(20),diagnosis:'뇌부종',status:'PHARMACIST_REVIEW'},
    // 52병동 (3)
    {patient:'한승우',ward:'52병동',room:'521호',type:'STAT',meds:['Heparin 5000U'],route:'IV',receivedAt:m(8),diagnosis:'폐색전증(PE)',status:'ORDERED'},
    {patient:'이나현',ward:'52병동',room:'525호',type:'PRE_OP',meds:['Midazolam 2mg'],route:'IV',receivedAt:m(35),diagnosis:'',status:'DISPENSING',surgeryTime:new Date(now+40*60000)},
    {patient:'김재원',ward:'52병동',room:'528호',type:'PRN',meds:['Morphine 5mg'],route:'IV',receivedAt:m(12),diagnosis:'흉부 수술 후 통증',status:'DUR_CHECK'},
    // 72병동 (3)
    {patient:'정예린',ward:'72병동',room:'721호',type:'FIRST_DOSE',meds:['Vancomycin 1g'],route:'IV',receivedAt:m(22),diagnosis:'C. diff 감염',status:'PHARMACIST_REVIEW'},
    {patient:'손민준',ward:'72병동',room:'725호',type:'DISCHARGE',meds:['Metformin 1000mg','Pantoprazole 40mg'],route:'PO',receivedAt:m(38),diagnosis:'',status:'DISPENSING'},
    {patient:'나지현',ward:'72병동',room:'728호',type:'REGULAR',meds:['Albumin 20% 100ml'],route:'IV',receivedAt:m(28),diagnosis:'간경변',status:'PHARMACIST_REVIEW'},
    // 81병동 (2)
    {patient:'류성민',ward:'81병동',room:'801호',type:'VERBAL',meds:['Ciprofloxacin 400mg'],route:'IV',receivedAt:m(30),diagnosis:'요로패혈증',status:'PHARMACIST_REVIEW'},
    {patient:'장혜진',ward:'81병동',room:'805호',type:'DISCHARGE',meds:['Tamsulosin 0.4mg'],route:'PO',receivedAt:m(42),diagnosis:'',status:'DELIVERING'},
    // 소아과 추가 (2)
    {patient:'백시원',ward:'소아과',room:'810호',type:'STAT',meds:['Ceftriaxone 1g'],route:'IV',receivedAt:m(7),diagnosis:'세균성 뇌막염',status:'ORDERED'},
    {patient:'임도윤',ward:'소아과',room:'815호',type:'FIRST_DOSE',meds:['Acyclovir 10mg/kg'],route:'IV',receivedAt:m(14),diagnosis:'단순포진 뇌염',status:'DUR_CHECK'}
  ];
  samples.forEach(s=>{
    const rx=createRx(s);
    if(STATUS_MAP[rx.status]&&STATUS_MAP[rx.status].idx>=1)rx.durResult=Math.random()>0.12?'PASS':'WARN';
    prescriptions.push(rx);
  });
}

// ─── EMR API Stub Functions ───
async function fetchFromEMR(){
  console.log('[EMR STUB] fetchFromEMR called');return[];
}
async function pushStatusToEMR(rxId,newStatus){
  console.log(`[EMR STUB] pushStatusToEMR: ${rxId} → ${newStatus}`);return{success:true};
}
async function getPatientFromEMR(patientId){
  console.log(`[EMR STUB] getPatientFromEMR: ${patientId}`);return null;
}
function toFHIRMedicationRequest(rx){
  return{resourceType:'MedicationRequest',id:rx.emrOrderId||`LOCAL-${rx.id}`,
    status:rx.status.toLowerCase(),intent:'order',
    medicationCodeableConcept:{text:rx.meds.join(', ')},
    subject:{reference:`Patient/${rx.patientId||'UNKNOWN'}`,display:rx.patient},
    authoredOn:rx.receivedAt.toISOString(),
    requester:{display:rx.doctorName||'미확인'},
    dosageInstruction:[{route:{text:rx.route},timing:{code:{text:rx.type}}}],
    extension:[{url:'http://pharmflow.kr/priority-score',valueInteger:rx.priorityScore}]};
}
