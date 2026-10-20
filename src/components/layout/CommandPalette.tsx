// ─────────────────────────────────────────────────────────
// 전역 검색 — 고객 · 현장 · 오늘 일정 · 고객 요청 · 화면을 한 입력창에서 찾고 바로 이동
// ⌘K / Ctrl+K 또는 '/' 로 열고, ↑↓ 로 고르고, Enter 로 이동, Esc 로 닫는다.
// 새 데이터를 만들지 않는다 — 이미 있는 화면의 상세 주소(?id= · /:id)로 보낼 뿐.
// ─────────────────────────────────────────────────────────
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Building2, CalendarClock, CornerDownLeft, Inbox, LayoutGrid, MapPin, Search, Users, X } from 'lucide-react'
import { Backdrop } from '../ui'
import { useDemo } from '../../lib/data/context'
import { CUSTOMERS, SITES, TEAMS, customerById, teamById, teamMemberNames } from '../../lib/demo/company'
import { matchesQuery } from '../../lib/search'
import { useHideHistoryNav } from '../../lib/historyNav'
import { trapTab } from '../../lib/focusTrap'
import { cx } from '../../lib/utils'

export interface PageLink { to: string; label: string; group?: string }

interface Hit { key: string; group: string; title: string; sub: string; to: string; icon: ReactNode }

const GROUP_ORDER = ['화면', '오늘 일정', '고객 요청', '고객', '현장', '팀']
// 검색어가 없을 때는 '지금 볼 것'(진행 중 일정 · 처리 중 요청)을 먼저, 화면 바로가기는 그 아래
const IDLE_ORDER = ['오늘 일정', '고객 요청', '화면']

/** 헤더의 검색 단추 — PC 는 입력창 모양, 폰은 아이콘 */
export function SearchTrigger({ onOpen, compact }: { onOpen: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <button onClick={onOpen} aria-label="검색" title="검색 (⌘K)" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft hover:bg-neutral-soft">
        <Search size={20} />
      </button>
    )
  }
  return (
    <button
      onClick={onOpen}
      className="flex h-9 w-full min-w-[6.5rem] max-w-[22rem] items-center gap-2 rounded-xl border border-line bg-ivory/70 px-3 text-left text-[0.82rem] text-ink-faint transition-colors hover:border-primary/40 hover:bg-card"
    >
      <Search size={15} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate"><span className="hidden min-[1360px]:inline">고객 · 현장 · 일정 · 요청 </span>검색</span>
      <kbd className="hidden shrink-0 rounded-md border border-line bg-card px-1.5 py-px font-sans text-[0.7rem] font-bold text-ink-faint xl:inline">⌘K</kbd>
    </button>
  )
}

