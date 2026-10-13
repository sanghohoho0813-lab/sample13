// 튜토리얼 · 시연 모드 단계 정의 — 화면 문구와 이동 경로만 담는다 (동작은 TourProvider)

export type TourKind = 'tutorial' | 'presentation'

export interface Step {
  route: string
  selector?: string
  title: string
  body: string
  /** 현장/고객 Surface 등 Role 전환이 필요한 Step */
  role?: 'ceo' | 'manager' | 'field' | 'customer'
}

export const TUTORIAL_STEPS: Step[] = [
  {
    route: '/', selector: '[data-tour="ai-briefing"]',
    title: '오늘의 운영센터',
    body: '사고 위험 · 배정 비효율 · 인력 부족 · 고객 요청 · 재계약 위험 · 저마진 · 추가서비스 7개 영역을 실시간으로 계산합니다. 항목을 누르면 바로 처리 화면으로 갑니다.',
  },
  {
    route: '/schedule', selector: '[data-tour="dispatch"]',
    title: 'Smart Dispatch',
    body: '이동거리 · 역량 · 현재 일정 · 난이도 · 고객 선호 · 연속근무 · 소요시간 7개 요인으로 팀을 비교합니다. 추천 → 검토 → 승인되면 현장직원 앱에 바로 알림이 갑니다.',
  },
  {
    route: '/customers/C01', selector: '[data-tour="customer-health"]',
    title: '고객 건강도 / 재계약',
    body: '방문 이력 · 불만/요청 · 작업 품질 · 이용 서비스 · 계약 시점으로 이탈 위험을 계산하고, 수익성까지 보고 재계약 전략을 정합니다.',
  },
  {
    route: '/upsell', selector: '[data-tour="upsell"]',
    title: '추가매출 기회',
    body: '현장 기록을 활용해 추가서비스 제안 가능성을 찾습니다.',
  },
  {
    route: '/evidence', selector: '[data-tour="evidence"]',
    title: '실증 기록 · 변경 이력',
    body: 'AI 추천이 실행과 결과로 이어진 과정, 그리고 누가 언제 무엇을 왜 바꿨는지가 모두 남습니다.',
  },
]

export const PRESENTATION_STEPS: Step[] = [
  { route: '/', selector: '[data-tour="kpi"]', title: '오늘의 운영센터', body: '오늘 일정 · 결정 대기 · 사고 위험 · 고객 요청 · 재계약 위험 · 추가매출이 한 화면에 모입니다. 대표는 아침에 이 화면부터 봅니다.' },
  { route: '/', selector: '[data-tour="ai-briefing"]', title: '지금 판단할 것', body: '7개 영역이 상태에서 실시간 계산됩니다. 처리하면 항목이 사라지고, 모든 항목은 실제 처리 화면으로 이어집니다.' },
  { route: '/schedule', selector: '[data-tour="dispatch"]', title: 'Smart Dispatch', body: '7개 요인 점수 분해 · 배정 불가 사유 · 승인하면 바뀌는 것까지 보여주고, 추천 → 검토 → 승인 → 현장 수신 확인을 한 흐름으로 처리합니다.' },
  { route: '/field', selector: '[data-tour="field-next"]', title: '현장직원 모바일', body: '체크인 → 사진 → 체크리스트 → 완료를 아래 버튼 하나로 안내합니다. 신호가 끊겨도 기록은 기기에 저장됐다가 자동 전송됩니다.', role: 'field' },
  { route: '/customers/C01', selector: '[data-tour="customer-health"]', title: '고객 건강도 · 재계약 판단', body: '5개 요인으로 이탈 위험을 계산하고, 위험 · 수익성 · 추가서비스를 함께 보고 재계약 전략을 정합니다.', role: 'ceo' },
  { route: '/renewals', selector: '[data-tour="renewal"]', title: '재계약 관리', body: '위험 · D-30 · D-60 단계별로 분류하고 예상 손실과 묶음 재계약 가능 매출을 함께 봅니다.' },
  { route: '/upsell', selector: '[data-tour="upsell"]', title: '추가매출', body: 'AI가 현장 기록에서 찾은 기회와 고객이 직접 요청한 기회를 함께 관리합니다.' },
  { route: '/care/home', selector: '[data-tour="care-quick"]', title: '고객 플랫폼', body: '고객은 오늘 서비스 진행 · 사진 리포트 · 요청 처리 상태를 직접 확인합니다. 보낸 요청은 곧바로 본사 처리함에 들어갑니다.', role: 'customer' },
  { route: '/requests', selector: '[data-tour="requests"]', title: '요청 → 일정 → 배정', body: '요청함에서 담당 지정 · 견적 · 일정 확정을 하면 배정안과 매출 기회가 함께 만들어집니다.', role: 'ceo' },
  { route: '/evidence', selector: '[data-tour="evidence"]', title: '실증 기록 · 변경 이력', body: 'AI 추천 → 사람의 결정 → 실행 → 결과, 그리고 누가 · 언제 · 무엇을 · 왜 바꿨는지가 기록되어 내부통제와 AX 실증 근거가 됩니다.' },
  { route: '/why-ax', selector: '[data-tour="why-hero"]', title: '기획의도 — Why AX', body: '왜 이 회사에 AX가 필요한지, 무엇이 바뀌는지, 어떻게 매출이 되는지를 설명합니다.' },
]
