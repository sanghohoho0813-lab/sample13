import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, MapPin, Clock, Sparkles, CheckCircle2, ArrowRight, CalendarDays, Users,
} from 'lucide-react'
import { Card, PageHeader, Badge, Btn, StatusPill, DemoBadge, EmptyState, useToast } from '../../components/ui'
import { AIReadyBadge, WhyAIButton, ActionLifecycle } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById, teamById, teamMemberNames, TEAMS } from '../../lib/demo/company'
import { DISPATCH_CANDIDATES } from '../../lib/demo/operations'
import { cx, dateWithOffset } from '../../lib/utils'
import type { Schedule as Sched } from '../../types'

type View = 'today' | 'week' | 'team'

export default function Schedule() {
  const { schedules, assignTeam, actions } = useDemo()
  const nav = useNavigate()
  const toast = useToast()
  const [view, setView] = useState<View>('today')
  const [selectedId, setSelectedId] = useState<string>('SC-16')

  const today = useMemo(() => schedules.filter((s) => s.dayOffset === 0).sort((a, b) => a.time.localeCompare(b.time)), [schedules])
  const week = useMemo(() => schedules.filter((s) => s.dayOffset > 0).sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time)), [schedules])
  const selected = schedules.find((s) => s.id === selectedId)
  const selCustomer = selected ? customerById(selected.customerId) : undefined
  const candidates = selected ? DISPATCH_CANDIDATES[selected.id] : undefined
  const riskList = today.filter((s) => s.risk)
  const dispatchAction = actions.find((a) => a.id === 'A-08')

  const ScheduleRow = ({ s }: { s: Sched }) => {
    const c = customerById(s.customerId)
    return (
      <button
        onClick={() => setSelectedId(s.id)}
        className={cx(
          'w-full rounded-xl border px-3.5 py-3 text-left transition-all',
          selectedId === s.id ? 'border-primary bg-mint/50 shadow-card' : 'border-line bg-card hover:border-primary/50',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="tnum text-[0.95rem] font-extrabold text-primary">{s.dayOffset > 0 ? `${dateWithOffset(s.dayOffset)} ` : ''}{s.time}</span>
          <StatusPill status={s.teamId ? s.status : '확인필요'} />
        </div>
        <p className="mt-1 truncate text-[0.95rem] font-bold">{c?.name}</p>
        <p className="truncate text-[0.76rem] text-ink-faint">{s.service} · {s.teamId ? teamById(s.teamId)?.name : '미배정'}</p>
        {s.risk && <p className="mt-1 flex items-center gap-1 text-[0.74rem] font-bold text-danger"><AlertTriangle size={12} /> {s.risk.type}</p>}
        {!s.teamId && <p className="mt-1 flex items-center gap-1 text-[0.74rem] font-bold text-warning"><Sparkles size={12} /> AI 배정 추천 대기</p>}
      </button>
    )
  }

  return (
    <div className="fade-up">
      <PageHeader
        title="일정 / 배정"
        desc="시간·고객·현장·팀 상태를 한 화면에서 보고, AI Smart Dispatch가 배정을 추천합니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />

      {/* View switcher */}
      <div className="mb-4 flex gap-1.5 rounded-xl border border-line bg-card p-1 w-fit">
        {([['today', 'Today'], ['week', 'Week'], ['team', 'Team']] as [View, string][]).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cx('rounded-lg px-4 py-1.5 text-[0.85rem] font-bold', view === v ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary')}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'team' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TEAMS.map((t) => {
            const jobs = today.filter((s) => s.teamId === t.id)
            return (
              <Card key={t.id} className="p-4.5 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[1rem] font-extrabold">{t.name}</p>
                  <Badge tone="brand"><Users size={11} /> {jobs.length}건</Badge>
                </div>
                <p className="mt-0.5 text-[0.76rem] text-ink-faint">{teamMemberNames(t.id)} · {t.specialty.join(' / ')}</p>
                <div className="mt-3 space-y-1.5">
                  {jobs.length === 0 && <p className="text-[0.8rem] text-ink-faint">오늘 배정된 일정이 없습니다.</p>}
                  {jobs.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 rounded-lg bg-ivory px-2.5 py-1.5 text-[0.8rem]">
                      <span className="tnum font-extrabold text-primary">{s.time}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{customerById(s.customerId)?.name}</span>
                      <StatusPill status={s.status} />
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[340px_1fr_360px]">
          {/* Left: 일정 리스트 */}
          <div className="space-y-2 xl:max-h-[72vh] xl:overflow-y-auto xl:pr-1">
            <p className="flex items-center gap-1.5 text-[0.8rem] font-bold text-ink-soft"><CalendarDays size={14} /> {view === 'today' ? `오늘 일정 ${today.length}건` : `이번 주 예정 ${week.length}건`}</p>
            {(view === 'today' ? today : week).map((s) => <ScheduleRow key={s.id} s={s} />)}
          </div>

          {/* Center: 선택 일정 상세 */}
          <div>
            {selected && selCustomer ? (
              <Card className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[1.3rem] font-extrabold">{selCustomer.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[0.82rem] text-ink-soft"><MapPin size={13} /> {selCustomer.address}</p>
                  </div>
                  <StatusPill status={selected.teamId ? selected.status : '확인필요'} />
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { l: '방문시간', v: `${selected.dayOffset > 0 ? dateWithOffset(selected.dayOffset) + ' ' : ''}${selected.time}` },
                    { l: '서비스', v: selected.service },
                    { l: '예상 작업', v: `${selected.durationMin}분` },
                    { l: '이동시간', v: selected.teamId ? `${selected.travelMin}분` : '배정 후 산출' },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl bg-ivory px-3 py-2.5">
                      <p className="text-[0.68rem] font-bold text-ink-faint">{x.l}</p>
                      <p className="mt-0.5 text-[0.88rem] font-extrabold leading-tight">{x.v}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-line p-3.5">
                  <p className="text-[0.72rem] font-bold text-ink-faint">담당팀</p>
                  {selected.teamId ? (
                    <p className="mt-0.5 text-[0.95rem] font-extrabold">{teamById(selected.teamId)?.name} <span className="font-semibold text-ink-soft text-[0.82rem]">— {teamMemberNames(selected.teamId)}</span></p>
                  ) : (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[0.95rem] font-extrabold text-warning"><Sparkles size={15} /> 미배정 — 우측 AI 추천을 확인하세요</p>
                  )}
                </div>
                {selected.risk && (
                  <div className="rounded-xl bg-danger-soft p-4">
                    <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold text-danger"><AlertTriangle size={15} /> {selected.risk.type} 위험</p>
                    <p className="mt-1 text-[0.85rem] leading-relaxed text-ink">{selected.risk.detail}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {selected.id === 'SC-14' && actions.find((a) => a.id === 'A-01') && (
                        <ActionLifecycle actionId="A-01" status={actions.find((a) => a.id === 'A-01')!.status} compact />
                      )}
                      <WhyAIButton dataViewed={['오늘 일정', '팀별 진행상황', '작업 예상시간', '현장 간 이동시간']} />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 border-t border-line pt-3.5">
                  <Btn variant="outline" size="sm" onClick={() => nav(`/sites/${selCustomer.id}`)}>현장 Detail <ArrowRight size={13} className="inline" /></Btn>
                  <Btn variant="outline" size="sm" onClick={() => nav(`/customers/${selCustomer.id}`)}>고객 Detail</Btn>
                </div>
              </Card>
            ) : (
              <EmptyState title="일정을 선택해주세요." desc="왼쪽 목록에서 일정을 선택하면 상세와 AI 추천이 표시됩니다." />
            )}
          </div>

          {/* Right: AI Smart Dispatch / Risk */}
          <div className="space-y-4">
            <Card tour="dispatch" className="overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-line bg-ai-soft px-4 py-3">
                <p className="flex items-center gap-1.5 text-[0.92rem] font-extrabold text-ai-strong"><Sparkles size={16} /> AI Smart Dispatch</p>
                <AIReadyBadge small />
              </div>
              <div className="p-4 space-y-3">
                {selected && !selected.teamId && candidates ? (
                  <>
                    <p className="text-[0.82rem] font-bold text-ink-soft">"누가 이 현장에 배정되는 것이 가장 합리적인가?"</p>
                    {candidates.map((cand) => {
                      const t = teamById(cand.teamId)
                      return (
                        <div key={cand.teamId} className={cx('rounded-xl border p-3.5', cand.rank === 1 ? 'border-ai bg-ai-soft/50' : 'border-line')}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.92rem] font-extrabold">{cand.rank}순위 · {t?.name}</p>
                            <Badge tone={cand.rank === 1 ? 'ai' : 'neutral'}>적합도 {cand.fitPct}%</Badge>
                          </div>
                          <p className="mt-0.5 text-[0.74rem] text-ink-faint">{teamMemberNames(cand.teamId)}</p>
                          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                            {[[`${cand.travelMin}분`, '이동'], [`${cand.fitPct}%`, '적합도'], [`${cand.slackMin}분`, '이후 여유']].map(([v, l]) => (
                              <div key={l} className="rounded-lg bg-card px-1 py-1.5 border border-line">
                                <p className="tnum text-[0.88rem] font-extrabold text-primary">{v}</p>
                                <p className="text-[0.64rem] font-bold text-ink-faint">{l}</p>
                              </div>
                            ))}
                          </div>
                          <ul className="mt-2 space-y-0.5">
                            {cand.reasons.map((r) => <li key={r} className="flex gap-1.5 text-[0.76rem] text-ink-soft"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ai" />{r}</li>)}
                          </ul>
                          {cand.rank === 1 && (
                            <Btn variant="ai" size="sm" className="mt-2.5 w-full" onClick={() => {
                              assignTeam(selected.id, cand.teamId)
                              toast(`${t?.name} 배정을 적용했습니다.`, 'success')
                            }}>
                              <CheckCircle2 size={14} className="inline" /> 이 팀 배정
                            </Btn>
                          )}
                        </div>
                      )
                    })}
                    <p className="text-[0.72rem] leading-relaxed text-ink-faint">AI는 추천만 합니다 — 자동 확정하지 않으며 최종 결정은 사람이 합니다.</p>
                    <WhyAIButton dataViewed={['현장 위치·방문시간', '서비스 종류·예상 작업시간', '직원 현재 일정', '직원별 숙련서비스', '팀 구성·예상 이동시간', '고객 중요도']} />
                  </>
                ) : selected?.teamId && DISPATCH_CANDIDATES[selected.id] ? (
                  <div className="rounded-xl bg-success-soft p-3.5 text-[0.85rem] font-bold text-success">
                    <CheckCircle2 size={15} className="mr-1 inline" /> 배정 완료 — {teamById(selected.teamId)?.name}
                    {dispatchAction && <div className="mt-2"><ActionLifecycle actionId="A-08" status={dispatchAction.status} compact /></div>}
                  </div>
                ) : (
                  <p className="text-[0.82rem] leading-relaxed text-ink-soft">
                    미배정 일정을 선택하면 AI가 이동시간·숙련도·일정 여유를 비교해 최적 팀을 추천합니다.
                    {today.some((s) => !s.teamId) && (
                      <Btn variant="ai" size="sm" className="mt-2.5 w-full" onClick={() => setSelectedId(today.find((s) => !s.teamId)!.id)}>미배정 일정 보기</Btn>
                    )}
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[0.92rem] font-extrabold text-danger"><AlertTriangle size={16} /> 오늘의 Risk {riskList.length}건</p>
              <div className="space-y-1.5">
                {riskList.map((s) => (
                  <button key={s.id} onClick={() => setSelectedId(s.id)} className="flex w-full items-center gap-2 rounded-lg bg-danger-soft/60 px-2.5 py-2 text-left text-[0.8rem] hover:bg-danger-soft">
                    <Clock size={13} className="shrink-0 text-danger" />
                    <span className="min-w-0 flex-1 truncate font-bold">{customerById(s.customerId)?.name}</span>
                    <span className="shrink-0 text-[0.7rem] font-bold text-danger">{s.risk!.type}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
      <p className="mt-5 text-[0.74rem] text-ink-faint">지도·실제 이동시간 API는 Integration Ready — 현재 값은 규칙 기반 DEMO 추정치입니다.</p>
    </div>
  )
}
