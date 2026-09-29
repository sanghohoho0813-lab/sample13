import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, StatusPill, EmptyState } from '../../components/ui'
import { CUSTOMERS } from '../../lib/demo/company'
import { SEED_HEALTH } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

const TYPES = ['전체', '병의원', '사무실', '학원', '상가', '빌딩', '프랜차이즈']

export default function Customers() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('전체')
  const list = CUSTOMERS.filter((c) =>
    (type === '전체' || c.type === type) &&
    (q.trim() === '' || c.name.includes(q.trim()) || c.district.includes(q.trim())),
  )

  return (
    <div className="fade-up">
      <PageHeader title="고객 / 계약" desc="정기관리 고객사 76곳 중 대표 12곳 표시 (DEMO). 고객 건강도로 상태를 관리합니다." right={<DemoBadge />} />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="고객사, 지역 검색"
            className="w-64 rounded-xl border border-line bg-card py-2 pl-9 pr-3 text-[0.88rem] font-semibold outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cx(
              'rounded-full border px-3 py-1.5 text-[0.78rem] font-bold',
              type === t ? 'border-primary bg-primary text-white' : 'border-line bg-card text-ink-soft hover:border-primary',
            )}>{t}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="검색 결과가 없습니다." desc="다른 키워드나 필터로 다시 시도해보세요." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const h = SEED_HEALTH.find((x) => x.customerId === c.id)
            return (
              <Card key={c.id} onClick={() => nav(`/customers/${c.id}`)} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[1.08rem] font-extrabold">{c.name}</p>
                    <p className="text-[0.76rem] text-ink-faint">{c.district} · {c.type}</p>
                  </div>
                  {h && <StatusPill status={h.aiStatus} />}
                </div>
                <p className="mt-2 text-[0.84rem] font-semibold text-ink-soft">{c.contract.serviceSummary}</p>
                <div className="mt-3 flex items-center justify-between text-[0.82rem]">
                  <span className="tnum font-extrabold text-primary">{c.contract.monthlyFee}만원/월</span>
                  <span className="flex items-center gap-1 font-bold text-warning"><Star size={13} fill="currentColor" /> {c.satisfaction.toFixed(1)}</span>
                  <Badge tone={c.contract.renewalDDay <= 30 ? 'danger' : c.contract.renewalDDay <= 60 ? 'warning' : 'neutral'}>갱신 D-{c.contract.renewalDDay}</Badge>
                </div>
                {h && (
                  <div className="mt-3 border-t border-line pt-2.5">
                    <div className="flex items-center justify-between text-[0.76rem] font-bold">
                      <span className="text-ink-faint">고객 건강도</span>
                      <span className={cx('tnum', h.score >= 80 ? 'text-success' : h.score >= 65 ? 'text-warning' : 'text-danger')}>{h.score} / 100</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-ivory">
                      <div className={cx('h-full rounded-full', h.score >= 80 ? 'bg-success' : h.score >= 65 ? 'bg-warning' : 'bg-danger')} style={{ width: `${h.score}%` }} />
                    </div>
                  </div>
                )}
                <p className="mt-3 flex items-center gap-1 text-[0.78rem] font-bold text-primary">고객 Detail <ArrowRight size={12} /></p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
