// ─────────────────────────────────────────────────────────
// 작업 전 · 후 사진 뷰어 — 리포트 사진을 눌러 크게 보고, 가운데 손잡이를 밀어 전 · 후를 겹쳐 비교한다.
// 키보드: ← → 로 비교 위치 이동 · Esc 로 닫기. 화면 읽기 프로그램에는 비교 위치(%)를 알려준다.
// ─────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { ChevronsLeftRight, X } from 'lucide-react'
import { Photo } from '../../components/ui/Photo'
import { useHideHistoryNav } from '../../lib/historyNav'
import { trapTab } from '../../lib/focusTrap'
import { cx } from '../../lib/utils'

export interface Shot { src: string; dataUrl?: string; alt: string; at?: string }
export type ViewerMode = 'compare' | 'before' | 'after'

const MODES: Array<[ViewerMode, string]> = [['compare', '전 · 후 비교'], ['before', '작업 전'], ['after', '작업 후']]

function Img({ shot, className }: { shot: Shot; className?: string }) {
  return shot.dataUrl
    ? <img src={shot.dataUrl} alt={shot.alt} className={className} draggable={false} />
    : <Photo src={shot.src} alt={shot.alt} width={1448} height={1086} loading="eager" sizes="100vw" className={className} draggable={false} />
}

export default function PhotoViewer({ open, onClose, before, after, title, initial = 'compare', demo }: {
  open: boolean; onClose: () => void; before: Shot; after: Shot; title: string; initial?: ViewerMode
  /** 대표(예시) 사진이면 true — 같은 자리 사진이라고 말하지 않는다 */
  demo?: boolean
}) {
  const [mode, setMode] = useState<ViewerMode>(initial)
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  useHideHistoryNav(open)

  useEffect(() => {
    if (!open) return
    setMode(initial); setPos(50)
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); else if (e.key === 'Tab') trapTab(boxRef.current, e) }
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => (initial === 'compare' ? rangeRef.current : closeRef.current)?.focus({ preventScroll: true }))
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      if (prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true })
    }
  }, [open, initial, onClose])

  if (!open) return null

  const moveTo = (clientX: number) => {
    const r = frameRef.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  // 기본 동작(포커스 이동 · 이미지 끌기)을 막아야 끌고 난 뒤에도 ← → 키가 비교 손잡이에 그대로 이어진다
  const onDown = (e: ReactPointerEvent) => { e.preventDefault(); dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); moveTo(e.clientX); rangeRef.current?.focus({ preventScroll: true }) }
  const onMove = (e: ReactPointerEvent) => { if (dragging.current) moveTo(e.clientX) }
  const onUp = () => { dragging.current = false }

  return createPortal(
    <div ref={boxRef} role="dialog" aria-modal="true" aria-label={`${title} 사진`} className="fixed inset-0 z-[70] flex flex-col bg-[#0b1413]/95 text-white backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <p className="min-w-0 truncate text-[0.92rem] font-extrabold">{title}</p>
        <button ref={closeRef} onClick={onClose} aria-label="사진 닫기" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X size={22} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-8">
        <div
          ref={frameRef}
          className={cx('relative aspect-[4/3] w-full max-w-[min(100%,calc((100vh-11rem)*4/3))] select-none overflow-hidden rounded-2xl bg-black/40', mode === 'compare' && 'cursor-ew-resize touch-pan-y')}
          onPointerDown={mode === 'compare' ? onDown : undefined}
          onPointerMove={mode === 'compare' ? onMove : undefined}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {mode === 'compare' ? (
            <>
              <Img shot={after} className="absolute inset-0 h-full w-full object-cover" />
              {/* 작업 전 사진을 손잡이 위치까지만 보여 겹친다 */}
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                <Img shot={before} className="h-full w-full object-cover" />
              </div>
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-0.5 text-[0.72rem] font-extrabold">작업 전{before.at ? ` · ${before.at}` : ''}</span>
              <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-[0.72rem] font-extrabold">작업 후{after.at ? ` · ${after.at}` : ''}</span>
              <input
                ref={rangeRef}
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pos)}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label="작업 전 · 후 비교 위치"
                aria-valuetext={`작업 전 ${Math.round(pos)}% · 작업 후 ${100 - Math.round(pos)}%`}
                className="peer sr-only"
              />
              <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] peer-focus-visible:*:ring-4" style={{ left: `${pos}%` }}>
                <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-pop ring-primary/70">
                  <ChevronsLeftRight size={20} />
                </span>
              </div>
            </>
          ) : (
            <>
              <Img shot={mode === 'before' ? before : after} className="absolute inset-0 h-full w-full object-cover" />
              <span className={cx('absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold', mode === 'before' ? 'bg-black/55' : 'bg-primary/90')}>
                {mode === 'before' ? '작업 전' : '작업 후'}{(mode === 'before' ? before.at : after.at) ? ` · ${mode === 'before' ? before.at : after.at}` : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div role="tablist" aria-label="사진 보기 방식" className="flex gap-1 rounded-full bg-white/10 p-1">
          {MODES.map(([m, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cx('rounded-full px-4 py-1.5 text-[0.84rem] font-bold transition-colors', mode === m ? 'bg-white text-ink' : 'text-white/75 hover:text-white')}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-[0.74rem] text-white/55">
          {mode === 'compare' ? '손잡이를 좌우로 밀어 작업 전 · 후를 비교하세요' : demo ? '작업 전 · 후 사진' : '현장에서 촬영한 사진'}
          {demo && <span className="block text-white/45">대표 사진 (DEMO) — 실서비스에서는 현장팀이 같은 위치에서 찍은 전 · 후 사진이 표시됩니다</span>}
        </p>
      </div>
    </div>,
    document.body,
  )
}
