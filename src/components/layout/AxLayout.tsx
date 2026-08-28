import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Zap, CalendarClock, MapPin, ClipboardList, Users, Building2,
  Inbox, ShieldCheck, RefreshCcw, TrendingUp, PieChart, Sparkles, ScrollText,
  BookOpen, Settings, Menu, X, MonitorSmartphone, Store, ChevronDown, Play,
  RotateCcw, BadgeCheck, Smartphone, Monitor,
} from 'lucide-react'
import { useDemo } from '../../lib/data/store'
import { COMPANY } from '../../lib/demo/company'
import { ROLE_LABEL, type Role } from '../../types'
import { Badge, Btn, Freshness, Modal } from '../ui'
import { cx, nowClock, nowDateLong } from '../../lib/utils'

// ─── Nav model (Role별 접근 제어 — RLS Preview) ──────────
interface NavItem { to: string; label: string; icon: ReactNode; roles: Role[] }
interface NavGroup { label: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', label: '대시보드', icon: <LayoutDashboard size={19} />, roles: ['ceo', 'manager'] },
      { to: '/today', label: '오늘의 AX', icon: <Zap size={19} />, roles: ['ceo', 'manager'] },
    ],
  },
  {
    label: 'SERVICE OPERATIONS',
    items: [
      { to: '/schedule', label: '일정 / 배정', icon: <CalendarClock size={19} />, roles: ['ceo', 'manager'] },
      { to: '/sites', label: '현장관리', icon: <MapPin size={19} />, roles: ['ceo', 'manager'] },
      { to: '/work', label: '작업현황', icon: <ClipboardList size={19} />, roles: ['ceo', 'manager'] },
      { to: '/team', label: '직원 / 팀', icon: <Users size={19} />, roles: ['ceo', 'manager'] },
    ],
  },
  {
    label: 'CUSTOMER',
    items: [
      { to: '/customers', label: '고객 / 계약', icon: <Building2 size={19} />, roles: ['ceo', 'manager'] },
      { to: '/requests', label: '요청 / 문의', icon: <Inbox size={19} />, roles: ['ceo', 'manager'] },
      { to: '/quality', label: '품질 / 만족도', icon: <ShieldCheck size={19} />, roles: ['ceo', 'manager'] },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { to: '/renewals', label: '재계약 관리', icon: <RefreshCcw size={19} />, roles: ['ceo', 'manager'] },
      { to: '/upsell', label: '추가서비스', icon: <TrendingUp size={19} />, roles: ['ceo', 'manager'] },
      { to: '/profitability', label: '수익성 분석', icon: <PieChart size={19} />, roles: ['ceo'] },
    ],
  },
  {
    label: 'AI',
    items: [{ to: '/ai', label: 'AI Operations Center', icon: <Sparkles size={19} />, roles: ['ceo', 'manager'] }],
  },
  {
    label: 'AX',
    items: [
      { to: '/evidence', label: 'AX Evidence', icon: <ScrollText size={19} />, roles: ['ceo'] },
      { to: '/why-ax', label: '기획의도', icon: <BookOpen size={19} />, roles: ['ceo', 'manager'] },
    ],
  },
  {
    label: 'SYSTEM',
    items: [{ to: '/settings', label: '설정', icon: <Settings size={19} />, roles: ['ceo'] }],
  },
]

// ─── Live clock ──────────────────────────────────────────
function LiveClock({ dark }: { dark?: boolean }) {
  const [clock, setClock] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setClock(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className={cx('leading-tight min-w-0', dark ? 'text-white/90' : 'text-ink')}>
      <p className="hidden sm:block text-[0.75rem] font-semibold whitespace-nowrap">{nowDateLong()}</p>
      <p className={cx('tnum text-[0.95rem] font-extrabold tracking-wide whitespace-nowrap', dark ? 'text-champagne' : 'text-primary')}>{clock}</p>
    </div>
  )
}

