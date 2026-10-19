import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarCheck, ChevronDown, FileText, MessageCircle, PlusCircle, RefreshCcw, Siren } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import RequestSheet, { type RequestPreset } from './RequestSheet'
import { EmptyState, StatusPill } from '../../components/ui'
import { Stepper } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { teamById } from '../../lib/demo/company'
import { cx, dateWithOffset } from '../../lib/utils'
import type { CustomerRequest, RequestType } from '../../types'

const STEPS = [{ label: '접수' }, { label: '담당 배정' }, { label: '처리 중' }, { label: '완료' }]
const stepOf = (r: CustomerRequest) => ({ 접수: 1, 검토중: 2, 처리중: 3, 완료: 4, 반려: 1 }[r.status])

const TYPES: Array<{ type: RequestType; label: string; icon: ReactNode; tile: string }> = [
  { type: '추가서비스', label: '추가서비스', icon: <PlusCircle size={20} />, tile: 'bg-mint text-primary' },
  { type: '일정변경', label: '일정 변경', icon: <RefreshCcw size={20} />, tile: 'bg-warning-soft text-warning' },
  { type: '긴급방문', label: '긴급 방문', icon: <Siren size={20} />, tile: 'bg-danger-soft text-danger' },
  { type: '문의', label: '담당자 문의', icon: <MessageCircle size={20} />, tile: 'bg-info-soft text-info' },
]
const typeMeta = (t: RequestType) => TYPES.find((x) => x.type === t)!

/** 고객 요청 — 주문 내역처럼: 무엇을 · 누가 맡아 · 어디까지 · 언제 방문 · 어떤 회신 (본사 처리 기록과 같은 원본) */
export default function CareRequests() {
  const { requests } = useDemo()
  const [sheet, setSheet] = useState<RequestType | null>(null)
  const [preset, setPreset] = useState<RequestPreset | undefined>(undefined)
  // 다른 화면(서비스 소개 등)에서 "상담 요청"으로 들어오면 요청 폼을 바로 연다 — 한 번 더 누를 필요 없이
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    const t = params.get('new') as RequestType | null
    if (!t || !['추가서비스', '일정변경', '긴급방문', '문의'].includes(t)) return
    setPreset({ topic: (params.get('topic') as RequestPreset['topic']) ?? undefined, memo: params.get('memo') ?? undefined })
    setSheet(t)
    setParams({}, { replace: true })
  }, [params, setParams])
  const [filter, setFilter] = useState<'진행' | '완료'>('진행')
  const mine = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)
  const open = mine.filter((r) => r.status !== '완료' && r.status !== '반려')
  const done = mine.filter((r) => r.status === '완료' || r.status === '반려')
  const list = filter === '진행' ? open : done

  return (
    <CareShell>
      <div className="fade-up space-y-6">
        <header>
          <h1 className="text-[1.45rem] font-extrabold sm:text-[1.6rem]">요청 · 문의</h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">보내신 요청을 누가 맡아 어디까지 처리했는지 실시간으로 확인할 수 있습니다.</p>
        </header>

        {/* 새 요청 — 홈으로 돌아가지 않고 여기서 바로 */}
        <section aria-label="새 요청">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setSheet(t.type)}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-card px-1 py-3.5 shadow-soft ring-1 ring-line/60 transition-all hover:-translate-y-0.5 hover:ring-primary/40"
              >
                <span className={cx('flex h-10 w-10 items-center justify-center rounded-2xl', t.tile)}>{t.icon}</span>
                <span className="text-[0.8rem] font-bold leading-tight sm:text-[0.86rem]">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="내 요청">
          <div role="tablist" aria-label="요청 상태" className="mb-3 inline-flex rounded-full bg-neutral-soft p-1">
            {(['진행', '완료'] as const).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.86rem] font-bold transition-all',
                filter === f ? 'bg-card text-ink shadow-[0_1px_3px_rgba(8,52,58,0.12)]' : 'text-ink-faint hover:text-ink',
              )}>
                {f === '진행' ? '진행 중' : '완료 · 종료'}
                <span className={cx('tnum text-[0.76rem]', filter === f ? 'text-primary' : 'text-ink-faint')}>{f === '진행' ? open.length : done.length}</span>
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <EmptyState
              title={filter === '진행' ? '처리 중인 요청이 없습니다.' : '완료된 요청이 없습니다.'}
              desc={filter === '진행' ? '위의 버튼으로 필요한 요청을 보내주세요.' : undefined}
            />
          ) : (
            <div className="space-y-3">
              {list.map((r) => <RequestCard key={r.id} r={r} />)}
            </div>
          )}
        </section>

        <p className="text-center text-[0.76rem] leading-relaxed text-ink-faint">
          요청은 클린웨이 운영센터에 실시간 접수되고, 담당자가 처리한 기록이 이 화면에 그대로 표시됩니다.
        </p>
      </div>
      <RequestSheet type={sheet} preset={preset} onClose={() => { setSheet(null); setPreset(undefined) }} />
    </CareShell>
  )
}

