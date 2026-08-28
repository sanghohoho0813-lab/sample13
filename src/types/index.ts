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
}

export interface WorkSession {
  scheduleId: string
  checkinAt?: string
  startedAt?: string
  checklist: Record<string, boolean>
  beforePhoto: boolean
  afterPhoto: boolean
  note: string
  completedAt?: string
  checkoutAt?: string
}

export interface DispatchCandidate {
  teamId: string
  rank: number
  travelMin: number
  fitPct: number
  slackMin: number
  reasons: string[]
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
  dispatch: 'AI Smart Dispatch',
  risk: 'AI Service Risk Radar',
  retention: 'AI Customer Retention',
  upsell: 'AI Upsell Finder',
  profit: 'AI Service Profitability',
  briefing: 'AI Executive Briefing',
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
}

export interface CustomerHealth {
  customerId: string
  score: number
  positives: string[]
  watch: string[]
  aiStatus: '안정' | 'Retention Watch' | 'Risk'
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

export interface CustomerRequest {
  id: string
  customerId: string
  type: RequestType
  detail: string
  createdAt: string
  status: '접수' | '처리중' | '완료'
  fromPortal?: boolean
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
}
