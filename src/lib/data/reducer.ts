// ─────────────────────────────────────────────────────────
// 데모 상태 변경 규칙 — 순수 함수 (같은 입력 → 같은 결과)
// 시각·ID 처럼 바깥에서 오는 값은 action.meta 로 받아, 테스트에서 고정할 수 있게 한다.
// ─────────────────────────────────────────────────────────
import type {
  ActionStatus, CustomerRequest, EvidenceLog, RequestType, Schedule, ServiceReport, UpsellOpportunity, WorkSession,
} from '../../types'
import { CHECKLIST_TEMPLATE } from '../demo/operations'
import { customerById, teamById } from '../demo/company'
import { initialState, type DemoState } from './state'

/** 바깥에서 주입하는 값 — 현재 시각(HH:MM)과 고유 ID 조각 */
export interface Meta { now: string; uid: string }

export type Prefs = Partial<Pick<DemoState, 'role' | 'theme' | 'fontScale' | 'reduceMotion' | 'tutorialSeen'>>

export type DemoAction =
  | { type: 'prefs'; patch: Prefs }
  | { type: 'reset' }
  | { type: 'hydrate'; state: DemoState }
  | { type: 'assignTeam'; scheduleId: string; teamId: string; meta: Meta }
  | { type: 'setScheduleStatus'; scheduleId: string; status: Schedule['status'] }
  | { type: 'checkin'; scheduleId: string; meta: Meta }
  | { type: 'startWork'; scheduleId: string; meta: Meta }
  | { type: 'toggleChecklist'; scheduleId: string; item: string }
  | { type: 'setPhoto'; scheduleId: string; kind: 'before' | 'after' }
  | { type: 'setNote'; scheduleId: string; note: string }
  | { type: 'completeWork'; scheduleId: string; meta: Meta }
  | { type: 'setActionStatus'; actionId: string; status: ActionStatus; result?: string; meta: Meta }
  | { type: 'addRequest'; id: string; customerId: string; requestType: RequestType; detail: string; meta: Meta }
  | { type: 'setRequestStatus'; requestId: string; status: CustomerRequest['status'] }
  | { type: 'setUpsellStatus'; id: string; status: UpsellOpportunity['status'] }
  | { type: 'addEvidence'; engine: EvidenceLog['engine']; text: string; result?: string; meta: Meta }

const emptyWork = (scheduleId: string): WorkSession => ({
  scheduleId,
  checklist: Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, false])),
  beforePhoto: false,
  afterPhoto: false,
  note: '',
})

const patchSchedule = (s: DemoState, id: string, p: Partial<Schedule>): DemoState => ({
  ...s, schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...p } : sc)),
})

const patchWork = (s: DemoState, id: string, p: Partial<WorkSession>): DemoState => ({
  ...s, work: { ...s.work, [id]: { ...(s.work[id] ?? emptyWork(id)), ...p } },
})

/** AX 실증 기록 — 사람이 실행한 조치를 시간순으로 남긴다 (최신이 위) */
const withEvidence = (s: DemoState, meta: Meta, engine: EvidenceLog['engine'], text: string, result?: string): DemoState => ({
  ...s, evidence: [{ id: `EV-${meta.uid}`, date: 'TODAY', time: meta.now, engine, text, result }, ...s.evidence],
})

const customerName = (s: DemoState, scheduleId: string) => {
  const sc = s.schedules.find((x) => x.id === scheduleId)
  return { sc, name: (sc && customerById(sc.customerId)?.name) ?? scheduleId }
}

