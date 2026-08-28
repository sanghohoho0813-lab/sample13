import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Sparkles, Play, Check } from 'lucide-react'
import { isInPreview } from '../../lib/preview'
import { cx } from '../../lib/utils'

/**
 * Guided In-App Tour
 * 슬라이드쇼가 아니라 실제 Route를 이동하며 실제 Component를 Spotlight 한다.
 *  route 이동 → 대상 DOM 렌더 확인 → Spotlight → 설명 → Next → 다음 Route
 * 종료 시 overlay / scroll lock / pointer-events 를 모두 원복한다.
 */

export type TourKind = 'tutorial' | 'presentation'

interface Step {
  route: string
  selector?: string
  title: string
  body: string
  /** 현장/고객 Surface 등 Role 전환이 필요한 Step */
  role?: 'ceo' | 'manager' | 'field' | 'customer'
}

export const TUTORIAL_STEPS: Step[] = [
  {
    route: '/', selector: '[data-tour="ai-briefing"]',
    title: 'AI 오늘의 운영 브리핑',
    body: '오늘 어떤 현장과 고객을 먼저 확인해야 하는지 AI가 운영 Risk와 Opportunity를 요약합니다.',
  },
  {
    route: '/schedule', selector: '[data-tour="dispatch"]',
    title: 'AI Smart Dispatch',
    body: '일정·현장·이동시간·팀 상황을 함께 비교해 적합한 배정을 추천합니다. 최종 결정은 사람이 합니다.',
  },
  {
    route: '/customers/C01', selector: '[data-tour="customer-health"]',
    title: 'Customer Health / Retention',
    body: '작업이력과 만족도, 계약 종료일을 함께 보고 재계약 관리가 필요한 고객을 찾습니다.',
  },
  {
    route: '/upsell', selector: '[data-tour="upsell"]',
    title: 'Upsell Opportunity',
    body: '현장 기록을 활용해 추가서비스 제안 가능성을 찾습니다.',
  },
  {
    route: '/evidence', selector: '[data-tour="evidence"]',
    title: 'Evidence Timeline',
    body: 'AI 추천이 실제 Action과 결과로 이어진 과정을 기록합니다.',
  },
]

export const PRESENTATION_STEPS: Step[] = [
  { route: '/', selector: '[data-tour="kpi"]', title: 'Service Command Center', body: '오늘 예정·진행·완료·Risk·갱신·추가매출 기회가 한 화면에 모입니다. 대표는 아침에 이 화면부터 봅니다.' },
  { route: '/', selector: '[data-tour="ai-briefing"]', title: 'AI Executive Briefing', body: '6개 AI Engine의 결과를 종합해 오늘 확인할 것을 자연어로 설명합니다.' },
  { route: '/schedule', selector: '[data-tour="dispatch"]', title: 'AI Smart Dispatch', body: '미배정 일정에 대해 이동시간·숙련도·일정 여유를 비교해 1~3순위 팀과 추천 이유를 제시합니다.' },
  { route: '/field', selector: '[data-tour="field-next"]', title: 'Employee Mobile', body: '현장직원은 모바일에서 체크인 → 체크리스트 → 사진 → 작업완료를 한 손으로 처리합니다.', role: 'field' },
  { route: '/customers/C01', selector: '[data-tour="customer-health"]', title: 'Customer Health', body: '만족도·품질문의·일정변경·계약 종료일을 하나의 점수로 봅니다.', role: 'ceo' },
  { route: '/renewals', selector: '[data-tour="renewal"]', title: 'Retention — 재계약 사전관리', body: '계약 D-60부터 단계별로 분류하고 AI가 사전 관리 Action을 제안합니다.' },
  { route: '/upsell', selector: '[data-tour="upsell"]', title: 'Growth — 추가매출', body: '현장 특이사항이 곧 영업 신호가 됩니다. 발견 → 제안 → 협의 → 성사까지 관리합니다.' },
  { route: '/care/home', selector: '[data-tour="care-quick"]', title: 'Customer Care Portal', body: '고객은 전화 없이 일정 확인·리포트·추가 요청을 처리합니다. 이 요청은 곧바로 내부 AX 데이터가 됩니다.', role: 'customer' },
  { route: '/requests', selector: '[data-tour="requests"]', title: 'Customer → AX Closed Loop', body: '고객 Portal 요청이 내부 요청함과 신규 Opportunity로 즉시 연결됩니다.', role: 'ceo' },
  { route: '/evidence', selector: '[data-tour="evidence"]', title: 'AX Evidence', body: 'AI 추천 → 사람의 결정 → 실행 → 결과가 기록되어 AX 도입 실증 근거가 됩니다.' },
  { route: '/why-ax', selector: '[data-tour="why-hero"]', title: '기획의도 — Why AX', body: '왜 이 회사에 AX가 필요한지, 무엇이 바뀌는지, 어떻게 매출이 되는지를 설명합니다.' },
]

interface TourCtx {
  active: TourKind | null
  start: (k: TourKind) => void
  stop: () => void
}

const Ctx = createContext<TourCtx>({ active: null, start: () => {}, stop: () => {} })
export const useTour = () => useContext(Ctx)

interface Rect { top: number; left: number; width: number; height: number }

export function TourProvider({ children, onRole }: { children: ReactNode; onRole?: (r: NonNullable<Step['role']>) => void }) {
  const [active, setActive] = useState<TourKind | null>(null)
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const nav = useNavigate()
  const loc = useLocation()
  const timers = useRef<number[]>([])

  const steps = active === 'presentation' ? PRESENTATION_STEPS : TUTORIAL_STEPS
  const step = active ? steps[idx] : null

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [] }

  const stop = useCallback(() => {
    clearTimers()
    setActive(null)
    setIdx(0)
    setRect(null)
  }, [])

  const start = useCallback((k: TourKind) => {
    clearTimers()
    setRect(null)
    setIdx(0)
    setActive(k)
  }, [])

  // Route 이동 + 대상 DOM 대기 → Spotlight
  useEffect(() => {
    if (!step) return
    clearTimers()
    setRect(null)
    if (step.role) onRole?.(step.role)
    if (loc.pathname !== step.route) nav(step.route)

    let tries = 0
    const seek = () => {
      const el = step.selector ? document.querySelector(step.selector) : null
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
      const el = document.querySelector(step.selector!)
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
    <Ctx.Provider value={value}>
      {children}
      {active && step && (
        <>
          {/* 클릭 차단 레이어 (투명) — 실제 App 화면은 그대로 보인다 */}
          <div className="fixed inset-0 z-[70]" onClick={(e) => e.stopPropagation()} />
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
                <button onClick={stop} className="rounded-lg p-1 text-ink-faint hover:bg-[#EFF1F0]" aria-label="종료"><X size={17} /></button>
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
    </Ctx.Provider>
  )
}

/** 첫 진입 시 튜토리얼 자동 시작 (Preview iframe 안에서는 실행하지 않음) */
export function useAutoTutorial(seen: boolean, markSeen: () => void) {
  const { start } = useTour()
  const fired = useRef(false)
  useEffect(() => {
    if (seen || fired.current || isInPreview()) return
    fired.current = true
    const t = window.setTimeout(() => { markSeen(); start('tutorial') }, 700)
    return () => window.clearTimeout(t)
  }, [seen, markSeen, start])
}
