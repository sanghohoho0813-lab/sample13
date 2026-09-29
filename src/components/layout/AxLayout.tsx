import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Zap, CalendarClock, MapPin, ClipboardList, Users, Building2,
  Inbox, ShieldCheck, RefreshCcw, TrendingUp, PieChart, Sparkles, ScrollText,
  BookOpen, Settings, Menu, X, Store, ChevronDown, Play,
  RotateCcw, Smartphone, MoreHorizontal, ArrowRight, Compass, Handshake, LineChart,
} from 'lucide-react'
import { useDemo } from '../../lib/data/store'
import { ROLE_LABEL, type Role } from '../../types'
import { Badge, Freshness } from '../ui'
import { cx, nowClock, nowDateLong, nowDateCompact } from '../../lib/utils'
import DevicePreview from './DevicePreview'
import { useTour, useAutoTutorial } from '../tour/TourProvider'
import { MiraeCredit } from '../brand/MiraeLogo'
import { SampleBridgeCTA, SampleBridgeMini } from '../brand/SampleBridgeCTA'
import { ROADMAP, STAGE_NOTE, type RoadmapStage } from '../../lib/demo/roadmap'

/* ═══════════════════════════════════════════════════════════════════
   Navigation 정보구조 (IA)
   ─ 사용자가 처음 보는 상위 항목은 7개. 세부 기능은 상위 항목 안으로 들어간다.
   ─ 기존 Route는 하나도 바꾸지 않는다 — 메뉴 구조만 정리한다.
   ─ 같은 상위 항목의 아이콘은 같은 색 계열을 쓴다 (5 families).
   ═══════════════════════════════════════════════════════════════════ */

// Icon Color Family — 카테고리마다 하나. 색만 봐도 어느 영역인지 느껴지게 한다.
export const FAMILY = {
  ops: '#52A7A3',      // 운영 (개요 · 현장 운영)
  customer: '#C58AA8', // 고객
  growth: '#DFAE5E',   // 성장 · 분석
  ai: '#8C93EA',       // AI
  system: '#98A6B5',   // 소개 · 설정
} as const
type Family = keyof typeof FAMILY

interface NavLeaf { to: string; label: string; icon: ReactNode; roles: Role[] }
interface NavEntry {
  key: string
  label: string
  icon: ReactNode
  family: Family
  /** 단일 링크 */
  to?: string
  roles: Role[]
  /** 그룹 — 하위 항목 */
  items?: NavLeaf[]
}

const ALL: Role[] = ['ceo', 'manager']

export const NAV: NavEntry[] = [
  { key: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} />, family: 'ops', to: '/', roles: ALL },
  { key: 'today', label: '오늘의 AX', icon: <Zap size={18} />, family: 'ops', to: '/today', roles: ALL },
  {
    key: 'ops', label: '현장 운영', icon: <MapPin size={18} />, family: 'ops', roles: ALL,
    items: [
      { to: '/schedule', label: '일정 / 배정', icon: <CalendarClock size={17} />, roles: ALL },
      { to: '/sites', label: '현장관리', icon: <MapPin size={17} />, roles: ALL },
      { to: '/work', label: '작업현황', icon: <ClipboardList size={17} />, roles: ALL },
      { to: '/team', label: '직원 / 팀', icon: <Users size={17} />, roles: ALL },
    ],
  },
  {
    key: 'customer', label: '고객 관리', icon: <Building2 size={18} />, family: 'customer', roles: ALL,
    items: [
      { to: '/customers', label: '고객 / 계약', icon: <Building2 size={17} />, roles: ALL },
      { to: '/requests', label: '요청 / 문의', icon: <Inbox size={17} />, roles: ALL },
      { to: '/quality', label: '품질 / 만족도', icon: <ShieldCheck size={17} />, roles: ALL },
      { to: '/renewals', label: '재계약 관리', icon: <RefreshCcw size={17} />, roles: ALL },
    ],
  },
  {
    key: 'growth', label: '성장 · 분석', icon: <LineChart size={18} />, family: 'growth', roles: ALL,
    items: [
      { to: '/upsell', label: '추가서비스', icon: <TrendingUp size={17} />, roles: ALL },
      { to: '/profitability', label: '수익성 분석', icon: <PieChart size={17} />, roles: ['ceo'] },
      { to: '/evidence', label: 'AX 실증 기록', icon: <ScrollText size={17} />, roles: ['ceo'] },
    ],
  },
  { key: 'ai', label: 'AI 센터', icon: <Sparkles size={18} />, family: 'ai', to: '/ai', roles: ALL },
  {
    key: 'system', label: '소개 · 설정', icon: <Compass size={18} />, family: 'system', roles: ALL,
    items: [
      { to: '/why-ax', label: '기획의도', icon: <BookOpen size={17} />, roles: ALL },
      { to: '/settings', label: '설정', icon: <Settings size={17} />, roles: ['ceo'] },
    ],
  },
]

