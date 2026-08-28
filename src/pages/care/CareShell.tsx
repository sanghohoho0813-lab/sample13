import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, FileText, Inbox, LayoutDashboard, Phone } from 'lucide-react'
import { DemoBadge } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { cx } from '../../lib/utils'

// Customer Demo Persona: 라온메디컬센터 (C01) 김수연 실장
export const CARE_CUSTOMER_ID = 'C01'

export default function CareShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const { role, setRole } = useDemo()
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => nav('/care')} className="text-left leading-tight">
            <p className="text-[1rem] font-extrabold tracking-wide text-shell">CLEANWAY <span className="text-primary">PARTNERS</span></p>
            <p className="text-[0.64rem] font-bold tracking-[0.18em] text-ink-faint">CUSTOMER CARE</p>
          </button>
          <nav className="hidden items-center gap-1 sm:flex">
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
          <div className="flex items-center gap-2">
            <DemoBadge label="DEMO" />
            {role !== 'customer' && (
              <button onClick={() => nav('/')} className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-[0.78rem] font-bold text-ink-soft hover:border-primary hover:text-primary" title="관리자 Demo 전용">
                <LayoutDashboard size={14} /> Business AX 보기
              </button>
            )}
            {role === 'customer' && (
              <button onClick={() => { setRole('ceo'); nav('/') }} className="rounded-xl border border-line px-3 py-1.5 text-[0.72rem] font-bold text-ink-faint hover:border-primary" title="Demo Role 전환">
                Demo: 대표로 전환
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={cx('mx-auto px-4 py-6 pb-24 sm:pb-10', wide ? 'max-w-5xl' : 'max-w-3xl')}>{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] sm:hidden">
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
