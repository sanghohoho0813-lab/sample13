// ─────────────────────────────────────────────────────────
// 운영 판단 뷰 — 상태에서 바로 계산한다 (저장하지 않음 → 처리하면 즉시 사라지고 다시 계산)
//   opsLanes()  오늘의 운영센터 7개 영역
//   buildCase() AI 센터 사건 체인 — 위험 → 배정 → 고객 건강도 → 수익성 → 추천 조치
// ─────────────────────────────────────────────────────────
import type { DemoState } from '../data/state'
import { CUSTOMERS, EMPLOYEES, TEAMS, customerById, teamById } from '../demo/company'
import { SEED_PROFITABILITY, SEED_QUALITY } from '../demo/intelligence'
import { arrivalForecast, evaluateDispatch, evaluateTeam } from './dispatch'
import { assessRenewal, type RenewalAssessment } from './renewal'
import type { Tone } from '../tone'

export type LaneKey = 'incident' | 'dispatch' | 'staffing' | 'voice' | 'renewal' | 'margin' | 'upsell'

export interface LaneItem {
  id: string
  title: string
  sub: string
  /** 짧은 상태 표시 (예: '40분 지연', '승인 대기') */
  tag?: string
  tone: Tone
  to: string
}

export interface Lane {
  key: LaneKey
  title: string
  /** 한 줄 설명 — 무엇을 근거로 골랐는지 */
  basis: string
  tone: Tone
  items: LaneItem[]
  /** 영역 요약 숫자 (예: 위험 연매출) */
  metric?: string
  to: string
  restricted?: boolean
}

const name = (customerId: string) => customerById(customerId)?.name ?? customerId
const OPEN_PROPOSAL = ['추천', '검토', '보류']

/** 오늘 남은 일정 중 현재 팀보다 10점 이상 나은 팀이 있으면 '비효율 배정' */
export function dispatchGaps(st: DemoState) {
  return st.schedules
    .filter((s) => s.dayOffset === 0 && s.teamId && s.status === '예정')
    .map((s) => {
      const evals = evaluateDispatch(s, st.schedules)
      const current = evals.find((e) => e.teamId === s.teamId)!
      const best = evals.find((e) => e.eligible)
      return { s, current, best, gap: best && current ? best.total - current.total : 0 }
    })
    .filter((x) => x.best && x.best.teamId !== x.s.teamId && (x.gap >= 10 || !x.current.eligible))
}

export function renewalAll(st: DemoState): RenewalAssessment[] {
  return CUSTOMERS.map((c) => assessRenewal(c.id, st)!).filter(Boolean)
}