/** Role 필터를 적용한 메뉴 */
function useNav(role: Role) {
  return useMemo(
    () => NAV
      .filter((e) => e.roles.includes(role))
      .map((e) => (e.items ? { ...e, items: e.items.filter((i) => i.roles.includes(role)) } : e))
      .filter((e) => !e.items || e.items.length > 0),
    [role],
  )
}

/** 현재 경로가 속한 그룹 key */
function activeGroupKey(pathname: string) {
  for (const e of NAV) {
    if (e.items?.some((i) => pathname === i.to || pathname.startsWith(i.to + '/'))) return e.key
  }
  return null
}

const IconTile = ({ color, children, dark, size = 8 }: { color: string; children: ReactNode; dark?: boolean; size?: 7 | 8 }) => (
  <span
    className={cx('flex shrink-0 items-center justify-center rounded-lg', size === 8 ? 'h-8 w-8' : 'h-7 w-7')}
    style={{ background: dark ? `${color}26` : `${color}1F`, color }}
  >
    {children}
  </span>
)

/* ─── 확장 기능 (향후 로드맵) ─────────────────────────────────────
   핵심 메뉴와 같은 무게로 나열하지 않는다. 기본은 접힌 한 줄 — "확장 기능 보기".
   아직 구현되지 않은 영역이므로 Route를 만들지 않고 설명만 펼친다. */
const STAGE_STYLE: Record<RoadmapStage, string> = {
  'NEXT': 'border-champagne/50 text-champagne',
  'Preview': 'border-aqua/50 text-aqua',
  'Long-term': 'border-white/25 text-[#8FB3B3]',
}
const ROADMAP_OPEN_KEY = 'cleanway.roadmapOpen'
const readRoadmapOpen = () => {
  try { return localStorage.getItem(ROADMAP_OPEN_KEY) === '1' } catch { return false }
}

