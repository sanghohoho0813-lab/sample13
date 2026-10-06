import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star, X } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, StatusPill, EmptyState } from '../../components/ui'
import { CUSTOMERS } from '../../lib/demo/company'
import { SEED_HEALTH } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

const TYPES = ['전체', '병의원', '사무실', '학원', '상가', '빌딩', '프랜차이즈']

export default function Customers() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('전체')
  // 검색은 공백·대소문자 무시 — "강남c" 로 쳐도 "강남 C클리닉"을 찾는다
  const norm = (v: string) => v.replace(/\s+/g, '').toLowerCase()
  const nq = norm(q)
  const list = CUSTOMERS.filter((c) =>
    (type === '전체' || c.type === type) &&
    (nq === '' || [c.name, c.district, c.contract.serviceSummary].some((f) => norm(f).includes(nq))),
  )
  const reset = () => { setQ(''); setType('전체') }

  return (
    <div className="fade-up">
      <PageHeader title="고객 / 계약" desc="정기관리 고객사 76곳 중 대표 12곳 표시 (DEMO). 고객 건강도로 상태를 관리합니다." right={<DemoBadge />} />

      <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-80">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="고객사 · 지역 · 서비스 검색"
            aria-label="고객 검색"
            className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-10 text-[0.92rem] font-semibold outline-none focus:border-primary [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="검색어 지우기" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:bg-ivory">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={cx(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[0.84rem] font-bold',
              type === t ? 'border-primary bg-primary text-white' : 'border-line bg-card text-ink-soft hover:border-primary',
            )}>{t}</button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-[0.84rem] font-bold text-ink-faint">
        {list.length}곳 {(q || type !== '전체') && <button onClick={reset} className="ml-1.5 text-primary hover:underline">조건 초기화</button>}
      </p>

      {list.length === 0 ? (
        <EmptyState
          title={`'${q || type}'에 해당하는 고객이 없습니다.`}
          desc="고객사 이름, 지역(예: 강남구), 서비스(예: 병의원)로 찾을 수 있습니다."
          action={<button onClick={reset} className="rounded-xl border border-line px-4 py-2 text-[0.86rem] font-bold hover:border-primary">조건 초기화</button>}
        />
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
                <p className="mt-3 flex items-center gap-1 text-[0.82rem] font-bold text-primary">고객 상세 <ArrowRight size={13} /></p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
