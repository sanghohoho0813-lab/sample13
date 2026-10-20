import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, ChevronRight } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, SectionTitle, StatTile } from '../../components/ui'
import { CUSTOMERS, customerById } from '../../lib/demo/company'
import { SEED_QUALITY } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

type IssueFilter = '미해결' | '해결' | '전체'
const ISSUE_MATCH: Record<IssueFilter, (status: string) => boolean> = { 미해결: (st) => st !== '해결', 해결: (st) => st === '해결', 전체: () => true }

export default function Quality() {
  const nav = useNavigate()
  const avg = CUSTOMERS.reduce((a, c) => a + c.satisfaction, 0) / CUSTOMERS.length
  // 처음에는 손댈 것(미해결)만 — 없으면 전체
  const [filter, setFilter] = useState<IssueFilter>(() => (SEED_QUALITY.some((q) => q.status !== '해결') ? '미해결' : '전체'))
  const issues = SEED_QUALITY.filter((q) => ISSUE_MATCH[filter](q.status)).sort((a, b) => Number(a.status === '해결') - Number(b.status === '해결'))

  return (
    <div className="fade-up">
      <PageHeader title="품질 / 만족도" desc="현장 품질 이슈와 고객 만족도를 추적하여 재계약 관리에 연결합니다." right={<DemoBadge />} />

      <div className="mb-5 grid grid-cols-3 gap-2.5 sm:max-w-lg sm:gap-3">
        <StatTile label="평균 만족도" value={avg.toFixed(1)} tone="warning" icon={<Star size={19} fill="currentColor" />} />
        <StatTile label="미해결 이슈" value={`${SEED_QUALITY.filter((q) => q.status !== '해결').length}건`} tone="danger" />
        <StatTile label="이번 달 처리" value={`${SEED_QUALITY.filter((q) => q.status === '해결').length}건`} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle
            right={
              <div role="tablist" aria-label="이슈 상태" className="flex gap-0.5 rounded-lg border border-line bg-ivory/60 p-0.5">
                {(Object.keys(ISSUE_MATCH) as IssueFilter[]).map((f) => (
                  <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx('rounded-md px-2.5 py-1 text-[0.76rem] font-bold', filter === f ? 'bg-card text-ink shadow-card' : 'text-ink-faint hover:text-ink')}>
                    {f} <span className="tnum">{SEED_QUALITY.filter((q) => ISSUE_MATCH[f](q.status)).length}</span>
                  </button>
                ))}
              </div>
            }
          >
            품질 이슈 이력
          </SectionTitle>
          <ul className="-mx-2 divide-y divide-line/70">
            {issues.map((q) => (
              <li key={q.id}>
                <button onClick={() => nav(`/customers/${q.customerId}`)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-mint/40">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[0.92rem] font-extrabold">{customerById(q.customerId)?.name}</span>
                      <span className="shrink-0 text-[0.72rem] font-bold text-ink-faint">{q.date}</span>
                    </span>
                    <span className="mt-0.5 block text-[0.82rem] text-ink-soft"><b className="font-bold text-ink">{q.category}</b> · {q.detail}</span>
                  </span>
                  <Badge tone={q.status === '해결' ? 'success' : q.status === '조치중' ? 'info' : 'warning'}>{q.status}</Badge>
                  <ChevronRight size={15} className="shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
          {issues.length === 0 && <p className="py-6 text-center text-[0.86rem] text-ink-faint">'{filter}' 이슈가 없습니다.</p>}
        </Card>

        <Card className="p-5">
          <SectionTitle right={<span className="flex items-center gap-1.5 text-[0.72rem] font-bold text-ink-faint"><span className="h-3 w-px bg-ink/35" aria-hidden="true" />평균 {avg.toFixed(1)}</span>}>고객별 만족도</SectionTitle>
          <div className="space-y-2">
            {[...CUSTOMERS].sort((a, b) => a.satisfaction - b.satisfaction).map((c) => (
              <button key={c.id} onClick={() => nav(`/customers/${c.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-mint/40">
                <span className="w-36 truncate text-left text-[0.84rem] font-bold">{c.name}</span>
                <div className="relative h-2 flex-1 rounded-full bg-ivory">
                  <div className={`h-full rounded-full ${c.satisfaction >= 4.5 ? 'bg-success' : c.satisfaction >= 4.1 ? 'bg-aqua' : 'bg-danger'}`} style={{ width: `${(c.satisfaction / 5) * 100}%` }} />
                  {/* 평균선 — 평균보다 낮은 고객이 바로 보이게 */}
                  <span className="absolute -inset-y-1 w-px bg-ink/35" style={{ left: `${(avg / 5) * 100}%` }} aria-hidden="true" />
                </div>
                <span className="tnum w-9 text-right text-[0.84rem] font-extrabold">{c.satisfaction.toFixed(1)}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[0.76rem] text-ink-faint"><ShieldCheck size={13} /> 만족도가 하락한 고객은 AI 재계약 관리 대상에 자동 포함됩니다.</p>
        </Card>
      </div>
    </div>
  )
}
