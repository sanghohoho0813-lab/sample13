import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Sparkles, Play, Check } from 'lucide-react'
import { cx } from '../../lib/utils'
import { useHideHistoryNav } from '../../lib/historyNav'
import { TourContext } from './context'
import { PRESENTATION_STEPS, TUTORIAL_STEPS, type Step, type TourKind } from './steps'

/**
 * Guided In-App Tour
 * 슬라이드쇼가 아니라 실제 Route를 이동하며 실제 Component를 Spotlight 한다.
 *  route 이동 → 대상 DOM 렌더 확인 → Spotlight → 설명 → Next → 다음 Route
 * 종료 시 overlay / scroll lock / pointer-events 를 모두 원복한다.
 */

interface Rect { top: number; left: number; width: number; height: number }

/** 같은 data-tour가 PC/모바일 레이아웃에 각각 있을 수 있으므로 화면에 실제로 보이는 것만 고른다 */
function findVisible(selector: string): Element | null {
  return [...document.querySelectorAll(selector)].find((el) => el.getClientRects().length > 0) ?? null
}

export function TourProvider({ children, onRole, role }: {
  children: ReactNode
  onRole?: (r: NonNullable<Step['role']>) => void
  /** 투어 시작 시점의 역할 — 투어가 역할을 바꿨다면 종료 시 되돌린다 */
  role?: NonNullable<Step['role']>
}) {
  const [active, setActive] = useState<TourKind | null>(null)
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  useHideHistoryNav(!!active)
  const nav = useNavigate()
  const loc = useLocation()
  const timers = useRef<number[]>([])
  const startRole = useRef<NonNullable<Step['role']> | undefined>(undefined)
  const roleTouched = useRef(false)
  const roleRef = useRef(role)
  roleRef.current = role

  const steps = active === 'presentation' ? PRESENTATION_STEPS : TUTORIAL_STEPS
  const step = active ? steps[idx] : null

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [] }

  const stop = useCallback(() => {
    clearTimers()
    setActive(null)
    setIdx(0)
    setRect(null)
    // 시연 중 현장직원·고객 역할로 바꿨다면 원래 역할로 복원 (다음 화면이 엉뚱한 권한으로 보이지 않게)
    if (roleTouched.current && startRole.current && startRole.current !== roleRef.current) onRole?.(startRole.current)
    roleTouched.current = false
  }, [onRole])

  const start = useCallback((k: TourKind) => {
    clearTimers()
    setRect(null)
    setIdx(0)
    startRole.current = roleRef.current
    roleTouched.current = false
    setActive(k)
  }, [])

  // Route 이동 + 대상 DOM 대기 → Spotlight
  useEffect(() => {
    if (!step) return
    clearTimers()
    setRect(null)
    if (step.role && step.role !== roleRef.current) { roleTouched.current = true; onRole?.(step.role) }
    if (loc.pathname !== step.route) nav(step.route)

    let tries = 0
    const seek = () => {
      const el = step.selector ? findVisible(step.selector) : null
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        timers.current.push(window.setTimeout(() => {
          const r = el.getBoundingClientRect()
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }, 380))
        return
      }
      if (tries++ < 30) timers.current.push(window.setTimeout(seek, 100))
    }
    timers.current.push(window.setTimeout(seek, 120))
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx])

  // 스크롤/리사이즈 시 Spotlight 위치 추적
  useEffect(() => {
    if (!step?.selector || !rect) return
    const track = () => {
      const el = findVisible(step.selector!)
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    window.addEventListener('scroll', track, true)
    window.addEventListener('resize', track)
    return () => { window.removeEventListener('scroll', track, true); window.removeEventListener('resize', track) }
  }, [step, rect])

  // ESC 종료
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop()
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(steps.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, steps.length, stop])

  const value = useMemo(() => ({ active, start, stop }), [active, start, stop])

  const last = active ? idx === steps.length - 1 : false
  const pad = 8

  return (
    <TourContext.Provider value={value}>
      {children}
      {active && step && (
        <>
          {/* 클릭 차단 레이어 (투명) — 실제 App 화면은 그대로 보인다 */}
          <div className="fixed inset-0 z-[70]" aria-hidden="true" />
          {/* Spotlight: 대상만 정상 밝기, 나머지는 30% Dim */}
          {rect ? (
            <div
              className="tour-spot"
              style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
            />
          ) : (
            <div className="fixed inset-0 z-[71] bg-shell/30 pointer-events-none" />
          )}

          {/* Guide Card */}
          <div className={cx(
            'fixed z-[72] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]',
            'inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:px-0',
          )}>
            <div className="pop-in rounded-2xl bg-card p-5 shadow-pop border border-line">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-1.5 text-[0.72rem] font-extrabold tracking-[0.14em] text-primary">
                  {active === 'presentation' ? <Play size={12} /> : <Sparkles size={12} />}
                  {active === 'presentation' ? '시연 모드' : '튜토리얼'} {String(idx + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </p>
                <button onClick={stop} className="rounded-lg p-1 text-ink-faint hover:bg-neutral-soft" aria-label="종료"><X size={17} /></button>
              </div>
              <p className="mt-1.5 text-[1.08rem] font-extrabold leading-snug">{step.title}</p>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-soft">{step.body}</p>

              <div className="mt-2.5 flex gap-1">
                {steps.map((_, i) => (
                  <span key={i} className={cx('h-1 flex-1 rounded-full', i <= idx ? 'bg-primary' : 'bg-line')} />
                ))}
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2">
                <button onClick={stop} className="text-[0.8rem] font-bold text-ink-faint hover:underline">건너뛰기</button>
                <div className="flex gap-2">
                  {idx > 0 && (
                    <button onClick={() => setIdx(idx - 1)} className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-[0.82rem] font-bold hover:border-primary">
                      <ChevronLeft size={15} /> 이전
                    </button>
                  )}
                  {last ? (
                    <button onClick={stop} className="flex items-center gap-1 rounded-xl bg-success px-4 py-2 text-[0.82rem] font-bold text-white hover:opacity-90">
                      <Check size={15} /> 완료
                    </button>
                  ) : (
                    <button onClick={() => setIdx(idx + 1)} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-[0.82rem] font-bold text-white hover:bg-primary-strong">
                      다음 <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </TourContext.Provider>
  )
}
