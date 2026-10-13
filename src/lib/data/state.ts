// ─────────────────────────────────────────────────────────
// 데모 상태 — 모양 · 초기값 · 저장/복원 (순수 함수만, React 없음)
// 실서비스 전환 시 이 계층을 API Repository 로 바꾸고 화면 코드는 그대로 둔다.
// ─────────────────────────────────────────────────────────
import type {
  Role, Schedule, WorkSession, ActionItem, CustomerRequest, UpsellOpportunity, EvidenceLog, ServiceReport,
  DispatchProposal, FieldIssue, FieldNotice, AuditEntry,
} from '../../types'
import { SEED_SCHEDULES } from '../demo/operations'
import { SEED_ACTIONS, SEED_REQUESTS, SEED_UPSELL, SEED_EVIDENCE, SEED_REPORTS } from '../demo/intelligence'
import { SEED_AUDIT, SEED_ISSUES, SEED_PROPOSALS } from '../demo/control'

export const STORAGE_KEY = 'cleanway-ax-demo-v1'
/** 저장 형식이 바뀌면 올린다 — 형식이 다른 옛 데이터는 업무 상태를 초기화하고 화면 설정만 살린다 */
export const SCHEMA_VERSION = 3
/** 이 버전보다 오래된 업무 데이터는 일정 · 배정 구조가 달라 다시 시작한다 (화면 설정은 유지) */
export const MIN_COMPATIBLE_VERSION = 3

/** 현장직원 앱 기본 사용자 — 김도윤 팀장 (Clean Team B) */
export const DEFAULT_FIELD_PERSONA = 'E03'

// ── Theme 6종 (index.css의 html[data-theme] 블록과 1:1 대응) ──
export type ThemeId = 'signature' | 'navy' | 'tealchampagne' | 'graphite' | 'indigo' | 'forest'
export type FontScale = 'sm' | 'md' | 'lg'

export const THEMES: Array<{ id: ThemeId; name: string; desc: string; dots: string[] }> = [
  { id: 'signature', name: '클린웨이 시그니처', desc: '딥 틸 · 샴페인', dots: ['#08343A', '#0E6D71', '#D7BC86', '#52A7A3', '#DDEDEA', '#F7F5F0'] },
  { id: 'navy', name: '이그제큐티브 네이비', desc: '딥 네이비 · 골드', dots: ['#0D1B33', '#23479B', '#C9A961', '#5B7BA8', '#DFE7F3', '#F7F8FA'] },
  { id: 'tealchampagne', name: '틸 샴페인', desc: '다크 틸 · 샴페인 골드', dots: ['#103C3A', '#12756E', '#DCC182', '#7FA38C', '#DCEDE6', '#F8F6EF'] },
  { id: 'graphite', name: '그라파이트 코퍼', desc: '그라파이트 · 코퍼', dots: ['#23262B', '#454B54', '#B4703F', '#7C8794', '#E8E6E2', '#F7F4EF'] },
  { id: 'indigo', name: '인디고 라벤더', desc: '미드나잇 인디고 · 라벤더', dots: ['#1E1B39', '#4A3E9E', '#B7A3DC', '#6C77B5', '#E8E5F5', '#F7F6FB'] },
  { id: 'forest', name: '포레스트 샌드', desc: '딥 포레스트 · 샌드 골드', dots: ['#14322A', '#2C6B4F', '#CBA968', '#7C9C82', '#DFEDE0', '#F8F6EE'] },
]

const ROLES: Role[] = ['ceo', 'manager', 'field', 'customer']
const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg']

export interface DemoState {
  version: number
  role: Role
  theme: ThemeId
  fontScale: FontScale
  reduceMotion: boolean
  schedules: Schedule[]
  work: Record<string, WorkSession>
  actions: ActionItem[]
  requests: CustomerRequest[]
  upsell: UpsellOpportunity[]
  evidence: EvidenceLog[]
  reports: ServiceReport[]
  /** 배정 변경안 — AI 추천부터 현장 수신 확인까지 */
  proposals: DispatchProposal[]
  /** 현장에서 올라온 이슈 */
  issues: FieldIssue[]
  /** 현장직원 앱으로 보낸 배정 · 변경 알림 */
  notices: FieldNotice[]
  /** 변경 이력 (최신이 위) */
  audit: AuditEntry[]
  /** 현장직원 앱을 쓰는 사람 (직원 ID) */
  fieldPersona: string
  tutorialSeen: boolean
}