// ─── Role Switcher ───────────────────────────────────────
function RoleSwitcher() {
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
        className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-[0.82rem] font-bold hover:border-primary"
      >
        <Users size={15} className="text-primary" />
        {ROLE_LABEL[role]}
        <ChevronDown size={14} className="text-ink-faint" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="pop-in absolute right-0 z-40 mt-2 w-52 rounded-xl border border-line bg-card p-1.5 shadow-pop">
            <p className="px-2.5 pt-1 pb-1.5 text-[0.68rem] font-bold text-ink-faint">DEMO ROLE SWITCHER · 권한 체감</p>
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

// ─── Device Preview (iframe = 실제 Responsive CSS) ───────
export function DevicePreview() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  return (
    <>
      <div className="hidden lg:flex items-center rounded-xl border border-line bg-card p-0.5">
        <button className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[0.75rem] font-bold text-white"><Monitor size={13} /> PC</button>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.75rem] font-bold text-ink-soft hover:text-primary"><Smartphone size={13} /> Mobile</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-shell/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="pop-in flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-white">
              <MonitorSmartphone size={18} />
              <span className="text-[0.9rem] font-bold">Mobile Preview — 실제 Responsive CSS 렌더링</span>
              <button onClick={() => setOpen(false)} className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"><X size={18} /></button>
            </div>
            <div className="phone-frame">
              <iframe title="mobile-preview" src={loc.pathname} className="h-[72vh] max-h-[760px] w-full border-0" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Tutorial ────────────────────────────────────────────
const TUTORIAL_STEPS = [
  { title: '오늘 먼저 확인할 것', body: '오늘 회사에서 먼저 확인해야 할 현장과 위험을 대시보드가 보여줍니다.' },
  { title: 'AI Smart Dispatch', body: 'AI가 일정과 직원상황을 비교해 최적의 팀 배정을 추천합니다.' },
  { title: '현장 모바일 업무', body: '현장직원은 모바일에서 체크인부터 작업완료까지 처리합니다.' },
  { title: 'Customer ↔ AX 연결', body: '고객 요청과 작업결과는 Customer Portal과 내부 AX에 함께 연결됩니다.' },
]

export function Tutorial() {
  const { tutorialSeen, markTutorialSeen } = useDemo()
  const [step, setStep] = useState(0)
  if (tutorialSeen) return null
  const s = TUTORIAL_STEPS[step]
  return (
    <Modal open onClose={markTutorialSeen} title={`시작하기 ${step + 1} / ${TUTORIAL_STEPS.length}`}>
      <div className="space-y-4">
        <p className="text-[1.05rem] font-extrabold">{s.title}</p>
        <p className="text-[0.92rem] leading-relaxed text-ink-soft">{s.body}</p>
        <div className="flex items-center justify-between pt-2">
          <button onClick={markTutorialSeen} className="text-[0.82rem] font-bold text-ink-faint hover:underline">건너뛰기</button>
          <div className="flex gap-2">
            {step > 0 && <Btn variant="outline" size="sm" onClick={() => setStep(step - 1)}>이전</Btn>}
            {step < TUTORIAL_STEPS.length - 1
              ? <Btn size="sm" onClick={() => setStep(step + 1)}>다음</Btn>
              : <Btn size="sm" onClick={markTutorialSeen}>시작하기</Btn>}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Sidebar ─────────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role, resetDemo } = useDemo()
  const nav = useNavigate()
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
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-bold transition-colors',
                    isActive ? 'bg-white/12 text-white border-l-[3px] border-champagne pl-[9px]' : 'text-[#B9D2D2] hover:bg-white/8 hover:text-white',
                  )}
                >
                  {i.icon}{i.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => { nav('/presentation'); onNavigate?.() }}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-champagne/40 px-3 py-2.5 text-[0.9rem] font-bold text-champagne hover:bg-champagne/10"
        >
          <Play size={17} /> 시연 모드
        </button>
      </nav>
      <div className="border-t border-shell-line px-5 py-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Badge tone="warning">DEMO MODE</Badge>
          <button
            onClick={() => { if (confirm('데모 상태를 초기 시연 상태로 되돌릴까요?')) resetDemo() }}
            className="flex items-center gap-1 text-[0.7rem] font-bold text-[#B9D2D2] hover:text-white"
          >
            <RotateCcw size={11} /> 데모 초기화
          </button>
        </div>
        <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-[#8FB3B3]">
          <BadgeCheck size={12} className="text-champagne" /> TECH ASSET · AX 기술자산 연계 검토중
        </p>
        <p className="text-[0.66rem] leading-relaxed text-[#6E9595]">
          미래AI랩 Reference MVP<br />모든 데이터는 가상의 Sample Data입니다.
        </p>
      </div>
    </div>
  )
}

// ─── Mobile bottom nav (Business AX) ─────────────────────
function AxBottomNav() {
  const items = [
    { to: '/', label: '홈', icon: <LayoutDashboard size={21} /> },
    { to: '/schedule', label: '일정', icon: <CalendarClock size={21} /> },
    { to: '/ai', label: 'AI', icon: <Sparkles size={21} /> },
    { to: '/customers', label: '고객', icon: <Building2 size={21} /> },
    { to: '/today', label: '더보기', icon: <Menu size={21} /> },
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
    </nav>
  )
}

// ─── Layout ──────────────────────────────────────────────
export default function AxLayout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  useEffect(() => { setDrawer(false) }, [loc.pathname])

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar 280px */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] bg-shell lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-shell/60" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[290px] bg-shell shadow-pop">
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[280px]">
        {/* Utility header */}
        <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawer(true)} className="rounded-lg p-1.5 text-ink-soft hover:bg-[#EFF1F0] lg:hidden" aria-label="메뉴">
                <Menu size={22} />
              </button>
              <LiveClock />
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block"><Freshness /></div>
              <DevicePreview />
              <button
                onClick={() => nav('/care')}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[0.82rem] font-bold text-white hover:bg-primary-strong"
              >
                <Store size={15} /> <span className="hidden sm:inline">고객 화면 보기</span><span className="sm:hidden">고객</span>
              </button>
              <RoleSwitcher />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1720px] px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <AxBottomNav />
      <Tutorial />
    </div>
  )
}
