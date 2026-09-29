import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import { Card, PageHeader, DemoBadge, StatusPill, Badge, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById, teamById } from '../../lib/demo/company'
import { cx } from '../../lib/utils'
import type { ScheduleStatus } from '../../types'

const FILTERS: Array<ScheduleStatus | '전체'> = ['전체', '예정', '이동중', '작업중', '완료', '확인필요']

export default function Work() {
  const { schedules, reports } = useDemo()
  const nav = useNavigate()
  const [filter, setFilter] = useState<ScheduleStatus | '전체'>('전체')
  const today = schedules
    .filter((s) => s.dayOffset === 0)
    .filter((s) => filter === '전체' || s.status === filter)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="fade-up">
      <PageHeader title="작업현황" desc="오늘 전 현장의 작업 진행상태와 작업 리포트를 확인합니다." right={<DemoBadge />} />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cx(
            'rounded-full px-3.5 py-1.5 text-[0.8rem] font-bold border',
            filter === f ? 'border-primary bg-primary text-white' : 'border-line bg-card text-ink-soft hover:border-primary',
          )}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[0.85rem]">
              <thead>
                <tr className="border-b border-line bg-ivory text-[0.74rem] text-ink-faint">
                  {['시간', '고객 / 현장', '서비스', '담당팀', '상태'].map((h) => <th key={h} className="px-4 py-2.5 font-bold whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {today.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-faint">해당 상태의 작업이 없습니다.</td></tr>
                )}
                {today.map((s) => (
                  <tr key={s.id} onClick={() => nav(`/sites/${s.customerId}`)} className="cursor-pointer border-b border-line/60 hover:bg-mint/30">
                    <td className="tnum px-4 py-3 font-extrabold text-primary whitespace-nowrap">{s.time}</td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap">{customerById(s.customerId)?.name}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{s.service}</td>
                    <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{teamById(s.teamId)?.name ?? <Badge tone="warning">미배정</Badge>}</td>
                    <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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
