import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CalendarCheck, ChevronRight, Gavel, Lock, MessageSquareWarning, Percent,
  RefreshCcw, Shuffle, TrendingUp, UserMinus, Users, Wallet,
} from 'lucide-react'
import { Card, KpiCard, SectionTitle, Btn, Freshness, SkeletonBlock, DemoBadge } from '../../components/ui'
import CaseChain from '../../components/ops/CaseChain'
import { toneText } from '../../lib/tone'
import { useDemo } from '../../lib/data/context'
import { TEAMS, EMPLOYEES } from '../../lib/demo/company'
import { MONTH_REVENUE } from '../../lib/demo/intelligence'
import { opsLanes, topCases, type Lane, type LaneKey } from '../../lib/ops/insights'
import { DEMO_NOW } from '../../lib/ops/geo'
import { fmtWon, cx } from '../../lib/utils'

// 차트 라이브러리는 무거워 본문을 먼저 그리고 뒤이어 받는다
const WeeklyTrendChart = lazy(() => import('../../components/charts/WeeklyTrendChart'))

const LANE_ICON: Record<LaneKey, ReactNode> = {
  incident: <AlertTriangle size={15} />,
  dispatch: <Shuffle size={15} />,
  staffing: <UserMinus size={15} />,
  voice: <MessageSquareWarning size={15} />,
  renewal: <RefreshCcw size={15} />,
  margin: <Percent size={15} />,
  upsell: <TrendingUp size={15} />,
}
const BAR: Record<string, string> = {
  danger: 'bg-danger', warning: 'bg-warning', success: 'bg-success', info: 'bg-info', ai: 'bg-ai', neutral: 'bg-neutral-mid', brand: 'bg-primary',
}

/**
 * 오늘의 운영센터 — 대표 · 운영 책임자가 아침에 여는 판단 화면
 * 7개 영역은 모두 상태에서 바로 계산된다(insights.ts). 처리하면 항목이 사라지고, 숫자도 함께 바뀐다.
 * 사진 · 장식 없이 '무엇을 결정해야 하는가'만 보여주고, 항목을 누르면 처리 화면 상세로 간다.
 */
