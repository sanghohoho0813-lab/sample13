import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { PageHeader, DemoBadge, EmptyState } from '../../components/ui'
import { AIReadyBadge, InsightCard } from '../../components/ai'
import { SEED_INSIGHTS, DAILY_BRIEFING } from '../../lib/demo/intelligence'
import { cx } from '../../lib/utils'
import type { AIEngine } from '../../types'

type Tab = 'today' | AIEngine

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'risk', label: 'Risk' },
  { id: 'retention', label: 'Retention' },
  { id: 'upsell', label: 'Growth' },
  { id: 'profit', label: 'Profit' },
]

export default function AiCenter() {
  const [tab, setTab] = useState<Tab>('today')
  const list = tab === 'today' ? SEED_INSIGHTS : SEED_INSIGHTS.filter((i) => i.engine === tab)

  return (
    <div className="fade-up">
      <PageHeader
        title="AI Operations Center"
        desc="6개 AI Engine의 발견·판단·추천을 한곳에서 봅니다. 챗봇이 아니라 업무 Flow에 연결된 AI입니다."
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

      <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-line bg-card p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cx(
            'rounded-lg px-3.5 py-1.5 text-[0.84rem] font-bold',
            tab === t.id ? 'bg-ai text-white' : 'text-ink-soft hover:text-ai-strong',
          )}>{t.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="이 영역의 AI Insight가 없습니다." desc="AI Engine이 새 발견을 하면 이곳에 표시됩니다." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-[0.76rem] leading-relaxed text-ink-faint">
        <Sparkles size={13} className="text-ai" /> 모든 Insight는 규칙 기반 Demo Logic으로 생성됩니다. 실서비스에서는 GPT/Claude 등 LLM API가 동일한 service interface로 연결됩니다.
      </p>
    </div>
  )
}
