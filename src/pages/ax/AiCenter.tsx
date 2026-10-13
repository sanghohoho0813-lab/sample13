import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card, PageHeader, DemoBadge, EmptyState } from '../../components/ui'
import { AIReadyBadge, InsightCard } from '../../components/ai'
import CaseChain from '../../components/ops/CaseChain'
import { useDemo } from '../../lib/data/context'
import { SEED_INSIGHTS } from '../../lib/demo/intelligence'
import { topCases } from '../../lib/ops/insights'
import { cx } from '../../lib/utils'
import { ENGINE_LABEL, type AIEngine } from '../../types'

type Tab = 'cases' | 'today' | AIEngine

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'cases', label: '사건 흐름' },
  { id: 'today', label: '전체 발견' },
  { id: 'dispatch', label: '배정' },
  { id: 'risk', label: '위험' },
  { id: 'retention', label: '재계약' },
  { id: 'upsell', label: '추가매출' },
  { id: 'profit', label: '수익성' },
]

export default function AiCenter() {
  // 탭은 URL(?tab=)에 둔다 — 대시보드 브리핑에서 특정 엔진으로 바로 들어오고, 새로고침해도 유지된다
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.some((t) => t.id === params.get('tab')) ? (params.get('tab') as Tab) : 'cases'
  const setTab = (t: Tab) => setParams(t === 'cases' ? {} : { tab: t }, { replace: true })
  const list = tab === 'today' ? SEED_INSIGHTS : SEED_INSIGHTS.filter((i) => i.engine === tab)
  const st = useDemo()
  const cases = useMemo(() => topCases(st, 6), [st])
  const nav = useNavigate()

  return (
    <div className="fade-up">
      <PageHeader
        title="AI 센터"
        desc="위험 · 배정 · 재계약 · 추가매출 · 수익성 엔진이 한 고객의 문제를 함께 판단합니다. 챗봇이 아니라 업무 흐름에 연결된 AI입니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />

      {/* 탭 6개 — 모바일은 3×2로 모두 보이게 (가로 스크롤에 숨지 않게) */}
      <div className="mb-4">
        <div role="tablist" aria-label="AI 엔진" className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-card p-1 sm:flex sm:w-max">
          {TABS.map((t) => {
            const n = t.id === 'cases' ? cases.length : t.id === 'today' ? SEED_INSIGHTS.length : SEED_INSIGHTS.filter((i) => i.engine === t.id).length
            return (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cx(
                'flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[0.86rem] font-bold sm:gap-1.5 sm:px-3.5',
                tab === t.id ? 'bg-ai text-white' : 'text-ink-soft hover:text-ai-strong',
              )}>
                {t.label}
                <span className={cx('tnum text-[0.74rem]', tab === t.id ? 'text-white/80' : 'text-ink-faint')}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'cases' ? (
        <div className="space-y-3">
          <p className="text-[0.86rem] text-ink-soft">엔진 결과를 따로 보지 않고 <b className="text-ink">한 고객의 문제</b>로 묶어 위험 → 배정 → 고객 건강도 → 수익성 → 추천 조치 순서로 봅니다. 신호가 2개 이상 겹친 고객만 표시합니다.</p>
          {cases.length === 0 ? <EmptyState title="신호가 겹친 고객이 없습니다." desc="오늘 처리할 사건이 모두 해소되었습니다." /> : cases.map((c, i) => (
            <Card key={c.customerId} className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="flex items-baseline gap-2">
                  <span className="tnum text-[0.8rem] font-extrabold text-ai-strong">#{i + 1}</span>
                  <button onClick={() => nav(`/customers/${c.customerId}`)} className="text-[1.05rem] font-extrabold hover:text-primary">{c.name}</button>
                </p>
                <span className="text-[0.82rem] font-bold text-ink-soft">{c.headline}</span>
              </div>
              <CaseChain chain={c} />
              {SEED_INSIGHTS.some((x) => x.customerId === c.customerId) && (
                <p className="mt-2.5 text-[0.76rem] text-ink-faint">관련 엔진 발견 — {SEED_INSIGHTS.filter((x) => x.customerId === c.customerId).map((x) => ENGINE_LABEL[x.engine]).join(' · ')}</p>
              )}
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="이 영역의 AI 발견이 없습니다." desc="AI 엔진이 새 발견을 하면 이곳에 표시됩니다." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-[0.76rem] leading-relaxed text-ink-faint">
        <Sparkles size={13} className="text-ai" /> 모든 분석은 규칙 기반 데모 로직으로 생성됩니다. 실서비스에서는 GPT · Claude 등 생성형 AI가 같은 연결 구조로 붙습니다.
      </p>
    </div>
  )
}
