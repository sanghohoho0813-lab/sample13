import { describe, expect, it } from 'vitest'
import { CHECKLIST_TEMPLATE } from '../demo/operations'
import { completionGaps, demoReducer, type DemoAction, type Meta } from './reducer'
import { initialState, type DemoState } from './state'

const as = (role: Meta['role'], actor: string, n = 1): Meta => ({ now: '14:30', uid: `t${n}`, actor, role })
const manager = (n = 1) => as('manager', '최은지 운영관리자', n)
const ceo = (n = 1) => as('ceo', '박정민 대표', n)
const field = (n = 1) => as('field', '김도윤 팀장', n)
const customer = (n = 1) => as('customer', '김수연 실장', n)
const run = (s: DemoState, ...actions: DemoAction[]) => actions.reduce(demoReducer, s)
const sched = (s: DemoState, id: string) => s.schedules.find((x) => x.id === id)!

/** 현장 작업을 끝까지 수행하는 동작 묶음 */
const fullWork = (id: string, skipLast = false): DemoAction[] => [
  { type: 'checkin', scheduleId: id, meta: field(1) },
  { type: 'startWork', scheduleId: id, meta: field(2) },
  ...CHECKLIST_TEMPLATE.map((item, i): DemoAction => (skipLast && i === CHECKLIST_TEMPLATE.length - 1
    ? { type: 'skipChecklist', scheduleId: id, item, reason: '화장실 공사 중 — 출입 불가', meta: field(3) }
    : { type: 'toggleChecklist', scheduleId: id, item, meta: field(3) })),
  { type: 'setPhoto', scheduleId: id, kind: 'before', meta: field(4) },
  { type: 'setPhoto', scheduleId: id, kind: 'after', meta: field(5) },
]

describe('권한 — 화면이 아니라 상태 변경에서 막는다', () => {
  it('현장직원 · 고객은 배정을 승인할 수 없다', () => {
    const s0 = run(initialState(), { type: 'proposalReview', proposalId: 'P-01', teamId: 'T-E', note: '', meta: manager() })
    expect(run(s0, { type: 'proposalApprove', proposalId: 'P-01', meta: field() })).toBe(s0)
    expect(run(s0, { type: 'proposalApprove', proposalId: 'P-01', meta: customer() })).toBe(s0)
  })
  it('본사 역할은 현장 체크인을 대신할 수 없다', () => {
    const s0 = initialState()
    expect(run(s0, { type: 'checkin', scheduleId: 'SC-03', meta: manager() })).toBe(s0)
  })
})

describe('Smart Dispatch — 추천 → 검토 → 승인 → 일정 반영 → 현장 확인', () => {
  it('신규 배정은 검토자가 바로 승인할 수 있고, 일정 · 현장 알림 · AI 조치 · 이력이 함께 바뀐다', () => {
    const s = run(initialState(),
      { type: 'proposalReview', proposalId: 'P-01', teamId: 'T-E', note: '유리 전문팀', meta: manager(1) },
      { type: 'proposalApprove', proposalId: 'P-01', meta: manager(2) })
    expect(sched(s, 'SC-16').teamId).toBe('T-E')
    expect(s.proposals.find((p) => p.id === 'P-01')).toMatchObject({ status: '승인', reviewer: '최은지 운영관리자', approver: '최은지 운영관리자' })
    expect(s.notices[0]).toMatchObject({ teamId: 'T-E', kind: '새 배정', scheduleId: 'SC-16' })
    expect(s.actions.find((a) => a.id === 'A-08')!.status).toBe('완료')
    expect(s.audit[0]).toMatchObject({ action: '승인 · 일정 반영', from: '미배정 15:30', to: 'Clean Team E 15:30' })
  })

  it('재배정은 직무 분리 — 검토자 본인은 승인 불가, 다른 승인권자는 가능', () => {
    const reviewed = run(initialState(), { type: 'proposalReview', proposalId: 'P-02', teamId: 'T-A', note: '', meta: manager(1) })
    expect(run(reviewed, { type: 'proposalApprove', proposalId: 'P-02', meta: manager(2) })).toBe(reviewed)
    const s = run(reviewed, { type: 'proposalApprove', proposalId: 'P-02', meta: ceo(3) })
    expect(sched(s, 'SC-14')).toMatchObject({ teamId: 'T-A', risk: undefined })
    // 새 팀에는 배정, 기존 팀에는 해제 알림
    expect(s.notices.map((n) => [n.teamId, n.kind])).toEqual([['T-A', '새 배정'], ['T-C', '배정 해제']])
  })

  it('현장 수신 확인으로 배정안이 닫힌다', () => {
    const s1 = run(initialState(),
      { type: 'proposalReview', proposalId: 'P-01', teamId: 'T-E', note: '', meta: manager(1) },
      { type: 'proposalApprove', proposalId: 'P-01', meta: manager(2) })
    const s2 = run(s1, { type: 'noticeAck', noticeId: s1.notices[0].id, meta: as('field', '강병철 팀장') })
    expect(s2.proposals.find((p) => p.id === 'P-01')!.status).toBe('현장확인')
    expect(s2.notices[0].ackBy).toBe('강병철 팀장')
  })

  it('보류 · 반려는 사유가 없으면 거부된다', () => {
    const s0 = initialState()
    expect(run(s0, { type: 'proposalHold', proposalId: 'P-03', reason: '  ', meta: ceo() })).toBe(s0)
    const s1 = run(s0, { type: 'proposalHold', proposalId: 'P-03', reason: '고객과 시간 협의 중', meta: ceo() })
    expect(s1.proposals.find((p) => p.id === 'P-03')).toMatchObject({ status: '보류', holdReason: '고객과 시간 협의 중' })
  })
})

