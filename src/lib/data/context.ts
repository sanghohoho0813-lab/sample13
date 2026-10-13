import { createContext, useContext } from 'react'
import type { ActionStatus, EvidenceLog, FieldIssue, ProposalKind, RequestType, Role, Schedule, UpsellOpportunity } from '../../types'
import type { DemoAction, Meta } from './reducer'
import type { DemoState, FontScale, ThemeId } from './state'

export interface DemoStore extends DemoState {
  /** 지금 처리하는 사람 (역할 전환에 따라 바뀜) — 변경 이력 · 직무 분리 판단에 쓰인다 */
  actor: string
  setRole: (r: Role) => void
  setTheme: (t: ThemeId) => void
  setFontScale: (f: FontScale) => void
  setReduceMotion: (v: boolean) => void
  markTutorialSeen: () => void
  replayTutorial: () => void
  resetDemo: () => void
  setScheduleStatus: (scheduleId: string, status: Schedule['status']) => void

  // ── 현장직원 앱 — 오프라인 대기열을 거치므로 동작 객체를 직접 보낸다 ──
  setFieldPersona: (employeeId: string) => void
  /** 현장 사용자로 처리자 정보(meta)를 만든다 — 오프라인에서 만든 동작도 실제 시각이 남는다 */
  fieldMeta: () => Meta
  dispatchField: (a: DemoAction) => void

  // ── 배정 (Smart Dispatch 실행 흐름) ──
  createProposal: (scheduleId: string, kind: ProposalKind, reason: string) => string
  reviewProposal: (proposalId: string, teamId: string, note: string) => void
  approveProposal: (proposalId: string) => void
  holdProposal: (proposalId: string, reason: string) => void
  rejectProposal: (proposalId: string, reason: string) => void

  // ── AI 조치 · 현장 이슈 ──
  setActionStatus: (actionId: string, status: ActionStatus, opts?: { result?: string; reason?: string }) => void
  setActionOwner: (actionId: string, owner: string) => void
  updateIssue: (issueId: string, status: FieldIssue['status'], owner?: string) => void

  // ── 고객 요청 처리 (본사) ──
  assignRequest: (requestId: string, assignee: string) => void
  replyRequest: (requestId: string, text: string, close: boolean) => void
  rejectRequest: (requestId: string, reason: string) => void
  /** 추가서비스 · 긴급방문 → 일정 생성 + 신규 배정안. 만든 일정 · 배정안 ID 를 돌려준다 */
  scheduleRequest: (requestId: string, opts: { dayOffset: number; time: string; durationMin: number; service: string; quote?: number }) => { scheduleId: string; proposalId: string }
  /** 일정변경 → 시간 변경안 */
  rescheduleRequest: (requestId: string, targetScheduleId: string, toTime: string) => string
  setUpsellStatus: (id: string, status: UpsellOpportunity['status']) => void
  addEvidence: (engine: EvidenceLog['engine'], text: string, result?: string) => void

  // ── 고객 포털 ──
  /** 접수번호를 돌려준다 — 고객 화면에서 접수 완료 안내에 사용 */
  addRequest: (customerId: string, type: RequestType, detail: string) => string
  rateReport: (reportId: string, rating: number, feedback: string) => void
}

export const DemoContext = createContext<DemoStore | null>(null)

export function useDemo(): DemoStore {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo 는 <DemoProvider> 안에서만 사용할 수 있습니다')
  return ctx
}
