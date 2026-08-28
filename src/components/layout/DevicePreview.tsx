import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { X, Smartphone, Monitor, MonitorSmartphone, Maximize2, Move } from 'lucide-react'
import { isInPreview, previewUrl, MOBILE_PREVIEW, PC_PREVIEW, type PreviewKind } from '../../lib/preview'
import { cx } from '../../lib/utils'

/**
 * Device Preview
 * - 현재 보고 있는 동일 Route / Data / State / Role / Theme 를 다른 Viewport에서 렌더
 * - 현재 Device와 같은 Preview 버튼은 노출하지 않음 (Recursive Preview 금지)
 * - Preview iframe 내부에서는 이 컴포넌트 자체가 렌더되지 않음
 * - 종료: X 버튼 / Backdrop / ESC
 */

function useIsDesktop() {
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setD(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return d
}

function PreviewModal({ kind, url, onClose }: { kind: PreviewKind; url: string; onClose: () => void }) {
  const frame = kind === 'mobile' ? MOBILE_PREVIEW : PC_PREVIEW
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  // PC Preview는 폭을 억지로 맞춰 읽기 불가능하게 만들지 않고 세로에 맞춘 뒤 가로 Pan을 기본으로 한다
  const [fitWidth, setFitWidth] = useState(false)

  useLayoutEffect(() => {
    const fit = () => {
      const el = stageRef.current
      if (!el) return
      const availW = el.clientWidth - 16
      const availH = el.clientHeight - 16
      const byW = availW / frame.w
      const byH = availH / frame.h
      setScale(Math.max(0.2, Math.min(1, kind === 'mobile' || fitWidth ? Math.min(byW, byH) : byH)))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [frame.w, frame.h, kind, fitWidth])

  // ESC 종료 + body scroll lock (닫힐 때 반드시 원복)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const panning = kind === 'pc' && !fitWidth

  // Header의 backdrop-filter가 fixed의 containing block이 되므로 body로 portal 한다
  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-shell/75 backdrop-blur-sm" onClick={onClose}>
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 text-white sm:px-6">
        <p className="flex min-w-0 items-center gap-2 text-[0.8rem] font-bold sm:text-[0.85rem]">
          <MonitorSmartphone size={17} className="shrink-0" />
          <span className="truncate">
            {kind === 'mobile' ? 'Mobile Preview · 390 × 844' : 'PC Preview · 1440 × 900'}
            <span className="hidden md:inline"> — 동일 화면 · 동일 데이터 · 동일 설정</span>
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {kind === 'pc' && (
            <button
              onClick={(e) => { e.stopPropagation(); setFitWidth((v) => !v) }}
              className="flex items-center gap-1 rounded-xl bg-white/12 px-2.5 py-2 text-[0.75rem] font-bold hover:bg-white/25"
            >
              {fitWidth ? <><Move size={14} /> 실제 비율</> : <><Maximize2 size={14} /> 폭 맞춤</>}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="flex items-center gap-1.5 rounded-xl bg-white/12 px-3 py-2 text-[0.8rem] font-bold hover:bg-white/25"
          >
            <X size={16} /> 닫기
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={cx('flex min-h-0 flex-1 px-2 pb-4', panning ? 'overflow-auto' : 'items-center justify-center overflow-hidden')}
        onClick={onClose}
      >
        {/* 외곽 Frame이 실제 표시 크기를 갖도록 하여 Pan/Scroll 영역과 시각 크기를 일치시킨다 */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ width: frame.w * scale, height: frame.h * scale }}
          className={cx('m-auto shrink-0 overflow-hidden', kind === 'mobile' ? 'phone-frame' : 'desk-frame')}
        >
          <iframe
            key={url}
            title={`${kind}-preview`}
            src={url}
            className="block border-0 bg-white"
            style={{ width: frame.w, height: frame.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          />
        </div>
      </div>

      <p className="shrink-0 px-4 pb-4 text-center text-[0.72rem] text-white/60">
        {panning ? '좌우로 밀어 전체 화면을 확인할 수 있습니다 · ' : ''}ESC · 바깥 영역 탭 · 닫기 버튼으로 종료
      </p>
    </div>,
    document.body,
  )
}

export default function DevicePreview({ compact }: { compact?: boolean }) {
  const loc = useLocation()
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState<PreviewKind | null>(null)

  // Preview 내부에서는 Device Switch Control 자체를 숨긴다 (재귀 방지)
  if (isInPreview()) return null

  // 현재 Device와 반대편 Preview만 제공
  const kind: PreviewKind = isDesktop ? 'mobile' : 'pc'
  const label = isDesktop ? '모바일 보기' : 'PC 보기'
  const Icon = isDesktop ? Smartphone : Monitor

  return (
    <>
      <button
        onClick={() => setOpen(kind)}
        title={`${label} — 현재 화면을 ${isDesktop ? '모바일' : 'PC'} 크기로 미리보기`}
        className={cx(
          'flex items-center gap-1.5 rounded-xl border border-line bg-card font-bold text-ink-soft hover:border-primary hover:text-primary',
          compact ? 'px-2.5 py-1.5 text-[0.75rem]' : 'px-3 py-1.5 text-[0.8rem]',
        )}
      >
        <Icon size={15} />
        {label}
      </button>
      {open && (
        <PreviewModal
          kind={open}
          url={previewUrl(loc.pathname, loc.search, open)}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  )
}