describe('현장 작업 — 완료 조건은 상태에서도 검사한다', () => {
  it('남은 항목을 사람이 읽을 수 있게 알려준다', () => {
    expect(completionGaps(undefined)).toEqual(['도착 체크인'])
    const s = run(initialState(), { type: 'checkin', scheduleId: 'SC-03', meta: field() })
    expect(completionGaps(s.work['SC-03'])).toEqual([`체크리스트 ${CHECKLIST_TEMPLATE.length}개`, '작업 전 사진', '작업 후 사진'])
  })

  it('미완료 상태로는 완료할 수 없다', () => {
    const s = run(initialState(), { type: 'checkin', scheduleId: 'SC-03', meta: field() })
    expect(run(s, { type: 'completeWork', scheduleId: 'SC-03', meta: field(9) })).toBe(s)
  })

  it('수행 불가 항목은 사유를 남기면 완료를 막지 않고 리포트에 남는다', () => {
    const s = run(initialState(), ...fullWork('SC-03', true), { type: 'completeWork', scheduleId: 'SC-03', meta: field(9) })
    const report = s.reports[0]
    expect(report).toMatchObject({ scheduleId: 'SC-03', itemsDone: CHECKLIST_TEMPLATE.length - 1, worker: '김도윤 팀장', checkinAt: '14:30' })
    expect(Object.values(report.skipped ?? {})).toEqual(['화장실 공사 중 — 출입 불가'])
    expect(sched(s, 'SC-03').status).toBe('완료')
  })

  it('이미 완료된 작업을 다시 완료해도 리포트가 두 번 생기지 않는다', () => {
    const done = run(initialState(), ...fullWork('SC-03'), { type: 'completeWork', scheduleId: 'SC-03', meta: field(9) })
    expect(run(done, { type: 'completeWork', scheduleId: 'SC-03', meta: field(10) })).toBe(done)
  })

  it('현장 이슈는 보고자 · 시각과 함께 남는다', () => {
    const s = run(initialState(), {
      type: 'reportIssue', meta: field(),
      issue: { scheduleId: 'SC-03', customerId: 'C01', type: '파손·누수', severity: '긴급', detail: '대기실 천장 누수', customerVisible: true },
    })
    expect(s.issues[0]).toMatchObject({ id: 'FI-t1', reportedBy: '김도윤 팀장', at: '14:30', status: '접수' })
    expect(s.audit[0].action).toBe('이슈 보고')
  })
})

