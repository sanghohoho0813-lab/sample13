import { createContext, useContext } from 'react'
import type { ActionStatus, CustomerRequest, EvidenceLog, RequestType, Role, Schedule, UpsellOpportunity } from '../../types'
import type { DemoState, FontScale, ThemeId } from './state'

export interface DemoStore extends DemoState {
  setRole: (r: Role) => void
  setTheme: (t: ThemeId) => void
  setFontScale: (f: FontScale) => void
  setReduceMotion: (v: boolean) => void
  markTutorialSeen: () => void
  replayTutorial: () => void
  resetDemo: () => void
  // 일정 / 배정
  assignTeam: (scheduleId: string, teamId: string) => void
  setScheduleStatus: (scheduleId: string, status: Schedule['status']) => void
  // 현장 작업
  checkin: (scheduleId: string) => void
  startWork: (scheduleId: string) => void
  toggleChecklist: (scheduleId: string, item: string) => void
  setPhoto: (scheduleId: string, kind: 'before' | 'after') => void
  setNote: (scheduleId: string, note: string) => void
  completeWork: (scheduleId: string) => void
  // 실행 단계
  setActionStatus: (actionId: string, status: ActionStatus, result?: string) => void
  // 고객 플랫폼 → AX 연결
  /** 접수번호를 돌려준다 — 고객 화면에서 접수 완료 안내에 사용 */
  addRequest: (customerId: string, type: RequestType, detail: string) => string
  setRequestStatus: (requestId: string, status: CustomerRequest['status']) => void
  setUpsellStatus: (id: string, status: UpsellOpportunity['status']) => void
  addEvidence: (engine: EvidenceLog['engine'], text: string, result?: string) => void
}

export const DemoContext = createContext<DemoStore | null>(null)

export function useDemo(): DemoStore {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo 는 <DemoProvider> 안에서만 사용할 수 있습니다')
  return ctx
}
