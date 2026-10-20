import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Star, X, LayoutGrid, Rows3, ChevronRight } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, StatusPill, EmptyState } from '../../components/ui'
import { CUSTOMERS } from '../../lib/demo/company'
import { useDemo } from '../../lib/data/context'
import { assessRenewal } from '../../lib/ops/renewal'
import { cx } from '../../lib/utils'
import { matchesQuery } from '../../lib/search'

const TYPES = ['전체', '병의원', '사무실', '학원', '상가', '빌딩', '프랜차이즈']

type Sort = 'base' | 'health' | 'renewal' | 'fee'
const SORTS: Array<[Sort, string]> = [['base', '기본 순'], ['health', '건강도 낮은 순'], ['renewal', '갱신 임박 순'], ['fee', '월 금액 높은 순']]

// 카드 · 표 보기 — 보는 사람 브라우저에만 기억하는 편의 설정 (없거나 막혀 있어도 카드로 동작)
type View = 'card' | 'table'
const VIEW_KEY = 'cleanway.customersView'
const readView = (): View => { try { return localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'card' } catch { return 'card' } }
const healthText = (n: number) => (n >= 80 ? 'text-success' : n >= 60 ? 'text-warning' : 'text-danger')
const healthBar = (n: number) => (n >= 80 ? 'bg-success' : n >= 60 ? 'bg-warning' : 'bg-danger')
const ddayTone = (d: number) => (d <= 30 ? 'danger' : d <= 60 ? 'warning' : 'neutral') as 'danger' | 'warning' | 'neutral'

export default function Customers() {
  const nav = useNavigate()
  const st = useDemo()
  const [q, setQ] = useState('')
  const [type, setType] = useState('전체')
  const [sort, setSort] = useState<Sort>('base')
  const [view, setViewState] = useState<View>(readView)
  const setView = (v: View) => { setViewState(v); try { localStorage.setItem(VIEW_KEY, v) } catch { /* 저장이 막혀도 보기 전환은 된다 */ } }
  // 상세 · 재계약 화면과 같은 5요인 계산 — 목록과 상세의 숫자가 다르지 않게
  const health = useMemo(() => new Map(CUSTOMERS.map((c) => [c.id, assessRenewal(c.id, st)])), [st])
  const list = CUSTOMERS.filter((c) =>
    (type === '전체' || c.type === type) && matchesQuery([c.name, c.district, c.contract.serviceSummary], q),
  )
  if (sort === 'health') list.sort((a, b) => (health.get(a.id)?.health ?? 101) - (health.get(b.id)?.health ?? 101))
  else if (sort === 'renewal') list.sort((a, b) => a.contract.renewalDDay - b.contract.renewalDDay)
  else if (sort === 'fee') list.sort((a, b) => b.contract.monthlyFee - a.contract.monthlyFee)
  const reset = () => { setQ(''); setType('전체'); setSort('base') }

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.84rem] font-bold text-ink-faint">
          {list.length}곳 {(q || type !== '전체' || sort !== 'base') && <button onClick={reset} className="ml-1.5 text-primary hover:underline">조건 초기화</button>}
        </p>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[0.8rem] font-bold text-ink-faint">
            정렬
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-line bg-card px-2 py-1.5 text-[0.82rem] font-bold text-ink outline-none focus:border-primary"
            >
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <div role="group" aria-label="보기 방식" className="hidden gap-0.5 rounded-lg border border-line bg-card p-0.5 xl:flex">
            {([['card', '카드', <LayoutGrid key="i" size={15} />], ['table', '표', <Rows3 key="i" size={15} />]] as const).map(([v, l, icon]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cx('flex items-center gap-1 rounded-md px-2.5 py-1 text-[0.8rem] font-bold', view === v ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary')}>
                {icon}{l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={`'${q || type}'에 해당하는 고객이 없습니다.`}
          desc="고객사 이름, 지역(예: 강남구), 서비스(예: 병의원)로 찾을 수 있습니다."
          action={<button onClick={reset} className="rounded-xl border border-line px-4 py-2 text-[0.86rem] font-bold hover:border-primary">조건 초기화</button>}
        />
      ) : view === 'table' ? (
        // 표 보기 (PC 1280px+) — 한 줄에 한 고객. 숫자 열은 오른쪽 정렬, 행 전체가 고객 상세로 가는 단추
        <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-card xl:block">
          <div aria-hidden="true" className="grid grid-cols-[minmax(14rem,2fr)_5.5rem_4rem_4.5rem_minmax(7rem,1fr)_7rem_1rem] items-center gap-2.5 border-b border-line bg-ivory/70 px-4 py-2.5 text-[0.74rem] font-extrabold text-ink-faint">
            <span>고객사 · 계약 서비스</span><span className="text-right">월 금액</span><span className="text-right">만족도</span><span>갱신</span><span>고객 건강도</span><span>상태</span><span />
          </div>
          <ul>
            {list.map((c) => {
              const r = health.get(c.id)
              return (
                <li key={c.id} className="border-b border-line/70 last:border-b-0">
                  <button
                    onClick={() => nav(`/customers/${c.id}`)}
                    aria-label={`${c.name} 고객 상세`}
                    className="grid w-full grid-cols-[minmax(14rem,2fr)_5.5rem_4rem_4.5rem_minmax(7rem,1fr)_7rem_1rem] items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-mint/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.92rem] font-extrabold">{c.name}</span>
                      <span className="block truncate text-[0.76rem] text-ink-faint">{c.district} · {c.type} · <span className="font-semibold text-ink-soft">{c.contract.serviceSummary}</span></span>
                    </span>
                    <span className="tnum text-right text-[0.86rem] font-extrabold text-primary">{c.contract.monthlyFee}만원</span>
                    <span className="tnum flex items-center justify-end gap-1 text-[0.84rem] font-bold text-warning"><Star size={12} fill="currentColor" />{c.satisfaction.toFixed(1)}</span>
                    <span><Badge tone={ddayTone(c.contract.renewalDDay)}>D-{c.contract.renewalDDay}</Badge></span>
                    <span className="flex items-center gap-2">
                      {r && <>
                        <span className="h-1.5 flex-1 rounded-full bg-ivory"><span className={cx('block h-full rounded-full', healthBar(r.health))} style={{ width: `${r.health}%` }} /></span>
                        <span className={cx('tnum w-7 text-right text-[0.82rem] font-extrabold', healthText(r.health))}>{r.health}</span>
                      </>}
                    </span>
                    <span>{r && <StatusPill status={r.status} />}</span>
                    <ChevronRight size={16} className="text-ink-faint" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {list.length > 0 && (
        <div className={cx('grid gap-4 md:grid-cols-2 xl:grid-cols-3', view === 'table' && 'xl:hidden')}>
          {list.map((c) => {
            const r = health.get(c.id)
            const h = r && { score: r.health, aiStatus: r.status }
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
                  <Badge tone={ddayTone(c.contract.renewalDDay)}>갱신 D-{c.contract.renewalDDay}</Badge>
                </div>
                {h && (
                  <div className="mt-3 border-t border-line pt-2.5">
                    <div className="flex items-center justify-between text-[0.76rem] font-bold">
                      <span className="text-ink-faint">고객 건강도</span>
                      <span className={cx('tnum', healthText(h.score))}>{h.score} / 100</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-ivory">
                      <div className={cx('h-full rounded-full', healthBar(h.score))} style={{ width: `${h.score}%` }} />
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
