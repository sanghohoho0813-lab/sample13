import { useNavigate } from 'react-router-dom'
import { PieChart as PieIcon, Lock } from 'lucide-react'
import { Card, PageHeader, DemoBadge, StatusPill, EmptyState, Btn, StatTile } from '../../components/ui'
import { WhyAIButton } from '../../components/ai'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { SEED_PROFITABILITY, MONTH_REVENUE } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'

export default function Profitability() {
  const { role, setRole } = useDemo()
  const nav = useNavigate()

  if (role !== 'ceo') {
    return (
      <EmptyState
        title="수익성 분석은 대표 권한 전용입니다."
        desc="역할별 데이터 접근 제어(RLS) 예시입니다. 대표 역할로 바꾸면 바로 볼 수 있습니다."
        action={<div className="flex flex-wrap justify-center gap-2"><Btn onClick={() => setRole('ceo')}>대표로 전환해서 보기</Btn><Btn variant="outline" onClick={() => nav('/')}>대시보드로</Btn></div>}
      />
    )
  }

  const rows = [...SEED_PROFITABILITY].sort((a, b) => a.contributionMarginPct - b.contributionMarginPct)

  return (
    <div className="fade-up">
      <PageHeader
        title="수익성 분석"
        desc="계약매출이 아니라 실제 운영 기여마진으로 현장을 봅니다 — 투입인원·작업시간·이동·소모품·긴급방문·클레임 대응까지 반영."
        right={<DemoBadge />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2 xl:max-w-4xl xl:grid-cols-4">
        {[
          ['월 계약매출 합계', `${(SEED_PROFITABILITY.reduce((a, r) => a + r.contractAmt, 0)).toLocaleString()}만원`],
          ['평균 표면 마진', `${Math.round(SEED_PROFITABILITY.reduce((a, r) => a + r.surfaceMarginPct, 0) / SEED_PROFITABILITY.length)}%`],
          ['평균 기여마진', `${MONTH_REVENUE.contribMarginPct}%`],
          ['수익성 악화', `${SEED_PROFITABILITY.filter((r) => r.grade === '수익성 악화').length}곳`],
        ].map(([l, v], i) => (
          <StatTile key={l} label={l} value={v} tone={i === 3 ? 'danger' : 'brand'} />
        ))}
      </div>

      {/* 조치가 필요한 현장을 표보다 먼저 — 무엇을 봐야 하는지부터 */}
      <div className="mb-5 grid gap-3.5 md:grid-cols-2">
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
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-5 py-3.5">
          <p className="flex min-w-0 items-center gap-2 text-[1rem] font-extrabold"><PieIcon size={17} className="shrink-0 text-primary" /> 현장별 운영 수익성</p>
          <WhyAIButton dataViewed={['계약금액', '투입인원·실제 작업시간', '예상 작업시간', '이동시간·교통비', '소모품', '추가 작업·재방문', '클레임 대응시간']} />
        </div>
        {/* 모바일 — 핵심 지표(기여마진·분류)가 화면 밖으로 밀리지 않게 목록형 */}
        <p className="flex justify-between bg-ivory px-4 py-2 text-[0.74rem] font-bold text-ink-faint md:hidden"><span>현장 · 월 계약 · 실제/예정 작업</span><span>기여마진</span></p>
        <ul className="divide-y divide-line/60 md:hidden">
          {rows.map((r) => {
            const over = r.avgWorkMin > r.plannedMin
            return (
              <li key={r.customerId}>
                <button onClick={() => nav(`/customers/${r.customerId}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-mint/30">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.93rem] font-extrabold leading-snug">{customerById(r.customerId)?.name}</span>
                    <span className="block truncate text-[0.78rem] text-ink-faint">
                      월 {r.contractAmt}만원 · 실작업 <b className={over ? 'text-danger' : 'text-success'}>{r.avgWorkMin}/{r.plannedMin}분</b>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cx('tnum text-[1.05rem] font-extrabold leading-none', r.contributionMarginPct < 20 ? 'text-danger' : r.contributionMarginPct >= 28 ? 'text-success' : 'text-ink')}>{r.contributionMarginPct}%</span>
                    <StatusPill status={r.grade} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="hidden overflow-x-auto md:block">
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

      <p className="mt-5 flex items-center gap-1.5 text-[0.74rem] text-ink-faint"><Lock size={12} /> 이 화면은 대표 권한 전용 — 관리자/직원/고객 역할에서는 접근이 차단됩니다 (RLS).</p>
    </div>
  )
}
