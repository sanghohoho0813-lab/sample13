import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarCheck, ChevronDown, FileText, MessageCircle, PlusCircle, RefreshCcw, Siren } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import RequestSheet, { type RequestPreset } from './RequestSheet'
import { Badge, Btn, Card, EmptyState } from '../../components/ui'
import { Stepper } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { teamById } from '../../lib/demo/company'
import { cx, dateWithOffset } from '../../lib/utils'
import type { CustomerRequest, RequestType } from '../../types'

const STEPS = [{ label: '접수' }, { label: '담당 배정' }, { label: '처리 중' }, { label: '완료' }]
const stepOf = (r: CustomerRequest) => ({ 접수: 1, 검토중: 2, 처리중: 3, 완료: 4, 반려: 1 }[r.status])
const TYPE_TONE = { 긴급방문: 'danger', 추가서비스: 'success', 일정변경: 'warning', 문의: 'info' } as const

/** 고객 요청 — 보낸 요청이 지금 누구 손에서 어디까지 왔는지 (본사 처리 기록과 같은 원본) */
export default function CareRequests() {
  const { requests, schedules, reports } = useDemo()
  const nav = useNavigate()
  const [sheet, setSheet] = useState<RequestType | null>(null)
  const [preset, setPreset] = useState<RequestPreset | undefined>(undefined)
  const [openHistory, setOpenHistory] = useState<string | null>(null)
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
      <div className="fade-up space-y-5">
        <div>
          <h1 className="text-[1.5rem] font-extrabold">요청 · 문의</h1>
          <p className="mt-1 text-[0.9rem] text-ink-soft">보내신 요청을 누가 맡아 어디까지 처리했는지 실시간으로 확인할 수 있습니다.</p>
        </div>

        {/* 새 요청 — 홈으로 돌아가지 않고 여기서 바로 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ['추가서비스', '추가서비스', <PlusCircle key="i" size={17} />],
            ['일정변경', '일정 변경', <RefreshCcw key="i" size={17} />],
            ['긴급방문', '긴급 방문', <Siren key="i" size={17} />],
            ['문의', '담당자 문의', <MessageCircle key="i" size={17} />],
          ] as Array<[RequestType, string, React.ReactNode]>).map(([t, label, icon]) => (
            <button key={t} onClick={() => setSheet(t)} className={cx(
              'flex items-center justify-center gap-1.5 rounded-xl border bg-card px-3 py-3 text-[0.88rem] font-bold transition-colors',
              t === '긴급방문' ? 'border-danger/30 text-danger hover:border-danger' : 'border-line text-ink hover:border-primary hover:text-primary',
            )}>
              {icon}{label}
            </button>
          ))}
        </div>

        <div role="tablist" aria-label="요청 상태" className="flex w-fit gap-1 rounded-xl border border-line bg-card p-1">
          {(['진행', '완료'] as const).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
              'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.88rem] font-bold',
              filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary',
            )}>
              {f === '진행' ? '진행 중' : '완료 · 종료'}
              <span className={cx('tnum text-[0.76rem]', filter === f ? 'text-white/80' : 'text-ink-faint')}>{f === '진행' ? open.length : done.length}</span>
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
            {list.map((r) => {
              const sc = r.scheduleId ? schedules.find((s) => s.id === r.scheduleId) : undefined
              const report = reports.find((x) => x.requestId === r.id)
              const visible = (r.history ?? []).filter((h) => h.visible)
              const showAll = openHistory === r.id
              return (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
                    <span className="tnum text-[0.78rem] font-bold text-ink-faint">접수 {r.createdAt} · {r.id}</span>
                  </div>
                  <p className="mt-2 text-[0.96rem] font-bold leading-relaxed [overflow-wrap:anywhere]">{r.detail}</p>
                  <div className="mt-3.5">
                    <Stepper steps={STEPS} current={stepOf(r)} branch={r.status === '반려' ? { label: '처리 불가 안내', tone: 'danger' } : undefined} />
                  </div>
                  {r.assignee && <p className="mt-3 text-[0.84rem] text-ink-soft">담당 <b className="text-ink">{r.assignee.replace(' 운영관리자', ' 매니저')}</b></p>}
                  {sc && (
                    <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-mint/60 px-3.5 py-2.5 text-[0.86rem] font-bold text-primary-strong">
                      <CalendarCheck size={15} className="shrink-0" />
                      방문 {sc.dayOffset === 0 ? '오늘' : dateWithOffset(sc.dayOffset)} {sc.time} · {sc.teamId ? `${teamById(sc.teamId)?.name} 배정` : '담당팀 배정 중'}{sc.status === '완료' ? ' · 작업 완료' : ''}
                    </p>
                  )}
                  {r.reply && <p className={cx('mt-2 rounded-xl px-3.5 py-2.5 text-[0.86rem] leading-relaxed', r.status === '반려' ? 'bg-danger-soft/60' : 'bg-ivory')}><b>클린웨이 회신</b> — {r.reply}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {report && <Btn size="sm" onClick={() => nav(`/care/reports?id=${report.id}`)}><FileText size={13} className="mr-1 inline" />작업 리포트 보기</Btn>}
                    {visible.length > 0 && (
                      <button onClick={() => setOpenHistory(showAll ? null : r.id)} aria-expanded={showAll} className="flex items-center gap-1 text-[0.8rem] font-bold text-ink-soft hover:text-primary">
                        <ChevronDown size={14} className={cx('transition-transform', showAll && 'rotate-180')} /> 진행 기록 {visible.length}
                      </button>
                    )}
                  </div>
                  {showAll && (
                    <ol className="mt-2.5 space-y-1.5 border-l border-line pl-3.5">
                      {visible.map((h, i) => (
                        <li key={i} className="text-[0.82rem]"><span className="tnum font-bold text-ink-faint">{h.at}</span> {h.text}</li>
                      ))}
                    </ol>
                  )}
                </Card>
              )
            })}
          </div>
        )}
        <p className="text-center text-[0.78rem] leading-relaxed text-ink-faint">
          요청은 클린웨이 운영센터에 실시간 접수되고, 담당자가 처리한 기록이 이 화면에 그대로 표시됩니다.
        </p>
      </div>
      <RequestSheet type={sheet} preset={preset} onClose={() => { setSheet(null); setPreset(undefined) }} />
    </CareShell>
  )
}
