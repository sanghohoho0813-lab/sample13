import { describe, expect, it } from 'vitest'
import { initialState } from '../data/state'
import { demoReducer, type DemoAction, type Meta } from '../data/reducer'
import { enqueue, overlay, parseOutbox } from './outbox'

const meta = (now: string, uid: string): Meta => ({ now, uid, actor: '김도윤 팀장', role: 'field' })

describe('현장 앱 오프라인 대기열', () => {
  it('오프라인에서 한 동작은 화면에 바로 보이고, 나중에 보내도 현장 시각이 남는다', () => {
    const server = initialState()
    let box: DemoAction[] = []
    box = enqueue(box, { type: 'checkin', scheduleId: 'SC-03', meta: meta('14:02', 'a') })
    expect(overlay(server, box).work['SC-03'].checkinAt).toBe('14:02')
    expect(server.work['SC-03']).toBeUndefined() // 서버에는 아직 없음

    // 14:30 에 신호 복구 → 순서대로 전송
    const synced = box.reduce(demoReducer, server)
    expect(synced.work['SC-03'].checkinAt).toBe('14:02')
    expect(synced.audit[0]).toMatchObject({ at: '14:02', action: '도착 체크인' })
  })

  it('같은 동작을 두 번 보내도(재전송) 결과는 한 번', () => {
    const a: DemoAction = { type: 'checkin', scheduleId: 'SC-03', meta: meta('14:02', 'a') }
    const once = overlay(initialState(), [a])
    const twice = overlay(initialState(), [a, a])
    expect(twice.audit.length).toBe(once.audit.length)
  })

  it('긴 메모 자동 저장은 마지막 것만 남긴다', () => {
    let box: DemoAction[] = []
    for (const note of ['대기', '대기실 유리', '대기실 유리 재청소 완료']) box = enqueue(box, { type: 'setNote', scheduleId: 'SC-03', note })
    expect(box).toHaveLength(1)
    expect(overlay(initialState(), box).work['SC-03'].note).toBe('대기실 유리 재청소 완료')
  })

  it('깨지거나 다른 종류의 동작이 섞인 저장값은 버린다', () => {
    expect(parseOutbox('not json')).toEqual([])
    expect(parseOutbox(JSON.stringify([{ type: 'proposalApprove' }, { type: 'checkin', scheduleId: 'SC-03' }]))).toHaveLength(1)
  })
})
