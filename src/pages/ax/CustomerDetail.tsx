import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, ArrowRight, TrendingUp, ShieldCheck, Eye } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, SectionTitle, StatusPill, EmptyState } from '../../components/ui'
import { InsightCard } from '../../components/ai'
import { AuditTrail } from '../../components/ops'
import CaseChain from '../../components/ops/CaseChain'
import RenewalPanel from '../../components/ops/RenewalPanel'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { SEED_INSIGHTS, SEED_PROFITABILITY, SEED_QUALITY } from '../../lib/demo/intelligence'
import { buildCase } from '../../lib/ops/insights'
import { assessRenewal } from '../../lib/ops/renewal'
import { cx } from '../../lib/utils'

export default function CustomerDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const store = useDemo()
  const { upsell, requests, reports, role } = store
  const customer = id ? customerById(id) : undefined
  if (!customer) {
    return <EmptyState title="고객을 찾을 수 없습니다." action={<Btn onClick={() => nav('/customers')}>고객 목록으로</Btn>} />
  }

  const renewal = assessRenewal(customer.id, store)!
  const chain = buildCase(customer.id, store)
  const history = store.audit.filter((a) => a.target === customer.name)
  const insights = SEED_INSIGHTS.filter((i) => i.customerId === customer.id)
  const profit = SEED_PROFITABILITY.find((p) => p.customerId === customer.id)
  const ups = upsell.filter((u) => u.customerId === customer.id)
  const reqs = requests.filter((r) => r.customerId === customer.id)
  const issueList = SEED_QUALITY.filter((q) => q.customerId === customer.id)
  const myReports = reports.filter((r) => r.customerId === customer.id)

  return (
    <div className="fade-up">
      <button onClick={() => nav('/customers')} className="mb-3 flex items-center gap-1 text-[0.85rem] font-bold text-ink-soft hover:text-primary"><ArrowLeft size={15} /> 고객 / 계약</button>
      <PageHeader
        title={customer.name}
        desc={`${customer.address} · ${customer.type}`}
        right={<><StatusPill status={renewal.status} /><DemoBadge /></>}
      />

      {/* 이 고객의 사건 흐름 — 위험 → 배정 → 건강도 → 수익성 → 조치 */}
      <Card className="mb-5 p-4">
        <p className="mb-2.5 text-[0.92rem] font-extrabold">지금 이 고객 — <span className="text-ink-soft">{chain.headline}</span></p>
        <CaseChain chain={chain} />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <RenewalPanel a={renewal} showMoney={role === 'ceo'} tour="customer-health" />

          {/* AI Insights */}
          {insights.map((i) => <InsightCard key={i.id} insight={i} />)}

          {/* 수익성 (대표 전용) */}
          <Card className="p-5">
            <SectionTitle right={role !== 'ceo' ? <Badge tone="neutral"><Eye size={11} /> 대표 전용</Badge> : undefined}>실제 운영 수익성</SectionTitle>
            {role === 'ceo' && profit ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-center min-[420px]:grid-cols-3 min-[420px]:gap-2.5">
                  {[
                    ['월 계약금액', `${profit.contractAmt}만원`],
                    ['표면 마진', `${profit.surfaceMarginPct}%`],
                    ['실제 기여마진', `${profit.contributionMarginPct}%`],
                  ].map(([l, v], i2) => (
                    <div key={l} className={cx('rounded-xl px-2 py-3', i2 === 2 ? (profit.contributionMarginPct < 20 ? 'bg-danger-soft' : 'bg-success-soft') : 'bg-ivory')}>
                      <p className="text-[0.7rem] font-bold text-ink-faint">{l}</p>
                      <p className={cx('tnum mt-0.5 whitespace-nowrap text-[1rem] font-extrabold sm:text-[1.15rem]', i2 === 2 && (profit.contributionMarginPct < 20 ? 'text-danger' : 'text-success'))}>{v}</p>
                    </div>
                  ))}
                </div>
                <p className="rounded-xl bg-ai-soft p-3 text-[0.84rem] leading-relaxed text-ink"><b className="text-ai-strong">AI 분석</b> — {profit.aiNote}</p>
                <div className="flex items-center justify-between">
                  <StatusPill status={profit.grade} />
                  <Btn variant="ghost" size="sm" onClick={() => nav('/profitability')}>수익성 분석 전체 <ArrowRight size={13} className="inline" /></Btn>
                </div>
              </div>
            ) : (
              <p className="text-[0.85rem] text-ink-faint">수익성 데이터는 대표 권한에서만 표시됩니다. (RLS)</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* 계약 정보 */}
          <Card className="p-5">
            <SectionTitle>계약 정보</SectionTitle>
            <div className="space-y-2 text-[0.86rem]">
              {[
                ['서비스', customer.contract.serviceSummary],
                ['방문 주기', `주 ${customer.contract.visitsPerWeek}회`],
                ['월 계약금액', `${customer.contract.monthlyFee}만원 (DEMO)`],
                ['계약 종료', `${customer.contract.endDate} (D-${customer.contract.renewalDDay})`],
                ['고객 담당자', customer.contract.customerManager],
                ['내부 담당자', customer.contract.internalManager],
                ['최근 방문', customer.lastVisit],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 border-b border-line/60 pb-1.5">
                  <span className="font-semibold text-ink-faint whitespace-nowrap">{l}</span>
                  <span className="text-right font-bold">{v}</span>
                </div>
              ))}
              <div className="flex justify-between gap-3 pt-1">
                <span className="font-semibold text-ink-faint">만족도</span>
                <span className="flex items-center gap-1 font-extrabold text-warning"><Star size={14} fill="currentColor" /> {customer.satisfaction.toFixed(1)} / 5</span>
              </div>
            </div>
            <div className="mt-3.5 flex gap-2">
              <Btn variant="outline" size="sm" className="flex-1" onClick={() => nav('/renewals')}>재계약 관리</Btn>
              <Btn variant="outline" size="sm" className="flex-1" onClick={() => nav(`/sites/${customer.id}`)}>현장 상세</Btn>
            </div>
          </Card>

          {/* Upsell */}
          <Card className="p-5">
            <SectionTitle right={<TrendingUp size={16} className="text-success" />}>추가매출 기회</SectionTitle>
            {ups.length === 0 ? <p className="text-[0.84rem] text-ink-faint">발견된 기회가 없습니다.</p> : (
              <div className="space-y-2">
                {ups.map((u) => (
                  <div key={u.id} className="rounded-xl bg-success-soft/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.86rem] font-extrabold">{u.recommendedService}</p>
                      <StatusPill status={u.status} />
                    </div>
                    <p className="mt-0.5 text-[0.76rem] text-ink-soft">{u.signal} · 예상 {u.expectedRevenue}만원 (DEMO)</p>
                  </div>
                ))}
              </div>
            )}
            <Btn variant="ghost" size="sm" className="mt-2.5" onClick={() => nav('/upsell')}>추가서비스 <ArrowRight size={13} className="inline" /></Btn>
          </Card>

          {/* 요청 / 품질 */}
          <Card className="p-5">
            <SectionTitle right={<ShieldCheck size={16} className="text-info" />}>최근 요청 / 품질</SectionTitle>
            <div className="space-y-2">
              {reqs.map((r) => (
                <button key={r.id} onClick={() => nav(`/requests?id=${r.id}`)} className="flex w-full items-center justify-between gap-2 rounded-lg bg-ivory px-3 py-2 text-left text-[0.8rem] hover:bg-mint/50">
                  <span className="min-w-0 flex-1"><Badge tone="info" className="mr-1.5">{r.type}</Badge><span className="font-semibold">{r.detail}</span></span>
                  <StatusPill status={r.status} />
                </button>
              ))}
              {issueList.map((q2) => (
                <div key={q2.id} className="flex items-center justify-between gap-2 rounded-lg bg-ivory px-3 py-2 text-[0.8rem]">
                  <span className="min-w-0 flex-1"><Badge tone="warning" className="mr-1.5">{q2.category}</Badge><span className="font-semibold">{q2.detail}</span></span>
                  <span className="shrink-0 text-[0.7rem] font-bold text-ink-faint">{q2.status}</span>
                </div>
              ))}
              {reqs.length === 0 && issueList.length === 0 && <p className="text-[0.84rem] text-ink-faint">최근 요청·품질 이슈가 없습니다.</p>}
            </div>
          </Card>

          {/* 현장 이슈 */}
          {store.issues.some((i) => i.customerId === customer.id) && (
            <Card className="p-5">
              <SectionTitle>현장 이슈</SectionTitle>
              <div className="space-y-2">
                {store.issues.filter((i) => i.customerId === customer.id).map((i) => (
                  <div key={i.id} className="rounded-lg bg-ivory px-3 py-2 text-[0.8rem]">
                    <p className="flex items-center justify-between gap-2 font-bold">{i.type} · {i.severity}<StatusPill status={i.status} /></p>
                    <p className="text-ink-soft">{i.detail}</p>
                    <p className="text-[0.74rem] text-ink-faint">보고 {i.reportedBy} {i.at}{i.owner ? ` · 조치 ${i.owner}` : ''}{i.customerVisible ? ' · 고객 공개' : ' · 내부'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 최근 리포트 */}
          {myReports.length > 0 && (
            <Card className="p-5">
              <SectionTitle>최근 작업 리포트</SectionTitle>
              <div className="space-y-2">
                {myReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-lg bg-ivory px-3 py-2 text-[0.8rem]">
                    <p className="font-bold">{r.date} {r.completedAt} · {r.team}</p>
                    <p className="text-ink-soft">{r.note}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 변경 이력 — 이 고객에 대해 누가 무엇을 바꿨는지 */}
          <Card className="p-5">
            <SectionTitle>이 고객의 변경 이력</SectionTitle>
            <AuditTrail entries={history} limit={5} empty="아직 이 고객에 대한 변경 이력이 없습니다." />
          </Card>
        </div>
      </div>
    </div>
  )
}
