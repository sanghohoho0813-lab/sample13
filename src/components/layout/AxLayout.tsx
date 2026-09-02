import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Zap, CalendarClock, MapPin, ClipboardList, Users, Building2,
  Inbox, ShieldCheck, RefreshCcw, TrendingUp, PieChart, Sparkles, ScrollText,
  BookOpen, Settings, Menu, X, Store, ChevronDown, Play,
  RotateCcw, BadgeCheck, Smartphone, MoreHorizontal, Palette,
} from 'lucide-react'
import { useDemo } from '../../lib/data/store'
import { ROLE_LABEL, type Role } from '../../types'
import { Badge, Freshness } from '../ui'
import { cx, nowClock, nowDateLong, nowDateCompact } from '../../lib/utils'
import DevicePreview from './DevicePreview'
import { useTour, useAutoTutorial } from '../tour/TourProvider'
import { MiraeCredit } from '../brand/MiraeLogo'

// ─── Nav model — Role 접근제어(RLS Preview) + Module Icon Color ──
interface NavItem { to: string; label: string; icon: ReactNode; roles: Role[]; color: string }
interface NavGroup { label: string; items: NavItem[] }

// Icon Color Mapping — Desktop Sidebar와 Mobile Drawer가 동일 (Unified v1.1)
const C = {
  dashboard: '#5B9BF0', today: '#4FC3D9', schedule: '#37B0A8', field: '#3FBF8F',
  team: '#4FB6A0', customer: '#C58AA8', retention: '#D98899', upsell: '#DFAE5E',
  profit: '#E0973F', ai: '#8C93EA', evidence: '#4FB985', why: '#D3B375', settings: '#98A6B5',
}

const NAV: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', label: '대시보드', icon: <LayoutDashboard size={18} />, roles: ['ceo', 'manager'], color: C.dashboard },
      { to: '/today', label: '오늘의 AX', icon: <Zap size={18} />, roles: ['ceo', 'manager'], color: C.today },
    ],
  },
  {
    label: 'SERVICE OPERATIONS',
    items: [
      { to: '/schedule', label: '일정 / 배정', icon: <CalendarClock size={18} />, roles: ['ceo', 'manager'], color: C.schedule },
      { to: '/sites', label: '현장관리', icon: <MapPin size={18} />, roles: ['ceo', 'manager'], color: C.field },
      { to: '/work', label: '작업현황', icon: <ClipboardList size={18} />, roles: ['ceo', 'manager'], color: C.field },
      { to: '/team', label: '직원 / 팀', icon: <Users size={18} />, roles: ['ceo', 'manager'], color: C.team },
    ],
  },
  {
    label: 'CUSTOMER',
    items: [
      { to: '/customers', label: '고객 / 계약', icon: <Building2 size={18} />, roles: ['ceo', 'manager'], color: C.customer },
      { to: '/requests', label: '요청 / 문의', icon: <Inbox size={18} />, roles: ['ceo', 'manager'], color: C.customer },
      { to: '/quality', label: '품질 / 만족도', icon: <ShieldCheck size={18} />, roles: ['ceo', 'manager'], color: C.retention },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { to: '/renewals', label: '재계약 관리', icon: <RefreshCcw size={18} />, roles: ['ceo', 'manager'], color: C.retention },
      { to: '/upsell', label: '추가서비스', icon: <TrendingUp size={18} />, roles: ['ceo', 'manager'], color: C.upsell },
      { to: '/profitability', label: '수익성 분석', icon: <PieChart size={18} />, roles: ['ceo'], color: C.profit },
    ],
  },
  { label: 'AI', items: [{ to: '/ai', label: 'AI Operations Center', icon: <Sparkles size={18} />, roles: ['ceo', 'manager'], color: C.ai }] },
  {
    label: 'AX',
    items: [
      { to: '/evidence', label: 'AX Evidence', icon: <ScrollText size={18} />, roles: ['ceo'], color: C.evidence },
      { to: '/why-ax', label: '기획의도', icon: <BookOpen size={18} />, roles: ['ceo', 'manager'], color: C.why },
    ],
  },
  { label: 'SYSTEM', items: [{ to: '/settings', label: '설정', icon: <Settings size={18} />, roles: ['ceo'], color: C.settings }] },
]