function RequestCard({ r }: { r: CustomerRequest }) {
  const { schedules, reports } = useDemo()
  const nav = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const meta = typeMeta(r.type)
  const sc = r.scheduleId ? schedules.find((s) => s.id === r.scheduleId) : undefined
  const report = reports.find((x) => x.requestId === r.id)
  const visible = (r.history ?? []).filter((h) => h.visible)
  const manager = r.assignee?.replace(' 운영관리자', ' 매니저')

  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-line/60">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', meta.tile)}>{meta.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.82rem] font-bold text-ink-soft">{meta.label}</p>
              <StatusPill status={r.status} />
            </div>
            <p className="tnum text-[0.74rem] text-ink-faint">{r.id} · 접수 {r.createdAt}</p>
          </div>
        </div>
        <p className="mt-3 text-[0.98rem] font-bold leading-relaxed [overflow-wrap:anywhere]">{r.detail}</p>

        <div className="mt-4">
          <Stepper steps={STEPS} current={stepOf(r)} branch={r.status === '반려' ? { label: '처리 불가 안내', tone: 'danger' } : undefined} />
        </div>

        {(manager || sc) && (
          <dl className="mt-4 space-y-2 text-[0.86rem]">
            {manager && (
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint text-[0.76rem] font-extrabold text-primary-strong" aria-hidden="true">{manager.slice(0, 1)}</span>
                <dt className="text-ink-faint">담당</dt><dd className="font-bold text-ink">{manager}</dd>
              </div>
            )}
            {sc && (
              <div className="flex items-center gap-2.5 rounded-xl bg-mint/60 px-3 py-2 font-bold text-primary-strong">
                <CalendarCheck size={16} className="shrink-0" />
                <dt className="sr-only">방문</dt>
                <dd>방문 {sc.dayOffset === 0 ? '오늘' : dateWithOffset(sc.dayOffset)} {sc.time} · {sc.teamId ? `${teamById(sc.teamId)?.name} 배정` : '담당팀 배정 중'}{sc.status === '완료' ? ' · 작업 완료' : ''}</dd>
              </div>
            )}
          </dl>
        )}

        {/* 회신 — 대화 말풍선처럼, 누가 보냈는지 분명하게 */}
        {r.reply && (
          <div className="mt-3 flex gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-shell text-[0.62rem] font-extrabold tracking-wide text-champagne" aria-hidden="true">CW</span>
            <p className={cx('min-w-0 flex-1 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[0.86rem] leading-relaxed', r.status === '반려' ? 'bg-danger-soft/70' : 'bg-ivory')}>
              <b className="block text-[0.76rem] text-ink-faint">클린웨이 회신</b>
              {r.reply}
            </p>
          </div>
        )}
      </div>

      {(report || visible.length > 0) && (
        <div className="border-t border-line/70 px-4 py-2.5 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {visible.length > 0 && (
              <button onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="flex items-center gap-1 py-1 text-[0.82rem] font-bold text-ink-soft hover:text-primary">
                <ChevronDown size={15} className={cx('transition-transform', showAll && 'rotate-180')} /> 진행 기록 {visible.length}
              </button>
            )}
            {report && (
              <button onClick={() => nav(`/care/reports?id=${report.id}`)} className="ml-auto flex min-h-[2.25rem] items-center gap-1.5 rounded-full bg-primary px-4 text-[0.84rem] font-bold text-white hover:bg-primary-strong">
                <FileText size={14} /> 작업 리포트 보기
              </button>
            )}
          </div>
          {showAll && (
            <ol className="fade-up mb-1 mt-2 space-y-2 border-l-2 border-line pl-3.5">
              {visible.map((h, i) => (
                <li key={i} className="relative text-[0.82rem]">
                  <span className="absolute -left-[1.18rem] top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" aria-hidden="true" />
                  <span className="tnum font-bold text-ink-faint">{h.at}</span> <span className="text-ink">{h.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  )
}
