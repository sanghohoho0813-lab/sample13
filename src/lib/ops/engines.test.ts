import { describe, expect, it } from 'vitest'
import { initialState } from '../data/state'
import { demoReducer } from '../data/reducer'
import { FACTOR_WEIGHTS, evaluateDispatch, evaluateTeam, arrivalForecast } from './dispatch'
import { ACTION_FLOW, PROPOSAL_FLOW, ROLE_PERMISSIONS, can, canMove, needsSecondApprover } from './governance'
import { travelMinutes } from './geo'
import { assessRenewal, RISK_WEIGHTS } from './renewal'
import { buildCase, opsLanes, topCases } from './insights'

const st = initialState()
const sched = (id: string) => st.schedules.find((s) => s.id === id)!
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

describe('이동시간 모델', () => {
  it('같은 현장은 0분, 같은 구는 10분, 멀수록 길다', () => {
    expect(travelMinutes('강남구', '강남구', true)).toBe(0)
    expect(travelMinutes('강남구', '강남구')).toBe(10)
    expect(travelMinutes('마포구', '송파구')).toBeGreaterThan(travelMinutes('강남구', '서초구'))
  })
})

describe('Smart Dispatch 엔진', () => {
  it('가중치 합은 100 — 화면의 점수 분해와 합계가 일치한다', () => {
    expect(sum(FACTOR_WEIGHTS)).toBe(100)
    const ev = evaluateTeam('T-E', sched('SC-16'), st.schedules)
    const recomputed = Math.round(ev.factors.reduce((a, f) => a + (f.score * f.weight) / 100, 0))
    expect(ev.total).toBe(recomputed)
    expect(ev.factors.map((f) => f.label)).toEqual(['이동거리', '직원 역량', '현재 일정', '현장 난이도', '고객 선호', '연속근무', '예상 소요시간'])
  })

  it('유리창 작업은 유리 전문팀(Team E)이 1순위', () => {
    const [top] = evaluateDispatch(sched('SC-16'), st.schedules)
    expect(top.teamId).toBe('T-E')
    expect(top.factors.find((f) => f.key === 'skill')!.detail).toContain('유리 전문팀')
  })

  it('앞 작업이 지연된 현재 팀보다 제시간에 도착하는 팀을 추천한다', () => {
    const evals = evaluateDispatch(sched('SC-14'), st.schedules)
    const current = evals.find((e) => e.isCurrent)!
    expect(current.teamId).toBe('T-C')
    expect(current.warnings.some((w) => w.includes('늦음'))).toBe(true)
    expect(evals[0].teamId).not.toBe('T-C')
    expect(evals[0].total).toBeGreaterThan(current.total)
    expect(arrivalForecast(sched('SC-14'), st.schedules)!.lateMin).toBeGreaterThanOrEqual(30)
  })

  it('일정이 겹치는 팀은 점수와 상관없이 배정 불가로 분리된다', () => {
    const evals = evaluateDispatch(sched('SC-18'), st.schedules)
    const g = evals.find((e) => e.teamId === 'T-G')!
    expect(g.eligible).toBe(false)
    expect(g.blockers.join()).toContain('겹침')
    // 배정 가능한 팀이 항상 앞에 온다
    const firstBlocked = evals.findIndex((e) => !e.eligible)
    expect(evals.slice(firstBlocked).every((e) => !e.eligible)).toBe(true)
  })

  it('고객 기피 이력이 있는 팀은 경고와 함께 감점된다', () => {
    const f = evaluateTeam('T-F', sched('SC-18'), st.schedules)
    expect(f.factors.find((x) => x.key === 'preference')!.score).toBeLessThanOrEqual(10)
    expect(f.warnings.join()).toContain('미끄러움')
  })
})

describe('내부통제 정책', () => {
  it('승인권은 본사 역할에만, 수익성 열람은 대표에게만', () => {
    expect(can('manager', 'dispatch.approve')).toBe(true)
    expect(can('field', 'dispatch.approve')).toBe(false)
    expect(can('manager', 'finance.view')).toBe(false)
    expect(can('ceo', 'finance.view')).toBe(true)
    expect(ROLE_PERMISSIONS.customer).toEqual(['customer.request'])
  })
  it('직무 분리 — 신규 배정만 1인 승인', () => {
    expect(needsSecondApprover('신규 배정')).toBe(false)
    expect(needsSecondApprover('재배정')).toBe(true)
    expect(needsSecondApprover('시간 변경')).toBe(true)
  })
  it('종료 상태에서는 어디로도 갈 수 없다', () => {
    expect(PROPOSAL_FLOW.반려).toEqual([])
    expect(canMove(ACTION_FLOW, '완료', '실행중')).toBe(false)
    expect(canMove(PROPOSAL_FLOW, '추천', '승인')).toBe(false) // 검토 없이 승인 불가
  })
})