export const initialState = (): DemoState => ({
  version: SCHEMA_VERSION,
  role: 'ceo',
  theme: 'signature',
  fontScale: 'md',
  reduceMotion: false,
  schedules: SEED_SCHEDULES.map((s) => ({ ...s })),
  work: {},
  actions: SEED_ACTIONS.map((a) => ({ ...a })),
  requests: SEED_REQUESTS.map((r) => ({ ...r })),
  upsell: SEED_UPSELL.map((u) => ({ ...u })),
  evidence: SEED_EVIDENCE.map((e) => ({ ...e })),
  reports: SEED_REPORTS.map((r) => ({ ...r })),
  proposals: SEED_PROPOSALS.map((p) => ({ ...p })),
  issues: SEED_ISSUES.map((i) => ({ ...i })),
  notices: [],
  audit: SEED_AUDIT.map((a) => ({ ...a })),
  fieldPersona: DEFAULT_FIELD_PERSONA,
  tutorialSeen: false,
})

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const pick = <T,>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback)

/** 화면 설정(역할·테마·글자·모션·튜토리얼 여부)만 안전하게 꺼낸다 — 형식이 달라도 사용자 선호는 지킨다 */
function readPrefs(raw: Record<string, unknown>, base: DemoState) {
  return {
    role: pick(raw.role, ROLES, base.role),
    theme: pick(raw.theme, THEMES.map((t) => t.id), base.theme),
    fontScale: pick(raw.fontScale, FONT_SCALES, base.fontScale),
    reduceMotion: typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : base.reduceMotion,
    tutorialSeen: typeof raw.tutorialSeen === 'boolean' ? raw.tutorialSeen : base.tutorialSeen,
  }
}

/**
 * 저장된 문자열 → 상태. 어떤 입력에도 예외를 던지지 않는다.
 * - 비어 있거나 JSON 이 깨졌으면 초기 상태
 * - 업무 데이터 배열이 하나라도 없거나 배열이 아니면 업무 상태는 초기화, 화면 설정은 유지
 * - 일정 · 배정 구조가 바뀐 옛 버전(v1·v2)은 업무 상태를 새로 시작하고 화면 설정만 옮긴다
 */
export function parseStoredState(raw: string | null): DemoState {
  const base = initialState()
  if (!raw) return base
  let data: unknown
  try { data = JSON.parse(raw) } catch { return base }
  if (!isObj(data)) return base
  const prefs = readPrefs(data, base)
  const version = typeof data.version === 'number' ? data.version : 1
  const lists = ['schedules', 'actions', 'requests', 'upsell', 'evidence', 'reports', 'proposals', 'issues', 'notices', 'audit'] as const
  const listsOk = lists.every((k) => Array.isArray(data[k]))
  if (version > SCHEMA_VERSION || version < MIN_COMPATIBLE_VERSION || !listsOk || !isObj(data.work)) return { ...base, ...prefs }
  return {
    ...base,
    ...prefs,
    schedules: data.schedules as Schedule[],
    actions: data.actions as ActionItem[],
    requests: data.requests as CustomerRequest[],
    upsell: data.upsell as UpsellOpportunity[],
    evidence: data.evidence as EvidenceLog[],
    reports: data.reports as ServiceReport[],
    proposals: data.proposals as DispatchProposal[],
    issues: data.issues as FieldIssue[],
    notices: data.notices as FieldNotice[],
    audit: data.audit as AuditEntry[],
    work: data.work as Record<string, WorkSession>,
    fieldPersona: typeof data.fieldPersona === 'string' ? data.fieldPersona : DEFAULT_FIELD_PERSONA,
  }
}
