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
    title: 'AI 오늘의 운영 브리핑',
    body: '오늘 어떤 현장과 고객을 먼저 확인해야 하는지 AI가 운영 위험과 매출 기회를 요약합니다.',
  },
  {
    route: '/schedule', selector: '[data-tour="dispatch"]',
    title: 'AI 스마트 배정',
    body: '일정·현장·이동시간·팀 상황을 함께 비교해 적합한 배정을 추천합니다. 최종 결정은 사람이 합니다.',
  },
  {
    route: '/customers/C01', selector: '[data-tour="customer-health"]',
    title: '고객 건강도 / 재계약',
    body: '작업이력과 만족도, 계약 종료일을 함께 보고 재계약 관리가 필요한 고객을 찾습니다.',
  },
  {
    route: '/upsell', selector: '[data-tour="upsell"]',
    title: '추가매출 기회',
    body: '현장 기록을 활용해 추가서비스 제안 가능성을 찾습니다.',
  },
  {
    route: '/evidence', selector: '[data-tour="evidence"]',
    title: '실증 기록 타임라인',
    body: 'AI 추천이 실제 실행과 결과로 이어진 과정을 기록합니다.',
  },
]

export const PRESENTATION_STEPS: Step[] = [
  { route: '/', selector: '[data-tour="kpi"]', title: '운영 현황판', body: '오늘 예정·진행·완료·위험·갱신·추가매출 기회가 한 화면에 모입니다. 대표는 아침에 이 화면부터 봅니다.' },
  { route: '/', selector: '[data-tour="ai-briefing"]', title: 'AI 경영 브리핑', body: '6개 AI 엔진의 결과를 종합해 오늘 확인할 것을 자연어로 설명합니다.' },
  { route: '/schedule', selector: '[data-tour="dispatch"]', title: 'AI 스마트 배정', body: '미배정 일정에 대해 이동시간·숙련도·일정 여유를 비교해 1~3순위 팀과 추천 이유를 제시합니다.' },
  { route: '/field', selector: '[data-tour="field-next"]', title: '현장직원 모바일', body: '현장직원은 모바일에서 체크인 → 체크리스트 → 사진 → 작업완료를 한 손으로 처리합니다.', role: 'field' },
  { route: '/customers/C01', selector: '[data-tour="customer-health"]', title: '고객 건강도', body: '만족도·품질문의·일정변경·계약 종료일을 하나의 점수로 봅니다.', role: 'ceo' },
  { route: '/renewals', selector: '[data-tour="renewal"]', title: '재계약 사전관리', body: '계약 D-60부터 단계별로 분류하고 AI가 사전 관리 조치를 제안합니다.' },
  { route: '/upsell', selector: '[data-tour="upsell"]', title: '추가매출 발굴', body: '현장 특이사항이 곧 영업 신호가 됩니다. 발견 → 제안 → 협의 → 성사까지 관리합니다.' },
  { route: '/care/home', selector: '[data-tour="care-quick"]', title: '고객 플랫폼', body: '고객은 전화 없이 일정 확인·리포트·추가 요청을 처리합니다. 이 요청은 곧바로 내부 AX 데이터가 됩니다.', role: 'customer' },
  { route: '/requests', selector: '[data-tour="requests"]', title: '고객 요청 → AX 연결', body: '고객 플랫폼의 요청이 내부 요청함과 신규 매출 기회로 즉시 연결됩니다.', role: 'ceo' },
  { route: '/evidence', selector: '[data-tour="evidence"]', title: 'AX 실증 기록', body: 'AI 추천 → 사람의 결정 → 실행 → 결과가 기록되어 AX 도입 실증 근거가 됩니다.' },
  { route: '/why-ax', selector: '[data-tour="why-hero"]', title: '기획의도 — Why AX', body: '왜 이 회사에 AX가 필요한지, 무엇이 바뀌는지, 어떻게 매출이 되는지를 설명합니다.' },
]
