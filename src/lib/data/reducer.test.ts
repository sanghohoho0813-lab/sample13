import { describe, expect, it } from 'vitest'
import { CHECKLIST_TEMPLATE } from '../demo/operations'
import { demoReducer, type DemoAction, type Meta } from './reducer'
import { initialState, type DemoState } from './state'

const meta = (n = 1): Meta => ({ now: '10:00', uid: `t${n}` })
const run = (s: DemoState, ...actions: DemoAction[]) => actions.reduce(demoReducer, s)
const firstOpen = (s: DemoState) => s.schedules.find((x) => x.status !== '완료' && x.teamId)!

describe('demoReducer — 데모 상태 변경 규칙', () => {
  it('설정 변경은 다른 값을 건드리지 않는다', () => {
    const s0 = initialState()
    const s1 = run(s0, { type: 'prefs', patch: { theme: 'navy' } })
    expect(s1.theme).toBe('navy')
    expect(s1.schedules).toBe(s0.schedules)
  })

  it('AI 배정을 적용하면 팀이 지정되고 실증 기록이 남는다', () => {
    const s0 = initialState()
    const target = s0.schedules.find((x) => !x.teamId)!
    const s1 = run(s0, { type: 'assignTeam', scheduleId: target.id, teamId: 'T-E', meta: meta() })
    expect(s1.schedules.find((x) => x.id === target.id)!.teamId).toBe('T-E')
    expect(s1.evidence[0]).toMatchObject({ id: 'EV-t1', engine: 'dispatch', time: '10:00' })
    expect(s1.evidence).toHaveLength(s0.evidence.length + 1)
  })

  it('체크인하면 작업중이 되고 도착 시각이 기록된다', () => {
    const s0 = initialState()
    const job = firstOpen(s0)
    const s1 = run(s0, { type: 'checkin', scheduleId: job.id, meta: meta() })
    expect(s1.schedules.find((x) => x.id === job.id)!.status).toBe('작업중')
    expect(s1.work[job.id].checkinAt).toBe('10:00')
  })

  it('체크리스트는 누를 때마다 켜고 끈다', () => {
    const job = firstOpen(initialState())
    const item = CHECKLIST_TEMPLATE[0]
    const toggle: DemoAction = { type: 'toggleChecklist', scheduleId: job.id, item }
    const s1 = run(initialState(), toggle)
    expect(s1.work[job.id].checklist[item]).toBe(true)
    expect(run(s1, toggle).work[job.id].checklist[item]).toBe(false)
  })

  it('작업 완료 → 리포트 1건 생성, 체크리스트 수와 메모를 담는다', () => {
    const s0 = initialState()
    const job = firstOpen(s0)
    const s1 = run(
      s0,
      { type: 'toggleChecklist', scheduleId: job.id, item: CHECKLIST_TEMPLATE[0] },
      { type: 'toggleChecklist', scheduleId: job.id, item: CHECKLIST_TEMPLATE[1] },
      { type: 'setNote', scheduleId: job.id, note: '  유리 얼룩 재청소  ' },
      { type: 'completeWork', scheduleId: job.id, meta: meta(7) },
    )
    expect(s1.reports).toHaveLength(s0.reports.length + 1)
    expect(s1.reports[0]).toMatchObject({ id: 'RP-t7', scheduleId: job.id, itemsDone: 2, itemsTotal: CHECKLIST_TEMPLATE.length, note: '유리 얼룩 재청소' })
    expect(s1.schedules.find((x) => x.id === job.id)!.status).toBe('완료')
  })

  it('이미 완료된 작업을 다시 완료해도 리포트가 두 번 생기지 않는다', () => {
    const job = firstOpen(initialState())
    const done: DemoAction = { type: 'completeWork', scheduleId: job.id, meta: meta() }
    const s1 = run(initialState(), done)
    expect(run(s1, done)).toBe(s1)
  })

  it('메모가 비어 있으면 리포트에 "특이사항 없음"', () => {
    const job = firstOpen(initialState())
    const s1 = run(initialState(), { type: 'completeWork', scheduleId: job.id, meta: meta() })
    expect(s1.reports[0].note).toBe('특이사항 없음')
  })

  it('실행 단계 — 같은 상태로 두 번 바꾸면 아무 일도 없다 (중복 기록 방지)', () => {
    const s0 = initialState()
    const a = s0.actions.find((x) => x.status === '추천됨')!
    const s1 = run(s0, { type: 'setActionStatus', actionId: a.id, status: '실행중', meta: meta() })
    expect(s1.evidence).toHaveLength(s0.evidence.length + 1)
    expect(run(s1, { type: 'setActionStatus', actionId: a.id, status: '실행중', meta: meta(2) })).toBe(s1)
  })

  it('실행 단계 — 검토 시작(확인)은 기록을 남기지 않고, 완료는 남긴다', () => {
    const s0 = initialState()
    const a = s0.actions.find((x) => x.status === '추천됨')!
    const s1 = run(s0, { type: 'setActionStatus', actionId: a.id, status: '확인', meta: meta() })
    expect(s1.evidence).toHaveLength(s0.evidence.length)
    const s2 = run(s1, { type: 'setActionStatus', actionId: a.id, status: '완료', meta: meta(2) })
    expect(s2.evidence[0].text).toContain('조치 완료')
  })

  it('고객이 추가서비스를 요청하면 요청함과 추가매출 기회가 함께 생긴다', () => {
    const s0 = initialState()
    const s1 = run(s0, { type: 'addRequest', id: 'R-1', customerId: 'C01', requestType: '추가서비스', detail: '유리창 집중청소 · 이번 주 안에', meta: meta() })
    expect(s1.requests[0]).toMatchObject({ id: 'R-1', status: '접수', fromPortal: true, createdAt: '오늘 10:00' })
    expect(s1.upsell[0]).toMatchObject({ id: 'U-R-1', customerId: 'C01', status: '발견됨' })
    expect(s1.evidence[0].engine).toBe('upsell')
  })

  it('문의는 요청함에만 들어가고 추가매출 기회는 만들지 않는다', () => {
    const s0 = initialState()
    const s1 = run(s0, { type: 'addRequest', id: 'R-2', customerId: 'C01', requestType: '문의', detail: '[일정] 시간 변경 가능?', meta: meta() })
    expect(s1.upsell).toBe(s0.upsell)
  })

  it('초기화는 업무 데이터만 되돌리고 화면 설정 · 튜토리얼 완료 여부는 유지한다', () => {
    const changed = run(
      initialState(),
      { type: 'prefs', patch: { theme: 'indigo', fontScale: 'lg', reduceMotion: true, tutorialSeen: true } },
      { type: 'addRequest', id: 'R-3', customerId: 'C01', requestType: '문의', detail: 'x', meta: meta() },
    )
    const reset = run(changed, { type: 'reset' })
    expect(reset.requests).toEqual(initialState().requests)
    expect(reset).toMatchObject({ theme: 'indigo', fontScale: 'lg', reduceMotion: true, tutorialSeen: true })
  })
})