export function opsLanes(st: DemoState): Lane[] {
  const today = st.schedules.filter((s) => s.dayOffset === 0)

  // ① 사고 위험 일정 — 위험 표시 일정 + 도착 예측상 10분 이상 늦는 일정 + 미배정
  const incident: LaneItem[] = []
  for (const s of today.filter((x) => x.status !== '완료')) {
    const f = arrivalForecast(s, st.schedules)
    const late = f && f.lateMin >= 10 && s.status === '예정'
    if (!s.risk && !late && s.teamId) continue
    incident.push({
      id: s.id,
      title: `${s.time} ${name(s.customerId)}`,
      sub: !s.teamId ? `${s.service} — 담당팀 없음`
        : s.risk?.type === '방문지연' || late ? `${f?.from}에서 지연 — ${f?.arrival} 도착 예상`
        : s.risk?.detail ?? '',
      tag: !s.teamId ? '미배정' : late ? `${f!.lateMin}분 지연` : s.risk?.type,
      tone: !s.teamId ? 'ai' : 'danger',
      to: `/schedule?id=${s.id}`,
    })
  }

  // ② 배정 비효율 — 진행 중인 배정안 + 더 나은 팀이 있는 일정
  const dispatch: LaneItem[] = st.proposals
    .filter((p) => OPEN_PROPOSAL.includes(p.status))
    .map((p) => {
      const s = st.schedules.find((x) => x.id === p.scheduleId)!
      const best = evaluateDispatch(s, st.schedules).find((e) => e.eligible)
      return {
        id: p.id,
        title: `${s.time} ${name(s.customerId)}`,
        sub: `${p.kind} · ${p.status === '검토' ? `${teamById(p.toTeamId ?? null)?.name} 검토 완료 — 승인 대기` : best ? `AI 1순위 ${teamById(best.teamId)?.name} ${best.total}점` : p.reason}`,
        tag: p.status === '검토' ? '승인 대기' : p.status === '보류' ? '보류' : '검토 필요',
        tone: p.status === '검토' ? 'warning' : 'info',
        to: `/schedule?id=${s.id}`,
      } as LaneItem
    })
  for (const g of dispatchGaps(st)) {
    if (dispatch.some((d) => d.to.endsWith(g.s.id))) continue
    dispatch.push({
      id: `GAP-${g.s.id}`, title: `${g.s.time} ${name(g.s.customerId)}`,
      sub: `현재 ${teamById(g.s.teamId)?.name} ${g.current.total}점 → ${teamById(g.best!.teamId)?.name} ${g.best!.total}점`,
      tag: `+${g.gap}점`, tone: 'info', to: `/schedule?id=${g.s.id}`,
    })
  }

  // ③ 인력 부족 — 결원 · 휴무가 있는 팀의 오늘 남은 일정
  const staffing: LaneItem[] = TEAMS.flatMap((t) => {
    const absent = EMPLOYEES.filter((e) => e.teamId === t.id && e.status !== '근무')
    if (!absent.length) return []
    const left = today.filter((s) => s.teamId === t.id && s.status !== '완료')
    return left.map((s) => {
      const ev = evaluateTeam(t.id, s, st.schedules)
      return {
        id: `ST-${s.id}`, title: `${s.time} ${name(s.customerId)}`,
        sub: `${t.name} ${absent.map((e) => `${e.name} ${e.status}`).join(' · ')} — 1인 작업 ${ev.expectedMin}분 예상`,
        tag: ev.eligible ? '1인 작업' : '다음 일정 겹침', tone: ev.eligible ? 'warning' : 'danger',
        to: `/schedule?id=${s.id}`,
      } as LaneItem
    })
  })

  // ④ 고객 불만 · 요청 — 미처리 요청 + 고객에게 보이는 현장 이슈 + 조치 중 품질 문의
  const voice: LaneItem[] = [
    ...st.requests.filter((r) => ['접수', '검토중', '처리중'].includes(r.status)).map((r) => ({
      id: r.id, title: name(r.customerId), sub: `${r.type} — ${r.detail}`,
      tag: r.status === '접수' ? '미배정' : r.status, tone: (r.type === '긴급방문' ? 'danger' : r.status === '접수' ? 'warning' : 'info') as Tone,
      to: `/requests?id=${r.id}`,
    })),
    ...st.issues.filter((i) => i.status !== '해결').map((i) => ({
      id: i.id, title: name(i.customerId), sub: `현장 이슈 · ${i.type} — ${i.detail}`,
      tag: i.severity === '긴급' ? '긴급' : i.status, tone: (i.severity === '긴급' ? 'danger' : 'warning') as Tone,
      to: `/sites/${i.customerId}`,
    })),
    ...SEED_QUALITY.filter((q) => q.status === '조치중').map((q) => ({
      id: q.id, title: name(q.customerId), sub: `${q.category} — ${q.detail}`, tag: '조치중', tone: 'warning' as Tone, to: `/customers/${q.customerId}`,
    })),
  ]

  // ⑤ 재계약 위험 — 90일 내 갱신 · 건강도 '안정' 아님
  const renewals = renewalAll(st).filter((r) => r.dday <= 90 && r.status !== '안정').sort((a, b) => b.churnRisk - a.churnRisk)
  const renewal: LaneItem[] = renewals.map((r) => ({
    id: `RN-${r.customerId}`, title: name(r.customerId),
    sub: `D-${r.dday} · 건강도 ${r.health} · ${r.strategy[0].title}`,
    tag: r.status === 'Risk' ? '위험' : '주의', tone: r.status === 'Risk' ? 'danger' : 'warning',
    to: `/customers/${r.customerId}`,
  }))
  const atStake = renewals.reduce((a, r) => a + r.annualValue, 0)

  // ⑥ 저마진 계약 — 기여마진 22% 미만 (대표만 금액 열람)
  const lows = SEED_PROFITABILITY.filter((p) => p.contributionMarginPct < 22).sort((a, b) => a.contributionMarginPct - b.contributionMarginPct)
  const margin: LaneItem[] = lows.map((p) => ({
    id: `MG-${p.customerId}`, title: name(p.customerId),
    sub: st.role === 'ceo' ? `기여마진 ${p.contributionMarginPct}% (표면 ${p.surfaceMarginPct}%) — ${p.aiNote}` : '기여마진 기준 미달 — 대표 권한에서 금액 확인',
    tag: p.grade, tone: p.contributionMarginPct < 20 ? 'danger' : 'warning',
    to: st.role === 'ceo' ? `/customers/${p.customerId}` : '/profitability',
  }))

  // ⑦ 추가서비스 기회 — 진행 중 (고객 직접 요청 우선)
  const ups = st.upsell.filter((u) => ['발견됨', '제안됨', '협의중'].includes(u.status))
    .sort((a, b) => Number(b.source === 'portal') - Number(a.source === 'portal') || b.expectedRevenue - a.expectedRevenue)
  const upsell: LaneItem[] = ups.map((u) => ({
    id: u.id, title: name(u.customerId), sub: `${u.recommendedService} · 예상 ${u.expectedRevenue}만원${u.source === 'portal' ? ' · 고객 요청' : ''}`,
    tag: u.status, tone: 'success', to: u.requestId ? `/requests?id=${u.requestId}` : `/upsell`,
  }))

  return [
    { key: 'incident', title: '사고 위험 일정', basis: '도착 예측 · 위험 표시 · 미배정', tone: 'danger', items: incident, to: '/schedule' },
    { key: 'dispatch', title: '배정 비효율', basis: '배정안 대기 · 더 나은 팀 존재(+10점)', tone: 'info', items: dispatch, to: '/schedule' },
    { key: 'staffing', title: '인력 부족', basis: '결원 · 휴무 팀의 남은 일정', tone: 'warning', items: staffing, to: '/team' },
    { key: 'voice', title: '고객 불만 · 요청', basis: '미처리 요청 · 현장 이슈 · 품질 문의', tone: 'warning', items: voice, to: '/requests' },
    { key: 'renewal', title: '재계약 위험', basis: '90일 내 갱신 · 건강도 80 미만', tone: 'danger', items: renewal, to: '/renewals', metric: `연 ${atStake.toLocaleString()}만원` },
    { key: 'margin', title: '저마진 계약', basis: '기여마진 22% 미만', tone: 'warning', items: margin, to: '/profitability', restricted: st.role !== 'ceo' },
    { key: 'upsell', title: '추가서비스 기회', basis: '진행 중 매출 기회 · 고객 직접 요청 우선', tone: 'success', items: upsell, to: '/upsell', metric: `${ups.reduce((a, u) => a + u.expectedRevenue, 0).toLocaleString()}만원` },
  ]
}

