import { useNavigate } from 'react-router-dom'
import { Inbox, ArrowRight, Store } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, StatusPill, EmptyState, useToast } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'

export default function Requests() {
  const { requests, setRequestStatus } = useDemo()
  const nav = useNavigate()
  const toast = useToast()

  return (
    <div className="fade-up">
      <PageHeader
        title="요청 / 문의"
        desc="Customer Portal과 담당자를 통해 접수된 고객 요청을 처리합니다. Portal 요청은 내부 AX에 실시간으로 연결됩니다 (Closed Loop)."
        right={<DemoBadge />}
      />
      {requests.length === 0 ? (
        <EmptyState title="접수된 요청이 없습니다." desc="Customer Portal에서 요청이 들어오면 이곳에 표시됩니다." />
      ) : (
        <div data-tour="requests" className="grid gap-3.5 md:grid-cols-2">
          {requests.map((r) => {
            const c = customerById(r.customerId)
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={r.type === '긴급방문' ? 'danger' : r.type === '추가서비스' ? 'success' : r.type === '일정변경' ? 'warning' : 'info'}>{r.type}</Badge>
                    {r.fromPortal && <Badge tone="ai"><Store size={11} /> Customer Portal</Badge>}
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <p className="mt-2.5 text-[1.02rem] font-extrabold">{c?.name}</p>
                <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-soft">{r.detail}</p>
                <p className="mt-1.5 text-[0.72rem] font-bold text-ink-faint">{r.createdAt}</p>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                  {r.status === '접수' && (
                    <Btn size="sm" onClick={() => { setRequestStatus(r.id, '처리중'); toast('담당자 확인 — 처리중으로 변경했습니다.', 'info') }}>담당자 확인</Btn>
                  )}
                  {r.status === '처리중' && (
                    <Btn size="sm" variant="success" onClick={() => { setRequestStatus(r.id, '완료'); toast('요청을 완료 처리했습니다.') }}>완료 처리</Btn>
                  )}
                  {r.type === '추가서비스' && <Btn size="sm" variant="outline" onClick={() => nav('/upsell')}>Opportunity 보기 <ArrowRight size={12} className="inline" /></Btn>}
                  {r.type === '일정변경' && <Btn size="sm" variant="outline" onClick={() => nav('/schedule')}>AI Dispatch 재검토</Btn>}
                  <Btn size="sm" variant="ghost" onClick={() => nav(`/customers/${r.customerId}`)}>고객 Detail</Btn>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <p className="mt-5 flex items-center gap-1.5 text-[0.76rem] text-ink-faint"><Inbox size={13} /> 문자·카카오톡·이메일 채널 연동은 Integration Ready 상태입니다.</p>
    </div>
  )
}
