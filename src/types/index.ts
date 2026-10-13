// ─── Roles ───────────────────────────────────────────────
export type Role = 'ceo' | 'manager' | 'field' | 'customer'

export const ROLE_LABEL: Record<Role, string> = {
  ceo: '대표',
  manager: '관리자 / 팀장',
  field: '현장직원',
  customer: '고객',
}

// ─── Company entities (static demo seed) ─────────────────
export interface Team {
  id: string
  name: string
  memberIds: string[]
  specialty: string[]
}

export interface Employee {
  id: string
  name: string
  position: '팀장' | '현장직원'
  teamId: string
  skills: string[]
  status: '근무' | '휴무' | '결원'
  todayJobs: number
}

export type CustomerType = '병의원' | '사무실' | '학원' | '상가' | '빌딩' | '프랜차이즈'

export interface Contract {
  serviceSummary: string
  visitsPerWeek: number
  monthlyFee: number // 만원
  startDate: string
  endDate: string // ISO
  renewalDDay: number // D-xx (양수 = 남은 일수)
  customerManager: string
  internalManager: string
  teamId: string
}

export interface Customer {
  id: string
  name: string
  type: CustomerType
  address: string
  district: string
  contract: Contract
  satisfaction: number // 0~5
  lastVisit: string
  recentInquiries: number
}

export interface Site {
  id: string
  customerId: string
  name: string
  address: string
  areaPyeong: number
  note?: string
}

// ─── Operations ──────────────────────────────────────────
export type ScheduleStatus = '예정' | '이동중' | '작업중' | '완료' | '확인필요'

export interface RiskInfo {
  type: '방문지연' | '일정겹침' | '미완료' | '직원결원' | '고객요청'
  detail: string
  eta?: string
}

export interface Schedule {
  id: string
  dayOffset: number // 0 = 오늘
  time: string // 'HH:MM'
  durationMin: number
  customerId: string
  service: string
  teamId: string | null // null = 미배정
  status: ScheduleStatus
  travelMin: number
  risk?: RiskInfo
  important?: boolean
  /** 진행 중 작업의 현재 지연(분) — 다음 일정 도착 예측에 쓰인다 */
  delayMin?: number
  /** 고객 요청으로 생긴 일정이면 요청 ID */
  requestId?: string
}

/** 현장에서 찍은 사진 한 장 — 화질 검사 결과를 함께 남긴다 */
export interface PhotoRecord {
  /** 축소 저장한 이미지(data URL). 데모 예시 사진을 쓰면 비어 있다 */
  dataUrl?: string
  at: string
  width: number
  height: number
  /** 0~255 평균 밝기 · 선명도(라플라시안 분산) */
  brightness: number
  sharpness: number
  /** 8×8 평균 해시 — 작업 전 · 후에 같은 사진을 올렸는지 비교 */
  hash?: string
  /** 화질 경고를 확인하고도 그대로 쓴 경우 그 경고 (리포트 · 본사에 표시) */
  flags?: string[]
}

export interface WorkSession {
  scheduleId: string
  checkinAt?: string
  startedAt?: string
  checklist: Record<string, boolean>
  /** 수행할 수 없었던 항목과 사유 (예: 화장실 공사 중) — 완료를 막지 않고 리포트·본사에 남는다 */
  skipped?: Record<string, string>
  beforePhoto: boolean
  afterPhoto: boolean
  photos?: { before?: PhotoRecord; after?: PhotoRecord }
  note: string
  completedAt?: string
  checkoutAt?: string
  /** 작업한 사람 (현장 앱 사용자) */
  worker?: string
}


// ─── Intelligence ────────────────────────────────────────
export type ActionStatus = '추천됨' | '확인' | '실행중' | '완료' | '보류' | '무시'

export type AIEngine =
  | 'dispatch'
  | 'risk'
  | 'retention'
  | 'upsell'
  | 'profit'
  | 'briefing'

export const ENGINE_LABEL: Record<AIEngine, string> = {
  dispatch: 'AI 스마트 배정',
  risk: 'AI 서비스 위험 감지',
  retention: 'AI 재계약 관리',
  upsell: 'AI 추가매출 발굴',
  profit: 'AI 서비스 수익성',
  briefing: 'AI 경영 브리핑',
}

export interface ActionItem {
  id: string
  engine: AIEngine
  title: string
  target: string // 고객/현장명
  detail: string
  status: ActionStatus
  owner: string
  createdAt: string
  result?: string
  customerId?: string
  /** 처리 기한 (예: '오늘 15:00', '이번 주') */
  due?: string
  holdReason?: string
}

export interface AIInsight {
  id: string
  engine: AIEngine
  severity: 'risk' | 'opportunity' | 'info'
  title: string
  target: string
  customerId?: string
  found: string // 무엇을 발견했는지
  dataViewed: string[] // 어떤 데이터를 봤는지
  why: string // 왜 중요한지
  recommendation: string // 추천 행동
  impact: string // 예상 영향
  actionId?: string
}

export interface UpsellOpportunity {
  id: string
  customerId: string
  currentService: string
  signal: string
  recommendedService: string
  expectedRevenue: number // 만원
  reason: string
  status: '발견됨' | '제안됨' | '협의중' | '성사' | '보류'
  /** 'ai' = AI 발굴, 'portal' = 고객이 직접 요청 */
  source?: 'ai' | 'portal'
  requestId?: string
  owner?: string
}

