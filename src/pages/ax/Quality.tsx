import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, SectionTitle, StatTile } from '../../components/ui'
import { CUSTOMERS, customerById } from '../../lib/demo/company'
import { SEED_QUALITY } from '../../lib/demo/intelligence'

export default function Quality() {
  const nav = useNavigate()
  const avg = CUSTOMERS.reduce((a, c) => a + c.satisfaction, 0) / CUSTOMERS.length

  return (
    <div className="fade-up">
      <PageHeader title="품질 / 만족도" desc="현장 품질 이슈와 고객 만족도를 추적하여 재계약 관리에 연결합니다." right={<DemoBadge />} />

      <div className="mb-5 grid grid-cols-3 gap-2.5 sm:max-w-lg sm:gap-3">
        <StatTile label="평균 만족도" value={avg.toFixed(1)} tone="warning" icon={<Star size={19} fill="currentColor" />} />
        <StatTile label="미해결 이슈" value={`${SEED_QUALITY.filter((q) => q.status !== '해결').length}건`} tone="danger" />
        <StatTile label="이번 달 처리" value={`${SEED_QUALITY.filter((q) => q.status === '해결').length}건`} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle>품질 이슈 이력</SectionTitle>
          <div className="space-y-2.5">
            {SEED_QUALITY.map((q) => (
              <button key={q.id} onClick={() => nav(`/customers/${q.customerId}`)} className="w-full rounded-xl border border-line p-3.5 text-left hover:border-primary">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-[0.92rem]">{customerById(q.customerId)?.name}</p>
                  <Badge tone={q.status === '해결' ? 'success' : q.status === '조치중' ? 'info' : 'warning'}>{q.status}</Badge>
                </div>
                <p className="mt-1 text-[0.84rem] text-ink-soft">{q.category} · {q.detail}</p>
                <p className="mt-0.5 text-[0.7rem] font-bold text-ink-faint">{q.date}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle>고객별 만족도</SectionTitle>
          <div className="space-y-2">
            {[...CUSTOMERS].sort((a, b) => a.satisfaction - b.satisfaction).map((c) => (
              <button key={c.id} onClick={() => nav(`/customers/${c.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-mint/40">
                <span className="w-36 truncate text-left text-[0.84rem] font-bold">{c.name}</span>
                <div className="h-2 flex-1 rounded-full bg-ivory">
                  <div className={`h-full rounded-full ${c.satisfaction >= 4.5 ? 'bg-success' : c.satisfaction >= 4.1 ? 'bg-aqua' : 'bg-danger'}`} style={{ width: `${(c.satisfaction / 5) * 100}%` }} />
                </div>
                <span className="tnum w-9 text-right text-[0.84rem] font-extrabold">{c.satisfaction.toFixed(1)}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[0.76rem] text-ink-faint"><ShieldCheck size={13} /> 만족도가 하락한 고객은 AI 재계약 관리 대상에 자동 포함됩니다.</p>
        </Card>
      </div>
    </div>
  )
}
