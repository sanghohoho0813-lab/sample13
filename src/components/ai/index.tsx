import { useState, type ReactNode } from 'react'
import { Sparkles, HelpCircle, Database, Brain, Target, TrendingUp } from 'lucide-react'
import { Badge, Btn, Card, Modal, StatusPill, useToast } from '../ui'
import type { AIInsight, ActionStatus } from '../../types'
import { ENGINE_LABEL } from '../../types'
import { useDemo } from '../../lib/data/store'
import { cx } from '../../lib/utils'

// ─── AI READY 표시 ───────────────────────────────────────
export function AIReadyBadge({ small }: { small?: boolean }) {
  return (
    <Badge tone="ai" className={small ? 'text-[0.72rem] px-2' : ''}>
      <Sparkles size={small ? 10 : 12} /> AI READY
    </Badge>
  )
}

// ─── 왜 이렇게 판단했나요? Modal ──────────────────────────
export function WhyAIButton({ dataViewed, aiDoes, className }: {
  dataViewed?: string[]; aiDoes?: string[]; className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cx('inline-flex items-center gap-1 text-[0.75rem] font-bold text-ai-strong hover:underline', className)}
      >
        <HelpCircle size={13} /> 왜 이렇게 판단했나요?
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={<span className="flex items-center gap-2"><Sparkles size={18} className="text-ai" /> 이 기능에는 AI API가 연결될 예정입니다</span>}>
        <div className="space-y-4 text-[0.9rem] leading-relaxed">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 font-bold text-ink"><Database size={15} className="text-ai-strong" /> AI가 보는 데이터</p>
            <ul className="grid grid-cols-2 gap-1.5">
              {(dataViewed ?? ['일정', '현장 위치', '직원 상황', '작업시간', '고객·계약', '품질 기록']).map((d) => (
                <li key={d} className="rounded-lg bg-ai-soft px-2.5 py-1.5 text-[0.8rem] font-semibold text-ai-strong">{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 font-bold text-ink"><Brain size={15} className="text-ai-strong" /> AI가 하는 일</p>
            <ul className="list-disc pl-5 space-y-1 text-ink-soft text-[0.85rem]">
              {(aiDoes ?? [
                '여러 조건을 함께 비교하여 위험과 기회를 발견합니다.',
                '우선순위를 정리하고 추천 행동과 이유를 설명합니다.',
                '담당자가 여러 화면을 직접 비교하는 시간을 줄입니다.',
              ]).map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-ivory p-3.5 text-[0.82rem]">
            <p><b>현재 MVP</b> — 규칙 기반 데모 로직 (실제 AI 미연결 · <b>AI READY</b>)</p>
            <p className="mt-1 text-ink-soft"><b>향후</b> — GPT / Claude 등 LLM API · Optimization API 연결 가능 (service interface 준비됨)</p>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── Action Lifecycle Control ────────────────────────────
const FLOW: ActionStatus[] = ['추천됨', '확인', '실행중', '완료']

export function ActionLifecycle({ actionId, status, compact }: { actionId: string; status: ActionStatus; compact?: boolean }) {
  const { setActionStatus } = useDemo()
  const toast = useToast()
  const idx = FLOW.indexOf(status)
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!compact && (
        <div className="flex items-center gap-1">
          {FLOW.map((f, i) => (
            <span key={f} className={cx(
              'rounded-full px-2 py-0.5 text-[0.72rem] font-bold',
              i <= idx ? 'bg-primary text-white' : 'bg-[#EFF1F0] text-ink-faint',
            )}>{f}</span>
          ))}
        </div>
      )}
      {compact && <StatusPill status={status} />}
      {next && (
        <Btn size="sm" variant="outline" onClick={() => { setActionStatus(actionId, next); toast(`실행 상태 변경: ${next}`, 'info') }}>
          {next === '완료' ? '완료 처리' : `${next}으로`}
        </Btn>
      )}
      {status !== '보류' && status !== '무시' && status !== '완료' && (
        <Btn size="sm" variant="ghost" onClick={() => { setActionStatus(actionId, '보류'); toast('실행을 보류했습니다.', 'warning') }}>보류</Btn>
      )}
      {status === '보류' && (
        <Btn size="sm" variant="outline" onClick={() => { setActionStatus(actionId, '확인'); toast('실행을 다시 진행합니다.', 'info') }}>다시 진행</Btn>
      )}
    </div>
  )
}

// ─── AI Insight Card (발견/데이터/이유/추천/영향) ─────────
export function InsightCard({ insight, footer }: { insight: AIInsight; footer?: ReactNode }) {
  const { actions } = useDemo()
  const action = insight.actionId ? actions.find((a) => a.id === insight.actionId) : undefined
  const sevTone = insight.severity === 'risk' ? 'danger' : insight.severity === 'opportunity' ? 'success' : 'ai'
  return (
    <Card className="p-5 space-y-3">
      {/* 배지는 하나(무엇을 발견했나)만 — 엔진명은 보조 텍스트, AI READY는 화면 상단에 한 번만 */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Badge tone={sevTone as 'danger'}>{insight.title}</Badge>
        <span className="flex items-center gap-1 text-[0.76rem] font-bold text-ai-strong"><Sparkles size={12} /> {ENGINE_LABEL[insight.engine]}</span>
      </div>
      <p className="text-[1.05rem] font-extrabold tracking-tight">{insight.target}</p>
      <p className="text-[0.88rem] leading-relaxed text-ink">{insight.found}</p>
      <div className="grid gap-2 text-[0.82rem]">
        <div className="flex gap-2"><Target size={15} className="mt-0.5 shrink-0 text-ink-faint" /><span className="text-ink-soft"><b className="text-ink">왜 중요한가</b> — {insight.why}</span></div>
        <div className="flex gap-2"><Brain size={15} className="mt-0.5 shrink-0 text-ai-strong" /><span className="text-ink-soft"><b className="text-ink">추천 행동</b> — {insight.recommendation}</span></div>
        <div className="flex gap-2"><TrendingUp size={15} className="mt-0.5 shrink-0 text-success" /><span className="text-ink-soft"><b className="text-ink">예상 영향</b> — {insight.impact}</span></div>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap border-t border-line pt-3">
        <WhyAIButton dataViewed={insight.dataViewed} />
        {action && <ActionLifecycle actionId={action.id} status={action.status} compact />}
      </div>
      {footer}
    </Card>
  )
}
