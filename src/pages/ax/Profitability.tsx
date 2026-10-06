import { useNavigate } from 'react-router-dom'
import { PieChart as PieIcon, Lock } from 'lucide-react'
import { Card, PageHeader, DemoBadge, StatusPill, EmptyState, Btn } from '../../components/ui'
import { AIReadyBadge, WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'
import { SEED_PROFITABILITY, MONTH_REVENUE } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

export default function Profitability() {
  const { role } = useDemo()
  const nav = useNavigate()

  if (role !== 'ceo') {
    return (
      <EmptyState
        title="수익성 분석은 대표 권한 전용입니다."
        desc="역할별 데이터 접근 제어(RLS)를 체감할 수 있는 화면입니다. 우측 상단에서 역할을 '대표'로 전환해보세요."
        action={<Btn onClick={() => nav('/')}>대시보드로</Btn>}
      />
    )
  }

  const rows = [...SEED_PROFITABILITY].sort((a, b) => a.contributionMarginPct - b.contributionMarginPct)

  return (
    <div className="fade-up">
      <PageHeader
        title="수익성 분석"
        desc="계약매출이 아니라 실제 운영 기여마진으로 현장을 봅니다 — 투입인원·작업시간·이동·소모품·긴급방문·클레임 대응까지 반영."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-4">
        {[
          ['월 계약매출 합계', `${(SEED_PROFITABILITY.reduce((a, r) => a + r.contractAmt, 0)).toLocaleString()}만원`],
          ['평균 표면 마진', `${Math.round(SEED_PROFITABILITY.reduce((a, r) => a + r.surfaceMarginPct, 0) / SEED_PROFITABILITY.length)}%`],
          ['평균 기여마진', `${MONTH_REVENUE.contribMarginPct}%`],
          ['수익성 악화', `${SEED_PROFITABILITY.filter((r) => r.grade === '수익성 악화').length}곳`],
        ].map(([l, v], i) => (
          <Card key={l} className="p-4 text-center">
            <p className="text-[0.72rem] font-bold text-ink-faint">{l}</p>
            <p className={cx('tnum mt-0.5 text-[clamp(0.9rem,4.2vw,1.2rem)] font-extrabold', i === 3 ? 'text-danger' : 'text-primary')}>{v}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <p className="flex items-center gap-2 text-[1rem] font-extrabold"><PieIcon size={17} className="text-primary" /> 고객/현장별 운영 수익성</p>
          <WhyAIButton dataViewed={['계약금액', '투입인원·실제 작업시간', '예상 작업시간', '이동시간·교통비', '소모품', '추가 작업·재방문', '클레임 대응시간']} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.84rem]">
            <thead>
              <tr className="border-b border-line bg-ivory text-[0.72rem] text-ink-faint">
                {['고객', '월 계약', '월 방문', '평균 인원', '실제/예정 작업', '이동', '긴급방문', '표면 마진', '기여마진', 'AI 분류'].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const over = r.avgWorkMin > r.plannedMin
                return (
                  <tr key={r.customerId} onClick={() => nav(`/customers/${r.customerId}`)} className="cursor-pointer border-b border-line/60 hover:bg-mint/30">
                    <td className="px-4 py-3 font-extrabold whitespace-nowrap">{customerById(r.customerId)?.name}</td>
                    <td className="tnum px-4 py-3 whitespace-nowrap">{r.contractAmt}만원</td>
                    <td className="tnum px-4 py-3">{r.visitsPerMonth}회</td>
                    <td className="tnum px-4 py-3">{r.avgCrew}명</td>
                    <td className={cx('tnum px-4 py-3 whitespace-nowrap font-bold', over ? 'text-danger' : 'text-success')}>{r.avgWorkMin}분 / {r.plannedMin}분</td>
                    <td className="tnum px-4 py-3">{r.avgTravelMin}분</td>
                    <td className={cx('tnum px-4 py-3 font-bold', r.urgentVisits >= 2 ? 'text-danger' : '')}>{r.urgentVisits}회</td>
                    <td className="tnum px-4 py-3 font-bold">{r.surfaceMarginPct}%</td>
                    <td className={cx('tnum px-4 py-3 font-extrabold', r.contributionMarginPct < 20 ? 'text-danger' : r.contributionMarginPct >= 28 ? 'text-success' : 'text-ink')}>{r.contributionMarginPct}%</td>
                    <td className="px-4 py-3"><StatusPill status={r.grade} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid gap-3.5 md:grid-cols-2">
        {rows.filter((r) => r.grade === '수익성 악화' || r.grade === '관찰').map((r) => (
          <Card key={r.customerId} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[1rem] font-extrabold">{customerById(r.customerId)?.name}</p>
              <StatusPill status={r.grade} />
            </div>
            <p className="mt-2 rounded-xl bg-ai-soft p-3 text-[0.85rem] leading-relaxed"><b className="text-ai-strong">AI 분석</b> — {r.aiNote}</p>
            <Btn size="sm" variant="outline" className="mt-3" onClick={() => nav(`/customers/${r.customerId}`)}>고객 상세</Btn>
          </Card>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-1.5 text-[0.74rem] text-ink-faint"><Lock size={12} /> 이 화면은 대표 권한 전용 — 관리자/직원/고객 역할에서는 접근이 차단됩니다 (RLS).</p>
    </div>
  )
}
