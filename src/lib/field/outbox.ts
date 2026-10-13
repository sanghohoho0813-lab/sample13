// ─────────────────────────────────────────────────────────
// 현장 앱 오프라인 대기열 — 신호가 약하거나 끊겨도 현장 기록이 사라지지 않게
//
// · 현장에서 한 동작은 처리 시각(meta)을 그 순간에 담아 대기열에 쌓는다 → 나중에 보내도 실제 시각이 남는다
// · 화면은 '서버 상태 + 대기열'을 리듀서로 겹쳐 그린다 → 오프라인에서도 바로 반영된 것처럼 보인다
// · 대기열은 기기 저장소에 보관 → 앱을 닫았다 열어도 남아 있다
// · 신호가 돌아오면 쌓인 순서대로 보낸다. 리듀서가 중복(체크인 2번 · 완료 2번)을 무시하므로 다시 보내도 안전하다
// ─────────────────────────────────────────────────────────
import { demoReducer, type DemoAction } from '../data/reducer'
import type { DemoState } from '../data/state'

export const OUTBOX_KEY = 'cleanway-field-outbox-v1'
export type Net = 'online' | 'weak' | 'offline'

const FIELD_TYPES = new Set(['checkin', 'startWork', 'toggleChecklist', 'skipChecklist', 'setPhoto', 'setNote', 'completeWork', 'reportIssue', 'noticeAck'])

export function parseOutbox(raw: string | null): DemoAction[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.filter((a) => a && typeof a === 'object' && FIELD_TYPES.has(a.type)) : []
  } catch {
    return []
  }
}

/** 대기열에 추가 — 메모는 같은 작업의 이전 저장분을 대체한다 (긴 메모 자동 저장이 대기열을 채우지 않게) */
export function enqueue(list: DemoAction[], a: DemoAction): DemoAction[] {
  if (a.type === 'setNote') return [...list.filter((x) => !(x.type === 'setNote' && x.scheduleId === a.scheduleId)), a]
  return [...list, a]
}

/** 화면에 그릴 상태 = 받은 상태 + 아직 못 보낸 동작 */
export const overlay = (s: DemoState, list: DemoAction[]): DemoState => list.reduce(demoReducer, s)