export function demoReducer(s: DemoState, a: DemoAction): DemoState {
  switch (a.type) {
    case 'prefs':
      return { ...s, ...a.patch }

    case 'reset':
      // 업무 데이터만 처음 상태로 — 테마·글자·모션 같은 사용자 선호와 튜토리얼 완료 여부는 유지
      return { ...initialState(), theme: s.theme, fontScale: s.fontScale, reduceMotion: s.reduceMotion, tutorialSeen: s.tutorialSeen }

    case 'hydrate':
      return a.state

    case 'assignTeam': {
      const { sc, name } = customerName(s, a.scheduleId)
      const next = patchSchedule(s, a.scheduleId, { teamId: a.teamId })
      return withEvidence(next, a.meta, 'dispatch', `AI 배정 추천 적용 — ${name} ${sc?.time ?? ''} · ${teamById(a.teamId)?.name ?? a.teamId}`)
    }

    case 'setScheduleStatus':
      return patchSchedule(s, a.scheduleId, { status: a.status })

    case 'checkin':
      return patchSchedule(patchWork(s, a.scheduleId, { checkinAt: a.meta.now }), a.scheduleId, { status: '작업중' })

    case 'startWork':
      return patchWork(s, a.scheduleId, { startedAt: a.meta.now })

    case 'toggleChecklist': {
      const cur = s.work[a.scheduleId] ?? emptyWork(a.scheduleId)
      return patchWork(s, a.scheduleId, { checklist: { ...cur.checklist, [a.item]: !cur.checklist[a.item] } })
    }

    case 'setPhoto':
      return patchWork(s, a.scheduleId, a.kind === 'before' ? { beforePhoto: true } : { afterPhoto: true })

    case 'setNote':
      return patchWork(s, a.scheduleId, { note: a.note })

    case 'completeWork': {
      const { sc, name } = customerName(s, a.scheduleId)
      if (!sc) return s
      // 이미 완료된 작업을 다시 완료해도 리포트가 두 번 생기지 않게
      if (sc.status === '완료') return s
      let next = patchWork(s, a.scheduleId, { completedAt: a.meta.now, checkoutAt: a.meta.now })
      next = patchSchedule(next, a.scheduleId, { status: '완료' })
      const ws = next.work[a.scheduleId]
      const report: ServiceReport = {
        id: `RP-${a.meta.uid}`,
        scheduleId: a.scheduleId,
        customerId: sc.customerId,
        date: '오늘',
        team: teamById(sc.teamId)?.name ?? '미배정',
        completedAt: a.meta.now,
        itemsDone: Object.values(ws.checklist).filter(Boolean).length,
        itemsTotal: CHECKLIST_TEMPLATE.length,
        note: ws.note.trim() || '특이사항 없음',
      }
      next = { ...next, reports: [report, ...next.reports] }
      return withEvidence(next, a.meta, 'risk', `현장 작업 완료 — ${name} · 작업 리포트 자동 생성`)
    }

    case 'setActionStatus': {
      const action = s.actions.find((x) => x.id === a.actionId)
      if (!action || action.status === a.status) return s
      const next = { ...s, actions: s.actions.map((x) => (x.id === a.actionId ? { ...x, status: a.status, result: a.result ?? x.result } : x)) }
      if (a.status !== '완료' && a.status !== '실행중') return next
      return withEvidence(next, a.meta, action.engine, `조치 ${a.status === '완료' ? '완료' : '실행'} — ${action.title}`, a.status === '완료' ? a.result ?? action.result : undefined)
    }

    case 'addRequest': {
      const c = customerById(a.customerId)
      const request: CustomerRequest = {
        id: a.id, customerId: a.customerId, type: a.requestType, detail: a.detail,
        createdAt: `오늘 ${a.meta.now}`, status: '접수', fromPortal: true,
      }
      // Closed Loop: 추가서비스 요청 → 추가매출 기회 자동 생성
      const upsell: UpsellOpportunity[] = a.requestType === '추가서비스'
        ? [{
            id: `U-${a.id}`, customerId: a.customerId,
            currentService: c?.contract.serviceSummary ?? '-',
            signal: '고객 플랫폼 고객 요청',
            recommendedService: a.detail,
            expectedRevenue: 85,
            reason: '고객이 플랫폼에서 직접 요청한 신규 서비스 기회',
            status: '발견됨',
          }, ...s.upsell]
        : s.upsell
      const follow = a.requestType === '추가서비스' ? ' → 추가매출 기회 자동 생성' : a.requestType === '일정변경' ? ' → AI 스마트 배정 재검토 대기' : ''
      return withEvidence(
        { ...s, requests: [request, ...s.requests], upsell },
        a.meta,
        a.requestType === '추가서비스' ? 'upsell' : 'risk',
        `고객 플랫폼 요청 접수 — ${c?.name ?? a.customerId} · ${a.requestType}${follow}`,
      )
    }

    case 'setRequestStatus':
      return { ...s, requests: s.requests.map((r) => (r.id === a.requestId ? { ...r, status: a.status } : r)) }

    case 'setUpsellStatus':
      return { ...s, upsell: s.upsell.map((u) => (u.id === a.id ? { ...u, status: a.status } : u)) }

    case 'addEvidence':
      return withEvidence(s, a.meta, a.engine, a.text, a.result)
  }
}
