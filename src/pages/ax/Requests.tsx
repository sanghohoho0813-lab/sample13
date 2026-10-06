import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, ArrowRight, Store } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, StatusPill, EmptyState, useToast } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'
import { cx } from '../../lib/utils'
import type { CustomerRequest } from '../../types'

type Filter = '처리 필요' | '처리중' | '완료' | '전체'
const TYPE_TONE = { 긴급방문: 'danger', 추가서비스: 'success', 일정변경: 'warning', 문의: 'info' } as const
// 처리 필요(접수) → 처리중 → 완료 순, 같은 상태에서는 긴급 방문을 맨 위로
const rank = (r: CustomerRequest) => ({ 접수: 0, 처리중: 1, 완료: 2 }[r.status] * 10 + (r.type === '긴급방문' ? 0 : 1))

export default function Requests() {
  const { requests, setRequestStatus } = useDemo()
  const nav = useNavigate()
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('처리 필요')

  const count: Record<Filter, number> = {
    '처리 필요': requests.filter((r) => r.status === '접수').length,
    처리중: requests.filter((r) => r.status === '처리중').length,
    완료: requests.filter((r) => r.status === '완료').length,
    전체: requests.length,
  }
  const list = requests
    .filter((r) => filter === '전체' || (filter === '처리 필요' ? r.status === '접수' : r.status === filter))
    .sort((a, b) => rank(a) - rank(b))

  return (
    <div className="fade-up">
      <PageHeader
        title="요청 / 문의"
        desc="고객 플랫폼과 담당자를 통해 들어온 요청을 처리합니다. 고객이 플랫폼에서 보낸 요청은 이곳에 바로 들어옵니다."
        right={<DemoBadge />}
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" className="flex w-max gap-1 rounded-xl border border-line bg-card p-1">
          {(['처리 필요', '처리중', '완료', '전체'] as Filter[]).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
              'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[0.88rem] font-bold',
              filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary',
            )}>
              {f}
              <span className={cx('tnum rounded-full px-1.5 text-[0.74rem]', filter === f ? 'text-white/85' : f === '처리 필요' && count[f] > 0 ? 'bg-danger-soft text-danger' : 'text-ink-faint')}>{count[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div data-tour="requests"><EmptyState
          title={filter === '처리 필요' ? '새로 처리할 요청이 없습니다.' : '해당하는 요청이 없습니다.'}
          desc={filter === '처리 필요' ? '고객 플랫폼에서 요청이 들어오면 이곳에 표시됩니다.' : undefined}
          action={filter !== '전체' ? <Btn variant="outline" size="sm" onClick={() => setFilter('전체')}>전체 요청 보기</Btn> : undefined}
        /></div>
      ) : (
        <div data-tour="requests" className="grid gap-3.5 md:grid-cols-2">
          {list.map((r) => {
            const c = customerById(r.customerId)
            return (
              <Card key={r.id} className={cx('p-5', r.type === '긴급방문' && r.status !== '완료' && 'border-danger/40')}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
                    {r.fromPortal && <span className="flex items-center gap-1 text-[0.78rem] font-bold text-ai-strong"><Store size={12} /> 고객 플랫폼</span>}
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <button onClick={() => nav(`/customers/${r.customerId}`)} className="mt-2.5 text-left text-[1.02rem] font-extrabold hover:text-primary">{c?.name}</button>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-soft">{r.detail}</p>
                <p className="tnum mt-1.5 text-[0.78rem] font-bold text-ink-faint">{r.createdAt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  {r.status === '접수' && (
                    <Btn size="sm" onClick={() => { setRequestStatus(r.id, '처리중'); toast(`${c?.name} — 처리중으로 변경했습니다.`, 'info') }}>담당자 확인</Btn>
                  )}
                  {r.status === '처리중' && (
                    <Btn size="sm" variant="success" onClick={() => { setRequestStatus(r.id, '완료'); toast(`${c?.name} — 요청을 완료 처리했습니다.`) }}>완료 처리</Btn>
                  )}
                  {r.type === '추가서비스' && <Btn size="sm" variant="ghost" onClick={() => nav('/upsell')}>매출 기회 보기 <ArrowRight size={12} className="inline" /></Btn>}
                  {r.type === '일정변경' && <Btn size="sm" variant="ghost" onClick={() => nav('/schedule')}>일정 재배정 <ArrowRight size={12} className="inline" /></Btn>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <p className="mt-5 flex items-center gap-1.5 text-[0.78rem] text-ink-faint"><Inbox size={13} /> 문자·카카오톡·이메일 채널 연동은 연동 준비 상태입니다.</p>
    </div>
  )
}
