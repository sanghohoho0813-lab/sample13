// 사건 체인 — 한 고객의 문제를 위험 → 배정 → 고객 건강도 → 수익성 → 추천 조치로 이어 보여준다
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Lock } from 'lucide-react'
import { CHAIN_LABEL, type CaseChain as Chain } from '../../lib/ops/insights'
import { cx } from '../../lib/utils'
import type { Tone } from '../../lib/tone'

const DOT: Record<Tone, string> = {
  danger: 'bg-danger', warning: 'bg-warning', success: 'bg-success', info: 'bg-info', ai: 'bg-ai', neutral: 'bg-neutral-mid', brand: 'bg-primary',
}

export default function CaseChain({ chain }: { chain: Chain }) {
  const nav = useNavigate()
  return (
    <ol className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
      {chain.steps.map((st, i) => (
        <li key={st.key} className="relative min-w-0">
          <button
            onClick={() => nav(st.to)}
            className={cx(
              'group flex h-full w-full flex-col rounded-xl border px-3 py-2.5 text-left transition-colors hover:border-primary',
              st.key === 'action' ? 'border-ai/40 bg-ai-soft/60' : 'border-line bg-card',
            )}
          >
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
              <span className={cx('h-2 w-2 shrink-0 rounded-full', DOT[st.tone])} />
              {i + 1}. {CHAIN_LABEL[st.key]}
              {st.restricted && <Lock size={11} className="ml-auto" />}
            </span>
            <span className="mt-1 text-[0.86rem] font-extrabold leading-snug break-keep">{st.title}</span>
            <span className="mt-0.5 line-clamp-2 text-[0.76rem] leading-snug text-ink-soft">{st.detail}</span>
          </button>
          {i < chain.steps.length - 1 && (
            <ChevronRight size={14} className="absolute -right-[0.7rem] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-card text-ink-faint xl:block" />
          )}
        </li>
      ))}
    </ol>
  )
}
