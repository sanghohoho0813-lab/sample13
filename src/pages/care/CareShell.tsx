import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, FileText, Inbox, LayoutDashboard, Phone, Menu, X, ChevronDown, ArrowRight, Sparkles,
} from 'lucide-react'
import { DemoBadge, Badge, Btn, toneBg, type Tone } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { cx, nowClock, nowDateCompact } from '../../lib/utils'
import DevicePreview from '../../components/layout/DevicePreview'
import { CUSTOMER_ROADMAP, STAGE_NOTE, type RoadmapStage } from '../../lib/demo/roadmap'
import { MiraeCredit } from '../../components/brand/MiraeLogo'

// Customer Demo Persona: 라온메디컬센터 (C01) 김수연 실장
export const CARE_CUSTOMER_ID = 'C01'

const NAV = [
  { to: '/care/home', label: '내 관리현황', desc: '다음 방문 · 담당팀 · AI 제안', icon: Home },
  { to: '/care/reports', label: '작업 리포트', desc: 'Before / After 사진과 점검 결과', icon: FileText },
  { to: '/care/requests', label: '요청 · 문의', desc: '일정 변경 · 추가서비스 · 긴급 방문', icon: Inbox },
  { to: '/care', label: '서비스 소개', desc: '제공 서비스 · 관리 전후 · 현장 기록', icon: Phone },
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
    <p className="tnum hidden text-[0.72rem] font-bold leading-tight text-ink-faint sm:block">
      {nowDateCompact()} · {t}
    </p>
  )
}

/**
 * 고객 포털 전체 메뉴
 * 랜딩 하단의 `앞으로 준비 중인 서비스`는 그대로 두고, 상단에서도 바로 볼 수 있게
 * 동일 데이터(CUSTOMER_ROADMAP)를 메뉴 안에 함께 담는다.
 */
function CareMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  const [detail, setDetail] = useState<string | null>(null)

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
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-shell/55" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="slide-left absolute inset-y-0 right-0 flex w-[330px] max-w-[88vw] flex-col bg-card shadow-pop"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <div className="leading-tight">
            <p className="text-[1rem] font-extrabold">전체 메뉴</p>
            <p className="text-[0.62rem] font-bold tracking-[0.16em] text-ink-faint">CUSTOMER CARE</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-[#EFF1F0]" aria-label="메뉴 닫기">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* ── 이용 중인 서비스 ── */}
          <p className="px-1 pb-1.5 text-[0.64rem] font-bold tracking-[0.16em] text-ink-faint">서비스</p>
          <div className="space-y-1">
            {NAV.map((n) => (
              <button
                key={n.to}
                onClick={() => go(n.to)}
                className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left hover:border-primary hover:bg-mint/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint text-primary">
                  <n.icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9rem] font-extrabold leading-tight">{n.label}</span>
                  <span className="block truncate text-[0.72rem] text-ink-faint">{n.desc}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-ink-faint" />
              </button>
            ))}
          </div>

          {/* ── 앞으로 준비 중인 서비스 (랜딩 하단과 동일 원본) ── */}
          <div className="mt-5 flex items-center gap-2 px-1 pb-1.5">
            <p className="text-[0.64rem] font-bold tracking-[0.16em] text-ink-faint">앞으로 준비 중인 서비스</p>
            <Badge tone="brand" className="px-2 py-0 text-[0.6rem]">NEXT</Badge>
          </div>
          <div className="space-y-0.5">
            {CUSTOMER_ROADMAP.map((r) => {
              const isOpen = detail === r.key
              return (
                <div key={r.key}>
                  <button
                    onClick={() => setDetail(isOpen ? null : r.key)}
                    aria-expanded={isOpen}
                    className={cx(
                      'flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-left transition-colors',
                      isOpen ? 'bg-mint/50' : 'hover:bg-[#F3F5F4]',
                    )}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${r.color}1F`, color: r.color }}
                    >
                      <r.icon size={16} />
                    </span>
                    {/* 라벨은 항상 한 줄 — 330px Drawer에서 잘리지 않게 폭을 배분한다 */}
                    <span className="min-w-0 flex-1 truncate text-[0.82rem] font-bold">{r.customerLabel}</span>
                    <span className={cx('shrink-0 rounded-full px-1.5 py-0.5 text-[0.56rem] font-bold whitespace-nowrap', toneBg[STAGE_TONE[r.stage]])}>
                      {r.stage}
                    </span>
                    <ChevronDown size={13} className={cx('shrink-0 text-ink-faint transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <p className="fade-up mx-2 mb-1 mt-0.5 rounded-lg bg-ivory px-3 py-2 text-[0.76rem] leading-relaxed text-ink-soft">
                      {r.customerDesc}
                      <span className="mt-1 block text-[0.68rem] font-bold text-ink-faint">
                        {r.stage} · {STAGE_NOTE[r.stage]}
                      </span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="px-2 pt-2 text-[0.7rem] leading-relaxed text-ink-faint">
            지금 제공되는 서비스는 아니며, 준비되는 대로 계약 고객께 먼저 안내드립니다.
          </p>

          {/* ── 상담 CTA ── */}
          <div className="mt-5 rounded-2xl bg-shell p-4">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-bold text-champagne">
              <Sparkles size={13} /> 필요한 관리가 있으신가요?
            </p>
            <p className="mt-1 text-[0.92rem] font-extrabold leading-snug text-white">
              현장 조건을 알려주시면<br />맞는 관리 방식을 제안드립니다.
            </p>
            <Btn className="mt-3 w-full bg-champagne text-shell hover:opacity-90" onClick={() => go('/care/requests')}>
              서비스 상담 신청
            </Btn>
          </div>

          {/* ── Demo 전용 이동 (고객 Role에는 노출하지 않음) ── */}
          {role !== 'customer' && (
            <div className="mt-4 rounded-2xl border border-dashed border-line p-3">
              <p className="pb-2 text-[0.62rem] font-bold tracking-[0.16em] text-ink-faint">DEMO · ADMIN</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => go('/')}
                  className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-[0.78rem] font-bold text-ink-soft hover:border-primary hover:text-primary"
                >
                  <LayoutDashboard size={14} /> Business AX 보기
                </button>
                <button
                  onClick={() => { setRole('customer'); onClose() }}
                  className="rounded-xl border border-line px-3 py-2 text-[0.78rem] font-bold text-ink-soft hover:border-primary hover:text-primary"
                >
                  고객 권한으로 보기
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center pb-2 pt-5">
            <MiraeCredit height={19} />
          </div>
        </div>
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
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <button onClick={() => nav('/care')} className="min-w-0 text-left leading-tight">
            <p className="truncate text-[0.82rem] font-extrabold tracking-wide text-shell sm:text-[1rem]">CLEANWAY <span className="text-primary">PARTNERS</span></p>
            <p className="text-[0.6rem] font-bold tracking-[0.18em] text-ink-faint sm:text-[0.64rem]">CUSTOMER CARE</p>
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ['/care/home', '내 관리현황'],
              ['/care/reports', '작업 리포트'],
              ['/care/requests', '요청'],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => cx(
                'rounded-xl px-3.5 py-2 text-[0.88rem] font-bold',
                isActive ? 'bg-mint text-primary-strong' : 'text-ink-soft hover:text-primary',
              )}>{label}</NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5">
            <CareClock />
            <span className="hidden sm:inline"><DemoBadge label="DEMO" /></span>
            <DevicePreview compact />
            {/* Surface Round-trip — 관리자 Demo에서만 노출, 고객 Role에는 숨김 */}
            {role !== 'customer' && (
              <button
                onClick={() => nav('/')}
                title="Business AX로 돌아가기"
                aria-label="Business AX로 돌아가기"
                className="flex shrink-0 items-center gap-1 rounded-xl border border-line px-2.5 py-1.5 text-[0.75rem] font-bold text-ink-soft hover:border-primary hover:text-primary"
              >
                {/* 모바일 헤더는 아이콘 액션으로 압축 (aria-label·title로 의미 보존) */}
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Business AX</span>
              </button>
            )}
            {role === 'customer' && (
              <button
                onClick={() => { setRole('ceo'); nav('/') }}
                title="Demo Role 전환"
                className="shrink-0 rounded-xl border border-line px-2.5 py-1.5 text-[0.7rem] font-bold text-ink-faint hover:border-primary"
              >
                <span className="hidden sm:inline">Demo: 대표로 전환</span><span className="sm:hidden">대표</span>
              </button>
            )}
            {/* 전체 메뉴 — 하단까지 내려가지 않아도 준비 중인 서비스까지 한 번에 본다 */}
            <button
              onClick={() => setMenu(true)}
              aria-label="전체 메뉴"
              title="전체 메뉴"
              className="flex items-center gap-1.5 rounded-xl border border-line px-2.5 py-1.5 text-[0.78rem] font-bold text-ink-soft hover:border-primary hover:text-primary"
            >
              <Menu size={17} /> <span className="hidden sm:inline">전체 메뉴</span>
            </button>
          </div>
        </div>
      </header>

      <main className={cx('mx-auto px-4 py-6 pb-24 sm:pb-10', wide ? 'max-w-5xl' : 'max-w-3xl')}>{children}</main>

      <CareMenu open={menu} onClose={() => setMenu(false)} />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {[
          { to: '/care/home', label: '홈', icon: <Home size={21} /> },
          { to: '/care/reports', label: '리포트', icon: <FileText size={21} /> },
          { to: '/care/requests', label: '요청', icon: <Inbox size={21} /> },
          { to: '/care', label: '서비스', icon: <Phone size={21} /> },
        ].map((i) => (
          <NavLink key={i.to} to={i.to} end className={({ isActive }) => cx(
            'flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.66rem] font-bold',
            isActive ? 'text-primary' : 'text-ink-faint',
          )}>{i.icon}{i.label}</NavLink>
        ))}
      </nav>
    </div>
  )
}
