import { useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PageHeader, DemoBadge, EmptyState } from '../../components/ui'
import { AIReadyBadge, InsightCard } from '../../components/ai'
import { SEED_INSIGHTS, DAILY_BRIEFING } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'
import type { AIEngine } from '../../types'

type Tab = 'today' | AIEngine

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: '오늘' },
  { id: 'dispatch', label: '배정' },
  { id: 'risk', label: '위험' },
  { id: 'retention', label: '재계약' },
  { id: 'upsell', label: '추가매출' },
  { id: 'profit', label: '수익성' },
]

export default function AiCenter() {
  // 탭은 URL(?tab=)에 둔다 — 대시보드 브리핑에서 특정 엔진으로 바로 들어오고, 새로고침해도 유지된다
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.some((t) => t.id === params.get('tab')) ? (params.get('tab') as Tab) : 'today'
  const setTab = (t: Tab) => setParams(t === 'today' ? {} : { tab: t }, { replace: true })
  const list = tab === 'today' ? SEED_INSIGHTS : SEED_INSIGHTS.filter((i) => i.engine === tab)

  return (
    <div className="fade-up">
      <PageHeader
        title="AI 센터"
        desc="6개 AI 엔진의 발견·판단·추천을 한곳에서 봅니다. 챗봇이 아니라 업무 흐름에 연결된 AI입니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />

      {tab === 'today' && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DAILY_BRIEFING.counters.map((c) => (
            <div key={c.label} className={cx('rounded-2xl border border-line p-4 text-center bg-card')}>
              <p className="text-[0.74rem] font-bold text-ink-faint">{c.label}</p>
              <p className={cx('tnum mt-1 text-[1.5rem] font-extrabold', {
                danger: 'text-danger', success: 'text-success', warning: 'text-warning', info: 'text-info',
              }[c.tone])}>{c.value}건</p>
            </div>
          ))}
        </div>
      )}

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" className="flex w-max gap-1 rounded-xl border border-line bg-card p-1">
          {TABS.map((t) => {
            const n = t.id === 'today' ? SEED_INSIGHTS.length : SEED_INSIGHTS.filter((i) => i.engine === t.id).length
            return (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cx(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[0.86rem] font-bold',
                tab === t.id ? 'bg-ai text-white' : 'text-ink-soft hover:text-ai-strong',
              )}>
                {t.label}
                <span className={cx('tnum text-[0.74rem]', tab === t.id ? 'text-white/80' : 'text-ink-faint')}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      {list.length === 0 ? (
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
