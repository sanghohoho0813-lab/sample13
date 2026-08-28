// ─────────────────────────────────────────────────────────
// 운영 데이터 시드 (DEMO) — 일정 · 배정 · 체크리스트 · 서비스
// ─────────────────────────────────────────────────────────
import type { Schedule, DispatchCandidate } from '../../types'

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

// 오늘(dayOffset=0) 24건 — Master Prompt Scenario 기준으로 구성한 DEMO 일정
// SC-01: 김도윤(Team B) 타임라인 / SC-14: 지연 Risk / SC-16: 미배정(Dispatch Demo)
export const SEED_SCHEDULES: Schedule[] = [
  // ── Team B (김도윤·박현우) 타임라인 ──
  { id: 'SC-01', dayOffset: 0, time: '09:00', durationMin: 120, customerId: 'C07', service: '사무실 정기청소', teamId: 'T-B', status: '완료', travelMin: 22 },
  { id: 'SC-02', dayOffset: 0, time: '11:30', durationMin: 90, customerId: 'C08', service: '학원·교육시설 관리', teamId: 'T-B', status: '완료', travelMin: 25 },
  { id: 'SC-03', dayOffset: 0, time: '14:00', durationMin: 110, customerId: 'C01', service: '병·의원 청소관리', teamId: 'T-B', status: '예정', travelMin: 18, important: true },
  { id: 'SC-04', dayOffset: 0, time: '17:00', durationMin: 80, customerId: 'C06', service: '상가 정기관리', teamId: 'T-B', status: '예정', travelMin: 30 },
  // ── 오전 완료 건 ──
  { id: 'SC-05', dayOffset: 0, time: '08:00', durationMin: 100, customerId: 'C12', service: '소독 / 위생관리', teamId: 'T-G', status: '완료', travelMin: 20 },
  { id: 'SC-06', dayOffset: 0, time: '08:30', durationMin: 120, customerId: 'C04', service: '병·의원 청소관리', teamId: 'T-A', status: '확인필요', travelMin: 15, risk: { type: '미완료', detail: '작업완료 보고 미제출 — 사진·체크리스트 확인 필요' } },
  { id: 'SC-07', dayOffset: 0, time: '09:00', durationMin: 150, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '완료', travelMin: 24 },
  { id: 'SC-08', dayOffset: 0, time: '09:30', durationMin: 90, customerId: 'C10', service: '상가 정기관리', teamId: 'T-D', status: '완료', travelMin: 28 },
  { id: 'SC-09', dayOffset: 0, time: '10:00', durationMin: 110, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-C', status: '완료', travelMin: 18 },
  { id: 'SC-10', dayOffset: 0, time: '10:30', durationMin: 130, customerId: 'C11', service: '바닥 세척 / 왁스', teamId: 'T-F', status: '완료', travelMin: 26 },
  { id: 'SC-11', dayOffset: 0, time: '11:00', durationMin: 80, customerId: 'C09', service: '병·의원 청소관리', teamId: 'T-A', status: '완료', travelMin: 21 },
  { id: 'SC-12', dayOffset: 0, time: '13:00', durationMin: 120, customerId: 'C05', service: '유리창 집중청소', teamId: 'T-E', status: '작업중', travelMin: 24 },
  { id: 'SC-13', dayOffset: 0, time: '13:30', durationMin: 100, customerId: 'C11', service: '건물 공용부 관리', teamId: 'T-F', status: '작업중', travelMin: 19 },
  // ── 오후 Risk / 진행 ──
  { id: 'SC-14', dayOffset: 0, time: '15:30', durationMin: 100, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-C', status: '예정', travelMin: 17, important: true, risk: { type: '방문지연', detail: '담당팀 이전 작업 32분 지연 — 예상 도착 15:47', eta: '15:47' } },
  { id: 'SC-15', dayOffset: 0, time: '14:30', durationMin: 90, customerId: 'C10', service: '매장 정기관리', teamId: 'T-D', status: '이동중', travelMin: 32, risk: { type: '직원결원', detail: '임태규 휴무 — 오세영 단독 작업, 시간 여유 확인 필요' } },
  // ── 미배정 (AI Dispatch Demo) ──
  { id: 'SC-16', dayOffset: 0, time: '15:00', durationMin: 90, customerId: 'C04', service: '유리창 집중청소', teamId: null, status: '예정', travelMin: 0, important: true },
  // ── 오후 예정 ──
  { id: 'SC-17', dayOffset: 0, time: '15:00', durationMin: 90, customerId: 'C03', service: '학원·교육시설 관리', teamId: 'T-D', status: '이동중', travelMin: 27 },
  { id: 'SC-18', dayOffset: 0, time: '16:00', durationMin: 110, customerId: 'C09', service: '소독 / 위생관리', teamId: 'T-G', status: '예정', travelMin: 23 },
  { id: 'SC-19', dayOffset: 0, time: '16:00', durationMin: 100, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '예정', travelMin: 14 },
  { id: 'SC-20', dayOffset: 0, time: '16:30', durationMin: 120, customerId: 'C12', service: '병·의원 청소관리', teamId: 'T-G', status: '예정', travelMin: 25 },
  { id: 'SC-21', dayOffset: 0, time: '17:30', durationMin: 90, customerId: 'C07', service: '에어컨 세척', teamId: 'T-H', status: '예정', travelMin: 29 },
  { id: 'SC-22', dayOffset: 0, time: '18:00', durationMin: 150, customerId: 'C11', service: '입주·퇴거 특수청소', teamId: 'T-H', status: '예정', travelMin: 31 },
  { id: 'SC-23', dayOffset: 0, time: '18:30', durationMin: 80, customerId: 'C08', service: '학원·교육시설 관리', teamId: 'T-F', status: '예정', travelMin: 22 },
  { id: 'SC-24', dayOffset: 0, time: '19:00', durationMin: 90, customerId: 'C02', service: '사무실 정기청소', teamId: 'T-E', status: '예정', travelMin: 20 },
  // ── 이번 주 (Week View 샘플) ──
  { id: 'SC-31', dayOffset: 1, time: '09:00', durationMin: 120, customerId: 'C01', service: '병·의원 청소관리', teamId: 'T-B', status: '예정', travelMin: 18 },
  { id: 'SC-32', dayOffset: 1, time: '10:00', durationMin: 100, customerId: 'C05', service: '건물 공용부 관리', teamId: 'T-C', status: '예정', travelMin: 24 },
  { id: 'SC-33', dayOffset: 1, time: '14:00', durationMin: 90, customerId: 'C03', service: '학원·교육시설 관리', teamId: 'T-B', status: '예정', travelMin: 21 },
  { id: 'SC-34', dayOffset: 2, time: '09:30', durationMin: 110, customerId: 'C12', service: '소독 / 위생관리', teamId: 'T-G', status: '예정', travelMin: 20 },
  { id: 'SC-35', dayOffset: 2, time: '13:00', durationMin: 120, customerId: 'C09', service: '병·의원 청소관리', teamId: 'T-A', status: '예정', travelMin: 23 },
  { id: 'SC-36', dayOffset: 3, time: '10:00', durationMin: 100, customerId: 'C06', service: '상가 정기관리', teamId: 'T-D', status: '예정', travelMin: 28 },
  { id: 'SC-37', dayOffset: 4, time: '09:00', durationMin: 130, customerId: 'C11', service: '바닥 세척 / 왁스', teamId: 'T-F', status: '예정', travelMin: 26 },
]

// AI Smart Dispatch — 미배정 SC-16(강남 C클리닉 15:00 유리창)에 대한 규칙 기반 추천 (DEMO)
export const DISPATCH_CANDIDATES: Record<string, DispatchCandidate[]> = {
  'SC-16': [
    {
      teamId: 'T-E', rank: 1, travelMin: 18, fitPct: 96, slackMin: 46,
      reasons: [
        '직전 현장(그랜드타워)에서 예상 이동 18분',
        '유리창 집중청소 전문팀 — 서비스 적합도 96%',
        '해당 시간 일정 충돌 없음',
        '예상 작업시간 90분, 이후 일정 여유 46분',
      ],
    },
    {
      teamId: 'T-A', rank: 2, travelMin: 12, fitPct: 74, slackMin: 25,
      reasons: [
        '이동시간 최단(12분) — 단, 유리 전문장비 미보유',
        '병의원 현장 경험 보유',
        '16:00 이후 일정 여유 25분으로 촉박',
      ],
    },
    {
      teamId: 'T-H', rank: 3, travelMin: 34, fitPct: 68, slackMin: 90,
      reasons: [
        '오후 일정 여유 충분(90분)',
        '이동 34분으로 도착 지연 가능성',
        '특수청소 전문 — 유리 적합도 보통',
      ],
    },
  ],
}