const IconTile = ({ color, children, dark }: { color: string; children: ReactNode; dark?: boolean }) => (
  <span
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
    style={{ background: dark ? `${color}24` : `${color}1F`, color }}
  >
    {children}
  </span>
)

// ─── 실시간 날짜 + 시각 (Desktop/Mobile 모두 날짜 표시 — Date/Time Parity) ──
function LiveClock() {
  const [clock, setClock] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setClock(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="leading-tight min-w-0">
      {/* Desktop: 전체 날짜 / Mobile: 압축 날짜 — 삭제하지 않고 압축 */}
      <p className="hidden text-[0.75rem] font-semibold text-ink-soft whitespace-nowrap sm:block">{nowDateLong()}</p>
      <p className="text-[0.68rem] font-bold text-ink-soft whitespace-nowrap sm:hidden">{nowDateCompact()}</p>
      <p className="tnum text-[0.9rem] font-extrabold tracking-wide text-primary whitespace-nowrap sm:text-[0.95rem]">{clock}</p>
    </div>
  )
}

// ─── Role Switcher ──
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
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex items-center gap-1 rounded-xl border border-line bg-card font-bold hover:border-primary',
          compact ? 'px-2.5 py-1.5 text-[0.75rem]' : 'px-3 py-1.5 text-[0.82rem]',
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
            <p className="px-2.5 pt-1 pb-1.5 text-[0.66rem] font-bold text-ink-faint">DEMO ROLE SWITCHER · 권한 체감</p>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => pick(r)}
                className={cx(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[0.85rem] font-bold hover:bg-mint',
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

// ─── Sidebar / Drawer 본문 ──
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useDemo()
  const { start } = useTour()
  const groups = useMemo(
    () => NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length > 0),
    [role],
  )
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-5">
        <p className="text-[1.12rem] font-extrabold tracking-wide text-white leading-tight">CLEANWAY<br />PARTNERS</p>
        <p className="mt-1 text-[0.82rem] font-bold tracking-[0.14em] text-champagne">Service Intelligence AX</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3.5 pb-4 space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-2.5 pb-1.5 text-[0.64rem] font-bold tracking-[0.16em] text-aqua">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) => cx(
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.92rem] font-bold transition-colors',
                    isActive ? 'bg-white/12 text-white' : 'text-[#B9D2D2] hover:bg-white/8 hover:text-white',
                  )}
                >
                  <IconTile color={i.color} dark>{i.icon}</IconTile>
                  {i.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => { onNavigate?.(); start('presentation') }}
          className="mt-2 flex w-full items-center gap-2.5 rounded-xl border border-champagne/40 px-2.5 py-2 text-[0.9rem] font-bold text-champagne hover:bg-champagne/10"
        >
          <IconTile color="#D7BC86" dark><Play size={17} /></IconTile> 시연 모드
        </button>
      </nav>
      <div className="border-t border-shell-line px-5 py-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Badge tone="warning">DEMO MODE</Badge>
          <button
            onClick={() => start('tutorial')}
            className="flex items-center gap-1 text-[0.7rem] font-bold text-[#B9D2D2] hover:text-white"
          >
            <Sparkles size={11} /> 튜토리얼
          </button>
        </div>
        <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-[#8FB3B3]">
          <BadgeCheck size={12} className="text-champagne" /> TECH ASSET · AX 기술자산 연계 검토중
        </p>
        <p className="text-[0.66rem] leading-relaxed text-[#6E9595]">
          모든 데이터는 가상의 Sample Data입니다.
        </p>
        <MiraeCredit tone="dark" height={18} className="pt-0.5" />
      </div>
    </div>
  )
}