describe('고객 요청 Closed Loop — 접수 → 담당 → 일정 · 배정 → 현장 완료 → 고객 회신', () => {
  it('추가서비스 요청이 매출 기회 · 일정 · 배정안 · 리포트까지 이어진다', () => {
    let s = run(initialState(), { type: 'addRequest', id: 'R-9', customerId: 'C01', requestType: '추가서비스', detail: '유리창 집중청소 · 이번 주 안에', meta: customer() })
    expect(s.requests[0]).toMatchObject({ status: '접수', opportunityId: 'U-R-9' })
    expect(s.upsell[0]).toMatchObject({ id: 'U-R-9', source: 'portal', status: '발견됨' })

    s = run(s,
      { type: 'requestAssign', requestId: 'R-9', assignee: '최은지 운영관리자', meta: manager(2) },
      { type: 'requestSchedule', requestId: 'R-9', scheduleId: 'SC-R9', proposalId: 'P-R9', dayOffset: 0, time: '16:30', durationMin: 60, service: '유리창 집중청소', quote: 90, meta: manager(3) })
    expect(s.requests.find((r) => r.id === 'R-9')).toMatchObject({ status: '처리중', scheduleId: 'SC-R9' })
    expect(s.upsell.find((u) => u.id === 'U-R-9')).toMatchObject({ status: '성사', expectedRevenue: 90 })
    expect(sched(s, 'SC-R9')).toMatchObject({ teamId: null, requestId: 'R-9' })

    s = run(s,
      { type: 'proposalReview', proposalId: 'P-R9', teamId: 'T-E', note: '', meta: manager(4) },
      { type: 'proposalApprove', proposalId: 'P-R9', meta: manager(5) },
      ...fullWork('SC-R9'),
      { type: 'completeWork', scheduleId: 'SC-R9', meta: field(9) })
    const req = s.requests.find((r) => r.id === 'R-9')!
    expect(req.status).toBe('완료')
    expect(req.history!.filter((h) => h.visible).map((h) => h.text)).toEqual([
      '요청 접수', '담당자 배정 — 최은지 운영관리자', '일정 확정 — 오늘 16:30 · 견적 90만원', '담당팀 배정 — Clean Team E (오늘 16:30)', '작업 완료 — 리포트 발송',
    ])
    expect(s.reports[0]).toMatchObject({ requestId: 'R-9', customerId: 'C01' })
  })

  it('일정변경 요청 → 시간 변경안 → 승인하면 요청이 자동 완료된다', () => {
    let s = run(initialState(), { type: 'addRequest', id: 'R-8', customerId: 'C01', requestType: '일정변경', detail: '다음 방문 → 오후 희망', meta: customer() })
    s = run(s,
      { type: 'requestReschedule', requestId: 'R-8', targetScheduleId: 'SC-31', toTime: '13:00', proposalId: 'P-T8', meta: manager(2) },
      { type: 'proposalReview', proposalId: 'P-T8', teamId: 'T-B', note: '', meta: manager(3) })
    // 시간 변경은 고객 안내가 바뀌므로 다른 승인권자 필요
    expect(run(s, { type: 'proposalApprove', proposalId: 'P-T8', meta: manager(4) })).toBe(s)
    s = run(s, { type: 'proposalApprove', proposalId: 'P-T8', meta: ceo(5) })
    expect(sched(s, 'SC-31').time).toBe('13:00')
    expect(s.requests.find((r) => r.id === 'R-8')).toMatchObject({ status: '완료', reply: '요청하신 대로 방문 시간을 13:00로 변경했습니다.' })
    expect(s.notices[0]).toMatchObject({ kind: '시간 변경', teamId: 'T-B' })
  })

  it('반려는 사유를 고객 회신으로 남기고 매출 기회를 보류한다', () => {
    let s = run(initialState(), { type: 'addRequest', id: 'R-7', customerId: 'C01', requestType: '추가서비스', detail: '외벽 도장', meta: customer() })
    s = run(s, { type: 'requestReject', requestId: 'R-7', reason: '도장은 제공하지 않는 서비스입니다', meta: manager() })
    expect(s.requests.find((r) => r.id === 'R-7')).toMatchObject({ status: '반려', reply: '도장은 제공하지 않는 서비스입니다' })
    expect(s.upsell.find((u) => u.id === 'U-R-7')!.status).toBe('보류')
  })

  it('고객 평가는 1~5점만 받는다', () => {
    const s0 = initialState()
    const id = s0.reports[0].id
    expect(run(s0, { type: 'rateReport', reportId: id, rating: 9, feedback: '', meta: customer() })).toBe(s0)
    expect(run(s0, { type: 'rateReport', reportId: id, rating: 5, feedback: ' 꼼꼼해요 ', meta: customer() }).reports[0]).toMatchObject({ rating: 5, feedback: '꼼꼼해요' })
  })
})

describe('AI 조치 · 상태 전이', () => {
  it('보류는 사유가 필수이고, 허용되지 않은 전이는 무시된다', () => {
    const s0 = initialState()
    const a = s0.actions.find((x) => x.status === '추천됨')!
    expect(run(s0, { type: 'setActionStatus', actionId: a.id, status: '보류', meta: manager() })).toBe(s0)
    expect(run(s0, { type: 'setActionStatus', actionId: a.id, status: '완료', meta: manager() })).toBe(s0) // 추천됨 → 완료 직행 불가
    const held = run(s0, { type: 'setActionStatus', actionId: a.id, status: '보류', reason: '고객 부재', meta: manager() })
    expect(held.actions.find((x) => x.id === a.id)).toMatchObject({ status: '보류', holdReason: '고객 부재' })
  })

  it('담당자 변경은 전후가 변경 이력에 남는다', () => {
    const s = run(initialState(), { type: 'setActionOwner', actionId: 'A-03', owner: '최은지 운영관리자', meta: ceo() })
    expect(s.audit[0]).toMatchObject({ action: '담당자 변경', from: '오세영 팀장', to: '최은지 운영관리자', actor: '박정민 대표' })
  })

  it('초기화는 업무 데이터만 되돌리고 화면 설정은 유지한다', () => {
    const changed = run(initialState(), { type: 'prefs', patch: { theme: 'indigo', tutorialSeen: true } }, { type: 'setFieldPersona', employeeId: 'E09' })
    const reset = run(changed, { type: 'reset' })
    expect(reset).toMatchObject({ theme: 'indigo', tutorialSeen: true, fieldPersona: 'E03' })
  })
})
