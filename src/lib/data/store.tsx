// ─────────────────────────────────────────────────────────
// DemoStore — Data Adapter Layer (DEMO MODE)
// UI ↔ Data 분리: 현재는 Seed + localStorage.
// 실서비스 전환 시 이 Layer만 Supabase/API Repository로 교체한다.
// ─────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Role, Schedule, WorkSession, ActionItem, ActionStatus,
  CustomerRequest, UpsellOpportunity, EvidenceLog, ServiceReport, RequestType,
} from '../../types'
import { SEED_SCHEDULES, CHECKLIST_TEMPLATE } from '../demo/operations'
import {
  SEED_ACTIONS, SEED_REQUESTS, SEED_UPSELL, SEED_EVIDENCE, SEED_REPORTS,
} from '../demo/intelligence'
import { customerById, teamById } from '../demo/company'
import { nowTimeHM } from '../utils'

const LS_KEY = 'cleanway-ax-demo-v1'

interface DemoState {
  role: Role
  schedules: Schedule[]
  work: Record<string, WorkSession>
  actions: ActionItem[]
  requests: CustomerRequest[]
  upsell: UpsellOpportunity[]
  evidence: EvidenceLog[]
  reports: ServiceReport[]
  tutorialSeen: boolean
}

const initialState = (): DemoState => ({
  role: 'ceo',
  schedules: SEED_SCHEDULES.map((s) => ({ ...s })),
  work: {},
  actions: SEED_ACTIONS.map((a) => ({ ...a })),
  requests: SEED_REQUESTS.map((r) => ({ ...r })),
  upsell: SEED_UPSELL.map((u) => ({ ...u })),
  evidence: SEED_EVIDENCE.map((e) => ({ ...e })),
  reports: SEED_REPORTS.map((r) => ({ ...r })),
  tutorialSeen: false,
})

const load = (): DemoState => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed && parsed.schedules && parsed.actions) return { ...initialState(), ...parsed }
    }
  } catch { /* localStorage 접근 불가 시 seed 사용 */ }
  return initialState()
}

interface DemoStore extends DemoState {
  setRole: (r: Role) => void
  markTutorialSeen: () => void
  resetDemo: () => void
  // 일정 / 배정
  assignTeam: (scheduleId: string, teamId: string) => void
  setScheduleStatus: (scheduleId: string, status: Schedule['status']) => void
  // Field workflow
  checkin: (scheduleId: string) => void
  startWork: (scheduleId: string) => void
  toggleChecklist: (scheduleId: string, item: string) => void
  setPhoto: (scheduleId: string, kind: 'before' | 'after') => void
  setNote: (scheduleId: string, note: string) => void
  completeWork: (scheduleId: string) => void
  // Action Lifecycle
  setActionStatus: (actionId: string, status: ActionStatus, result?: string) => void
  // Customer Portal → AX Closed Loop
  addRequest: (customerId: string, type: RequestType, detail: string) => void
  setRequestStatus: (requestId: string, status: CustomerRequest['status']) => void
  setUpsellStatus: (id: string, status: UpsellOpportunity['status']) => void
  addEvidence: (engine: EvidenceLog['engine'], text: string, result?: string) => void
}

