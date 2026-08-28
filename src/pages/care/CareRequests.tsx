import { useNavigate } from 'react-router-dom'
import { PlusCircle, ArrowRight } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Card, Badge, Btn, StatusPill, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'

export default function CareRequests() {
  const { requests } = useDemo()
  const nav = useNavigate()
  const mine = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)

  return (
    <CareShell>
      <div className="fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.5rem] font-extrabold">요청</h1>
            <p className="mt-1 text-[0.88rem] text-ink-soft">보내신 요청의 처리 상태를 확인할 수 있습니다.</p>
          </div>
          <Btn onClick={() => nav('/care/home')}><PlusCircle size={16} className="mr-1 inline" /> 새 요청</Btn>
        </div>

        {mine.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="아직 보낸 요청이 없습니다."
              desc="추가서비스·일정변경·긴급방문 요청을 홈 화면에서 보낼 수 있습니다."
              action={<Btn onClick={() => nav('/care/home')}>요청 보내기 <ArrowRight size={14} className="inline" /></Btn>}
            />
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {mine.map((r) => (
              <Card key={r.id} className="p-4.5 p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={r.type === '긴급방문' ? 'danger' : r.type === '추가서비스' ? 'success' : r.type === '일정변경' ? 'warning' : 'info'}>{r.type}</Badge>
                  <StatusPill status={r.status} />
                </div>
                <p className="mt-2 text-[0.95rem] font-bold">{r.detail}</p>
                <p className="mt-1 text-[0.72rem] font-bold text-ink-faint">{r.createdAt}</p>
                <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-[0.76rem] font-semibold text-ink-faint">
                  {['접수', '처리중', '완료'].map((step, i) => {
                    const cur = r.status === '접수' ? 0 : r.status === '처리중' ? 1 : 2
                    return (
                      <span key={step} className="flex items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 font-bold ${i <= cur ? 'bg-primary text-white' : 'bg-ivory text-ink-faint'}`}>{step}</span>
                        {i < 2 && <span className="h-px w-4 bg-line" />}
                      </span>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-5 text-center text-[0.7rem] leading-relaxed text-ink-faint">
          요청은 클린웨이 내부 시스템(Business AX)에 실시간 접수되어 담당자가 확인합니다.
        </p>
      </div>
    </CareShell>
  )
}
