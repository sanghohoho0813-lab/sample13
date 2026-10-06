import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, FileText, Inbox, LayoutDashboard, Compass, Menu, X, ChevronDown, ArrowRight, Sparkles,
} from 'lucide-react'
import { Backdrop, DemoBadge, Btn, type Tone } from '../../components/ui'
import { toneBg } from '../../lib/tone'
import { useDemo } from '../../lib/data/context'
import { cx, nowClock, nowDateCompact } from '../../lib/utils'
import DevicePreview from '../../components/layout/DevicePreview'
import { CUSTOMER_ROADMAP, STAGE_NOTE, type RoadmapStage } from '../../lib/demo/roadmap'
import { MiraeCredit } from '../../components/brand/MiraeLogo'
import { SampleBridgeCTA, SampleBridgeMini } from '../../components/brand/SampleBridgeCTA'
import { useHideHistoryNav } from '../../lib/historyNav'

// Customer Demo Persona: 라온메디컬센터 (C01) 김수연 실장
export const CARE_CUSTOMER_ID = 'C01'

/* 고객 플랫폼 메뉴 — 고객이 자주 하는 행동 4가지만. 내부 업무 기능은 노출하지 않는다. */
const NAV = [
  { to: '/care/home', label: '내 관리현황', desc: '다음 방문 · 담당팀 · AI 제안', icon: Home },
  { to: '/care/reports', label: '작업 리포트', desc: '작업 전 · 후 사진과 점검 결과', icon: FileText },
  { to: '/care/requests', label: '요청 · 문의', desc: '일정 변경 · 추가서비스 · 긴급 방문', icon: Inbox },
  { to: '/care', label: '서비스 소개', desc: '제공 서비스 · 관리 전후 · 현장 기록', icon: Compass },
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
  return (
    <p className="tnum hidden text-[0.74rem] font-bold leading-tight text-ink-faint whitespace-nowrap md:block">
      {nowDateCompact()} · {t}
    </p>
  )
}

/** AX 운영화면 보기 — 고객 플랫폼 → 내부 AX 복귀 (DEMO 환경에서만 노출) */
function AxButton({ variant }: { variant: 'toolbar' | 'drawer' | 'header' }) {
  const nav = useNavigate()
  if (variant === 'drawer') {
    return (
      <button
        onClick={() => nav('/')}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-shell px-3 py-3 text-[0.92rem] font-extrabold text-white hover:opacity-90"
      >
        <LayoutDashboard size={17} /> AX 운영화면 보기 <ArrowRight size={16} />
      </button>
    )
  }
  return (
    <button
      onClick={() => nav('/')}
      className={cx(
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-card font-bold text-ink-soft hover:border-primary hover:text-primary',
        variant === 'toolbar' ? 'min-h-[2.25rem] px-3 py-1.5 text-[0.78rem]' : 'px-3 py-1.5 text-[0.82rem]',
      )}
    >
      <LayoutDashboard size={14} /> AX 운영화면 보기
    </button>
  )
}

/**
 * 고객 플랫폼 전체 메뉴 (좌측 Drawer)
 * 상단: 브랜드 · 닫기 / 중단: 핵심 메뉴 4 + 확장 기능(접힘) / 하단: 상담 CTA · AX 운영화면 보기
 */
function CareMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  const loc = useLocation()
  const [roadmapOpen, setRoadmapOpen] = useState(false)
  const [detail, setDetail] = useState<string | null>(null)
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
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <div className="leading-tight">
            <p className="text-[1rem] font-extrabold tracking-wide text-shell">CLEANWAY <span className="text-primary">PARTNERS</span></p>
            <p className="text-[0.72rem] font-bold text-ink-faint">고객 플랫폼 · 전체 메뉴</p>
          </div>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-faint hover:bg-neutral-soft" aria-label="메뉴 닫기">
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* ── 핵심 메뉴 ── */}
          <div className="space-y-1">
            {NAV.map((n) => {
              const active = n.to === '/care' ? loc.pathname === '/care' : loc.pathname.startsWith(n.to)
              return (
                <button
                  key={n.to}
                  onClick={() => go(n.to)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left',
                    active ? 'border-primary bg-mint/60' : 'border-line hover:border-primary hover:bg-mint/40',
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint text-primary">
                    <n.icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.92rem] font-extrabold leading-tight">{n.label}</span>
                    <span className="block truncate text-[0.74rem] text-ink-faint">{n.desc}</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-ink-faint" />
                </button>
              )
            })}
          </div>

          {/* ── 확장 기능 (기본 접힘 — 핵심 메뉴보다 한 단계 낮은 무게) ── */}
          <button
            onClick={() => setRoadmapOpen((v) => !v)}
            aria-expanded={roadmapOpen}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[0.88rem] font-bold text-ink-soft hover:bg-ivory"
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
                      className={cx(
                        'flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-left transition-colors',
                        isOpen ? 'bg-mint/50' : 'hover:bg-neutral-soft',
                      )}
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
          <div className="mt-4 rounded-2xl bg-shell p-4">
            <p className="text-[0.74rem] font-bold text-champagne">필요한 관리가 있으신가요?</p>
            <p className="mt-1 text-[0.95rem] font-extrabold leading-snug text-white">현장 조건을 알려주시면<br />맞는 관리 방식을 제안드립니다.</p>
            <Btn className="mt-3 w-full bg-champagne text-shell hover:opacity-90" onClick={() => go('/care/requests')}>서비스 상담 신청</Btn>
          </div>

          <SampleBridgeMini className="mt-4" />
          <div className="flex justify-center pb-2 pt-4"><MiraeCredit height={18} /></div>
        </div>

        {/* 하단 고정 — DEMO에서만 AX 복귀 / 고객 권한 전환 */}
        {role !== 'customer' ? (
          <div className="shrink-0 space-y-2 border-t border-line px-4 py-3">
            <AxButton variant="drawer" />
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

export default function CareShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  const loc = useLocation()
  const [menu, setMenu] = useState(false)

  useEffect(() => { setMenu(false) }, [loc.pathname])

  return (
    <div className="min-h-screen bg-ivory">
      <a href="#main" className="skip-link">본문으로 건너뛰기</a>
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
        {/* 모바일 데모 툴바 — AX 헤더와 같은 2층 구조 */}
        <div className="flex items-center justify-between gap-2 border-b border-line/70 bg-ivory px-3 py-1.5 xl:hidden">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0"><DemoBadge label="DEMO" /></span>
            <span className="hidden truncate text-[0.74rem] font-bold text-ink-faint min-[430px]:inline">{role === 'customer' ? '고객 권한' : `${role === 'ceo' ? '대표' : '관리자'} 권한으로 보는 중`}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <DevicePreview compact />
            {role !== 'customer' ? <AxButton variant="toolbar" /> : (
              <button onClick={() => { setRole('ceo'); nav('/') }} className="min-h-[2.25rem] whitespace-nowrap rounded-xl border border-line px-3 py-1.5 text-[0.78rem] font-bold text-ink-soft hover:border-primary">
                대표로 전환
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4 lg:py-3">
          <div className="flex min-w-0 items-center gap-1.5 lg:shrink-0">
            <button
              onClick={() => setMenu(true)}
              aria-label="전체 메뉴"
              title="전체 메뉴"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-neutral-soft"
            >
              <Menu size={23} />
            </button>
            <button onClick={() => nav('/care')} className="min-w-0 text-left leading-tight">
              <p className="truncate text-[0.95rem] font-extrabold tracking-wide text-shell sm:text-[1rem]">CLEANWAY <span className="text-primary">PARTNERS</span></p>
              <p className="text-[0.7rem] font-bold text-ink-faint">고객 플랫폼</p>
            </button>
          </div>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex xl:flex-none">
            {[
              ['/care/home', '내 관리현황'],
              ['/care/reports', '작업 리포트'],
              ['/care/requests', '요청 · 문의'],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => cx(
                'whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.9rem] font-bold',
                isActive ? 'bg-mint text-primary-strong' : 'text-ink-soft hover:text-primary',
              )}>{label}</NavLink>
            ))}
          </nav>
          {/* Desktop 액션 — 모바일에서는 위 툴바로 */}
          <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
            <CareClock />
            <DemoBadge label="DEMO" />
            <DevicePreview compact />
            {role !== 'customer' ? <AxButton variant="header" /> : (
              <button onClick={() => { setRole('ceo'); nav('/') }} className="whitespace-nowrap rounded-xl border border-line px-3 py-1.5 text-[0.78rem] font-bold text-ink-faint hover:border-primary">
                데모 · 대표로 전환
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className={cx('mx-auto px-4 py-6 pb-24 lg:pb-10', wide ? 'max-w-5xl' : 'max-w-3xl')}>
        {children}
        {/* 고객 화면에서도 동일한 브릿지 — 링크·문구는 src/lib/mirae.ts 단일 원본 */}
        <SampleBridgeCTA className="mt-10" />
      </main>

      <CareMenu open={menu} onClose={() => setMenu(false)} />

      {/* Mobile bottom nav — 핵심 4개 */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { to: '/care/home', label: '홈', icon: <Home size={21} /> },
          { to: '/care/reports', label: '리포트', icon: <FileText size={21} /> },
          { to: '/care/requests', label: '요청', icon: <Inbox size={21} /> },
          { to: '/care', label: '서비스', icon: <Compass size={21} /> },
        ].map((i) => (
          <NavLink key={i.to} to={i.to} end className={({ isActive }) => cx(
            'flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[0.72rem] font-bold',
            isActive ? 'text-primary' : 'text-ink-faint',
          )}>{i.icon}{i.label}</NavLink>
        ))}
      </nav>
    </div>
  )
}
