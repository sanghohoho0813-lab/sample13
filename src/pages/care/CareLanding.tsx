import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Sparkles, ShieldCheck, CalendarCheck, FileText, Star } from 'lucide-react'
import CareShell from './CareShell'
import { Card, Btn, Badge } from '../../components/ui'
import { SERVICE_TYPES } from '../../lib/demo/operations'

export default function CareLanding() {
  const nav = useNavigate()
  return (
    <CareShell wide>
      {/* Hero */}
      <section className="fade-up overflow-hidden rounded-3xl bg-shell px-6 py-12 text-white sm:px-12 sm:py-16">
        <Badge tone="brand" className="bg-white/10 text-champagne">B2B 시설관리 · 정기청소 전문</Badge>
        <h1 className="mt-4 max-w-xl text-[1.9rem] leading-tight font-extrabold sm:text-[2.5rem]">
          관리가 필요한 순간,<br /><span className="text-champagne">CLEANWAY</span>가 먼저 움직입니다.
        </h1>
        <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-white/75">
          정기관리부터 작업 리포트, 일정 변경, 추가 요청까지 한 화면에서 확인하세요.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Btn size="lg" className="bg-champagne text-shell hover:opacity-90" onClick={() => nav('/care/home')}>
            내 관리현황 보기 <ArrowRight size={17} className="inline" />
          </Btn>
          <Btn size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:border-champagne hover:text-champagne" onClick={() => nav('/care/requests')}>
            서비스 상담
          </Btn>
        </div>
      </section>

      {/* Trust */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [<Building2 key="i" size={20} />, '정기관리 고객사', '76곳'],
          [<CalendarCheck key="i" size={20} />, '월 정기 작업', '약 520건'],
          [<Star key="i" size={20} />, '평균 만족도', '4.5 / 5'],
          [<ShieldCheck key="i" size={20} />, '작업 리포트', '전 현장 제공'],
        ].map(([icon, l, v]) => (
          <Card key={l as string} className="p-4 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary">{icon}</span>
            <p className="mt-2 text-[0.72rem] font-bold text-ink-faint">{l}</p>
            <p className="tnum text-[1.15rem] font-extrabold text-shell">{v}</p>
          </Card>
        ))}
      </section>
      <p className="mt-2 text-center text-[0.68rem] text-ink-faint">위 수치는 가상의 DEMO DATA입니다.</p>

      {/* Services */}
      <section className="mt-10">
        <h2 className="text-[1.3rem] font-extrabold">서비스</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">기업·병의원·학원·상가·빌딩 — 공간에 맞는 전문 관리를 제공합니다.</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {SERVICE_TYPES.map((s) => (
            <button key={s} onClick={() => nav('/care/requests')} className="rounded-xl border border-line bg-card px-3 py-3.5 text-[0.82rem] font-bold text-ink hover:border-primary hover:text-primary transition-colors">
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Portal feature */}
      <section className="mt-10 rounded-3xl bg-mint/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-lg">
            <p className="flex items-center gap-1.5 text-[0.8rem] font-extrabold text-primary"><Sparkles size={14} /> CUSTOMER CARE PORTAL</p>
            <h2 className="mt-1.5 text-[1.35rem] font-extrabold leading-snug">전화하지 않아도, 관리 상태가 보입니다.</h2>
            <ul className="mt-3 space-y-1.5 text-[0.9rem] text-ink-soft">
              {['다음 방문 일정과 담당팀 확인', '작업 리포트 · Before/After 사진', '일정 변경 · 추가서비스 · 긴급 방문 요청', 'AI가 우리 시설에 필요한 관리를 먼저 제안'].map((x) => (
                <li key={x} className="flex gap-2"><FileText size={15} className="mt-0.5 shrink-0 text-primary" /> {x}</li>
              ))}
            </ul>
          </div>
          <Btn size="lg" onClick={() => nav('/care/home')}>포털 들어가기 <ArrowRight size={16} className="inline" /></Btn>
        </div>
      </section>

      <footer className="mt-12 border-t border-line pt-6 text-center text-[0.74rem] leading-relaxed text-ink-faint">
        클린웨이파트너스㈜ · 사업시설 유지관리 및 현장 서비스<br />
        본 페이지는 미래AI랩 Reference MVP의 가상 회사 데모입니다.
      </footer>
    </CareShell>
  )
}