export default function Dashboard() {
  const st = useDemo()
  const { schedules, role, proposals, requests, issues } = st
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t) }, [])

  const lanes = useMemo(() => opsLanes(st), [st])
  const cases = useMemo(() => topCases(st, 3), [st])
  const lane = (k: LaneKey) => lanes.find((l) => l.key === k)!

  const today = schedules.filter((s) => s.dayOffset === 0)
  const done = today.filter((s) => s.status === '완료').length
  const active = today.filter((s) => s.status === '작업중' || s.status === '이동중').length
  const decide = proposals.filter((p) => ['추천', '검토', '보류'].includes(p.status)).length
  const approveWait = proposals.filter((p) => p.status === '검토').length
  const newReq = requests.filter((r) => r.status === '접수').length
  const openIssues = issues.filter((i) => i.status !== '해결').length
  const working = EMPLOYEES.filter((e) => e.status === '근무').length
  const absent = EMPLOYEES.filter((e) => e.status !== '근무')

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{[...Array(6)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}</div>
        <SkeletonBlock className="h-64" />
      </div>
    )
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <h1 className="text-[1.6rem] font-extrabold tracking-tight lg:text-[1.85rem]">오늘의 운영센터</h1>
          <p className="mt-0.5 text-[0.9rem] text-ink-soft">
            기준 {DEMO_NOW} · 결정 대기 <b className="text-ink">{decide + newReq}건</b>
            {approveWait > 0 && <> · 승인 대기 <b className="text-warning">{approveWait}건</b></>}
          </p>
        </div>
        <Freshness />
      </div>

      {/* 핵심 숫자 — 누르면 처리 화면으로 */}
      <div data-tour="kpi" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={<CalendarCheck size={16} />} label="오늘 일정" value={today.length} unit="건" tone="brand" onClick={() => nav('/schedule')} sub={`완료 ${done} · 진행 ${active}`} />
        <KpiCard icon={<Gavel size={16} />} label="결정 대기" value={decide + newReq} unit="건" tone="ai" onClick={() => nav('/today')} sub={`배정 ${decide} · 신규 요청 ${newReq}`} />
        <KpiCard icon={<AlertTriangle size={16} />} label="사고 위험" value={lane('incident').items.length} unit="건" tone="danger" onClick={() => nav('/schedule')} sub="도착 지연 · 결원 · 미배정" />
        <KpiCard icon={<MessageSquareWarning size={16} />} label="요청 · 이슈" value={lane('voice').items.length} unit="건" tone="warning" onClick={() => nav('/requests')} sub={`현장 이슈 ${openIssues}건 포함`} />
        <KpiCard icon={<RefreshCcw size={16} />} label="재계약 위험" value={lane('renewal').items.length} unit="곳" tone="warning" onClick={() => nav('/renewals')} sub={lane('renewal').metric} />
        <KpiCard icon={<TrendingUp size={16} />} label="추가매출 진행" value={lane('upsell').items.length} unit="건" tone="success" onClick={() => nav('/upsell')} sub={`예상 ${lane('upsell').metric}`} />
      </div>

      {/* 7개 판단 영역 */}
      <section data-tour="ai-briefing" aria-label="오늘 판단할 7개 영역">
        <SectionTitle right={<span className="text-[0.76rem] font-bold text-ink-faint">상태에서 실시간 계산 · 처리하면 사라짐</span>}>
          지금 판단할 것
        </SectionTitle>
        {/* 1행: 오늘 현장(사고 · 배정 · 인력) 3칸, 2행: 고객 · 계약 · 매출 4칸 */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
          {lanes.map((l, i) => <LaneCard key={l.key} lane={l} className={i < 3 ? 'xl:col-span-4' : 'xl:col-span-3'} />)}
        </div>
      </section>

      {/* 사건 체인 — 여러 신호가 겹친 고객 */}
      <section aria-label="오늘의 사건">
        <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/ai')}>AI 센터 <ArrowRight size={14} className="inline" /></Btn>}>
          신호가 겹친 고객 — 위험부터 조치까지
        </SectionTitle>
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.customerId} className="p-4">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <button onClick={() => nav(`/customers/${c.customerId}`)} className="text-[1.02rem] font-extrabold hover:text-primary">{c.name}</button>
                <span className="text-[0.8rem] font-bold text-ink-soft">{c.headline}</span>
              </div>
              <CaseChain chain={c} />
            </Card>
          ))}
        </div>
      </section>

      {/* 인력 · 매출 — 맥락 */}
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <Card className="p-5">
          <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/team')}>팀 상세 <ArrowRight size={14} className="inline" /></Btn>}>인력 가동</SectionTitle>
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-primary"><Users size={21} /></span>
            <div>
              <p className="tnum text-[1.35rem] font-extrabold leading-tight">{working} / {EMPLOYEES.length}명 근무</p>
              <p className="text-[0.8rem] text-ink-faint">{TEAMS.length}개 팀 · {absent.map((e) => `${e.name} ${e.status}`).join(' · ')}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {TEAMS.map((t) => {
              const jobs = today.filter((s) => s.teamId === t.id)
              const left = jobs.filter((s) => s.status !== '완료').length
              return (
                <div key={t.id} className="rounded-lg bg-ivory px-1.5 py-2 text-center">
                  <p className="text-[0.74rem] font-bold text-ink-faint">{t.name.replace('Clean Team ', '팀 ')}</p>
                  <p className="tnum text-[0.98rem] font-extrabold text-primary">{left}<span className="text-[0.74rem] text-ink-faint">/{jobs.length}</span></p>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[0.74rem] text-ink-faint">남은 일정 / 오늘 배정</p>
        </Card>

        <Card className="p-5">
          <SectionTitle right={<DemoBadge label="데모" />}>주간 작업 추이</SectionTitle>
          <div className="h-[200px]">
            <Suspense fallback={<div className="skeleton h-full w-full" />}><WeeklyTrendChart /></Suspense>
          </div>
        </Card>

        <Card className="p-5" onClick={role === 'ceo' ? () => nav('/profitability') : undefined}>
          <SectionTitle>계약 / 매출 요약</SectionTitle>
          {role === 'ceo' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-info-soft text-info"><Wallet size={21} /></span>
                <div>
                  <p className="text-[0.78rem] font-bold text-ink-faint">이번 달 누적 매출 (데모)</p>
                  <p className="tnum text-[clamp(1.2rem,5.4vw,1.5rem)] font-extrabold leading-tight">{fmtWon(MONTH_REVENUE.total)}</p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[0.8rem] font-bold text-ink-soft">
                  <span>목표 대비 {Math.round((MONTH_REVENUE.total / MONTH_REVENUE.target) * 100)}%</span>
                  <span className="text-success">전년 +{MONTH_REVENUE.yoyPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-ivory"><div className="h-full rounded-full bg-primary" style={{ width: `${(MONTH_REVENUE.total / MONTH_REVENUE.target) * 100}%` }} /></div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ivory px-3.5 py-2.5">
                <span className="text-[0.85rem] font-bold text-ink-soft">평균 운영 기여마진</span>
                <span className="tnum text-[1.1rem] font-extrabold text-primary">{MONTH_REVENUE.contribMarginPct}%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Lock size={24} className="text-ink-faint" />
              <p className="text-[0.9rem] font-bold text-ink-soft">매출 · 수익성은 대표 권한에서 확인할 수 있습니다.</p>
              <p className="text-[0.78rem] text-ink-faint">역할별 데이터 접근 제어</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/** 판단 영역 하나 — 근거 · 상위 3건 · 전체 보기. 항목은 모두 실제 상세 화면으로 이어진다 */
function LaneCard({ lane, className }: { lane: Lane; className?: string }) {
  const nav = useNavigate()
  const shown = lane.items.slice(0, 3)
  return (
    <Card className={cx('flex flex-col p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cx('flex items-center gap-1.5 text-[0.95rem] font-extrabold', toneText[lane.tone])}>
            {LANE_ICON[lane.key]}<span className="text-ink">{lane.title}</span>
            <span className="tnum">{lane.items.length}</span>
            {lane.restricted && <Lock size={12} className="text-ink-faint" aria-label="금액은 대표 권한" />}
          </p>
          <p className="mt-0.5 text-[0.74rem] text-ink-faint">{lane.basis}</p>
        </div>
        {lane.metric && <span className="tnum shrink-0 text-[0.8rem] font-extrabold text-ink-soft">{lane.metric}</span>}
      </div>
      {lane.items.length === 0 ? (
        <p className="mt-3 flex-1 text-[0.84rem] font-bold text-success">처리할 항목 없음</p>
      ) : (
        <ul className="mt-2.5 flex-1 divide-y divide-line">
          {shown.map((i) => (
            <li key={i.id}>
              <button onClick={() => nav(i.to)} className="group flex w-full items-center gap-2.5 py-2 text-left">
                <span className={cx('h-8 w-1 shrink-0 rounded-full', BAR[i.tone])} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="min-w-0 truncate text-[0.86rem] font-bold">{i.title}</span>
                    {i.tag && <span className={cx('shrink-0 text-[0.72rem] font-extrabold', toneText[i.tone])}>{i.tag}</span>}
                  </span>
                  <span className="block truncate text-[0.76rem] text-ink-faint">{i.sub}</span>
                </span>
                <ChevronRight size={15} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => nav(lane.to)} className="mt-1.5 self-start text-[0.78rem] font-bold text-primary hover:underline">
        {lane.items.length > 3 ? `외 ${lane.items.length - 3}건 · 전체 보기` : '화면 열기'} <ArrowRight size={12} className="inline" />
      </button>
    </Card>
  )
}
