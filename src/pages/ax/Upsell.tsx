import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowRight, Send } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, StatusPill, useToast } from '../../components/ui'
import { AIReadyBadge, WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'
import { fmtManwon } from '../../lib/utils'

export default function Upsell() {
  const { upsell, setUpsellStatus, addEvidence } = useDemo()
  const nav = useNavigate()
  const toast = useToast()
  const totalExpected = upsell.filter((u) => u.status !== '성사' && u.status !== '보류').reduce((a, u) => a + u.expectedRevenue, 0)
  const closed = upsell.filter((u) => u.status === '성사').reduce((a, u) => a + u.expectedRevenue, 0)

  return (
    <div className="fade-up">
      <PageHeader
        title="추가서비스 (Upsell Center)"
        desc="AI Upsell Finder가 계약·현장 기록에서 발견한 추가 매출 기회를 관리합니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
        <Card className="p-4 text-center">
          <p className="text-[0.75rem] font-bold text-ink-faint">진행중 Opportunity</p>
          <p className="tnum text-[1.4rem] font-extrabold text-primary">{fmtManwon(totalExpected)}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[0.75rem] font-bold text-ink-faint">이번 달 성사</p>
          <p className="tnum text-[1.4rem] font-extrabold text-success">{fmtManwon(closed)}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {upsell.map((u) => {
          const c = customerById(u.customerId)
          return (
            <Card key={u.id} className="p-5 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="success"><TrendingUp size={11} /> Growth Opportunity</Badge>
                <StatusPill status={u.status} />
              </div>
              <p className="mt-2.5 text-[1.05rem] font-extrabold">{c?.name}</p>
              <div className="mt-2 space-y-1.5 text-[0.82rem]">
                <p><span className="font-bold text-ink-faint">현재</span> — {u.currentService}</p>
                <p><span className="font-bold text-ink-faint">발견 Signal</span> — {u.signal}</p>
                <p className="rounded-lg bg-mint px-2.5 py-1.5 font-extrabold text-primary-strong">추천 · {u.recommendedService}</p>
                <p className="text-ink-soft">{u.reason}</p>
              </div>
              <p className="tnum mt-2.5 text-[1.1rem] font-extrabold text-success">예상 {u.expectedRevenue}만원 <span className="text-[0.7rem] font-bold text-ink-faint">DEMO</span></p>
              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {u.status === '발견됨' && (
                  <Btn size="sm" onClick={() => {
                    setUpsellStatus(u.id, '제안됨')
                    addEvidence('upsell', `${c?.name} — ${u.recommendedService} 고객 제안 발송`)
                    toast('고객에게 제안했습니다.', 'success')
                  }}><Send size={13} className="inline" /> 고객에게 제안</Btn>
                )}
                {u.status === '제안됨' && <Btn size="sm" variant="outline" onClick={() => { setUpsellStatus(u.id, '협의중'); toast('협의중으로 변경했습니다.', 'info') }}>협의 시작</Btn>}
                {u.status === '협의중' && (
                  <Btn size="sm" variant="success" onClick={() => {
                    setUpsellStatus(u.id, '성사')
                    addEvidence('upsell', `${c?.name} — ${u.recommendedService} 계약 성사`, `추가매출 ${u.expectedRevenue}만원 (DEMO)`)
                    toast('Opportunity 성사! Evidence에 기록되었습니다.')
                  }}>성사 처리</Btn>
                )}
                <Btn size="sm" variant="ghost" onClick={() => nav(`/customers/${u.customerId}`)}>고객 <ArrowRight size={12} className="inline" /></Btn>
              </div>
              <div className="mt-2"><WhyAIButton dataViewed={['현재 계약 서비스', '현장 특이사항 기록', '고객 요청 이력', '서비스 이용 패턴']} /></div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
