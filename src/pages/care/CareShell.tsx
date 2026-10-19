import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, FileText, Inbox, LayoutDashboard, Compass, Menu, X, ChevronDown, ChevronRight, Sparkles,
} from 'lucide-react'
import { Backdrop, type Tone } from '../../components/ui'
import { toneBg } from '../../lib/tone'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { cx, nowClock, nowDateCompact } from '../../lib/utils'
import DevicePreview from '../../components/layout/DevicePreview'
import { CUSTOMER_ROADMAP, STAGE_NOTE, type RoadmapStage } from '../../lib/demo/roadmap'
import { MiraeCredit } from '../../components/brand/MiraeLogo'
import { SampleBridgeCTA, SampleBridgeMini } from '../../components/brand/SampleBridgeCTA'
import { useHideHistoryNav } from '../../lib/historyNav'
import { CARE_CUSTOMER_ID } from './careIdentity'
import { useCareToday } from './useCareToday'

// Customer Demo Persona: 라온메디컬센터 (C01) 김수연 실장
export { CARE_CUSTOMER_ID }

/* 고객 플랫폼 메뉴 — 고객이 자주 하는 행동 4가지만. 내부 업무 기능은 노출하지 않는다. */
const NAV = [
  { to: '/care/home', label: '내 관리현황', short: '홈', desc: '오늘 방문 · 담당팀 · AI 제안', icon: Home },
  { to: '/care/reports', label: '작업 리포트', short: '리포트', desc: '작업 전 · 후 사진과 점검 결과', icon: FileText },
  { to: '/care/requests', label: '요청 · 문의', short: '요청', desc: '일정 변경 · 추가서비스 · 긴급 방문', icon: Inbox },
  { to: '/care', label: '서비스 소개', short: '서비스', desc: '제공 서비스 · 관리 전후 · 현장 기록', icon: Compass },
]

const STAGE_TONE: Record<RoadmapStage, Tone> = {
  'NEXT': 'brand',
  'Preview': 'info',
  'Long-term': 'neutral',
}

function CareClock() {
  const [t, setT] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setT(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tnum hidden whitespace-nowrap text-white/60 md:inline">{nowDateCompact()} · {t}</span>
}

/** 브랜드 워드마크 — 기존 표기(CLEANWAY PARTNERS) 그대로 */
function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span className={cx('block whitespace-nowrap font-extrabold tracking-[0.05em] text-shell', size === 'sm' ? 'text-[0.86rem]' : 'text-[0.9rem] sm:text-[1rem]')}>
      CLEANWAY <span className="text-primary">PARTNERS</span>
    </span>
  )
}

/**
 * 데모 전용 띠 — 실제 고객 화면과 분리된 얇은 어두운 줄. 고정하지 않아 스크롤하면 사라진다.
 * (예전에는 데모 툴바와 앱 헤더가 같은 무게로 2층을 차지해 첫 화면이 무거웠다)
 */
