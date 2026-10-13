// ─────────────────────────────────────────────────────────
// 운영 통제 공용 부품 — 사유 입력 · 단계 표시 · 변경 이력 · 점수 막대
// 배정 · 요청 · AI 조치 · 이슈 화면이 같은 모양으로 '누가 · 언제 · 왜'를 남기고 보여준다.
// ─────────────────────────────────────────────────────────
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Check, History, Lock } from 'lucide-react'
import { Btn, Modal, TextArea } from '../ui'
import { cx } from '../../lib/utils'
import { toneText, type Tone } from '../../lib/tone'
import type { AuditEntry } from '../../types'
import { ROLE_LABEL } from '../../types'

/** 보류 · 반려 · 처리 불가처럼 사유가 반드시 필요한 결정 — 빈 사유로는 확정할 수 없다 */
export function ReasonDialog({ open, onClose, onConfirm, title, desc, confirmLabel, presets = [], danger, placeholder = '사유를 입력해주세요' }: {
  open: boolean; onClose: () => void; onConfirm: (reason: string) => void
  title: string; desc?: ReactNode; confirmLabel: string; presets?: string[]; danger?: boolean; placeholder?: string
}) {
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const id = useId()
  useEffect(() => { if (open) { setText(''); setTouched(false) } }, [open])
  const empty = !text.trim()
  const submit = () => {
    setTouched(true)
    if (empty) return
    onConfirm(text.trim())
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {desc && <p className="mb-3 text-[0.88rem] leading-relaxed text-ink-soft">{desc}</p>}
      {presets.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5" aria-label="자주 쓰는 사유">
          {presets.map((p) => (
            <button key={p} type="button" onClick={() => setText(p)}
              className={cx('rounded-full border px-3 py-1 text-[0.8rem] font-bold', text === p ? 'border-primary bg-mint text-primary-strong' : 'border-line hover:border-primary/60')}>
              {p}
            </button>
          ))}
        </div>
      )}
      <label htmlFor={id} className="sr-only">사유</label>
      <TextArea id={id} value={text} onChange={setText} placeholder={placeholder} maxLength={200} invalid={touched && empty} />
      {touched && empty && <p role="alert" className="mt-1 text-[0.8rem] font-bold text-danger">사유는 변경 이력에 남습니다 — 비워둘 수 없습니다.</p>}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Btn variant="outline" size="lg" onClick={onClose}>취소</Btn>
        <Btn variant={danger ? 'danger' : 'primary'} size="lg" onClick={submit}>{confirmLabel}</Btn>
      </div>
    </Modal>
  )
}

/** 상태 단계 — 지나온 단계는 체크, 현재 단계는 강조, 보류 · 반려는 따로 표시 */
export function Stepper({ steps, current, branch }: {
  steps: Array<{ label: string; sub?: string }>
  /** 현재 단계 index (모두 끝나면 steps.length) */
  current: number
  branch?: { label: string; tone: Tone; note?: string }
}) {
  return (
    <div>
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => {
          const done = i < current
          const now = i === current && !branch
          return (
            <li key={s.label} className="min-w-0" aria-current={now ? 'step' : undefined}>
              <div className={cx('h-1.5 rounded-full', done ? 'bg-primary' : now ? 'bg-primary/45' : 'bg-line')} />
              <p className={cx('mt-1.5 flex items-center gap-1 text-[0.76rem] font-bold leading-tight break-keep', done ? 'text-primary-strong' : now ? 'text-ink' : 'text-ink-faint')}>
                {done && <Check size={12} className="shrink-0" />}{s.label}
              </p>
              {s.sub && <p className="mt-0.5 truncate text-[0.7rem] text-ink-faint">{s.sub}</p>}
            </li>
          )
        })}
      </ol>
      {branch && (
        <p className={cx('mt-2 text-[0.8rem] font-bold', toneText[branch.tone])}>
          {branch.label}{branch.note && <span className="font-semibold text-ink-soft"> — {branch.note}</span>}
        </p>
      )}
    </div>
  )
}

/** 0~100 점수 막대 */
export function ScoreBar({ score, tone = 'brand', className }: { score: number; tone?: 'brand' | 'warning' | 'danger' | 'ai'; className?: string }) {
  const color = { brand: 'bg-primary', warning: 'bg-warning', danger: 'bg-danger', ai: 'bg-ai' }[tone]
  return (
    <div className={cx('h-1.5 overflow-hidden rounded-full bg-ivory', className)} role="presentation">
      <div className={cx('h-full rounded-full', color)} style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
    </div>
  )
}

const roleText = (r: AuditEntry['role']) => (r === 'system' ? 'AI · 시스템' : ROLE_LABEL[r])

/** 변경 이력 — 누가 · 언제 · 무엇을 · 어떻게(전 → 후) · 왜 */
export function AuditTrail({ entries, empty = '아직 변경 이력이 없습니다.', limit, compact }: {
  entries: AuditEntry[]; empty?: string; limit?: number; compact?: boolean
}) {
  const [all, setAll] = useState(false)
  const shown = limit && !all ? entries.slice(0, limit) : entries
  if (!entries.length) return <p className="text-[0.82rem] text-ink-faint">{empty}</p>
  return (
    <div>
      <ol className="relative space-y-2.5 border-l border-line pl-4">
        {shown.map((e) => (
          <li key={e.id} className="relative">
            <span className={cx('absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full ring-2 ring-card', e.role === 'system' ? 'bg-ai' : 'bg-primary')} />
            <p className="text-[0.84rem] leading-snug">
              <span className="tnum font-bold text-ink-faint">{e.day === 'TODAY' ? '' : `${e.day} `}{e.at}</span>
              <b className="ml-1.5">{e.action}</b>
              {(e.from || e.to) && (
                <span className="text-ink-soft"> · {e.from && <span className="line-through decoration-ink-faint/60">{e.from}</span>}{e.from && e.to && ' → '}{e.to && <b className="text-ink">{e.to}</b>}</span>
              )}
            </p>
            <p className="text-[0.76rem] text-ink-faint">
              {e.actor}{!compact && <> · {roleText(e.role)}</>}{!compact && <> · {e.entity} {e.entityId}</>}
            </p>
            {e.note && <p className="mt-0.5 text-[0.8rem] text-ink-soft">“{e.note}”</p>}
          </li>
        ))}
      </ol>
      {limit && entries.length > limit && (
        <button onClick={() => setAll((v) => !v)} className="mt-2 flex items-center gap-1 text-[0.8rem] font-bold text-primary hover:underline">
          <History size={13} /> {all ? '접기' : `이력 ${entries.length - limit}건 더 보기`}
        </button>
      )}
    </div>
  )
}

/** 권한이 없어 버튼 대신 보여주는 안내 */
export function Restricted({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 rounded-xl bg-neutral-soft px-3 py-2 text-[0.8rem] font-bold text-ink-soft">
      <Lock size={13} className="shrink-0" /> {children}
    </p>
  )
}
