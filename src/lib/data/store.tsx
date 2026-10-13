// ─────────────────────────────────────────────────────────
// DemoProvider — 데모 상태를 화면에 연결하는 유일한 지점
//   state.ts    모양 · 초기값 · 저장 형식 검증 (순수)
//   reducer.ts  상태 변경 규칙 · 권한 · 변경 이력 (순수, 단위 테스트 대상)
//   context.ts  useDemo() 와 화면이 쓰는 동작 목록
// 처리자는 화면(표면)으로 정한다 — AX 는 현재 역할, 현장직원 앱은 현장 사용자, 고객 포털은 고객.
// 실서비스 전환 시 이 Provider 의 dispatch 자리를 API 호출로 바꾼다.
// ─────────────────────────────────────────────────────────
import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { Role } from '../../types'
import { nowTimeHM } from '../utils'
import { ACTOR_BY_ROLE, personaName } from '../demo/company'
import { DemoContext, type DemoStore } from './context'
import { demoReducer, type DemoAction, type Meta } from './reducer'
import { STORAGE_KEY, parseStoredState } from './state'

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const metaFor = (actor: string, role: Role): Meta => ({ now: nowTimeHM(), uid: uid(), actor, role })

/** 현장직원 앱에서만 오는 동작 — 다른 동작은 여기로 보낼 수 없다 */
const FIELD_ACTIONS = new Set<DemoAction['type']>(['checkin', 'startWork', 'toggleChecklist', 'skipChecklist', 'setPhoto', 'setNote', 'completeWork', 'reportIssue', 'noticeAck'])

const readStorage = () => {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null } // 사생활 보호 모드 등 저장소 접근 불가
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, null, () => parseStoredState(readStorage()))
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* 저장 실패 시에도 화면은 동작 */ }
  }, [state])

  // 테마 · 글자 크기 · 모션 → <html> 속성 (PC · 모바일 · 미리보기 iframe 공통)
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-theme', state.theme)
    el.setAttribute('data-font', state.fontScale)
    el.setAttribute('data-motion', state.reduceMotion ? 'reduce' : 'normal')
  }, [state.theme, state.fontScale, state.reduceMotion])

  // 다른 탭 · 미리보기 iframe 에서 바뀐 상태를 그대로 받아온다
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) dispatch({ type: 'hydrate', state: parseStoredState(e.newValue) })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // 동작 함수는 한 번만 만든다 — 처리자 정보는 호출 시점의 최신 상태(ref)에서 읽는다
  const actions = useMemo(() => {
    const ax = () => metaFor(ACTOR_BY_ROLE[ref.current.role], ref.current.role)
    const field = () => metaFor(personaName(ref.current.fieldPersona), 'field')
    const customer = () => metaFor(ACTOR_BY_ROLE.customer, 'customer')
    return {
      setRole: (role) => dispatch({ type: 'prefs', patch: { role } }),
      setTheme: (theme) => dispatch({ type: 'prefs', patch: { theme } }),
      setFontScale: (fontScale) => dispatch({ type: 'prefs', patch: { fontScale } }),
      setReduceMotion: (reduceMotion) => dispatch({ type: 'prefs', patch: { reduceMotion } }),
      markTutorialSeen: () => dispatch({ type: 'prefs', patch: { tutorialSeen: true } }),
      replayTutorial: () => dispatch({ type: 'prefs', patch: { tutorialSeen: false } }),
      resetDemo: () => dispatch({ type: 'reset' }),
      setScheduleStatus: (scheduleId, status) => dispatch({ type: 'setScheduleStatus', scheduleId, status }),

      setFieldPersona: (employeeId) => dispatch({ type: 'setFieldPersona', employeeId }),
      fieldMeta: field,
      dispatchField: (a) => { if (FIELD_ACTIONS.has(a.type)) dispatch(a) },

      createProposal: (scheduleId, kind, reason) => {
        const id = `P-${uid().slice(-5).toUpperCase()}`
        const sc = ref.current.schedules.find((x) => x.id === scheduleId)
        dispatch({ type: 'createProposal', proposal: { id, scheduleId, kind, fromTeamId: sc?.teamId ?? null, reason }, meta: ax() })
        return id
      },
      reviewProposal: (proposalId, teamId, note) => dispatch({ type: 'proposalReview', proposalId, teamId, note, meta: ax() }),
      approveProposal: (proposalId) => dispatch({ type: 'proposalApprove', proposalId, meta: ax() }),
      holdProposal: (proposalId, reason) => dispatch({ type: 'proposalHold', proposalId, reason, meta: ax() }),
      rejectProposal: (proposalId, reason) => dispatch({ type: 'proposalReject', proposalId, reason, meta: ax() }),

      setActionStatus: (actionId, status, opts) => dispatch({ type: 'setActionStatus', actionId, status, result: opts?.result, reason: opts?.reason, meta: ax() }),
      setActionOwner: (actionId, owner) => dispatch({ type: 'setActionOwner', actionId, owner, meta: ax() }),
      updateIssue: (issueId, status, owner) => dispatch({ type: 'issueUpdate', issueId, status, owner, meta: ax() }),

      assignRequest: (requestId, assignee) => dispatch({ type: 'requestAssign', requestId, assignee, meta: ax() }),
      replyRequest: (requestId, text, close) => dispatch({ type: 'requestReply', requestId, text, close, meta: ax() }),
      rejectRequest: (requestId, reason) => dispatch({ type: 'requestReject', requestId, reason, meta: ax() }),
      scheduleRequest: (requestId, opts) => {
        const tag = uid().slice(-5).toUpperCase()
        const ids = { scheduleId: `SC-R${tag}`, proposalId: `P-R${tag}` }
        dispatch({ type: 'requestSchedule', requestId, ...ids, ...opts, meta: ax() })
        return ids
      },
      rescheduleRequest: (requestId, targetScheduleId, toTime) => {
        const proposalId = `P-T${uid().slice(-5).toUpperCase()}`
        dispatch({ type: 'requestReschedule', requestId, targetScheduleId, toTime, proposalId, meta: ax() })
        return proposalId
      },
      setUpsellStatus: (id, status) => dispatch({ type: 'setUpsellStatus', id, status, meta: ax() }),
      addEvidence: (engine, text, result) => dispatch({ type: 'addEvidence', engine, text, result, meta: ax() }),

      addRequest: (customerId, requestType, detail) => {
        // 사람이 읽고 전화로 불러줄 수 있는 짧은 접수번호 — 시각 6자리 + 영문 2자리
        const id = `R-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
        dispatch({ type: 'addRequest', id, customerId, requestType, detail, meta: customer() })
        return id
      },
      rateReport: (reportId, rating, feedback) => dispatch({ type: 'rateReport', reportId, rating, feedback, meta: customer() }),
    } satisfies Omit<DemoStore, keyof typeof state | 'actor'>
  }, [])

  const store = useMemo<DemoStore>(() => ({ ...state, ...actions, actor: ACTOR_BY_ROLE[state.role] }), [state, actions])
  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>
}