function NextRoadmap({ onNavigate }: { onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(readRoadmapOpen)
  const [open, setOpen] = useState<string | null>(null)
  const toggle = () => {
    setExpanded((v) => {
      const next = !v
      try { localStorage.setItem(ROADMAP_OPEN_KEY, next ? '1' : '0') } catch { /* 저장 불가여도 동작에는 영향 없음 */ }
      if (!next) setOpen(null)
      return next
    })
  }
  void onNavigate
  return (
    <div>
      <button
        onClick={toggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.9rem] font-bold text-[#9FBDBD] hover:bg-white/6 hover:text-white"
      >
        <IconTile color={FAMILY.system} dark><Handshake size={18} /></IconTile>
        <span className="min-w-0 flex-1 truncate">확장 기능 보기</span>
        <span className="rounded-md border border-white/20 px-1.5 py-[0.05rem] text-[0.7rem] font-bold text-[#8FB3B3]">{ROADMAP.length}</span>
        <ChevronDown size={15} className={cx('shrink-0 text-white/40 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="fade-up mt-1 space-y-0.5 border-l border-shell-line pl-3 ml-4">
          {ROADMAP.map((i) => {
            const isOpen = open === i.key
            return (
              <div key={i.key}>
                <button
                  onClick={() => setOpen(isOpen ? null : i.key)}
                  aria-expanded={isOpen}
                  className={cx(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.84rem] font-semibold transition-colors',
                    isOpen ? 'bg-white/8 text-white' : 'text-[#9FBDBD] hover:bg-white/6 hover:text-white',
                  )}
                >
                  <i.icon size={15} className="shrink-0 opacity-80" />
                  <span className="min-w-0 flex-1 truncate">{i.label}</span>
                  <span className={cx('shrink-0 rounded-md border px-1.5 py-[0.05rem] text-[0.7rem] font-bold', STAGE_STYLE[i.stage])}>
                    {STAGE_NOTE[i.stage]}
                  </span>
                </button>
                {isOpen && (
                  <p className="fade-up mx-2 mb-1 mt-0.5 rounded-lg bg-white/6 px-3 py-2 text-[0.78rem] leading-relaxed text-[#B9D2D2]">{i.desc}</p>
                )}
              </div>
            )
          })}
          <p className="px-2 pt-1.5 text-[0.72rem] leading-relaxed text-[#6E9595]">
            아직 구현되지 않은 로드맵입니다. 현재 데이터를 그대로 재사용하는 범위로만 정리했습니다.
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── 실시간 날짜 + 시각 ─────────────────────────────────────────── */
function LiveClock() {
  const [clock, setClock] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setClock(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="leading-tight min-w-0">
      {/* Desktop: 전체 날짜 / Mobile: 압축 날짜 — 삭제하지 않고 압축 */}
      <p className="hidden text-[0.76rem] font-semibold text-ink-soft whitespace-nowrap sm:block">{nowDateLong()}</p>
      <p className="text-[0.72rem] font-bold text-ink-soft whitespace-nowrap sm:hidden">{nowDateCompact()}</p>
      <p className="tnum text-[0.95rem] font-extrabold tracking-wide text-primary whitespace-nowrap">{clock}</p>
    </div>
  )
}

/* ─── 역할 전환 ──────────────────────────────────────────────────── */
function RoleSwitcher({ compact }: { compact?: boolean }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const pick = (r: Role) => {
    setRole(r)
    setOpen(false)
    if (r === 'field') nav('/field')
    else if (r === 'customer') nav('/care/home')
    else nav('/')
  }
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex min-h-[2.25rem] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-line bg-card font-bold hover:border-primary',
          compact ? 'px-2.5 py-1.5 text-[0.78rem]' : 'px-3 py-1.5 text-[0.84rem]',
        )}
      >
        <Users size={14} className="text-primary" />
        {ROLE_LABEL[role]}
        <ChevronDown size={13} className="text-ink-faint" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="pop-in absolute right-0 z-40 mt-2 w-52 rounded-xl border border-line bg-card p-1.5 shadow-pop">
            <p className="px-2.5 pt-1 pb-1.5 text-[0.72rem] font-bold text-ink-faint">데모 역할 전환 · 권한 체감</p>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => pick(r)}
                className={cx(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.88rem] font-bold hover:bg-mint',
                  r === role && 'bg-mint text-primary-strong',
                )}
              >
                {ROLE_LABEL[r]}
                {r === 'field' && <Smartphone size={13} className="text-ink-faint" />}
                {r === 'customer' && <Store size={13} className="text-ink-faint" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── 고객 플랫폼 보기 — AX ↔ 고객 플랫폼 전환의 단일 명칭 ─────────── */
function CustomerPlatformButton({ variant }: { variant: 'header' | 'drawer' | 'toolbar' }) {
  const nav = useNavigate()
  if (variant === 'drawer') {
    return (
      <button
        onClick={() => nav('/care')}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-champagne px-3 py-2.5 text-[0.9rem] font-extrabold text-shell hover:opacity-90"
      >
        <Store size={17} /> 고객 플랫폼 보기 <ArrowRight size={16} />
      </button>
    )
  }
  return (
    <button
      onClick={() => nav('/care')}
      className={cx(
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary font-bold text-white hover:bg-primary-strong',
        variant === 'toolbar' ? 'min-h-[2.25rem] px-3 py-1.5 text-[0.78rem]' : 'px-3 py-1.5 text-[0.82rem]',
      )}
    >
      <Store size={15} /> 고객 플랫폼 보기
    </button>
  )
}

/* ─── Sidebar / Drawer 본문 ────────────────────────────────────────
   Desktop: 그룹을 모두 펼쳐 보여준다 (폭이 있으므로).
   Mobile Drawer: 그룹은 접이식 — 현재 화면이 속한 그룹만 열린 채 시작한다. */
function SidebarContent({ onNavigate, collapsible }: { onNavigate?: () => void; collapsible?: boolean }) {
  const { role } = useDemo()
  const { start } = useTour()
  const loc = useLocation()
  const entries = useNav(role)
  const [openKey, setOpenKey] = useState<string | null>(() => activeGroupKey(loc.pathname))
  useEffect(() => { setOpenKey(activeGroupKey(loc.pathname)) }, [loc.pathname])

  const linkCls = (isActive: boolean, sub?: boolean) => cx(
    'flex items-center gap-2.5 rounded-xl px-2.5 text-left font-bold transition-colors',
    sub ? 'py-1.5 text-[0.88rem]' : 'py-2 text-[0.92rem]',
    isActive ? 'bg-white/12 text-white' : 'text-[#B9D2D2] hover:bg-white/8 hover:text-white',
  )

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-5 pb-3">
        <p className="text-[1.08rem] font-extrabold tracking-wide text-white leading-tight">CLEANWAY<br />PARTNERS</p>
        <p className="mt-1 text-[0.82rem] font-bold tracking-[0.14em] text-champagne">Service Intelligence AX</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-0.5">
        {entries.map((e) => {
          const color = FAMILY[e.family]
          if (e.to) {
            return (
              <NavLink key={e.key} to={e.to} end={e.to === '/'} onClick={onNavigate} className={({ isActive }) => linkCls(isActive)}>
                <IconTile color={color} dark>{e.icon}</IconTile>
                {e.label}
              </NavLink>
            )
          }
          const groupActive = activeGroupKey(loc.pathname) === e.key
          const isOpen = collapsible ? openKey === e.key : true
          return (
            <div key={e.key}>
              {collapsible ? (
                <button
                  onClick={() => setOpenKey(isOpen ? null : e.key)}
                  aria-expanded={isOpen}
                  className={cx(linkCls(false), 'w-full', groupActive && 'text-white')}
                >
                  <IconTile color={color} dark>{e.icon}</IconTile>
                  <span className="min-w-0 flex-1 truncate">{e.label}</span>
                  <ChevronDown size={15} className={cx('shrink-0 text-white/40 transition-transform', isOpen && 'rotate-180')} />
                </button>
              ) : (
                <p className="flex items-center gap-2.5 px-2.5 pt-3 pb-1 text-[0.74rem] font-bold tracking-[0.08em] text-aqua">
                  {e.label}
                </p>
              )}
              {isOpen && (
                <div className={cx('space-y-0.5', collapsible ? 'fade-up ml-4 border-l border-shell-line pl-2 py-1' : '')}>
                  {e.items!.map((i) => (
                    <NavLink key={i.to} to={i.to} onClick={onNavigate} className={({ isActive }) => linkCls(isActive, collapsible)}>
                      <IconTile color={color} dark size={collapsible ? 7 : 8}>{i.icon}</IconTile>
                      {i.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* 데모 도구 — 소개·설정과 같은 계열 */}
        <div className="pt-2">
          <button onClick={() => { onNavigate?.(); start('presentation') }} className={cx(linkCls(false), 'w-full')}>
            <IconTile color={FAMILY.system} dark><Play size={18} /></IconTile> 시연 모드
          </button>
          <button onClick={() => { onNavigate?.(); start('tutorial') }} className={cx(linkCls(false), 'w-full')}>
            <IconTile color={FAMILY.system} dark><Sparkles size={18} /></IconTile> 튜토리얼
          </button>
          <NextRoadmap onNavigate={onNavigate} />
        </div>
      </nav>

      {/* 하단 — 부가 기능 + 고객 플랫폼 CTA */}
      <div className="border-t border-shell-line px-4 pt-3 pb-3 space-y-2">
        {role !== 'customer' && <CustomerPlatformButton variant="drawer" />}
        <SampleBridgeMini tone="dark" compact />
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[0.72rem] font-semibold text-[#8FB3B3]">데모 · 가상 샘플 데이터</span>
          <MiraeCredit tone="dark" height={14} label="" />
        </div>
      </div>
    </div>
  )
}

/* ─── 더보기 Sheet — 햄버거 메뉴와 같은 정보구조 (그룹별) ───────────── */
function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, resetDemo } = useDemo()
  const { start } = useTour()
  const nav = useNavigate()
  const loc = useLocation()
  const entries = useNav(role)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  if (!open) return null

  const go = (to: string) => { onClose(); nav(to) }
  const rowCls = (active: boolean) => cx(
    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[0.9rem] font-bold',
    active ? 'bg-mint text-primary-strong' : 'text-ink hover:bg-ivory',
  )
  const tools = [
    { label: '현장직원 앱 보기', icon: <Smartphone size={17} />, run: () => go('/field') },
    { label: '시연 모드', icon: <Play size={17} />, run: () => { onClose(); start('presentation') } },
    { label: '튜토리얼', icon: <Sparkles size={17} />, run: () => { onClose(); start('tutorial') } },
    { label: '데모 초기화', icon: <RotateCcw size={17} />, run: () => { if (confirm('데모 상태를 초기 시연 상태로 되돌릴까요?')) { resetDemo(); onClose() } } },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-shell/55" />
      <div onClick={(e) => e.stopPropagation()} className="slide-up relative max-h-[84vh] overflow-y-auto rounded-t-3xl bg-card pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card px-5 py-3.5">
          <p className="text-[1rem] font-extrabold">전체 메뉴</p>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-faint hover:bg-[#EFF1F0]" aria-label="닫기"><X size={20} /></button>
        </div>
        <div className="space-y-4 px-4 pt-3">
          {entries.map((e) => {
            const color = FAMILY[e.family]
            const items = e.items ?? [{ to: e.to!, label: e.label, icon: e.icon, roles: e.roles }]
            return (
              <section key={e.key}>
                {e.items && (
                  <p className="flex items-center gap-2 px-1 pb-1 text-[0.74rem] font-bold text-ink-faint">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {e.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((i) => {
                    const active = i.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(i.to)
                    return (
                      <button key={i.to} onClick={() => go(i.to)} className={rowCls(active)}>
                        <IconTile color={color}>{i.icon}</IconTile>
                        {i.label}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
          <section>
            <p className="px-1 pb-1 text-[0.74rem] font-bold text-ink-faint">데모 도구</p>
            <div className="grid grid-cols-2 gap-1.5">
              {tools.map((t) => (
                <button key={t.label} onClick={t.run} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[0.84rem] font-bold text-ink-soft hover:border-primary hover:text-primary">
                  <span className="text-ink-faint">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </section>
          {role !== 'customer' && <CustomerPlatformButton variant="drawer" />}
        </div>
      </div>
    </div>
  )
}

/* ─── 모바일 하단 내비 — 사용 빈도 상위 4개 + 전체 메뉴 ─────────────── */
function AxBottomNav({ onMore }: { onMore: () => void }) {
  const items = [
    { to: '/', label: '홈', icon: <LayoutDashboard size={20} /> },
    { to: '/schedule', label: '일정', icon: <CalendarClock size={20} /> },
    { to: '/ai', label: 'AI', icon: <Sparkles size={20} /> },
    { to: '/customers', label: '고객', icon: <Building2 size={20} /> },
  ]
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.to === '/'}
          className={({ isActive }) => cx(
            'flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[0.72rem] font-bold',
            isActive ? 'text-primary' : 'text-ink-faint',
          )}
        >
          {i.icon}{i.label}
        </NavLink>
      ))}
      <button onClick={onMore} className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[0.72rem] font-bold text-ink-faint">
        <MoreHorizontal size={20} /> 더보기
      </button>
    </nav>
  )
}

/* ─── Layout ─────────────────────────────────────────────────────── */
export default function AxLayout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const [more, setMore] = useState(false)
  const loc = useLocation()
  const { tutorialSeen, markTutorialSeen, role } = useDemo()

  useEffect(() => { setDrawer(false); setMore(false) }, [loc.pathname])
  useEffect(() => {
    if (!drawer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [drawer])

  useAutoTutorial(tutorialSeen, markTutorialSeen)

  return (
    <div className="min-h-screen bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] bg-shell lg:block">
        <SidebarContent />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-shell/60" onClick={() => setDrawer(false)} />
          <aside className="slide-in-left absolute inset-y-0 left-0 flex w-[86vw] max-w-[370px] flex-col bg-shell shadow-pop">
            <button onClick={() => setDrawer(false)} className="absolute right-2 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-white/70 hover:bg-white/10" aria-label="메뉴 닫기"><X size={22} /></button>
            <SidebarContent onNavigate={() => setDrawer(false)} collapsible />
          </aside>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
          {/* 모바일 데모 툴바 — 역할·미리보기·플랫폼 전환. 메인 헤더와 역할을 나눈다 */}
          <div className="flex items-center justify-between gap-2 border-b border-line/70 bg-ivory px-3 py-1.5 lg:hidden">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="hidden shrink-0 min-[420px]:inline"><Badge tone="warning" className="text-[0.72rem]">DEMO</Badge></span>
              <RoleSwitcher compact />
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <DevicePreview compact />
              {role !== 'customer' && <CustomerPlatformButton variant="toolbar" />}
            </div>
          </div>

          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-8 lg:py-2.5">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <button
                onClick={() => setDrawer(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-[#EFF1F0] lg:hidden"
                aria-label="전체 메뉴"
              >
                <Menu size={23} />
              </button>
              <LiveClock />
            </div>
            {/* Desktop 액션 — 모바일에서는 위 툴바로 이동 */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <div className="hidden xl:block"><Freshness /></div>
              <DevicePreview compact />
              {role !== 'customer' && <CustomerPlatformButton variant="header" />}
              <RoleSwitcher compact />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1720px] px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          {children}
          {/* 샘플을 다 본 뒤의 공통 브릿지 — 모든 AX 화면 하단에 동일하게 붙는다 */}
          <SampleBridgeCTA className="mt-10" />
        </main>
      </div>

      <AxBottomNav onMore={() => setMore(true)} />
      <MoreSheet open={more} onClose={() => setMore(false)} />
    </div>
  )
}