const Ctx = createContext<DemoStore | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch { /* noop */ }
  }, [state])

  const store = useMemo<DemoStore>(() => {
    const patch = (p: Partial<DemoState>) => setState((s) => ({ ...s, ...p }))
    const patchSchedule = (id: string, p: Partial<Schedule>) =>
      setState((s) => ({ ...s, schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...p } : sc)) }))
    const patchWork = (id: string, p: Partial<WorkSession>) =>
      setState((s) => {
        const cur: WorkSession = s.work[id] ?? {
          scheduleId: id,
          checklist: Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, false])),
          beforePhoto: false, afterPhoto: false, note: '',
        }
        return { ...s, work: { ...s.work, [id]: { ...cur, ...p } } }
      })
    const pushEvidence = (engine: EvidenceLog['engine'], text: string, result?: string) =>
      setState((s) => ({
        ...s,
        evidence: [
          { id: `EV-${Date.now()}`, date: 'TODAY', time: nowTimeHM(), engine, text, result },
          ...s.evidence,
        ],
      }))

    return {
      ...state,
      setRole: (role) => patch({ role }),
      markTutorialSeen: () => patch({ tutorialSeen: true }),
      resetDemo: () => {
        try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
        setState(initialState())
      },
      assignTeam: (scheduleId, teamId) => {
        patchSchedule(scheduleId, { teamId })
        const sc = state.schedules.find((s) => s.id === scheduleId)
        const c = sc ? customerById(sc.customerId) : undefined
        pushEvidence('dispatch', `AI 배정 추천 적용 — ${c?.name ?? scheduleId} ${sc?.time ?? ''} · ${teamById(teamId)?.name ?? teamId}`)
      },
      setScheduleStatus: (scheduleId, status) => patchSchedule(scheduleId, { status }),
      checkin: (id) => { patchWork(id, { checkinAt: nowTimeHM() }); patchSchedule(id, { status: '작업중' }) },
      startWork: (id) => patchWork(id, { startedAt: nowTimeHM() }),
      toggleChecklist: (id, item) =>
        setState((s) => {
          const cur = s.work[id] ?? {
            scheduleId: id,
            checklist: Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, false])),
            beforePhoto: false, afterPhoto: false, note: '',
          }
          return {
            ...s,
            work: { ...s.work, [id]: { ...cur, checklist: { ...cur.checklist, [item]: !cur.checklist[item] } } },
          }
        }),
      setPhoto: (id, kind) => patchWork(id, kind === 'before' ? { beforePhoto: true } : { afterPhoto: true }),
      setNote: (id, note) => patchWork(id, { note }),
      completeWork: (id) => {
        const t = nowTimeHM()
        patchWork(id, { completedAt: t, checkoutAt: t })
        patchSchedule(id, { status: '완료' })
        setState((s) => {
          const sc = s.schedules.find((x) => x.id === id)
          if (!sc) return s
          const ws = s.work[id]
          const done = ws ? Object.values(ws.checklist).filter(Boolean).length : 0
          const report: ServiceReport = {
            id: `RP-${Date.now()}`,
            scheduleId: id,
            customerId: sc.customerId,
            date: '오늘',
            team: teamById(sc.teamId)?.name ?? '미배정',
            completedAt: t,
            itemsDone: done,
            itemsTotal: CHECKLIST_TEMPLATE.length,
            note: ws?.note || '특이사항 없음',
          }
          return { ...s, reports: [report, ...s.reports] }
        })
        const sc = state.schedules.find((x) => x.id === id)
        const c = sc ? customerById(sc.customerId) : undefined
        pushEvidence('risk', `현장 작업 완료 — ${c?.name ?? id} · Service Report 자동 생성`)
      },
      setActionStatus: (actionId, status, result) => {
        setState((s) => ({
          ...s,
          actions: s.actions.map((a) => (a.id === actionId ? { ...a, status, result: result ?? a.result } : a)),
        }))
        const a = state.actions.find((x) => x.id === actionId)
        if (a && (status === '완료' || status === '실행중')) {
          pushEvidence(a.engine, `Action ${status === '완료' ? '완료' : '실행'} — ${a.title}`, status === '완료' ? result ?? a.result : undefined)
        }
      },
      addRequest: (customerId, type, detail) => {
        const c = customerById(customerId)
        setState((s) => ({
          ...s,
          requests: [
            { id: `R-${Date.now()}`, customerId, type, detail, createdAt: `오늘 ${nowTimeHM()}`, status: '접수', fromPortal: true },
            ...s.requests,
          ],
          // Closed Loop: 추가서비스 요청 → Upsell Opportunity 자동 생성
          upsell: type === '추가서비스'
            ? [
                {
                  id: `U-${Date.now()}`, customerId,
                  currentService: c?.contract.serviceSummary ?? '-',
                  signal: 'Customer Portal 고객 요청',
                  recommendedService: detail,
                  expectedRevenue: 85,
                  reason: '고객이 Portal에서 직접 요청한 신규 Service Opportunity',
                  status: '발견됨',
                },
                ...s.upsell,
              ]
            : s.upsell,
        }))
        pushEvidence(
          type === '추가서비스' ? 'upsell' : 'risk',
          `Customer Portal 요청 접수 — ${c?.name ?? customerId} · ${type}${type === '추가서비스' ? ' → 신규 Service Opportunity 생성' : type === '일정변경' ? ' → AI Smart Dispatch 재검토 대기' : ''}`,
        )
      },
      setRequestStatus: (requestId, status) =>
        setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === requestId ? { ...r, status } : r)) })),
      setUpsellStatus: (id, status) =>
        setState((s) => ({ ...s, upsell: s.upsell.map((u) => (u.id === id ? { ...u, status } : u)) })),
      addEvidence: pushEvidence,
    }
  }, [state])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useDemo(): DemoStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