// ── AI 센터 사건 체인 ─────────────────────────────────────

export type ChainKey = 'risk' | 'dispatch' | 'health' | 'profit' | 'action'
export const CHAIN_LABEL: Record<ChainKey, string> = {
  risk: '위험 감지', dispatch: '배정', health: '고객 건강도', profit: '수익성', action: '추천 조치',
}

export interface ChainStep {
  key: ChainKey
  title: string
  detail: string
  tone: Tone
  to: string
  restricted?: boolean
}

export interface CaseChain {
  customerId: string
  name: string
  headline: string
  /** 정렬용 — 높을수록 먼저 */
  priority: number
  steps: ChainStep[]
}

export function buildCase(customerId: string, st: DemoState): CaseChain {
  const c = customerById(customerId)!
  const renewal = assessRenewal(customerId, st)!
  const today = st.schedules.filter((s) => s.customerId === customerId && s.dayOffset === 0 && s.status !== '완료')
    .sort((a, b) => a.time.localeCompare(b.time))
  const riskSched = today.find((s) => s.risk || !s.teamId)
  const issue = st.issues.find((i) => i.customerId === customerId && i.status !== '해결')
  const quality = SEED_QUALITY.find((q) => q.customerId === customerId && q.status !== '해결')
  const request = st.requests.find((r) => r.customerId === customerId && ['접수', '검토중', '처리중'].includes(r.status))

  // 위험
  const risk: ChainStep = riskSched
    ? { key: 'risk', title: !riskSched.teamId ? '미배정 일정' : `${riskSched.risk!.type} 위험`, detail: `${riskSched.time} ${riskSched.service} — ${riskSched.risk?.detail ?? '담당팀 없음'}`, tone: 'danger', to: `/schedule?id=${riskSched.id}` }
    : issue ? { key: 'risk', title: `현장 이슈 · ${issue.type}`, detail: issue.detail, tone: 'warning', to: `/sites/${customerId}` }
    : quality ? { key: 'risk', title: quality.category, detail: `${quality.detail} (${quality.status})`, tone: 'warning', to: `/customers/${customerId}` }
    : request ? { key: 'risk', title: `고객 ${request.type}`, detail: request.detail, tone: 'info', to: `/requests?id=${request.id}` }
    : { key: 'risk', title: '위험 신호 없음', detail: '오늘 일정 · 품질 · 요청 정상', tone: 'success', to: `/customers/${customerId}` }

  // 배정
  const target = riskSched ?? today[0]
  const proposal = target ? st.proposals.find((p) => p.scheduleId === target.id && p.status !== '반려') : undefined
  let dispatch: ChainStep
  if (target) {
    const evals = evaluateDispatch(target, st.schedules)
    const best = evals.find((e) => e.eligible)
    const cur = target.teamId ? evals.find((e) => e.teamId === target.teamId) : undefined
    const inProgress = target.status === '이동중' || target.status === '작업중'
    dispatch = inProgress
      ? { key: 'dispatch', title: `진행 중 · ${teamById(target.teamId)?.name}`, detail: cur?.warnings[0] ?? (target.risk ? '현장 대응 — 다음 일정 영향 확인' : '정상 진행'), tone: target.risk ? 'warning' : 'success', to: `/schedule?id=${target.id}` }
      : proposal && OPEN_PROPOSAL.includes(proposal.status)
      ? { key: 'dispatch', title: `배정안 ${proposal.status === '검토' ? '승인 대기' : '검토 필요'}`, detail: `${proposal.kind} — AI 1순위 ${teamById(best?.teamId ?? null)?.name} ${best?.total}점${cur ? ` (현재 ${teamById(cur.teamId)?.name} ${cur.total}점)` : ''}`, tone: 'warning', to: `/schedule?id=${target.id}` }
      : proposal && (proposal.status === '승인' || proposal.status === '현장확인')
        ? { key: 'dispatch', title: proposal.status === '현장확인' ? '재배정 완료 · 현장 확인' : '재배정 승인 · 현장 확인 대기', detail: `${target.time} ${teamById(target.teamId)?.name} 배정`, tone: 'success', to: `/schedule?id=${target.id}` }
        : cur && best && best.teamId !== cur.teamId && best.total - cur.total >= 10
          ? { key: 'dispatch', title: '재배정 검토 권장', detail: `현재 ${teamById(cur.teamId)?.name} ${cur.total}점 → ${teamById(best.teamId)?.name} ${best.total}점`, tone: 'warning', to: `/schedule?id=${target.id}` }
          : { key: 'dispatch', title: '현재 배정 적합', detail: `${target.time} ${teamById(target.teamId)?.name ?? '미배정'}${cur ? ` · ${cur.total}점` : ''}`, tone: 'success', to: `/schedule?id=${target.id}` }
  } else {
    const nextVisit = st.schedules.filter((s) => s.customerId === customerId && s.dayOffset > 0).sort((a, b) => a.dayOffset - b.dayOffset)[0]
    dispatch = { key: 'dispatch', title: '오늘 남은 방문 없음', detail: nextVisit ? `다음 방문 ${nextVisit.dayOffset}일 후 ${nextVisit.time} · ${teamById(nextVisit.teamId)?.name}` : '예정 방문 없음', tone: 'neutral', to: '/schedule' }
  }

  // 건강도 · 수익성
  const top = [...renewal.factors].sort((a, b) => b.risk * b.weight - a.risk * a.weight)[0]
  const health: ChainStep = {
    key: 'health', title: `${renewal.health}점 · ${renewal.status === 'Risk' ? '위험' : renewal.status === '안정' ? '안정' : '재계약 주의'}`,
    detail: `가장 큰 요인 — ${top.label}: ${top.detail}`,
    tone: renewal.status === 'Risk' ? 'danger' : renewal.status === '안정' ? 'success' : 'warning',
    to: `/customers/${customerId}`,
  }
  const m = renewal.margin
  const profit: ChainStep = st.role !== 'ceo'
    ? { key: 'profit', title: '대표 권한에서 열람', detail: '기여마진 · 계약 수익성은 대표 역할만 볼 수 있습니다', tone: 'neutral', to: '/profitability', restricted: true }
    : m ? { key: 'profit', title: `기여마진 ${m.pct}% · ${m.grade}`, detail: m.note, tone: m.pct < 20 ? 'danger' : m.pct < 24 ? 'warning' : 'success', to: '/profitability' }
      : { key: 'profit', title: '데이터 없음', detail: '수익성 데이터 미연결', tone: 'neutral', to: '/profitability' }

  // 추천 조치 — 지금 결정할 것이 있으면 그것을, 없으면 재계약 전략
  const aiAction = st.actions.find((x) => x.customerId === customerId && ['추천됨', '확인', '실행중'].includes(x.status))
  const action: ChainStep = proposal && OPEN_PROPOSAL.includes(proposal.status)
    ? { key: 'action', title: proposal.status === '검토' ? '배정안 승인' : '배정안 검토 · 승인', detail: `${proposal.reason} → ${renewal.strategy[0].title}`, tone: 'ai', to: `/schedule?id=${proposal.scheduleId}` }
    : aiAction
      ? { key: 'action', title: aiAction.title, detail: `${aiAction.status} · 담당 ${aiAction.owner}${aiAction.due ? ` · 기한 ${aiAction.due}` : ''}`, tone: 'ai', to: '/today' }
      : { key: 'action', title: renewal.strategy[0].title, detail: renewal.strategy[0].why, tone: 'ai', to: `/customers/${customerId}` }

  const priority = (riskSched ? 40 : 0) + (proposal && OPEN_PROPOSAL.includes(proposal.status) ? 20 : 0) + renewal.churnRisk + (m && m.pct < 20 ? 15 : 0) + (issue ? 10 : 0)
  return {
    customerId, name: c.name, priority,
    headline: `${risk.title} → ${renewal.strategy[0].title}`,
    steps: [risk, dispatch, health, profit, action],
  }
}

/** 오늘 다룰 사건 — 위험 신호가 2개 이상 겹친 고객 순 */
export function topCases(st: DemoState, limit = 5): CaseChain[] {
  return CUSTOMERS.map((c) => buildCase(c.id, st))
    .filter((k) => k.steps.filter((s) => s.tone === 'danger' || s.tone === 'warning').length >= 2)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
}
