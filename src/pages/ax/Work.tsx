import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight, ChevronRight } from 'lucide-react'
import { Card, PageHeader, DemoBadge, StatusPill, StatusText, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById, teamById } from '../../lib/demo/company'
import { cx } from '../../lib/utils'
import type { ScheduleStatus } from '../../types'

const FILTERS: Array<ScheduleStatus | '전체'> = ['전체', '예정', '이동중', '작업중', '완료', '확인필요']

export default function Work() {
  const { schedules, reports } = useDemo()
  const nav = useNavigate()
  const [filter, setFilter] = useState<ScheduleStatus | '전체'>('전체')
  const all = schedules.filter((s) => s.dayOffset === 0)
  const count = (f: ScheduleStatus | '전체') => (f === '전체' ? all.length : all.filter((s) => s.status === f).length)
  const today = all
    .filter((s) => filter === '전체' || s.status === filter)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="fade-up">
      <PageHeader title="작업현황" desc="오늘 전 현장의 작업 진행상태와 작업 리포트를 확인합니다." right={<DemoBadge />} />

      {/* 상태 필터 — 건수를 함께 보여 어디에 몇 건이 있는지 바로 알 수 있게 */}
      <div className="mb-4">
        <div role="tablist" aria-label="작업 상태" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-card p-1 sm:flex sm:w-max">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
              'flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[0.86rem] font-bold sm:gap-1.5 sm:px-3.5',
              filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary',
            )}>
              {f}
              <span className={cx('tnum text-[0.74rem]', filter === f ? 'text-white/85' : f === '확인필요' && count(f) > 0 ? 'text-danger' : 'text-ink-faint')}>{count(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* 표 대신 목록 행 — 좁은 화면에서도 상태가 화면 밖으로 밀려나지 않는다 (일정/배정과 같은 행 구조) */}
        <div className="space-y-1.5">
          {today.length === 0 ? (
            <EmptyState
              title={`'${filter}' 상태인 작업이 없습니다.`}
              action={<button onClick={() => setFilter('전체')} className="rounded-xl border border-line px-4 py-2 text-[0.86rem] font-bold hover:border-primary">전체 작업 보기</button>}
            />
          ) : today.map((s) => {
            const team = teamById(s.teamId)?.name
            return (
              <button
                key={s.id}
                onClick={() => nav(`/sites/${s.customerId}`)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5 text-left transition-colors hover:border-primary/60"
              >
                <span className="tnum w-[2.9rem] shrink-0 text-[0.95rem] font-extrabold text-primary">{s.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.93rem] font-bold leading-snug">{customerById(s.customerId)?.name}</span>
                  <span className="block truncate text-[0.78rem] text-ink-faint">
                    <StatusText status={s.status} className="min-[400px]:hidden" />
                    {!team && <span className="font-bold text-warning">미배정 · </span>}
                    {`${s.service}${team ? ` · ${team}` : ''}`}
                  </span>
                </span>
                <span className="hidden shrink-0 min-[400px]:block"><StatusPill status={s.status} /></span>
                <ChevronRight size={16} className="shrink-0 text-ink-faint" />
              </button>
            )
          })}
        </div>

        <div>
          <h2 className="mb-3 text-[1.05rem] font-bold">최근 작업 리포트</h2>
          {reports.length === 0 ? (
            <EmptyState title="생성된 리포트가 없습니다." />
          ) : (
            <div className="space-y-2.5">
              {reports.slice(0, 6).map((r) => (
                <Card key={r.id} onClick={() => nav(`/sites/${r.customerId}`)} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-1.5 text-[0.9rem] font-extrabold"><FileText size={15} className="shrink-0 text-primary" /><span className="truncate">{customerById(r.customerId)?.name}</span></p>
                    <span className="tnum shrink-0 text-[0.72rem] font-bold text-ink-faint">{r.date} {r.completedAt}</span>
                  </div>
                  <p className="mt-1 text-[0.78rem] text-ink-soft">{r.team} · 작업항목 {r.itemsDone}/{r.itemsTotal}</p>
                  <p className="mt-1 truncate text-[0.78rem] text-ink-faint">{r.note}</p>
                  {r.nextRecommend && <p className="mt-1.5 flex items-center gap-1 text-[0.76rem] font-bold text-primary">{r.nextRecommend} <ArrowRight size={12} /></p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