function DemoStrip() {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  return (
    <div className="bg-shell text-[0.72rem] font-bold text-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:px-5">
        <p className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded border border-white/30 px-1.5 py-px tracking-[0.12em] text-white/90">DEMO</span>
          <span className="hidden truncate min-[400px]:inline">고객 화면 · {role === 'customer' ? '고객 권한' : `${role === 'ceo' ? '대표' : '관리자'} 권한으로 미리보기`}</span>
          <CareClock />
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <DevicePreview compact dark />
          {role !== 'customer' ? (
            <button onClick={() => nav('/')} className="flex min-h-[2rem] items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-white hover:border-champagne hover:text-champagne">
              <LayoutDashboard size={14} /> AX 운영화면 보기
            </button>
          ) : (
            <button onClick={() => { setRole('ceo'); nav('/') }} className="min-h-[2rem] whitespace-nowrap rounded-xl border border-white/20 px-2.5 py-1 text-white hover:border-champagne">
              대표로 전환
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** 오늘 방문 진행 알약 — 다른 화면에 있어도 지금 상태를 한눈에 (홈에서는 큰 카드가 대신한다) */
function TodayPill() {
  const { today, status, stage } = useCareToday()
  const nav = useNavigate()
  if (!today || stage < 0) return null
  const live = stage === 2 || stage === 3
  return (
    <button
      onClick={() => nav('/care/home')}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-2 pr-2.5 text-[0.76rem] font-bold text-ink hover:border-primary/60"
      aria-label={`오늘 ${today.time} 방문 — ${status}`}
    >
      <span className="relative flex h-2 w-2">
        {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />}
        <span className={cx('relative inline-flex h-2 w-2 rounded-full', stage === 4 ? 'bg-success' : live ? 'bg-primary' : 'bg-champagne')} />
      </span>
      <span className="tnum"><span className="hidden min-[430px]:inline">오늘 </span>{today.time}</span>
      <span className="text-ink-faint">{status}</span>
    </button>
  )
}

/**
 * 고객 플랫폼 전체 메뉴 (좌측 Drawer)
 * 상단: 브랜드 · 고객사 / 중단: 핵심 메뉴 4 + 준비 중 서비스(접힘) / 하단: 상담 CTA · AX 운영화면 보기
 */
function CareMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  const loc = useLocation()
  const [roadmapOpen, setRoadmapOpen] = useState(false)
  const [detail, setDetail] = useState<string | null>(null)
  const customer = customerById(CARE_CUSTOMER_ID)
  useHideHistoryNav(open)

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

  return (
    <div className="fixed inset-0 z-[70]">
      <Backdrop onClick={onClose} label="메뉴 닫기" className="bg-shell/55" />
      <aside
        aria-label="고객 플랫폼 전체 메뉴"
        className="slide-in-left absolute inset-y-0 left-0 flex w-[86vw] max-w-[370px] flex-col bg-card shadow-pop"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 px-5 pb-4 pt-4">
          <div className="min-w-0">
            <Wordmark size="sm" />
            <p className="mt-3 text-[1.1rem] font-extrabold leading-tight">{customer?.name}</p>
            <p className="mt-0.5 text-[0.78rem] text-ink-faint">{customer?.contract.customerManager} · {customer?.contract.serviceSummary}</p>
          </div>
          <button onClick={onClose} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-soft" aria-label="메뉴 닫기">
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-line px-3 py-3">
          {/* ── 핵심 메뉴 ── */}
          <div className="space-y-0.5">
            {NAV.map((n) => {
              const active = n.to === '/care' ? loc.pathname === '/care' : loc.pathname.startsWith(n.to)
              return (
                <button
                  key={n.to}
                  onClick={() => go(n.to)}
                  aria-current={active ? 'page' : undefined}
                  className={cx('flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors', active ? 'bg-mint/70' : 'hover:bg-ivory')}
                >
                  <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', active ? 'bg-primary text-white' : 'bg-ivory text-primary')}>
                    <n.icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.94rem] font-extrabold leading-tight">{n.label}</span>
                    <span className="block truncate text-[0.76rem] text-ink-faint">{n.desc}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-ink-faint" />
                </button>
              )
            })}
          </div>

          {/* ── 확장 기능 (기본 접힘 — 핵심 메뉴보다 한 단계 낮은 무게) ── */}
          <button
            onClick={() => setRoadmapOpen((v) => !v)}
            aria-expanded={roadmapOpen}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[0.88rem] font-bold text-ink-soft hover:bg-ivory"
          >
            <Sparkles size={16} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1">앞으로 준비 중인 서비스</span>
            <span className="rounded-full bg-ivory px-2 py-0.5 text-[0.72rem] font-bold text-ink-faint">{CUSTOMER_ROADMAP.length}</span>
            <ChevronDown size={15} className={cx('shrink-0 text-ink-faint transition-transform', roadmapOpen && 'rotate-180')} />
          </button>
          {roadmapOpen && (
            <div className="fade-up space-y-0.5 pl-1">
              {CUSTOMER_ROADMAP.map((r) => {
                const isOpen = detail === r.key
                return (
                  <div key={r.key}>
                    <button
                      onClick={() => setDetail(isOpen ? null : r.key)}
                      aria-expanded={isOpen}
                      className={cx('flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-left transition-colors', isOpen ? 'bg-mint/50' : 'hover:bg-neutral-soft')}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${r.color}1F`, color: r.color }}>
                        <r.icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[0.84rem] font-bold">{r.customerLabel}</span>
                      <span className={cx('shrink-0 rounded-full px-1.5 py-0.5 text-[0.7rem] font-bold whitespace-nowrap', toneBg[STAGE_TONE[r.stage]])}>
                        {STAGE_NOTE[r.stage]}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="fade-up mx-2 mb-1 mt-0.5 rounded-lg bg-ivory px-3 py-2 text-[0.78rem] leading-relaxed text-ink-soft">{r.customerDesc}</p>
                    )}
                  </div>
                )
              })}
              <p className="px-2 pt-1.5 text-[0.72rem] leading-relaxed text-ink-faint">
                지금 제공되는 서비스는 아니며, 준비되는 대로 계약 고객께 먼저 안내드립니다.
              </p>
            </div>
          )}

          {/* ── 상담 CTA ── */}
          <div className="mx-1 mt-4 rounded-2xl bg-shell p-4">
            <p className="text-[0.74rem] font-bold text-champagne">필요한 관리가 있으신가요?</p>
            <p className="mt-1 text-[0.95rem] font-extrabold leading-snug text-white">현장 조건을 알려주시면<br />맞는 관리 방식을 제안드립니다.</p>
            <button className="mt-3 flex min-h-[2.5rem] w-full items-center justify-center rounded-xl bg-champagne px-4 text-[0.88rem] font-extrabold text-shell hover:opacity-90" onClick={() => go('/care/requests')}>서비스 상담 신청</button>
          </div>

          <SampleBridgeMini className="mt-4" />
          <div className="flex justify-center pb-2 pt-4"><MiraeCredit height={18} /></div>
        </div>

        {/* 하단 고정 — DEMO에서만 AX 복귀 / 고객 권한 전환 */}
        {role !== 'customer' ? (
          <div className="shrink-0 space-y-1.5 border-t border-line px-4 py-3">
            <button
              onClick={() => go('/')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-shell px-3 py-3 text-[0.92rem] font-extrabold text-white hover:opacity-90"
            >
              <LayoutDashboard size={17} /> AX 운영화면 보기
            </button>
            <button onClick={() => { setRole('customer'); onClose() }} className="w-full rounded-xl px-3 py-2 text-[0.8rem] font-bold text-ink-faint hover:text-primary">
              고객 권한으로 보기
            </button>
          </div>
        ) : (
          <div className="shrink-0 border-t border-line px-4 py-3">
            <button onClick={() => { setRole('ceo'); go('/') }} className="w-full rounded-xl border border-line px-3 py-2.5 text-[0.84rem] font-bold text-ink-soft hover:border-primary hover:text-primary">
              데모 · 대표 권한으로 전환
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

/**
 * 고객 플랫폼 셸 — 신뢰 중심
 * · 데모 띠(어두운 한 줄)와 실제 앱 헤더를 분리 — 앱 헤더는 브랜드 · 고객사 · 지금 방문 상태만
 * · PC: 가운데 탭(밑줄 표시) · 오른쪽 고객사 / 모바일: 하단 탭 4개(활성 탭은 아이콘 알약)
 */
export default function CareShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const nav = useNavigate()
  const loc = useLocation()
  const [menu, setMenu] = useState(false)
  const customer = customerById(CARE_CUSTOMER_ID)
  const onHome = loc.pathname === '/care/home'

  useEffect(() => { setMenu(false) }, [loc.pathname])

  return (
    <div className="min-h-screen bg-ivory">
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>
      <DemoStrip />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-2 sm:px-4 lg:h-16">
          <button
            onClick={() => setMenu(true)}
            aria-label="전체 메뉴"
            title="전체 메뉴"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft hover:bg-neutral-soft"
          >
            <Menu size={22} />
          </button>
          <button onClick={() => nav('/care')} className="min-w-0 text-left leading-tight lg:shrink-0">
            <Wordmark />
            <span className="block truncate text-[0.72rem] font-bold text-ink-faint">고객 플랫폼 · {customer?.name}</span>
          </button>

          <nav aria-label="고객 플랫폼" className="mx-auto hidden h-full items-stretch gap-1 lg:flex">
            {NAV.slice(0, 3).map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx(
                'relative flex items-center whitespace-nowrap px-4 text-[0.92rem] font-bold transition-colors',
                isActive ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-primary' : 'text-ink-faint hover:text-ink',
              )}>{n.label}</NavLink>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            {!onHome && <TodayPill />}
            <div className="hidden items-center gap-2.5 border-l border-line pl-3 lg:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[0.86rem] font-extrabold text-primary-strong" aria-hidden="true">
                {customer?.contract.customerManager.slice(0, 1)}
              </span>
              <span className="leading-tight">
                <span className="block text-[0.84rem] font-extrabold">{customer?.contract.customerManager}</span>
                <span className="block text-[0.72rem] text-ink-faint">{customer?.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className={cx('mx-auto px-4 pb-28 pt-5 sm:pt-7 lg:pb-12', wide ? 'max-w-6xl' : 'max-w-3xl')}>
        {children}
        {/* 고객 화면에서도 동일한 브릿지 — 링크·문구는 src/lib/mirae.ts 단일 원본 */}
        <SampleBridgeCTA className="mt-12" />
      </main>

      <CareMenu open={menu} onClose={() => setMenu(false)} />

      {/* 모바일 하단 탭 — 핵심 4개, 활성 탭은 아이콘 알약으로 */}
      <nav aria-label="고객 플랫폼 하단 메뉴" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end className="flex min-h-[3.4rem] flex-1 flex-col items-center justify-center gap-0.5 pb-1 pt-1.5">
              {({ isActive }) => (
                <>
                  <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive ? 'bg-mint text-primary-strong' : 'text-ink-faint')}>
                    <n.icon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
                  </span>
                  <span className={cx('text-[0.7rem] font-bold', isActive ? 'text-primary-strong' : 'text-ink-faint')}>{n.short}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
