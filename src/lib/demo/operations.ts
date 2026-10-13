// ─────────────────────────────────────────────────────────
// 운영 데이터 시드 (DEMO) — 일정 · 배정 · 체크리스트 · 서비스
// ─────────────────────────────────────────────────────────
import type { Schedule } from '../../types'

export const SERVICE_TYPES = [
  '사무실 정기청소',
  '상가 정기관리',
  '병·의원 청소관리',
  '학원·교육시설 관리',
  '건물 공용부 관리',
  '바닥 세척 / 왁스',
  '유리창 집중청소',
  '소독 / 위생관리',
  '에어컨 세척',
  '입주·퇴거 특수청소',
]

export const UPSELL_SERVICES = [
  '바닥 집중관리',
  '유리창 집중청소',
  '소독 / 위생관리',
  '에어컨 세척',
  '입주·퇴거 특수청소',
  '대청소',
  '소모품 관리',
]

export const CHECKLIST_TEMPLATE = [
  '공용공간 청소',
  '바닥 세척·오염 제거',
  '유리·거울 관리',
  '화장실 위생 점검',
  '폐기물 수거·분리',
  '소모품 확인·보충',
]

// 오늘(dayOffset=0) 24건 — 팀마다 시간이 겹치지 않는 실제 동선으로 구성한 DEMO 일정 (기준 시각 14:20)
// SC-03: 김도윤(Team B) 다음 현장 / SC-14: 방문지연(이전 작업 지연) / SC-16: 미배정 / SC-18: 결원으로 단독 작업
export const SEED_SCHEDULES: Schedule[] = [
  // ── Team A (이준호·최민석) — 병의원 전문, 오후 비어 있음 ──
  { id: 'SC-06', dayOffset: 0, time: '08:30', durationMin: 120, customerId: 'C04', service: '병·의원 청소관리', teamId: 'T-A', status: '확인필요', travelMin: 15, risk: { type: '미완료', detail: '작업완료 보고 미제출 — 사진·체크리스트 확인 필요' } },
  { id: 'SC-11', dayOffset: 0, time: '11:00', durationMin: 80, customerId: 'C09', service: '병·의원 청소관리', teamId: 'T-A', status: '완료', travelMin: 21 },
  // ── Team B (김도윤·박현우) — 현장직원 앱 기본 사용자 ──
  { id: 'SC-01', dayOffset: 0, time: '09:00', durationMin: 120, customerId: 'C07', service: '사무실 정기청소', teamId: 'T-B', status: '완료', travelMin: 22 },
  { id: 'SC-02', dayOffset: 0, time: '11:30', durationMin: 90, customerId: 'C08', service: '학원·교육시설 관리', teamId: 'T-B', status: '완료', travelMin: 25 },
  { id: 'SC-03', dayOffset: 0, time: '14:00', durationMin: 110, customerId: 'C01', service: '병·의원 청소관리', teamId: 'T-B', status: '예정', travelMin: 18, important: true },
  { id: 'SC-04', dayOffset: 0, time: '17:00', durationMin: 80, customerId: 'C06', service: '상가 정기관리', teamId: 'T-B', status: '예정', travelMin: 30 },
  // ── Team C (정승원·한지훈) — 오후 그랜드타워 작업이 32분 지연 중 ──
  { id: 'SC-07', dayOffset: 0, time: '08:00', durationMin: 150, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '완료', travelMin: 24 },
  { id: 'SC-09', dayOffset: 0, time: '11:00', durationMin: 110, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-C', status: '완료', travelMin: 18 },
  { id: 'SC-19', dayOffset: 0, time: '13:30', durationMin: 100, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '작업중', travelMin: 20, delayMin: 32 },
  { id: 'SC-14', dayOffset: 0, time: '15:30', durationMin: 100, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-C', status: '예정', travelMin: 28, important: true, risk: { type: '방문지연', detail: '담당팀 이전 작업(그랜드타워) 32분 지연 — 도착 지연 예상' } },
  // ── Team D (오세영 · 임태규 휴무) ──
  { id: 'SC-08', dayOffset: 0, time: '09:30', durationMin: 90, customerId: 'C10', service: '매장 정기관리', teamId: 'T-D', status: '완료', travelMin: 28 },
  { id: 'SC-15', dayOffset: 0, time: '14:30', durationMin: 90, customerId: 'C10', service: '매장 위생 점검', teamId: 'T-D', status: '이동중', travelMin: 32, risk: { type: '직원결원', detail: '임태규 휴무 — 오세영 단독 작업, 시간 여유 확인 필요' } },
  { id: 'SC-17', dayOffset: 0, time: '16:30', durationMin: 90, customerId: 'C03', service: '학원·교육시설 관리', teamId: 'T-D', status: '예정', travelMin: 27 },
  // ── Team E (강병철·서준일) — 유리 전문 ──
  { id: 'SC-12', dayOffset: 0, time: '13:00', durationMin: 120, customerId: 'C05', service: '유리창 집중청소', teamId: 'T-E', status: '작업중', travelMin: 24 },
  { id: 'SC-24', dayOffset: 0, time: '19:00', durationMin: 90, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-E', status: '예정', travelMin: 20 },
  // ── Team F (문성재·조영민) — 바닥 전문 ──
  { id: 'SC-10', dayOffset: 0, time: '10:30', durationMin: 130, customerId: 'C11', service: '바닥 세척 / 왁스', teamId: 'T-F', status: '완료', travelMin: 26 },
  { id: 'SC-13', dayOffset: 0, time: '13:30', durationMin: 100, customerId: 'C11', service: '건물 공용부 관리', teamId: 'T-F', status: '작업중', travelMin: 19 },
  { id: 'SC-23', dayOffset: 0, time: '18:30', durationMin: 80, customerId: 'C08', service: '학원·교육시설 관리', teamId: 'T-F', status: '예정', travelMin: 22 },
  // ── Team G (배정호 · 신우철 결원) — 오후 서초 E의원이 단독 작업 ──
  { id: 'SC-05', dayOffset: 0, time: '08:00', durationMin: 100, customerId: 'C12', service: '소독 / 위생관리', teamId: 'T-G', status: '완료', travelMin: 20 },
  { id: 'SC-18', dayOffset: 0, time: '16:00', durationMin: 110, customerId: 'C09', service: '소독 / 위생관리', teamId: 'T-G', status: '예정', travelMin: 23, risk: { type: '직원결원', detail: '신우철 결원 — 배정호 단독 작업, 작업시간 30분 이상 증가 예상' } },
  { id: 'SC-20', dayOffset: 0, time: '18:30', durationMin: 120, customerId: 'C12', service: '병·의원 청소관리', teamId: 'T-G', status: '예정', travelMin: 25 },
  // ── Team H (황인규·유창현) — 특수청소 ──
  { id: 'SC-21', dayOffset: 0, time: '15:00', durationMin: 90, customerId: 'C07', service: '에어컨 세척', teamId: 'T-H', status: '예정', travelMin: 29 },
  { id: 'SC-22', dayOffset: 0, time: '18:00', durationMin: 150, customerId: 'C11', service: '입주·퇴거 특수청소', teamId: 'T-H', status: '예정', travelMin: 31 },
  // ── 미배정 (AI 배정 대상) ──
  { id: 'SC-16', dayOffset: 0, time: '15:30', durationMin: 90, customerId: 'C04', service: '유리창 집중청소', teamId: null, status: '예정', travelMin: 0, important: true },
  // ── 이번 주 ──
  { id: 'SC-31', dayOffset: 1, time: '09:00', durationMin: 120, customerId: 'C01', service: '병·의원 청소관리', teamId: 'T-B', status: '예정', travelMin: 18 },
  { id: 'SC-32', dayOffset: 1, time: '10:00', durationMin: 100, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '예정', travelMin: 24 },
  { id: 'SC-33', dayOffset: 1, time: '14:00', durationMin: 90, customerId: 'C03', service: '학원·교육시설 관리', teamId: 'T-B', status: '예정', travelMin: 21 },
  { id: 'SC-34', dayOffset: 2, time: '09:30', durationMin: 110, customerId: 'C12', service: '소독 / 위생관리', teamId: 'T-G', status: '예정', travelMin: 20 },
  { id: 'SC-35', dayOffset: 2, time: '13:00', durationMin: 120, customerId: 'C09', service: '병·의원 청소관리', teamId: 'T-A', status: '예정', travelMin: 23 },
  { id: 'SC-36', dayOffset: 3, time: '10:00', durationMin: 100, customerId: 'C06', service: '상가 정기관리', teamId: 'T-D', status: '예정', travelMin: 28 },
  { id: 'SC-37', dayOffset: 4, time: '09:00', durationMin: 130, customerId: 'C11', service: '바닥 세척 / 왁스', teamId: 'T-F', status: '예정', travelMin: 26 },
]
