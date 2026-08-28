import { useNavigate } from 'react-router-dom'
import { RefreshCcw, ArrowRight } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, StatusPill } from '../../components/ui'
import { ActionLifecycle, AIReadyBadge, WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { CUSTOMERS } from '../../lib/demo/company'
import { SEED_HEALTH } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

const stageOf = (dday: number, risk: boolean): { label: string; tone: 'danger' | 'warning' | 'brand' | 'success' | 'neutral' } => {
  if (risk) return { label: 'Risk', tone: 'danger' }
  if (dday <= 7) return { label: 'D-7 긴급확인', tone: 'danger' }
  if (dday <= 30) return { label: 'D-30 재계약 협의', tone: 'warning' }
  if (dday <= 60) return { label: 'D-60 사전관리', tone: 'brand' }
  return { label: '안정', tone: 'success' }
}

export default function Renewals() {
  const nav = useNavigate()
  const { actions } = useDemo()
  const sorted = [...CUSTOMERS].sort((a, b) => a.contract.renewalDDay - b.contract.renewalDDay)
  const groups: Record<string, typeof sorted> = {}
  sorted.forEach((c) => {
    const h = SEED_HEALTH.find((x) => x.customerId === c.id)
    const st = stageOf(c.contract.renewalDDay, h?.aiStatus === 'Risk')
    groups[st.label] = [...(groups[st.label] ?? []), c]
  })
  const order = ['Risk', 'D-7 긴급확인', 'D-30 재계약 협의', 'D-60 사전관리', '안정']

  return (
    <div className="fade-up">
      <PageHeader
        title="재계약 관리"
        desc="Contract Renewal Center — 계약 종료일과 Customer Health를 함께 보고 AI Retention Action을 연결합니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />
      <div className="space-y-6">
        {order.filter((o) => groups[o]?.length).map((stage) => (
          <section key={stage}>
            <h2 className={cx('mb-3 flex items-center gap-2 text-[1.05rem] font-extrabold',
              stage === 'Risk' || stage === 'D-7 긴급확인' ? 'text-danger' : stage.startsWith('D-30') ? 'text-warning' : 'text-ink')}>
              <RefreshCcw size={17} /> {stage} <span className="text-[0.8rem] font-bold text-ink-faint">{groups[stage].length}건</span>
            </h2>
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {groups[stage].map((c) => {
                const h = SEED_HEALTH.find((x) => x.customerId === c.id)
                const retentionAction = c.id === 'C01' ? actions.find((a) => a.id === 'A-02') : c.id === 'C09' ? actions.find((a) => a.id === 'A-05') : undefined
                return (
                  <Card key={c.id} className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[1.02rem] font-extrabold">{c.name}</p>
                      <Badge tone={c.contract.renewalDDay <= 30 ? 'danger' : c.contract.renewalDDay <= 60 ? 'warning' : 'neutral'}>D-{c.contract.renewalDDay}</Badge>
                    </div>
                    <p className="mt-1 text-[0.8rem] text-ink-soft">{c.contract.serviceSummary} · {c.contract.monthlyFee}만원/월</p>
                    {h && (
                      <div className="mt-2.5 flex items-center justify-between text-[0.78rem] font-bold">
                        <span className="text-ink-faint">Health {h.score}</span>
                        <StatusPill status={h.aiStatus} />
                      </div>
                    )}
                    {h && h.watch.length > 0 && (
                      <ul className="mt-2 space-y-0.5">{h.watch.slice(0, 2).map((w) => <li key={w} className="flex gap-1.5 text-[0.76rem] text-ink-soft"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />{w}</li>)}</ul>
                    )}
                    <div className="mt-3 space-y-2 border-t border-line pt-3">
                      {retentionAction && <ActionLifecycle actionId={retentionAction.id} status={retentionAction.status} compact />}
                      <div className="flex items-center justify-between">
                        <Btn size="sm" variant="outline" onClick={() => nav(`/customers/${c.id}`)}>고객 Detail <ArrowRight size={12} className="inline" /></Btn>
                        {(stage === 'Risk' || stage.startsWith('D-30')) && <WhyAIButton dataViewed={['계약 갱신일', '만족도 추이', '품질문의', '일정변경 이력']} />}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
