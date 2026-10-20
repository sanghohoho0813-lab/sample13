// ─────────────────────────────────────────────────────────
// 긴 상세 화면의 섹션 바로가기 — 헤더 바로 아래에 붙어 있고, 지금 읽는 섹션을 표시한다.
// 폰에서는 한 화면에 섹션 하나 정도만 보이므로 '어디쯤인지'와 '바로 가기'가 필요하다.
// ─────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { cx } from '../../lib/utils'

export interface SectionLink { id: string; label: string }

/** 화면 위에 붙어 있는 앱 헤더 높이 — 바로가기 줄을 그 아래에 붙이고, 이동할 때 그만큼 띄운다 */
function useStickyHeaderHeight() {
  const [h, setH] = useState(0)
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('header.sticky')
    if (!header) return
    const update = () => setH(header.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])
  return h
}

export default function SectionNav({ links, className }: { links: SectionLink[]; className?: string }) {
  const top = useStickyHeaderHeight()
  const [active, setActive] = useState(links[0]?.id)
  const barRef = useRef<HTMLDivElement>(null)
  const ids = links.map((l) => l.id).join(',')

  // 지금 읽는 섹션 — 바로가기 줄 바로 아래 선을 지난 마지막 섹션
  useEffect(() => {
    const onScroll = () => {
      const line = top + (barRef.current?.offsetHeight ?? 0) + 24
      let current = links[0]?.id
      for (const l of links) {
        const el = document.getElementById(l.id)
        if (el && el.offsetParent !== null && el.getBoundingClientRect().top <= line) current = l.id
      }
      // 맨 아래까지 내렸으면 마지막 섹션
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = links[links.length - 1]?.id
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 섹션 목록(ids)과 헤더 높이가 바뀔 때만 다시 건다
  }, [ids, top])

  // 표시된 칩이 가로 줄 밖이면 보이게
  useEffect(() => {
    barRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = top + (barRef.current?.offsetHeight ?? 0) + 12
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
    setActive(id)
    // 키보드 · 스크린리더 사용자는 이동한 섹션에서 계속 읽는다
    el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }

  return (
    <nav
      aria-label="섹션 바로가기"
      className={cx('sticky z-20 -mx-4 mb-4 border-b border-line/70 bg-ivory/90 px-4 py-2 backdrop-blur lg:-mx-8 lg:px-8', className)}
      style={{ top }}
    >
      <div ref={barRef} className="scroll-row flex gap-1.5 overflow-x-auto">
        {links.map((l) => (
          <button
            key={l.id}
            data-id={l.id}
            onClick={() => go(l.id)}
            aria-current={active === l.id ? 'location' : undefined}
            className={cx(
              'shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[0.8rem] font-bold transition-colors',
              active === l.id ? 'border-primary bg-primary text-white' : 'border-line bg-card text-ink-soft hover:border-primary/50',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