describe('재계약 판단', () => {
  it('가중치 합 100 · 건강도 = 100 − 이탈 위험', () => {
    expect(sum(RISK_WEIGHTS)).toBe(100)
    const r = assessRenewal('C01', st)!
    expect(r.health).toBe(100 - r.churnRisk)
  })
  it('미해결 이슈가 겹친 고객은 위험, 문제없는 고객은 안정', () => {
    expect(assessRenewal('C09', st)!.status).toBe('Risk')
    expect(assessRenewal('C09', st)!.strategy[0].title).toBe('품질 회복 후 재계약 협의')
    const stable = ['C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C10', 'C12'].map((id) => assessRenewal(id, st)!)
    expect(stable.every((r) => r.status === '안정')).toBe(true)
  })
  it('고객 평가와 요청 해결이 점수에 바로 반영된다', () => {
    const before = assessRenewal('C01', st)!.health
    const report = st.reports.find((r) => r.customerId === 'C01')
    const rated = report
      ? demoReducer(st, { type: 'rateReport', reportId: report.id, rating: 5, feedback: '', meta: { now: '15:00', uid: 'x', actor: '고객', role: 'customer' } })
      : st
    const resolved = { ...rated, requests: rated.requests.map((r) => (r.customerId === 'C01' ? { ...r, status: '완료' as const } : r)) }
    expect(assessRenewal('C01', resolved)!.health).toBeGreaterThan(before)
  })
  it('없는 고객은 null', () => {
    expect(assessRenewal('NOPE', st)).toBeNull()
  })
})

describe('운영센터 · 사건 체인', () => {
  it('7개 영역이 모두 실제 상세 화면으로 이어진다', () => {
    const lanes = opsLanes(st)
    expect(lanes.map((l) => l.title)).toEqual(['사고 위험 일정', '배정 비효율', '인력 부족', '고객 불만 · 요청', '재계약 위험', '저마진 계약', '추가서비스 기회'])
    for (const l of lanes) {
      expect(l.items.length).toBeGreaterThan(0)
      for (const i of l.items) expect(i.to).toMatch(/^\/(schedule\?id=SC-|requests\?id=R-|sites\/C|customers\/C|upsell|profitability)/)
    }
  })
  it('배정안을 승인하면 해당 항목이 운영센터에서 사라진다', () => {
    const meta = (uid: string) => ({ now: '14:30', uid, actor: '최은지 운영관리자', role: 'manager' as const })
    let s = demoReducer(st, { type: 'proposalReview', proposalId: 'P-01', teamId: 'T-E', note: '', meta: meta('a') })
    s = demoReducer(s, { type: 'proposalApprove', proposalId: 'P-01', meta: meta('b') })
    const incident = opsLanes(s).find((l) => l.key === 'incident')!
    expect(incident.items.some((i) => i.to === '/schedule?id=SC-16')).toBe(false)
    expect(opsLanes(st).find((l) => l.key === 'incident')!.items.some((i) => i.to === '/schedule?id=SC-16')).toBe(true)
  })
  it('수익성은 대표가 아니면 가려진다', () => {
    expect(buildCase('C09', { ...st, role: 'manager' }).steps[3].restricted).toBe(true)
    expect(buildCase('C09', { ...st, role: 'ceo' }).steps[3].title).toMatch(/기여마진/)
  })
  it('사건 체인은 위험 → 배정 → 건강도 → 수익성 → 조치 순서이고, 신호가 겹친 고객이 먼저 나온다', () => {
    const cases = topCases(st)
    expect(cases[0].customerId).toBe('C09')
    expect(cases[0].steps.map((s) => s.key)).toEqual(['risk', 'dispatch', 'health', 'profit', 'action'])
    expect(cases.every((c, i) => i === 0 || cases[i - 1].priority >= c.priority)).toBe(true)
  })
})
