import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../lib/utils'
import { HEALTH_STATUS_LABEL } from '../../types'

// ─── Tone system (의미색 고정) ───────────────────────────
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral' | 'brand'

export const toneBg: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  ai: 'bg-ai-soft text-ai-strong',
  neutral: 'bg-[#EFF1F0] text-ink-soft',
  brand: 'bg-mint text-primary-strong',
}

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
      className={cx(
        'rounded-2xl bg-card border border-line shadow-card',
        (hover || onClick) && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────
export function KpiCard({ icon, label, value, unit, sub, tone = 'brand', onClick }: {
  icon: ReactNode; label: string; value: string | number; unit?: string; sub?: ReactNode; tone?: Tone; onClick?: () => void
}) {
  return (
    <Card onClick={onClick} className="p-4 sm:p-5 flex flex-col gap-2 min-w-0">
      {/* 400px 미만 2열 카드에서는 아이콘을 라벨 위로 — 라벨이 단어 중간에서 끊기지 않게 */}
      <div className="flex items-center gap-2 max-[399px]:flex-col max-[399px]:items-start max-[399px]:gap-1.5">
        <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10', toneBg[tone])}>{icon}</span>
        <span className="min-w-0 text-[0.8rem] font-semibold text-ink-soft leading-snug break-keep sm:text-[0.85rem]">{label}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="tnum whitespace-nowrap text-[1.75rem] font-extrabold leading-none tracking-tight sm:text-[1.9rem]">{value}</span>
        {unit && <span className="whitespace-nowrap text-[0.9rem] font-semibold text-ink-faint">{unit}</span>}
      </div>
      {sub && <div className="text-[0.78rem] text-ink-faint leading-snug break-keep">{sub}</div>}
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

export function PageHeader({ title, desc, right }: { title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[1.7rem] lg:text-[1.85rem] font-extrabold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-[0.92rem] text-ink-soft max-w-2xl leading-relaxed">{desc}</p>}
      </div>
      {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
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
    primary: 'bg-primary text-white hover:bg-primary-strong',
    outline: 'border border-line bg-card text-ink hover:border-primary hover:text-primary',
    ghost: 'text-ink-soft hover:bg-[#EFF1F0]',
    ai: 'bg-ai text-white hover:bg-ai-strong',
    danger: 'bg-danger text-white hover:opacity-90',
    success: 'bg-success text-white hover:opacity-90',
  }[variant]
  const s = {
    sm: 'px-3 py-1.5 text-[0.8rem] rounded-lg',
    md: 'px-4 py-2 text-[0.88rem] rounded-xl',
    lg: 'px-5 py-3 text-[0.95rem] rounded-xl',
  }[size]
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cx('font-bold transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed', v, s, className)}
    >
      {children}
    </button>
  )
}

// ─── Modal ───────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean
}) {
  if (!open) return null
  // 조상 요소의 backdrop-filter/transform이 fixed의 containing block이 되는 것을 방지
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-shell/50 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cx(
          'pop-in w-full bg-card sm:rounded-2xl rounded-t-2xl shadow-pop max-h-[88vh] overflow-y-auto',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-card px-5 py-4">
          <h3 className="text-[1.05rem] font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-[#EFF1F0]" aria-label="닫기">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

// ─── States ──────────────────────────────────────────────
export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <p className="text-[0.98rem] font-bold text-ink-soft">{title}</p>
      {desc && <p className="mt-1 text-[0.85rem] text-ink-faint">{desc}</p>}
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
const ToastCtx = createContext<(msg: string, tone?: Tone) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; tone: Tone }>>([])
  const push = (msg: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 z-[60] -translate-x-1/2 flex flex-col gap-2 items-center px-4 w-full max-w-md pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={cx('pop-in rounded-xl px-4 py-2.5 text-[0.85rem] font-bold shadow-pop', toneBg[t.tone], 'bg-card border border-line')}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// ─── Status pill for schedules / actions ─────────────────
export function StatusPill({ status }: { status: string }) {
  const tone: Tone =
    status === '완료' || status === '성사' || status === '해결' ? 'success'
    : status === '작업중' || status === '실행중' || status === '처리중' || status === '협의중' || status === '조치중' ? 'info'
    : status === '이동중' || status === '제안됨' || status === '확인' ? 'brand'
    : status === '확인필요' || status === 'Risk' || status === '위험' || status === '보류' ? 'danger'
    : status === '추천됨' || status === '발견됨' || status === '접수' || status === '재계약 주의' || status === 'Retention Watch' ? 'warning'
    : 'neutral'
  const label = (HEALTH_STATUS_LABEL as Record<string, string>)[status] ?? status
  return <Badge tone={tone}>{label}</Badge>
}
