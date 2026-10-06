import { Suspense, lazy, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, Loader2, CheckCircle2, AlertTriangle, RefreshCcw, TrendingUp,
  Sparkles, ArrowRight, Users, Wallet, Lock, ChevronRight,
} from 'lucide-react'
import { Card, KpiCard, SectionTitle, Btn, StatusPill, StatusText, Freshness, SkeletonBlock, DemoBadge, type Tone } from '../../components/ui'
import { toneBg } from '../../lib/tone'
import { AIReadyBadge, WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/context'
import { customerById, teamById, TEAMS, EMPLOYEES } from '../../lib/demo/company'
import { DAILY_BRIEFING, MONTH_REVENUE, SEED_INSIGHTS } from '../../lib/demo/intelligence'

// 차트 라이브러리는 무거워 본문을 먼저 그리고 뒤이어 받는다
const WeeklyTrendChart = lazy(() => import('../../components/charts/WeeklyTrendChart'))
import { fmtManwon, fmtWon, cx } from '../../lib/utils'

// 오늘 진행 상황 막대 — 상태별 색 (StatusPill 의미색과 동일 계열)
const STATUS_ORDER: Array<{ key: string; label: string; color: string }> = [
  { key: '완료', label: '완료', color: 'var(--color-success)' },
  { key: '진행', label: '진행중', color: 'var(--color-info)' },
  { key: '예정', label: '예정', color: 'var(--color-neutral-mid)' },
  { key: '확인필요', label: '확인필요', color: 'var(--color-danger)' },
]

// 브리핑 칩 — 숫자는 AI 센터 해당 탭의 건수와 같은 원본에서 센다 (누른 뒤 숫자가 달라 보이지 않게)
const BRIEF_CHIPS: Array<{ tab: 'risk' | 'upsell' | 'retention' | 'dispatch'; label: string; tone: Tone }> = [
  { tab: 'risk', label: '위험', tone: 'danger' },
  { tab: 'retention', label: '재계약', tone: 'warning' },
  { tab: 'upsell', label: '추가매출', tone: 'success' },
  { tab: 'dispatch', label: '배정 추천', tone: 'info' },
]

// 오늘 먼저 확인할 것 — 오늘의 AX 상위 4건 (전체는 오늘의 AX에서)
const PRIORITIES: Array<{ tone: Tone; tag: string; title: string; desc: string; to: string }> = [
  { tone: 'danger', tag: '방문지연 위험', title: '성수 B오피스', desc: '이전 작업 32분 지연 · 예상 도착 15:47', to: '/schedule?id=SC-14' },
  { tone: 'warning', tag: '재계약 사전관리', title: '라온메디컬센터', desc: '계약 종료 D-32 · 품질문의 증가', to: '/customers/C01' },
  { tone: 'success', tag: '추가서비스 제안', title: '에이원교육센터', desc: '유리 오염 특이사항 4회 → 집중관리 제안', to: '/upsell' },
  { tone: 'info', tag: '미완료 보고', title: '강남 C클리닉', desc: '08:30 작업 보고 미제출', to: '/sites/C04' },
]

export default function Dashboard() {
  const { schedules, role } = useDemo()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])

  const today = schedules.filter((s) => s.dayOffset === 0).sort((a, b) => a.time.localeCompare(b.time))
  const done = today.filter((s) => s.status === '완료').length
  const inProgress = today.filter((s) => s.status === '작업중' || s.status === '이동중').length
  const needCheck = today.filter((s) => !s.teamId || s.status === '확인필요').length
  const planned = today.length - done - inProgress - needCheck
  const risks = today.filter((s) => s.risk).length
  const unassigned = today.filter((s) => !s.teamId).length
  const upcoming = today.filter((s) => s.status !== '완료')
  const working = EMPLOYEES.filter((e) => e.status === '근무').length
  const progress: Record<string, number> = { 완료: done, 진행: inProgress, 예정: Math.max(0, planned), 확인필요: needCheck }

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
          <h1 className="text-[1.6rem] font-extrabold tracking-tight lg:text-[1.85rem]">AX 대시보드</h1>
          <p className="mt-0.5 text-[0.9rem] text-ink-soft">클린웨이파트너스 운영 현황판</p>
        </div>
        <Freshness />
      </div>

      {/* 01 핵심 지표 — 숫자만 빠르게. 눌러서 해당 화면으로 */}
      <div data-tour="kpi" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={<CalendarCheck size={16} />} label="오늘 예정" value={today.length} unit="건" tone="brand" onClick={() => nav('/schedule')} sub="전체 현장 일정" />
        <KpiCard icon={<Loader2 size={16} />} label="진행중" value={inProgress} unit="건" tone="info" onClick={() => nav('/work')} sub="이동중 · 작업중" />
        <KpiCard icon={<CheckCircle2 size={16} />} label="완료" value={done} unit="건" tone="success" onClick={() => nav('/work')} sub={`완료율 ${Math.round((done / today.length) * 100)}%`} />
        <KpiCard icon={<AlertTriangle size={16} />} label="서비스 위험" value={risks} unit="건" tone="danger" onClick={() => nav('/today')} sub={unassigned > 0 ? `미배정 ${unassigned}건 포함` : 'AI 위험 감지'} />
        <KpiCard icon={<RefreshCcw size={16} />} label="갱신 예정" value={7} unit="계약" tone="warning" onClick={() => nav('/renewals')} sub="90일 내 · 긴급 1건" />
        <KpiCard icon={<TrendingUp size={16} />} label="추가매출 기회" value={5} unit="건" tone="success" onClick={() => nav('/upsell')} sub={`예상 ${fmtManwon(420)}`} />
      </div>

      {/* 02 AI 브리핑 + 03 오늘 먼저 확인할 것 */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card tour="ai-briefing" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-gradient-to-r from-ai-soft to-mint px-5 py-3.5">
            <p className="flex items-center gap-2 text-[1.05rem] font-extrabold"><Sparkles size={18} className="text-ai-strong" /> AI 오늘의 운영 브리핑</p>
            <AIReadyBadge small />
          </div>
          <div className="space-y-2 p-5 text-[0.95rem] leading-relaxed">
            <p className="text-[1.02rem] font-bold">{DAILY_BRIEFING.summary[0]}</p>
            <ul className="space-y-1.5 text-ink-soft">
              {DAILY_BRIEFING.summary.slice(1).map((s) => (
                <li key={s} className="flex gap-2"><span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-ai" />{s}</li>
              ))}
            </ul>
            {/* AI 엔진별 발견 건수 — 누르면 AI 센터의 해당 탭으로 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {BRIEF_CHIPS.map((c) => (
                <button
                  key={c.tab}
                  onClick={() => nav(`/ai?tab=${c.tab}`)}
                  className={cx('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] font-bold transition-opacity hover:opacity-80', toneBg[c.tone])}
                >
                  {c.label} <span className="tnum text-[0.95rem] font-extrabold">{SEED_INSIGHTS.filter((i) => i.engine === c.tab).length}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <WhyAIButton dataViewed={['오늘 일정 24건', '팀별 진행상황', '계약 갱신일', '품질·문의 기록', '수익성 요약']} />
              <button onClick={() => nav('/ai')} className="flex items-center gap-1 text-[0.84rem] font-bold text-ai-strong hover:underline">
                AI 센터 열기 <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/today')}>전체 <ArrowRight size={14} className="inline" /></Btn>}>
            오늘 먼저 확인할 것
          </SectionTitle>
          <div className="divide-y divide-line">
            {PRIORITIES.map((c) => (
              <button key={c.title} onClick={() => nav(c.to)} className="group flex w-full items-center gap-3 py-3 text-left first:pt-1 last:pb-0">
                <span className={cx('h-9 w-1.5 shrink-0 rounded-full', {
                  danger: 'bg-danger', warning: 'bg-warning', success: 'bg-success', info: 'bg-info',
                }[c.tone as 'danger'])} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[0.98rem] font-extrabold">{c.title}</span>
                    <span className={cx('text-[0.76rem] font-bold', {
                      danger: 'text-danger', warning: 'text-warning', success: 'text-success', info: 'text-info',
                    }[c.tone as 'danger'])}>{c.tag}</span>
                  </span>
                  <span className="block text-[0.84rem] text-ink-soft">{c.desc}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* 04 오늘 일정 (진행 막대 포함) + 05 팀 가동 */}
      <div className="grid items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-5">
          <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/schedule')}>일정 전체 <ArrowRight size={14} className="inline" /></Btn>}>
            오늘 일정
          </SectionTitle>

          {/* 진행 상황 — 상태별 비율을 한 줄로 */}
          <div className="flex h-2.5 overflow-hidden rounded-full bg-ivory" role="img" aria-label={`완료 ${done}, 진행 ${inProgress}, 예정 ${planned}, 확인필요 ${needCheck}`}>
            {STATUS_ORDER.map((s) => progress[s.key] > 0 && (
              <span key={s.key} style={{ width: `${(progress[s.key] / today.length) * 100}%`, background: s.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] font-semibold text-ink-soft">
            {STATUS_ORDER.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label} <b className="tnum text-ink">{progress[s.key]}</b>
              </span>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[0.8rem] font-bold text-ink-faint">남은 일정 {upcoming.length}건</p>
          <div className="space-y-1.5">
            {upcoming.slice(0, 6).map((s) => {
              const c = customerById(s.customerId)
              return (
                <button key={s.id} onClick={() => nav(`/sites/${s.customerId}`)} className="flex w-full items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-left transition-colors hover:border-primary hover:bg-mint/40">
                  <span className="tnum w-[2.9rem] shrink-0 text-[0.95rem] font-extrabold text-primary">{s.time}</span>
                  <span className="min-w-0 flex-1">
                    {/* 현장명은 잘라내지 않는다 — 길면 두 줄로 */}
                    <span className="block text-[0.92rem] font-bold leading-snug">{c?.name}</span>
                    <span className="block truncate text-[0.78rem] text-ink-faint">
                      <StatusText status={s.teamId ? s.status : '확인필요'} className="min-[400px]:hidden" />
                      {s.risk ? <span className="font-bold text-danger">{s.risk.type} · </span> : null}
                      {s.service} · {teamById(s.teamId)?.name ?? '미배정'}
                    </span>
                  </span>
                  <span className="hidden shrink-0 min-[400px]:block"><StatusPill status={s.teamId ? s.status : '확인필요'} /></span>
                </button>
              )
            })}
          </div>
          {upcoming.length > 6 && (
            <button onClick={() => nav('/schedule')} className="mt-2 w-full rounded-xl py-2 text-[0.84rem] font-bold text-primary hover:bg-mint/40">
              남은 일정 {upcoming.length - 6}건 더 보기
            </button>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/team')}>팀 상세 <ArrowRight size={14} className="inline" /></Btn>}>직원 / 팀 가동</SectionTitle>
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-primary"><Users size={21} /></span>
            <div>
              <p className="tnum text-[1.35rem] font-extrabold leading-tight">{working} / {EMPLOYEES.length}명 근무</p>
              <p className="text-[0.8rem] text-ink-faint">{TEAMS.length}개 팀 · 휴무 1 · 결원 1</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {TEAMS.map((t) => {
              const jobs = today.filter((s) => s.teamId === t.id).length
              return (
                <div key={t.id} className="rounded-lg bg-ivory px-1.5 py-2 text-center">
                  <p className="text-[0.74rem] font-bold text-ink-faint">{t.name.replace('Clean Team ', '팀 ')}</p>
                  <p className="tnum text-[0.98rem] font-extrabold text-primary">{jobs}건</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 06 주간 추이 + 07 매출 요약 */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-5">
          <SectionTitle right={<DemoBadge label="데모" />}>주간 작업 추이</SectionTitle>
          <div className="h-[220px]">
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
              <p className="flex items-center gap-1 text-[0.84rem] font-bold text-primary">수익성 분석 열기 <ArrowRight size={14} /></p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Lock size={24} className="text-ink-faint" />
              <p className="text-[0.9rem] font-bold text-ink-soft">매출·수익성은 대표 권한에서 확인할 수 있습니다.</p>
              <p className="text-[0.78rem] text-ink-faint">역할별 데이터 접근 제어 (RLS)</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
