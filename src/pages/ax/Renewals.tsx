import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCcw } from 'lucide-react'
import { Badge, Btn, Card, DemoBadge, PageHeader, StatTile, StatusPill } from '../../components/ui'
import { ActionLifecycle } from '../../components/ai'
import { HealthGauge } from '../../components/ops/RenewalPanel'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { renewalAll } from '../../lib/ops/insights'
import type { RenewalAssessment } from '../../lib/ops/renewal'
import { cx, fmtManwon } from '../../lib/utils'

type Stage = '위험' | '재계약 협의 (D-30)' | '사전관리 (D-60)' | '관찰' | '안정'
const stageOf = (a: RenewalAssessment): Stage =>
  a.status === 'Risk' ? '위험' : a.dday <= 30 ? '재계약 협의 (D-30)' : a.dday <= 60 ? '사전관리 (D-60)' : a.status === 'Retention Watch' ? '관찰' : '안정'
const ORDER: Stage[] = ['위험', '재계약 협의 (D-30)', '사전관리 (D-60)', '관찰', '안정']

/**
 * 재계약 관리 — 계약 종료일만이 아니라 방문 이력 · 불만/요청 · 작업 품질 · 이용 서비스 · 수익성으로 판단한다.
 * 점수는 고객 요청 처리 · 현장 이슈 조치 · 고객 평가가 바뀌면 즉시 다시 계산된다.
 */
export default function Renewals() {
  const nav = useNavigate()
  const st = useDemo()
  const { actions, role } = st
  const all = useMemo(() => renewalAll(st).sort((a, b) => b.churnRisk - a.churnRisk), [st])
  const groups = ORDER.map((stage) => ({ stage, list: all.filter((a) => stageOf(a) === stage) })).filter((g) => g.list.length)
  const atRisk = all.filter((a) => a.status !== '안정' && a.dday <= 90)
  const loss = atRisk.reduce((s, a) => s + a.expectedLoss, 0)
  const bundle = all.reduce((s, a) => s + a.upsell.revenue, 0)

  return (
    <div className="fade-up">
      <PageHeader
        title="재계약 관리"
        desc="방문 이력 · 불만/요청 · 작업 품질 · 이용 서비스 · 계약 시점 5개 요인으로 이탈 위험을 계산하고, 수익성까지 보고 재계약 전략을 정합니다."
        right={<DemoBadge />}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="90일 내 관리 대상" value={`${atRisk.length}곳`} tone="warning" />
        <StatTile label="대상 연 계약액" value={<span className="whitespace-nowrap">{fmtManwon(atRisk.reduce((s, a) => s + a.annualValue, 0))}</span>} tone="brand" />
        <StatTile label="예상 손실 (위험 × 계약액)" value={<span className="whitespace-nowrap">{fmtManwon(loss)}</span>} tone="danger" />
        <StatTile label="묶음 재계약 가능 추가매출" value={<span className="whitespace-nowrap">{fmtManwon(bundle)}</span>} tone="success" />
      </div>

      <div className="space-y-6">
        {groups.map(({ stage, list }) => (
          <section key={stage}>
            <h2 className={cx('mb-3 flex items-center gap-2 text-[1.05rem] font-extrabold', stage === '위험' ? 'text-danger' : stage.startsWith('재계약') ? 'text-warning' : 'text-ink')}>
              <RefreshCcw size={17} /> {stage} <span className="text-[0.8rem] font-bold text-ink-faint">{list.length}곳</span>
            </h2>
            <div data-tour={stage === groups[0].stage ? 'renewal' : undefined} className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {list.map((a) => {
                const c = customerById(a.customerId)!
                const top = [...a.factors].sort((x, y) => y.risk * y.weight - x.risk * x.weight).slice(0, 2)
                const act = actions.find((x) => x.customerId === a.customerId && x.engine === 'retention' && !['완료', '무시'].includes(x.status))
                const strategy = a.strategy.find((s) => role === 'ceo' || s.title !== '범위 · 단가 재협의')
                return (
                  <Card key={a.customerId} className="flex flex-col p-5">
                    <div className="flex items-start gap-3">
                      <HealthGauge score={a.health} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <button onClick={() => nav(`/customers/${a.customerId}`)} className="text-left text-[1.02rem] font-extrabold hover:text-primary">{c.name}</button>
                          <Badge tone={a.dday <= 30 ? 'danger' : a.dday <= 60 ? 'warning' : 'neutral'}>D-{a.dday}</Badge>
                        </div>
                        <p className="mt-0.5 text-[0.78rem] text-ink-soft">{c.contract.serviceSummary} · 연 {a.annualValue.toLocaleString()}만원</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] font-bold"><StatusPill status={a.status} /><span className="text-ink-faint">이탈 위험 {a.churnRisk}</span></p>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {top.map((f) => (
                        <li key={f.key} className="text-[0.78rem] text-ink-soft"><b className={f.risk >= 60 ? 'text-danger' : f.risk >= 30 ? 'text-warning' : 'text-ink'}>{f.label} {f.risk}</b> — {f.detail}</li>
                      ))}
                    </ul>
                    {strategy && (
                      <p className="mt-2.5 rounded-lg bg-ivory px-3 py-2 text-[0.8rem]"><b>전략</b> — {strategy.title}{a.expectedLoss > 0 && a.status !== '안정' && <span className="text-ink-faint"> · 예상 손실 {a.expectedLoss.toLocaleString()}만원</span>}</p>
                    )}
                    <div className="mt-auto space-y-2 border-t border-line pt-3 [&:not(:first-child)]:mt-3">
                      {act && (
                        <div>
                          <p className="mb-1 text-[0.76rem] font-bold text-ink-faint">{act.title} · 담당 {act.owner}{act.due ? ` · 기한 ${act.due}` : ''}</p>
                          <ActionLifecycle actionId={act.id} status={act.status} compact />
                        </div>
                      )}
                      <Btn size="sm" variant="outline" onClick={() => nav(`/customers/${a.customerId}`)}>판단 근거 · 고객 상세 <ArrowRight size={12} className="inline" /></Btn>
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