export default function CommandPalette({ open, onClose, pages }: { open: boolean; onClose: () => void; pages: PageLink[] }) {
  const { schedules, requests } = useDemo()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  useHideHistoryNav(open)
  // 입력창 밖(지우기 · 닫기 단추)에 포커스가 있어도 ESC 로 닫히고, Tab 은 검색창 안에서만 돈다
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Tab') trapTab(boxRef.current, e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setQ(''); setActive(0)
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => { document.body.style.overflow = prevOverflow; if (prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true }) }
  }, [open])

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim()
    const out: Hit[] = []
    const take = (list: Hit[], n: number) => out.push(...list.slice(0, n))

    take(pages.filter((p) => matchesQuery([p.label, p.group], query)).map((p) => ({
      key: `page-${p.to}`, group: '화면', title: p.label, sub: p.group ?? '운영', to: p.to, icon: <LayoutGrid size={16} />,
    })), query ? 5 : 6)

    const today = schedules.filter((s) => s.dayOffset === 0).sort((a, b) => a.time.localeCompare(b.time))
    take(today.filter((s) => (query ? matchesQuery([customerById(s.customerId)?.name, s.service, s.time, teamById(s.teamId)?.name, s.id], query) : s.status !== '완료')).map((s) => ({
      key: `sc-${s.id}`, group: '오늘 일정', title: `${s.time} ${customerById(s.customerId)?.name ?? ''}`,
      sub: `${s.service} · ${teamById(s.teamId)?.name ?? '미배정'} · ${s.status}`, to: `/schedule?id=${s.id}`, icon: <CalendarClock size={16} />,
    })), query ? 6 : 3)

    take(requests.filter((r) => (query ? matchesQuery([r.id, r.type, r.detail, customerById(r.customerId)?.name], query) : ['접수', '검토중', '처리중'].includes(r.status))).map((r) => ({
      key: `rq-${r.id}`, group: '고객 요청', title: `${customerById(r.customerId)?.name ?? ''} — ${r.type}`,
      sub: `${r.id} · ${r.status} · ${r.detail}`, to: `/requests?id=${r.id}`, icon: <Inbox size={16} />,
    })), query ? 5 : 3)

    if (query) {
      take(CUSTOMERS.filter((c) => matchesQuery([c.name, c.district, c.type, c.contract.serviceSummary, c.contract.customerManager], query)).map((c) => ({
        key: `cu-${c.id}`, group: '고객', title: c.name, sub: `${c.district} · ${c.type} · 갱신 D-${c.contract.renewalDDay}`, to: `/customers/${c.id}`, icon: <Building2 size={16} />,
      })), 6)
      take(SITES.filter((s) => matchesQuery([s.name, s.address], query)).map((s) => ({
        key: `si-${s.id}`, group: '현장', title: s.name, sub: s.address, to: `/sites/${s.customerId}`, icon: <MapPin size={16} />,
      })), 4)
      take(TEAMS.filter((t) => matchesQuery([t.name, teamMemberNames(t.id), t.specialty.join(' ')], query)).map((t) => ({
        key: `tm-${t.id}`, group: '팀', title: t.name, sub: `${teamMemberNames(t.id)} · ${t.specialty.join(' / ')}`, to: '/team', icon: <Users size={16} />,
      })), 3)
    }
    const order = query ? GROUP_ORDER : IDLE_ORDER
    return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group))
  }, [q, pages, schedules, requests])

  useEffect(() => { setActive(0) }, [q])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null
  const go = (h: Hit) => { onClose(); nav(h.to) }
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(hits.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); go(hits[active]) }
  }
  const optionId = (i: number) => `${listId}-o${i}`
  let lastGroup = ''

  return createPortal(
    <div className="fixed inset-0 z-[65] flex items-start justify-center sm:px-4 sm:pt-[12vh]">
      <Backdrop onClick={onClose} label="검색 닫기" className="bg-shell/45 backdrop-blur-[2px]" />
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="전역 검색" className="sheet-in relative flex h-full w-full flex-col overflow-hidden bg-card shadow-pop sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search size={18} className="shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={hits[active] ? optionId(active) : undefined}
            aria-label="검색어"
            placeholder="고객사 · 현장 · 일정 시각 · 요청번호 · 화면 이름"
            className="palette-input min-w-0 flex-1 bg-transparent py-1 text-[1rem] outline-none placeholder:text-ink-faint/70"
          />
          {q && <button onClick={() => { setQ(''); inputRef.current?.focus() }} className="rounded-md px-1.5 py-0.5 text-[0.76rem] font-bold text-ink-faint hover:text-ink">지우기</button>}
          <button onClick={onClose} aria-label="닫기" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-soft"><X size={18} /></button>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="검색 결과" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {hits.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-bold text-ink-soft">‘{q}’에 해당하는 결과가 없습니다</p>
              <p className="mt-1 text-[0.82rem] text-ink-faint">고객사 이름 일부(예: 강남), 시각(예: 15:30), 요청번호(예: R-01)로 찾아보세요.</p>
            </div>
          ) : hits.map((h, i) => {
            const head = h.group !== lastGroup
            lastGroup = h.group
            return (
              <div key={h.key}>
                {head && <p className="px-2.5 pb-1 pt-2.5 text-[0.7rem] font-extrabold tracking-wide text-ink-faint first:pt-1">{!q && h.group === '화면' ? '화면 바로가기' : h.group}{!q && h.group !== '화면' ? ' · 지금 볼 것' : ''}</p>}
                <div
                  id={optionId(i)}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  tabIndex={-1}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(h)}
                  onKeyDown={(e) => { if (e.key === 'Enter') go(h) }}
                  className={cx('flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2', i === active ? 'bg-mint/70' : 'hover:bg-ivory')}
                >
                  <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', i === active ? 'bg-primary text-white' : 'bg-ivory text-ink-soft')}>{h.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] font-bold">{h.title}</span>
                    <span className="block truncate text-[0.76rem] text-ink-faint">{h.sub}</span>
                  </span>
                  {i === active && <CornerDownLeft size={14} className="shrink-0 text-ink-faint" aria-hidden="true" />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden items-center gap-3 border-t border-line bg-ivory/60 px-4 py-2 text-[0.72rem] font-semibold text-ink-faint sm:flex">
          <span><kbd className="font-sans font-bold">↑↓</kbd> 이동</span>
          <span><kbd className="font-sans font-bold">Enter</kbd> 열기</span>
          <span><kbd className="font-sans font-bold">Esc</kbd> 닫기</span>
          <span className="ml-auto">⌘K · Ctrl+K · /</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
