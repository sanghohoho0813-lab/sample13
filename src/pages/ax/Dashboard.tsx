import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, Loader2, CheckCircle2, AlertTriangle, RefreshCcw, TrendingUp,
  Sparkles, ArrowRight, Users, Wallet, Clock,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Card, KpiCard, SectionTitle, Badge, Btn, StatusPill, Freshness, SkeletonBlock, DemoBadge } from '../../components/ui'
import { AIReadyBadge, WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById, teamById, TEAMS, EMPLOYEES } from '../../lib/demo/company'
import { DAILY_BRIEFING, WEEKLY_TREND, MONTH_REVENUE } from '../../lib/demo/intelligence'
import { fmtManwon, cx } from '../../lib/utils'

const STATUS_COLORS: Record<string, string> = {
  예정: '#94A3B8', 이동중: '#52A7A3', 작업중: '#2563AE', 완료: '#1E8A5E', 확인필요: '#C24A3F',
}

export default function Dashboard() {
  const { schedules, role } = useDemo()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])

  const today = schedules.filter((s) => s.dayOffset === 0)
  const done = today.filter((s) => s.status === '완료').length
  const inProgress = today.filter((s) => s.status === '작업중' || s.status === '이동중').length
  const risks = today.filter((s) => s.risk).length
  const unassigned = today.filter((s) => !s.teamId).length

  const statusDist = Object.entries(
    today.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {}),
  ).map(([name, value]) => ({ name, value }))

  const working = EMPLOYEES.filter((e) => e.status === '근무').length

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">{[...Array(6)].map((_, i) => <SkeletonBlock key={i} className="h-32" />)}</div>
        <SkeletonBlock className="h-64" />
      </div>
    )
  }

  return (
    <div className="fade-up space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem] lg:text-[1.85rem] font-extrabold tracking-tight">AX 대시보드</h1>
          <p className="mt-0.5 text-[0.9rem] text-ink-soft">클린웨이파트너스 Service Command Center</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Freshness /></div>
      </div>

      {/* 01 Executive KPI */}
      <div data-tour="kpi" className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={<CalendarCheck size={21} />} label="오늘 예정" value={today.length} unit="건" tone="brand" onClick={() => nav('/schedule')} sub="전체 현장 일정" />
        <KpiCard icon={<Loader2 size={21} />} label="진행중" value={inProgress} unit="건" tone="info" onClick={() => nav('/work')} sub="이동중 · 작업중" />
        <KpiCard icon={<CheckCircle2 size={21} />} label="완료" value={done} unit="건" tone="success" onClick={() => nav('/work')} sub={`완료율 ${Math.round((done / today.length) * 100)}%`} />
        <KpiCard icon={<AlertTriangle size={21} />} label="Service Risk" value={risks} unit="건" tone="danger" onClick={() => nav('/today')} sub={unassigned > 0 ? `미배정 ${unassigned}건 포함 확인` : 'AI Risk Radar 감지'} />
        <KpiCard icon={<RefreshCcw size={21} />} label="갱신 예정" value={7} unit="계약" tone="warning" onClick={() => nav('/renewals')} sub="90일 내 · D-21 긴급 1건" />
        <KpiCard icon={<TrendingUp size={21} />} label="Upsell Opportunity" value={5} unit="건" tone="success" onClick={() => nav('/upsell')} sub={`예상 ${fmtManwon(420)} (DEMO)`} />
      </div>

      {/* 02 AI 오늘의 운영 브리핑 */}
      <Card tour="ai-briefing" className="overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-ai-soft to-mint px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[1.05rem] font-extrabold"><Sparkles size={19} className="text-ai-strong" /> AI 오늘의 운영 브리핑</p>
          <div className="flex items-center gap-2"><AIReadyBadge /><WhyAIButton dataViewed={['오늘 일정 24건', '팀별 진행상황', '계약 갱신일', '품질·문의 기록', '수익성 Snapshot']} /></div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-2 text-[0.95rem] leading-relaxed">
            {DAILY_BRIEFING.summary.map((s, i) => (
              <p key={i} className={cx(i === 0 && 'font-bold text-[1.02rem]')}>{s}</p>
            ))}
            <Btn variant="ai" size="sm" className="mt-2" onClick={() => nav('/ai')}>전체 AI Insight <ArrowRight size={14} className="inline" /></Btn>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DAILY_BRIEFING.counters.map((c) => (
              <div key={c.label} className={cx('rounded-xl p-3.5', {
                danger: 'bg-danger-soft', success: 'bg-success-soft', warning: 'bg-warning-soft', info: 'bg-info-soft',
              }[c.tone])}>
                <p className="text-[0.75rem] font-bold text-ink-soft">{c.label}</p>
                <p className={cx('tnum mt-1 text-[1.6rem] font-extrabold', {
                  danger: 'text-danger', success: 'text-success', warning: 'text-warning', info: 'text-info',
                }[c.tone])}>{c.value}건</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 03 오늘 먼저 확인할 것 */}
      <section>
        <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/today')}>오늘의 AX 전체보기 <ArrowRight size={14} className="inline" /></Btn>}>
          오늘 먼저 확인할 것
        </SectionTitle>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { badge: '방문지연 Risk', tone: 'danger' as const, title: '성수 B오피스', desc: '이전 작업 32분 지연 · 예상 도착 15:47', to: '/schedule' },
            { badge: '재계약 사전관리', tone: 'warning' as const, title: '라온메디컬센터', desc: '계약 종료 D-32 · 품질문의 증가', to: '/customers/C01' },
            { badge: '추가서비스 제안', tone: 'success' as const, title: '에이원교육센터', desc: '유리 오염 특이사항 4회 → 집중관리 제안', to: '/upsell' },
            { badge: '미완료 보고', tone: 'info' as const, title: '강남 C클리닉', desc: '08:30 작업 보고 미제출 · 확인 필요', to: '/sites/C04' },
          ].map((c) => (
            <Card key={c.title} onClick={() => nav(c.to)} className="p-4.5 p-5">
              <Badge tone={c.tone}>{c.badge}</Badge>
              <p className="mt-2.5 text-[1.05rem] font-extrabold">{c.title}</p>
              <p className="mt-1 text-[0.82rem] leading-snug text-ink-soft">{c.desc}</p>
              <p className="mt-3 flex items-center gap-1 text-[0.8rem] font-bold text-primary">상세보기 <ArrowRight size={13} /></p>
            </Card>
          ))}
        </div>
      </section>

      {/* 04+05 Timeline & 진행현황 */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/schedule')}>일정 전체 <ArrowRight size={14} className="inline" /></Btn>}>
            오늘의 Service Timeline
          </SectionTitle>
          <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
            {[...today].sort((a, b) => a.time.localeCompare(b.time)).map((s) => {
              const c = customerById(s.customerId)
              return (
                <button key={s.id} onClick={() => nav(`/sites/${s.customerId}`)} className="flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left transition-colors hover:border-primary hover:bg-mint/40">
                  <span className="tnum w-[52px] shrink-0 text-[0.95rem] font-extrabold text-primary">{s.time}</span>
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.92rem] font-bold">{c?.name}</span>
                    <span className="block truncate text-[0.76rem] text-ink-faint">{s.service} · {teamById(s.teamId)?.name ?? '미배정'}</span>
                  </span>
                  {s.risk && <AlertTriangle size={16} className="shrink-0 text-danger" />}
                  <StatusPill status={s.teamId ? s.status : '확인필요'} />
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>현장 진행현황</SectionTitle>
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                    {statusDist.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? '#94A3B8'} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={9} formatter={(v) => <span className="text-[0.78rem] font-semibold text-ink-soft">{v}</span>} />
                  <Tooltip formatter={(v: number, n: string) => [`${v}건`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[0.78rem] text-ink-faint">총 {today.length}건 · <DemoBadge label="DEMO" /></p>
          </Card>

          <Card className="p-5">
            <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/team')}>팀 상세 <ArrowRight size={14} className="inline" /></Btn>}>직원 / 팀 가동현황</SectionTitle>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-primary"><Users size={22} /></span>
              <div>
                <p className="tnum text-[1.4rem] font-extrabold">{working} / {EMPLOYEES.length}명 근무</p>
                <p className="text-[0.78rem] text-ink-faint">{TEAMS.length}개 팀 운영 · 휴무 1 · 결원 1</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {TEAMS.map((t) => {
                const jobs = today.filter((s) => s.teamId === t.id).length
                return (
                  <div key={t.id} className="rounded-lg bg-ivory px-2 py-1.5 text-center">
                    <p className="text-[0.68rem] font-bold text-ink-faint">{t.name.replace('Clean Team ', 'Team ')}</p>
                    <p className="tnum text-[0.95rem] font-extrabold text-primary">{jobs}건</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* 06 주간 추이 & 08 매출 Snapshot */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <SectionTitle>주간 작업 추이 <DemoBadge label="DEMO" /></SectionTitle>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_TREND} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 13, fontWeight: 700, fill: '#6B7684' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7684' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={9} formatter={(v) => <span className="text-[0.78rem] font-semibold text-ink-soft">{v}</span>} />
                <Line type="monotone" dataKey="예정" stroke="#52A7A3" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="완료" stroke="#0E6D71" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="지연" stroke="#C24A3F" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5" onClick={role === 'ceo' ? () => nav('/profitability') : undefined}>
          <SectionTitle>계약 / 매출 Snapshot</SectionTitle>
          {role === 'ceo' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-soft text-info"><Wallet size={22} /></span>
                <div>
                  <p className="text-[0.75rem] font-bold text-ink-faint">이번 달 누적 매출 (DEMO)</p>
                  <p className="tnum text-[1.55rem] font-extrabold">{(MONTH_REVENUE.total * 10000).toLocaleString('ko-KR')}원</p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[0.75rem] font-bold text-ink-soft">
                  <span>목표 대비 {Math.round((MONTH_REVENUE.total / MONTH_REVENUE.target) * 100)}%</span>
                  <span className="text-success">전년 +{MONTH_REVENUE.yoyPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-ivory"><div className="h-full rounded-full bg-primary" style={{ width: `${(MONTH_REVENUE.total / MONTH_REVENUE.target) * 100}%` }} /></div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ivory px-3.5 py-2.5">
                <span className="text-[0.82rem] font-bold text-ink-soft">평균 운영 기여마진</span>
                <span className="tnum text-[1.1rem] font-extrabold text-primary">{MONTH_REVENUE.contribMarginPct}%</span>
              </div>
              <p className="flex items-center gap-1 text-[0.8rem] font-bold text-primary">수익성 분석 열기 <ArrowRight size={13} /></p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Clock size={26} className="text-ink-faint" />
              <p className="text-[0.88rem] font-bold text-ink-soft">매출·수익성 정보는 대표 권한에서 확인할 수 있습니다.</p>
              <p className="text-[0.75rem] text-ink-faint">RLS Preview — 역할별 데이터 접근 제어 (DEMO)</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
