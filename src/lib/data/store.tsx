// ─────────────────────────────────────────────────────────
// DemoProvider — 데모 상태를 화면에 연결하는 유일한 지점
//   state.ts    모양 · 초기값 · 저장 형식 검증 (순수)
//   reducer.ts  상태 변경 규칙 (순수, 단위 테스트 대상)
//   context.ts  useDemo() 와 화면이 쓰는 동작 목록
// 실서비스 전환 시 이 Provider 의 dispatch 자리를 API 호출로 바꾼다.
// ─────────────────────────────────────────────────────────
import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { nowTimeHM } from '../utils'
import { DemoContext, type DemoStore } from './context'
import { demoReducer, type Meta } from './reducer'
import { STORAGE_KEY, parseStoredState } from './state'

const meta = (): Meta => ({ now: nowTimeHM(), uid: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` })

const readStorage = () => {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null } // 사생활 보호 모드 등 저장소 접근 불가
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, null, () => parseStoredState(readStorage()))

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

  // 동작 함수는 한 번만 만든다 (dispatch 는 바뀌지 않음) — 상태가 바뀌어도 함수 참조는 그대로
  const actions = useMemo(() => ({
    setRole: (role) => dispatch({ type: 'prefs', patch: { role } }),
    setTheme: (theme) => dispatch({ type: 'prefs', patch: { theme } }),
    setFontScale: (fontScale) => dispatch({ type: 'prefs', patch: { fontScale } }),
    setReduceMotion: (reduceMotion) => dispatch({ type: 'prefs', patch: { reduceMotion } }),
    markTutorialSeen: () => dispatch({ type: 'prefs', patch: { tutorialSeen: true } }),
    replayTutorial: () => dispatch({ type: 'prefs', patch: { tutorialSeen: false } }),
    resetDemo: () => dispatch({ type: 'reset' }),
    assignTeam: (scheduleId, teamId) => dispatch({ type: 'assignTeam', scheduleId, teamId, meta: meta() }),
    setScheduleStatus: (scheduleId, status) => dispatch({ type: 'setScheduleStatus', scheduleId, status }),
    checkin: (scheduleId) => dispatch({ type: 'checkin', scheduleId, meta: meta() }),
    startWork: (scheduleId) => dispatch({ type: 'startWork', scheduleId, meta: meta() }),
    toggleChecklist: (scheduleId, item) => dispatch({ type: 'toggleChecklist', scheduleId, item }),
    setPhoto: (scheduleId, kind) => dispatch({ type: 'setPhoto', scheduleId, kind }),
    setNote: (scheduleId, note) => dispatch({ type: 'setNote', scheduleId, note }),
    completeWork: (scheduleId) => dispatch({ type: 'completeWork', scheduleId, meta: meta() }),
    setActionStatus: (actionId, status, result) => dispatch({ type: 'setActionStatus', actionId, status, result, meta: meta() }),
    addRequest: (customerId, requestType, detail) => {
      // 사람이 읽고 전화로 불러줄 수 있는 짧은 접수번호 — 시각 6자리 + 영문 2자리
      const id = `R-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
      dispatch({ type: 'addRequest', id, customerId, requestType, detail, meta: meta() })
      return id
    },
    setRequestStatus: (requestId, status) => dispatch({ type: 'setRequestStatus', requestId, status }),
    setUpsellStatus: (id, status) => dispatch({ type: 'setUpsellStatus', id, status }),
    addEvidence: (engine, text, result) => dispatch({ type: 'addEvidence', engine, text, result, meta: meta() }),
  }) satisfies Omit<DemoStore, keyof typeof state>, [])

  const store = useMemo<DemoStore>(() => ({ ...state, ...actions }), [state, actions])
  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>
}
