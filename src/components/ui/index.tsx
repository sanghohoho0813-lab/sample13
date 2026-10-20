import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, AlertTriangle, Info, Inbox } from 'lucide-react'
import { cx } from '../../lib/utils'
import { useHideHistoryNav } from '../../lib/historyNav'
import { trapTab } from '../../lib/focusTrap'
import { toneBg, toneText, type Tone } from '../../lib/tone'
import { statusLabel, statusTone } from '../../lib/status'
import { ToastContext } from './toast-context'

export type { Tone }

// ─── Badge ───────────────────────────────────────────────
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold whitespace-nowrap', toneBg[tone], className)}>
      {children}
    </span>
  )
}

export function DemoBadge({ label = '데모 데이터' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-ink-faint/50 px-2 py-0.5 text-[0.72rem] font-bold tracking-wide text-ink-faint whitespace-nowrap">
      {label}
    </span>
  )
}

// ─── Card ────────────────────────────────────────────────
export function Card({ children, className, onClick, hover, tour }: { children: ReactNode; className?: string; onClick?: () => void; hover?: boolean; tour?: string }) {
  return (
    <div
      data-tour={tour}
      onClick={onClick}
      // 눌러서 이동하는 카드는 키보드(Tab · Enter · Space)로도 열 수 있어야 한다
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
      } : undefined}
      className={cx(
        'rounded-2xl bg-card border border-line shadow-card',
        (hover || onClick) && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        onClick && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Stat Tile — 화면 상단 요약 숫자 (팀·품질·추가서비스·수익성 공통) ───────
export function StatTile({ label, value, tone = 'brand', icon, className }: {
  label: string; value: ReactNode; tone?: Tone; icon?: ReactNode; className?: string
}) {
  return (
    <Card className={cx('px-4 py-3.5', className)}>
      <p className="text-[0.8rem] font-bold text-ink-faint">{label}</p>
      <p className={cx('mt-0.5 flex flex-wrap items-center gap-1 text-[clamp(1.15rem,5vw,1.45rem)] font-extrabold leading-tight tabular-nums [overflow-wrap:anywhere]', toneText[tone])}>{icon}<span className="min-w-0">{value}</span></p>
    </Card>
  )
}

// ─── KPI Card ────────────────────────────────────────────
export function KpiCard({ icon, label, value, unit, sub, tone = 'brand', onClick }: {
  icon: ReactNode; label: string; value: string | number; unit?: string; sub?: ReactNode; tone?: Tone; onClick?: () => void
}) {
  return (
    <Card onClick={onClick} className="flex min-w-0 flex-col p-3.5 sm:p-4">
      {/* 업무 KPI — 이름은 위 · 아이콘은 오른쪽 작게, 숫자가 가장 먼저 읽히게 */}
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-[0.8rem] font-bold leading-snug text-ink-soft break-keep">{label}</span>
        <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', toneBg[tone])}>{icon}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1">
        <span className="tnum whitespace-nowrap text-[1.75rem] font-extrabold leading-none tracking-tight">{value}</span>
        {unit && <span className="whitespace-nowrap text-[0.86rem] font-semibold text-ink-faint">{unit}</span>}
      </div>
      {sub && <div className="mt-2 truncate border-t border-line/70 pt-2 text-[0.76rem] leading-snug text-ink-faint">{sub}</div>}
    </Card>
  )
}

// ─── Section ─────────────────────────────────────────────
export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-2 mb-3', className)}>
      <h2 className="min-w-0 break-keep text-[1.18rem] font-bold leading-snug tracking-tight">{children}</h2>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

/**
 * 화면 머리 — 제목과 상태 배지는 한 줄, 설명은 그 아래.
 * 폰에서는 설명을 두 줄로 줄여 첫 화면에 실제 업무 내용이 더 많이 보이게 한다(탭하면 펼침).
 */
export function PageHeader({ title, desc, right }: { title: string; desc?: string; right?: ReactNode }) {
  const [more, setMore] = useState(false)
  const [clamped, setClamped] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)
  // 실제로 잘렸을 때만 '더보기'를 보여준다 (짧은 설명에 버튼이 붙지 않게)
  useEffect(() => {
    const el = descRef.current
    if (!el) return
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [desc])
  return (
    <div className="mb-5 lg:mb-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[1.35rem] font-extrabold leading-tight sm:text-[1.5rem] lg:text-[1.7rem]">{title}</h1>
        {right && <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 pt-1">{right}</div>}
      </div>
      {desc && (
        <>
          <p ref={descRef} className={cx('mt-1.5 max-w-2xl text-[0.88rem] leading-relaxed text-ink-soft sm:line-clamp-none', !more && 'line-clamp-2')}>
            {desc}
          </p>
          {(clamped || more) && (
            <button onClick={() => setMore((v) => !v)} className="mt-0.5 text-[0.78rem] font-bold text-primary sm:hidden">
              {more ? '접기' : '설명 더보기'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── Buttons ─────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', className, disabled }: {
  children: ReactNode; onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost' | 'ai' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'; className?: string; disabled?: boolean
}) {
  const v = {
    primary: 'bg-primary text-white shadow-[0_1px_2px_rgba(8,52,58,0.18)] hover:bg-primary-strong',
    outline: 'border border-line bg-card text-ink hover:border-primary/60 hover:text-primary',
    ghost: 'text-ink-soft hover:bg-neutral-soft',
    ai: 'bg-ai text-white hover:bg-ai-strong',
    danger: 'bg-danger text-white hover:opacity-90',
    success: 'bg-success text-white hover:opacity-90',
  }[variant]
  const s = {
    sm: 'min-h-[2.1rem] px-3 py-1.5 text-[0.8rem] rounded-lg',
    md: 'min-h-[2.5rem] px-4 py-2 text-[0.88rem] rounded-xl',
    lg: 'min-h-[3rem] px-5 py-3 text-[0.95rem] rounded-xl',
  }[size]
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cx('inline-flex items-center justify-center gap-1 font-bold transition-[background-color,border-color,color,box-shadow,transform] whitespace-nowrap active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100', v, s, className)}
    >
      {children}
    </button>
  )
}

/**
 * 오버레이 배경 — 누르면 닫힌다. 클릭 핸들러를 붙인 div 대신 실제 버튼을 쓰고,
 * 키보드 사용자는 ESC · 닫기 버튼으로 닫으므로 Tab 순서에서는 뺀다(tabIndex -1).
 */
export function Backdrop({ onClick, label = '닫기', className }: { onClick: () => void; label?: string; className?: string }) {
  return <button type="button" tabIndex={-1} aria-label={label} onClick={onClick} className={cx('absolute inset-0 cursor-default', className)} />
}

// ─── Modal ───────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean
}) {
  const titleId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  useHideHistoryNav(open)
  // 열리면 대화상자로 포커스를 옮기고, 닫히면 연 버튼으로 되돌린다 (키보드·스크린리더 사용자)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    boxRef.current?.focus({ preventScroll: true })
    return () => { if (prev && document.contains(prev)) prev.focus({ preventScroll: true }) }
  }, [open])
  // ESC 닫기 · Tab 이 대화상자 밖으로 빠져나가지 않게 · 배경 스크롤 잠금 (닫힐 때 반드시 원복)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Tab') trapTab(boxRef.current, e)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  // 조상 요소의 backdrop-filter/transform이 fixed의 containing block이 되는 것을 방지
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <Backdrop onClick={onClose} className="bg-shell/50 backdrop-blur-sm" />
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'sheet-in relative w-full bg-card outline-none rounded-t-3xl sm:rounded-2xl shadow-pop max-h-[90vh] overflow-y-auto overscroll-contain',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-card px-5 pb-3.5 pt-5 sm:py-4">
          {/* 폰 시트 손잡이 — 아래에서 올라온 면이라는 단서 */}
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line sm:hidden" aria-hidden="true" />
          <h3 id={titleId} className="text-[1.08rem] font-bold">{title}</h3>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-soft" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/** 브라우저 기본 confirm() 대신 쓰는 확인 대화상자 — 미리보기 iframe에서도 동작하고 톤이 일관된다 */
export function ConfirmDialog({ open, onClose, onConfirm, title, desc, confirmLabel, danger }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; desc?: ReactNode; confirmLabel: string; danger?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {desc && <p className="text-[0.92rem] leading-relaxed text-ink-soft">{desc}</p>}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Btn variant="outline" size="lg" className="justify-center" onClick={onClose}>취소</Btn>
        <Btn variant={danger ? 'danger' : 'primary'} size="lg" className="justify-center" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Btn>
      </div>
    </Modal>
  )
}

// ─── States ──────────────────────────────────────────────
export function EmptyState({ title, desc, action, icon }: { title: string; desc?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/60 px-6 py-11 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-ink-faint" aria-hidden="true">
        {icon ?? <Inbox size={22} />}
      </span>
      <p className="text-[0.98rem] font-bold text-ink-soft">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-[0.85rem] leading-relaxed text-ink-faint">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cx('skeleton', className ?? 'h-24 w-full')} />
}

// ─── Data Freshness ──────────────────────────────────────
export function Freshness({ source = '데모 데이터' }: { source?: string }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const update = () => setT(fmt.format(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="tnum inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-faint">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning inline-block" />
      <span>{source} · 마지막 업데이트 {t}</span>
    </span>
  )
}

// ─── Toast ───────────────────────────────────────────────
const TOAST_ICON: Partial<Record<Tone, ReactNode>> = {
  success: <CheckCircle2 size={15} />,
  warning: <AlertTriangle size={14} />,
  danger: <AlertTriangle size={14} />,
  info: <Info size={14} />,
}
const TOAST_DOT: Partial<Record<Tone, string>> = {
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; tone: Tone }>>([])
  // 참조가 바뀌지 않아야 useToast() 를 쓰는 화면이 불필요하게 다시 그려지지 않는다
  const push = useCallback((msg: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random()
    // 같은 문구를 연달아 누르면 쌓지 않고 하나만 — 최대 3개
    setToasts((t) => [...t.filter((x) => x.msg !== msg), { id, msg, tone }].slice(-3))
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* 스크린리더가 알림 내용을 읽도록 live region 으로 둔다 */}
      {/* 어두운 알림 — 밝은 카드 위에서도 한눈에 구분되고, 의미색은 아이콘에만.
          폰에서는 화면 위쪽 — 아래의 주요 버튼(현장 단계 버튼 · 하단 메뉴)을 가리지 않는다 */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex w-full max-w-md -translate-x-1/2 flex-col-reverse items-center gap-2 px-4 lg:bottom-6 lg:top-auto lg:flex-col">
        {toasts.map((t) => (
          <div key={t.id} className="toast-in flex max-w-full items-center gap-2.5 rounded-2xl bg-ink/95 py-2.5 pl-3 pr-4 text-[0.86rem] font-semibold leading-snug text-white shadow-pop backdrop-blur">
            <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', TOAST_DOT[t.tone] ?? 'bg-white/15 text-white')}>{TOAST_ICON[t.tone] ?? <Info size={14} />}</span>
            <span className="min-w-0">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Status pill for schedules / actions ─────────────────
export function StatusPill({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
}

/** 좁은 목록 행에서 Pill 대신 보조줄 앞에 붙이는 상태 텍스트 — 이름 칸을 넓혀 단어가 중간에 끊기지 않게 한다 */
export function StatusText({ status, className }: { status: string; className?: string }) {
  return <span className={cx('font-bold', toneText[statusTone(status)], className)}>{statusLabel(status)} · </span>
}

// ─── Form ────────────────────────────────────────────────
// 입력폼 공통 부품 — 라벨·도움말·오류 위치와 크기를 화면마다 같게 맞춘다.
export function Field({ label, required, hint, error, children, htmlFor }: {
  label: string; required?: boolean; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-[0.88rem] font-bold text-ink">
        {label}{required && <span className="text-danger" aria-hidden="true">*</span>}
        {!required && <span className="text-[0.76rem] font-semibold text-ink-faint">(선택)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[0.8rem] font-bold text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[0.78rem] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextArea({ id, value, onChange, placeholder, maxLength = 300, rows = 3, invalid }: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; rows?: number; invalid?: boolean
}) {
  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={cx(
          'w-full resize-none rounded-xl border bg-card px-3.5 py-3 pb-6 text-[0.92rem] leading-relaxed outline-none transition-colors placeholder:text-ink-faint/70',
          invalid ? 'border-danger focus:border-danger' : 'border-line focus:border-primary',
        )}
      />
      <span className="tnum pointer-events-none absolute bottom-2 right-3 text-[0.72rem] font-semibold text-ink-faint">{value.length} / {maxLength}</span>
    </div>
  )
}

/** 단일 선택 칩 — 라디오 그룹 역할 (키보드·스크린리더에서도 선택 상태가 읽힌다) */
export function ChoiceGroup<T extends string>({ options, value, onChange, cols = 2, invalid, label }: {
  options: readonly T[] | Array<{ value: T; label: string; desc?: string }>
  value: T | null; onChange: (v: T) => void; cols?: 1 | 2 | 3; invalid?: boolean; label?: string
}) {
  const items = (options as Array<T | { value: T; label: string; desc?: string }>).map((o) => (typeof o === 'string' ? { value: o, label: o, desc: undefined } : o))
  return (
    <div role="radiogroup" aria-label={label} className={cx('grid gap-2', cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2')}>
      {items.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'min-h-[2.9rem] rounded-xl border px-3 py-2.5 text-left text-[0.88rem] font-bold leading-snug transition-colors',
              on ? 'border-primary bg-mint text-primary-strong' : invalid ? 'border-danger/60 bg-card' : 'border-line bg-card hover:border-primary/60',
            )}
          >
            {o.label}
            {o.desc && <span className="mt-0.5 block text-[0.76rem] font-semibold text-ink-faint">{o.desc}</span>}
          </button>
        )
      })}
    </div>
  )
}