export interface CustomerHealth {
  customerId: string
  score: number
  positives: string[]
  watch: string[]
  aiStatus: '안정' | 'Retention Watch' | 'Risk'
}

/** 고객 건강도 상태의 화면 표기 — 데이터 값은 유지하고 표기만 한글로 통일한다 */
export const HEALTH_STATUS_LABEL: Record<CustomerHealth['aiStatus'], string> = {
  '안정': '안정',
  'Retention Watch': '재계약 주의',
  'Risk': '위험',
}


export interface ProfitabilityRow {
  customerId: string
  contractAmt: number // 만원/월
  visitsPerMonth: number
  avgCrew: number
  avgWorkMin: number
  plannedMin: number
  avgTravelMin: number
  suppliesCost: number // 만원/월
  urgentVisits: number
  surfaceMarginPct: number
  contributionMarginPct: number
  grade: '고수익' | '정상' | '관찰' | '수익성 악화'
  aiNote: string
}

export type RequestType = '추가서비스' | '일정변경' | '긴급방문' | '문의'

export type RequestStatus = '접수' | '검토중' | '처리중' | '완료' | '반려'

export interface RequestEvent {
  at: string
  actor: string
  text: string
  /** 고객 화면에도 보이는 단계인지 (내부 메모는 false) */
  visible: boolean
}

export interface CustomerRequest {
  id: string
  customerId: string
  type: RequestType
  detail: string
  createdAt: string
  status: RequestStatus
  fromPortal?: boolean
  /** 본사 담당자 */
  assignee?: string
  /** 고객에게 보이는 최신 회신 */
  reply?: string
  history?: RequestEvent[]
  /** 추가서비스 요청 → 자동 생성된 매출 기회 */
  opportunityId?: string
  /** 요청으로 생긴(또는 변경한) 일정 */
  scheduleId?: string
}

export interface QualityIssue {
  id: string
  customerId: string
  date: string
  category: string
  detail: string
  status: '접수' | '조치중' | '해결'
}

export interface EvidenceLog {
  id: string
  date: string // 'MM.DD'
  time: string // 'HH:MM'
  engine: AIEngine
  text: string
  result?: string
}

export interface ServiceReport {
  id: string
  scheduleId: string
  customerId: string
  date: string
  team: string
  completedAt: string
  itemsDone: number
  itemsTotal: number
  note: string
  nextRecommend?: string
  /** 현장 기록 원본 — 리포트 상세(체크리스트 · 사진 · 예외 · 이슈)에 쓰인다 */
  service?: string
  checkinAt?: string
  worker?: string
  skipped?: Record<string, string>
  photos?: { before?: PhotoRecord; after?: PhotoRecord }
  issueIds?: string[]
  requestId?: string
  /** 고객 평가 (1~5) · 의견 */
  rating?: number
  feedback?: string
}

// ─── 운영 통제 ────────────────────────────────────────────
/** 배정 변경안 — AI 추천 → 담당자 검토 → 승인 → 일정 반영 → 현장 확인 */
export type ProposalStatus = '추천' | '검토' | '승인' | '현장확인' | '보류' | '반려'
export type ProposalKind = '신규 배정' | '재배정' | '시간 변경'

export interface DispatchProposal {
  id: string
  scheduleId: string
  kind: ProposalKind
  status: ProposalStatus
  /** 변경 전 팀 · 시간 */
  fromTeamId: string | null
  fromTime?: string
  /** 검토자가 고른 팀 · 시간 (검토 전에는 AI 1순위) */
  toTeamId?: string
  toTime?: string
  reason: string
  createdAt: string
  createdBy: string
  reviewer?: string
  reviewNote?: string
  approver?: string
  decidedAt?: string
  holdReason?: string
  requestId?: string
  /** 함께 닫히는 AI 조치 */
  actionId?: string
}

export type IssueType = '파손·누수' | '소모품 부족' | '출입 불가' | '안전 위험' | '고객 추가 요청' | '기타'
export type IssueSeverity = '낮음' | '보통' | '긴급'

/** 현장 이슈 보고 — 현장직원이 올리고 본사가 조치한다 */
export interface FieldIssue {
  id: string
  scheduleId: string
  customerId: string
  type: IssueType
  severity: IssueSeverity
  detail: string
  reportedBy: string
  at: string
  status: '접수' | '조치중' | '해결'
  owner?: string
  /** 고객 리포트에 표시 */
  customerVisible: boolean
}

/** 현장직원 앱으로 가는 알림 (배정 · 시간 변경) — 수신 확인을 받는다 */
export interface FieldNotice {
  id: string
  teamId: string
  scheduleId: string
  kind: '새 배정' | '시간 변경' | '배정 해제'
  text: string
  at: string
  ackAt?: string
  ackBy?: string
  proposalId?: string
}

export type AuditEntity = '배정' | '일정' | '요청' | '조치' | '매출 기회' | '현장 작업' | '현장 이슈' | '고객 평가' | '설정'

/** 변경 이력 — 누가 · 언제 · 무엇을 · 어떻게 바꿨는지 (내부통제) */
export interface AuditEntry {
  id: string
  at: string
  /** 'TODAY' 또는 'D-1' 같은 상대 날짜 */
  day: string
  actor: string
  /** 'system' = AI 엔진 · 자동 처리 */
  role: Role | 'system'
  entity: AuditEntity
  entityId: string
  target: string
  action: string
  from?: string
  to?: string
  note?: string
}