// ─── More Sheet — "더보기 = 추가 메뉴" (Navigation Semantics) ──
function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, resetDemo } = useDemo()
  const { start } = useTour()
  const nav = useNavigate()
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
  const items = ([
    { label: '오늘의 AX', icon: <Zap size={18} />, color: C.today, run: () => go('/today'), roles: ['ceo', 'manager'] },
    { label: '현장관리', icon: <MapPin size={18} />, color: C.field, run: () => go('/sites'), roles: ['ceo', 'manager'] },
    { label: '작업현황', icon: <ClipboardList size={18} />, color: C.field, run: () => go('/work'), roles: ['ceo', 'manager'] },
    { label: '직원 / 팀', icon: <Users size={18} />, color: C.team, run: () => go('/team'), roles: ['ceo', 'manager'] },
    { label: '재계약 관리', icon: <RefreshCcw size={18} />, color: C.retention, run: () => go('/renewals'), roles: ['ceo', 'manager'] },
    { label: '추가서비스', icon: <TrendingUp size={18} />, color: C.upsell, run: () => go('/upsell'), roles: ['ceo', 'manager'] },
    { label: '수익성 분석', icon: <PieChart size={18} />, color: C.profit, run: () => go('/profitability'), roles: ['ceo'] },
    { label: 'AX Evidence', icon: <ScrollText size={18} />, color: C.evidence, run: () => go('/evidence'), roles: ['ceo'] },
    { label: '기획의도', icon: <BookOpen size={18} />, color: C.why, run: () => go('/why-ax'), roles: ['ceo', 'manager'] },
    { label: '설정 · 테마', icon: <Palette size={18} />, color: C.settings, run: () => go('/settings'), roles: ['ceo'] },
    { label: '고객 화면 보기', icon: <Store size={18} />, color: C.customer, run: () => go('/care'), roles: ['ceo', 'manager'] },
    { label: '현장직원 화면', icon: <Smartphone size={18} />, color: C.field, run: () => go('/field'), roles: ['ceo', 'manager'] },
    { label: '튜토리얼 다시보기', icon: <Sparkles size={18} />, color: C.ai, run: () => { onClose(); start('tutorial') }, roles: ['ceo', 'manager'] },
    { label: '시연 모드', icon: <Play size={18} />, color: C.why, run: () => { onClose(); start('presentation') }, roles: ['ceo', 'manager'] },
    { label: '데모 초기화', icon: <RotateCcw size={18} />, color: C.settings, run: () => { if (confirm('데모 상태를 초기 시연 상태로 되돌릴까요?')) { resetDemo(); onClose() } }, roles: ['ceo', 'manager'] },
  ] as Array<{ label: string; icon: ReactNode; color: string; run: () => void; roles: Role[] }>)
    .filter((i) => i.roles.includes(role))

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-shell/55" />
      <div onClick={(e) => e.stopPropagation()} className="slide-up relative max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-card px-5 py-3.5">
          <p className="text-[1rem] font-extrabold">더보기</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-[#EFF1F0]" aria-label="닫기"><X size={19} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {items.map((i) => (
            <button key={i.label} onClick={i.run} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line px-2 py-3.5 text-[0.74rem] font-bold text-ink hover:border-primary hover:text-primary">
              <IconTile color={i.color}>{i.icon}</IconTile>
              <span className="text-center leading-tight">{i.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile bottom nav ──
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
            'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.66rem] font-bold',
            isActive ? 'text-primary' : 'text-ink-faint',
          )}
        >
          {i.icon}{i.label}
        </NavLink>
      ))}
      <button onClick={onMore} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.66rem] font-bold text-ink-faint">
        <MoreHorizontal size={20} /> 더보기
      </button>
    </nav>
  )
}

// ─── Layout ──
export default function AxLayout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const [more, setMore] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const { tutorialSeen, markTutorialSeen, role } = useDemo()


  useEffect(() => { setDrawer(false); setMore(false) }, [loc.pathname])
  useEffect(() => {
    if (!drawer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
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
          <aside className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] bg-shell shadow-pop">
            <button onClick={() => setDrawer(false)} className="absolute right-2 top-2 z-10 rounded-lg p-2 text-white/70 hover:bg-white/10" aria-label="메뉴 닫기"><X size={20} /></button>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-2 px-3 py-2.5 sm:px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button onClick={() => setDrawer(true)} className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-[#EFF1F0] lg:hidden" aria-label="전체 메뉴">
                <Menu size={22} />
              </button>
              <LiveClock />
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="hidden xl:block"><Freshness /></div>
              <DevicePreview compact />
              {role !== 'customer' && (
                <button
                  onClick={() => nav('/care')}
                  className="hidden items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[0.8rem] font-bold text-white hover:bg-primary-strong sm:flex"
                >
                  <Store size={15} /> 고객 화면 보기
                </button>
              )}
              <RoleSwitcher compact />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1720px] px-4 py-6 pb-24 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <AxBottomNav onMore={() => setMore(true)} />
      <MoreSheet open={more} onClose={() => setMore(false)} />
    </div>
  )
}
