import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, MapPin, Sparkles, CheckCircle2, ArrowRight, Users, ChevronRight,
} from 'lucide-react'
import { Card, PageHeader, Badge, Btn, StatusPill, StatusText, DemoBadge, EmptyState, Modal, useToast } from '../../components/ui'
import { AIReadyBadge, WhyAIButton, ActionLifecycle } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById, teamById, teamMemberNames, TEAMS } from '../../lib/demo/company'
import { DISPATCH_CANDIDATES } from '../../lib/demo/operations'
import { cx, dateWithOffset } from '../../lib/utils'
import { useIsWide } from '../../lib/useMedia'
import type { Schedule as Sched } from '../../types'

type View = 'today' | 'week' | 'team'

/**
 * 일정 / 배정
 * - PC(1280px+): 왼쪽 일정 목록 · 오른쪽 선택 일정 상세 + AI 배정 추천
 * - 모바일·태블릿: 목록만 보이고, 항목을 누르면 상세가 하단 시트로 열린다
 *   (예전에는 상세가 목록 24건 아래에 그려져 눌러도 반응이 없는 것처럼 보였다)
 * - 미배정·위험 일정은 목록 위 알림 줄로 끌어올려 첫 화면에서 바로 처리한다
 */
export default function Schedule() {
  const { schedules, assignTeam, actions } = useDemo()
  const nav = useNavigate()
  const toast = useToast()
  const wide = useIsWide()
  const [view, setView] = useState<View>('today')
  // ?id=SC-14 로 들어오면 그 일정을 바로 선택(모바일은 시트로 연다) — 대시보드·오늘의 AX에서 한 번에 도착
  const [params, setParams] = useSearchParams()
  const deepId = params.get('id')
  const [selectedId, setSelectedId] = useState<string>(() => (deepId && schedules.some((s) => s.id === deepId) ? deepId : 'SC-16'))
  const [sheetOpen, setSheetOpen] = useState(() => !!deepId && !wide && schedules.some((s) => s.id === deepId))
  useEffect(() => {
    if (!deepId) return
    if (schedules.some((s) => s.id === deepId)) {
      setSelectedId(deepId)
      if (!wide) setSheetOpen(true)
    }
    setParams({}, { replace: true })
  }, [deepId, schedules, wide, setParams])

  const today = useMemo(() => schedules.filter((s) => s.dayOffset === 0).sort((a, b) => a.time.localeCompare(b.time)), [schedules])
  const week = useMemo(() => schedules.filter((s) => s.dayOffset > 0).sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time)), [schedules])
  const selected = schedules.find((s) => s.id === selectedId)
  const unassigned = today.filter((s) => !s.teamId)
  const riskList = today.filter((s) => s.risk)

  const open = (id: string) => {
    setSelectedId(id)
    if (!wide) setSheetOpen(true)
  }

  const Row = ({ s }: { s: Sched }) => {
    const c = customerById(s.customerId)
    const active = wide && selectedId === s.id
    return (
      <button
        onClick={() => open(s.id)}
        aria-current={active ? 'true' : undefined}
        className={cx(
          'flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
          active ? 'border-primary bg-mint/60' : 'border-line bg-card hover:border-primary/60',
        )}
      >
        <span className="tnum w-[2.9rem] shrink-0 text-[0.95rem] font-extrabold text-primary">{s.time}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.93rem] font-bold leading-snug">
            {s.dayOffset > 0 && <span className="mr-1.5 text-[0.78rem] font-bold text-ink-faint">{dateWithOffset(s.dayOffset)}</span>}
            {c?.name}
          </span>
          <span className="block truncate text-[0.78rem] text-ink-faint">
            {s.teamId && <StatusText status={s.status} className="min-[400px]:hidden" />}
            {!s.teamId ? <span className="font-bold text-warning">미배정 · </span> : s.risk ? <span className="font-bold text-danger">{s.risk.type} · </span> : null}
            {`${s.service}${s.teamId ? ` · ${teamById(s.teamId)?.name}` : ''}`}
          </span>
        </span>
        <span className="hidden shrink-0 min-[400px]:block"><StatusPill status={s.teamId ? s.status : '확인필요'} /></span>
        {!wide && <ChevronRight size={16} className="shrink-0 text-ink-faint" />}
      </button>
    )
  }

  const list = view === 'today' ? today : week

  return (
    <div className="fade-up">
      <PageHeader
        title="일정 / 배정"
        desc="오늘 일정과 팀 배정을 한 화면에서 확인하고, 미배정 일정은 AI 추천으로 바로 배정합니다."
        right={<DemoBadge />}
      />

      {/* 먼저 처리할 것 — 미배정 / 위험 */}
      {(unassigned.length > 0 || riskList.length > 0) && view !== 'team' && (
        <div className="mb-4 space-y-2">
          {unassigned.map((s) => (
            <button
              key={s.id}
              data-tour={wide ? undefined : 'dispatch'}
              onClick={() => open(s.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-ai/30 bg-ai-soft px-4 py-3 text-left hover:border-ai"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ai text-white"><Sparkles size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-extrabold text-ai-strong">미배정 일정 — AI가 배정할 팀을 추천했습니다</span>
                <span className="block text-[0.82rem] text-ink-soft">{s.time} {customerById(s.customerId)?.name} · {s.service}</span>
              </span>
              <span className="hidden shrink-0 text-[0.84rem] font-bold text-ai-strong sm:inline">추천 보기</span>
              <ChevronRight size={18} className="shrink-0 text-ai-strong" />
            </button>
          ))}
          {riskList.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-danger/20 bg-danger-soft/60 px-4 py-2.5 sm:flex-wrap sm:overflow-visible">
              <span className="flex shrink-0 items-center gap-1.5 text-[0.86rem] font-extrabold text-danger"><AlertTriangle size={15} /> 위험 {riskList.length}건</span>
              {riskList.map((s) => (
                <button key={s.id} onClick={() => open(s.id)} className="shrink-0 whitespace-nowrap rounded-full border border-danger/25 bg-card px-3 py-1 text-[0.8rem] font-bold text-ink hover:border-danger">
                  {customerById(s.customerId)?.name} <span className="text-danger">· {s.risk!.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 보기 전환 */}
      <div role="tablist" className="mb-3 flex w-fit gap-1 rounded-xl border border-line bg-card p-1">
        {([['today', '오늘', today.length], ['week', '이번 주', week.length], ['team', '팀별', TEAMS.length]] as [View, string, number][]).map(([v, label, n]) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={cx('flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.88rem] font-bold', view === v ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary')}
          >
            {label}<span className={cx('tnum text-[0.74rem]', view === v ? 'text-white/80' : 'text-ink-faint')}>{n}</span>
          </button>
        ))}
      </div>

      {view === 'team' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TEAMS.map((t) => {
            const jobs = today.filter((s) => s.teamId === t.id)
            return (
              <Card key={t.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[1rem] font-extrabold">{t.name}</p>
                  <Badge tone="brand"><Users size={11} /> {jobs.length}건</Badge>
                </div>
                <p className="mt-0.5 text-[0.78rem] text-ink-faint">{teamMemberNames(t.id)} · {t.specialty.join(' / ')}</p>
                <div className="mt-3 space-y-1.5">
                  {jobs.length === 0 && <p className="text-[0.82rem] text-ink-faint">오늘 배정된 일정이 없습니다.</p>}
                  {jobs.map((s) => (
                    <button key={s.id} onClick={() => { setView('today'); open(s.id) }} className="flex w-full items-center gap-2 rounded-lg bg-ivory px-2.5 py-1.5 text-left text-[0.82rem] hover:bg-mint/60">
                      <span className="tnum font-extrabold text-primary">{s.time}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{customerById(s.customerId)?.name}</span>
                      <StatusPill status={s.status} />
                    </button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(320px,380px)_1fr]">
          {/* 미배정이 모두 처리된 뒤에도 튜토리얼이 가리킬 곳이 있도록 목록을 대체 대상으로 */}
          <div data-tour={!wide && unassigned.length === 0 ? 'dispatch' : undefined} className="space-y-1.5 xl:max-h-[calc(100vh-15rem)] xl:overflow-y-auto xl:pr-1">
            {list.length === 0
              ? <EmptyState title="표시할 일정이 없습니다." />
              : list.map((s) => <Row key={s.id} s={s} />)}
          </div>

          {/* PC — 오른쪽 상세 */}
          {wide && (
            <div className="space-y-4">
              {selected ? (
                <DetailPanel s={selected} wide onAssign={(teamId) => { assignTeam(selected.id, teamId); toast(`${teamById(teamId)?.name} 배정을 적용했습니다.`) }} actions={actions} nav={nav} />
              ) : (
                <EmptyState title="일정을 선택해주세요." desc="왼쪽 목록에서 일정을 선택하면 상세와 AI 추천이 표시됩니다." />
              )}
            </div>
          )}
        </div>
      )}

      {/* 모바일·태블릿 — 하단 시트 */}
      {!wide && selected && (
        <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title={customerById(selected.customerId)?.name ?? '일정 상세'} wide>
          <DetailPanel
            s={selected}
            onAssign={(teamId) => { assignTeam(selected.id, teamId); toast(`${teamById(teamId)?.name} 배정을 적용했습니다.`) }}
            actions={actions}
            nav={nav}
          />
        </Modal>
      )}

      <p className="mt-5 text-[0.78rem] text-ink-faint">지도·실제 이동시간 API는 연동 준비 상태 — 현재 값은 규칙 기반 데모 추정치입니다.</p>
    </div>
  )
}

/** 선택한 일정의 상세 + AI 배정 추천 — PC 오른쪽 칸과 모바일 하단 시트가 같은 내용을 쓴다 */
function DetailPanel({ s, wide, onAssign, actions, nav }: {
  s: Sched
  wide?: boolean
  onAssign: (teamId: string) => void
  actions: ReturnType<typeof useDemo>['actions']
  nav: ReturnType<typeof useNavigate>
}) {
  const c = customerById(s.customerId)
  const candidates = DISPATCH_CANDIDATES[s.id]
  const dispatchAction = actions.find((a) => a.id === 'A-08')
  const riskAction = s.id === 'SC-14' ? actions.find((a) => a.id === 'A-01') : undefined
  if (!c) return null

  const Wrap = wide ? Card : 'div'
  return (
    <div className="space-y-4">
      <Wrap className={cx('space-y-4', wide && 'p-5')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {wide && <p className="text-[1.3rem] font-extrabold leading-tight">{c.name}</p>}
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.85rem] text-ink-soft"><MapPin size={14} className="shrink-0" /> {c.address}</p>
          </div>
          <StatusPill status={s.teamId ? s.status : '확인필요'} />
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['방문시간', `${s.dayOffset > 0 ? dateWithOffset(s.dayOffset) + ' ' : ''}${s.time}`],
            ['서비스', s.service],
            ['예상 작업', `${s.durationMin}분`],
            ['담당팀', s.teamId ? teamById(s.teamId)?.name ?? '-' : '미배정'],
          ].map(([l, v]) => (
            <div key={l} className="min-w-0 rounded-xl bg-ivory px-3 py-2.5">
              <dt className="text-[0.74rem] font-bold text-ink-faint">{l}</dt>
              <dd className={cx('mt-0.5 break-keep text-[0.9rem] font-extrabold leading-tight', v === '미배정' && 'text-warning')}>{v}</dd>
            </div>
          ))}
        </dl>
        {s.teamId && <p className="text-[0.82rem] text-ink-soft">팀원 — {teamMemberNames(s.teamId)} · 예상 이동 {s.travelMin}분</p>}

        {s.risk && (
          <div className="rounded-xl bg-danger-soft p-4">
            <p className="flex items-center gap-1.5 text-[0.92rem] font-extrabold text-danger"><AlertTriangle size={15} /> {s.risk.type} 위험</p>
            <p className="mt-1 text-[0.86rem] leading-relaxed text-ink">{s.risk.detail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {riskAction && <ActionLifecycle actionId={riskAction.id} status={riskAction.status} compact />}
              <WhyAIButton dataViewed={['오늘 일정', '팀별 진행상황', '작업 예상시간', '현장 간 이동시간']} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-3.5">
          <Btn variant="outline" size="sm" onClick={() => nav(`/sites/${c.id}`)}>현장 상세 <ArrowRight size={13} className="inline" /></Btn>
          <Btn variant="outline" size="sm" onClick={() => nav(`/customers/${c.id}`)}>고객 상세 <ArrowRight size={13} className="inline" /></Btn>
        </div>
      </Wrap>

      {/* AI 스마트 배정 */}
      {(!s.teamId && candidates) || (s.teamId && candidates) ? (
        <Card tour={wide ? 'dispatch' : undefined} className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-ai-soft px-4 py-3">
            <p className="flex items-center gap-1.5 text-[0.95rem] font-extrabold text-ai-strong"><Sparkles size={16} /> AI 스마트 배정</p>
            <AIReadyBadge small />
          </div>
          <div className="space-y-2.5 p-4">
            {!s.teamId ? (
              <>
                <p className="text-[0.84rem] font-semibold text-ink-soft">이동시간 · 숙련도 · 일정 여유를 비교한 추천 순위입니다. 최종 결정은 담당자가 합니다.</p>
                {candidates!.map((cand) => {
                  const t = teamById(cand.teamId)
                  const top = cand.rank === 1
                  return (
                    <div key={cand.teamId} className={cx('rounded-xl border p-3.5', top ? 'border-ai bg-ai-soft/50' : 'border-line')}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[0.95rem] font-extrabold">{cand.rank}순위 · {t?.name}</p>
                        <span className={cx('tnum text-[0.86rem] font-extrabold', top ? 'text-ai-strong' : 'text-ink-soft')}>적합도 {cand.fitPct}%</span>
                      </div>
                      <p className="mt-0.5 text-[0.8rem] text-ink-faint">{teamMemberNames(cand.teamId)} · 이동 {cand.travelMin}분 · 이후 여유 {cand.slackMin}분</p>
                      {top && (
                        <>
                          <ul className="mt-2 space-y-0.5">
                            {cand.reasons.map((r) => <li key={r} className="flex gap-1.5 text-[0.82rem] text-ink-soft"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ai" />{r}</li>)}
                          </ul>
                          <Btn variant="ai" className="mt-3 w-full py-2.5" onClick={() => onAssign(cand.teamId)}>
                            <CheckCircle2 size={16} className="mr-1 inline" /> {t?.name} 배정하기
                          </Btn>
                        </>
                      )}
                      {!top && (
                        <button onClick={() => onAssign(cand.teamId)} className="mt-2 text-[0.8rem] font-bold text-ink-soft underline-offset-2 hover:text-primary hover:underline">
                          이 팀으로 배정
                        </button>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="rounded-xl bg-success-soft p-3.5 text-[0.88rem] font-bold text-success">
                <CheckCircle2 size={16} className="mr-1 inline" /> 배정 완료 — {teamById(s.teamId)?.name}
                {dispatchAction && <div className="mt-2"><ActionLifecycle actionId="A-08" status={dispatchAction.status} compact /></div>}
              </div>
            )}
            <WhyAIButton dataViewed={['현장 위치·방문시간', '서비스 종류·예상 작업시간', '직원 현재 일정', '직원별 숙련서비스', '팀 구성·예상 이동시간', '고객 중요도']} />
          </div>
        </Card>
      ) : null}
    </div>
  )
}
