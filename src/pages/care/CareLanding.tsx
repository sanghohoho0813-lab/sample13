import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Sparkles, ShieldCheck, CalendarCheck, FileText, Star, Camera } from 'lucide-react'
import CareShell from './CareShell'
import { Card, Btn, Badge } from '../../components/ui'
import { SERVICE_TYPES } from '../../lib/demo/operations'
import { PHOTO, altOf, photoOf } from '../../lib/demo/photos'
import { MiraeCredit } from '../../components/brand/MiraeLogo'
import { CUSTOMER_ROADMAP, STAGE_NOTE } from '../../lib/demo/roadmap'

export default function CareLanding() {
  const nav = useNavigate()
  return (
    <CareShell wide>
      {/* ── Hero — 실제 현장 사진 위에 브랜드 메시지 ── */}
      <section className="fade-up relative overflow-hidden rounded-3xl bg-shell">
        <img
          src={PHOTO.hero}
          alt={altOf(PHOTO.hero)}
          width={1448}
          height={1086}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Deep Teal 브랜드 톤을 유지하면서 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-gradient-to-r from-shell/95 via-shell/78 to-shell/30" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
          <Badge tone="brand" className="bg-white/15 text-champagne">B2B 시설관리 · 정기청소 전문</Badge>
          <h1 className="mt-4 max-w-xl text-[1.9rem] leading-tight font-extrabold text-white sm:text-[2.5rem]">
            관리가 필요한 순간,<br /><span className="text-champagne">CLEANWAY</span>가 먼저 움직입니다.
          </h1>
          <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-white/85">
            정기관리부터 작업 리포트, 일정 변경, 추가 요청까지 한 화면에서 확인하세요.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Btn size="lg" className="bg-champagne text-shell hover:opacity-90" onClick={() => nav('/care/home')}>
              내 관리현황 보기 <ArrowRight size={17} className="inline" />
            </Btn>
            <Btn size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:border-champagne hover:text-champagne" onClick={() => nav(`/care/requests?new=문의&topic=${encodeURIComponent('기타')}&memo=${encodeURIComponent('서비스 상담을 원합니다. ')}`)}>
              서비스 상담
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
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
      <p className="mt-2 text-center text-[0.72rem] text-ink-faint">위 수치는 가상의 DEMO DATA입니다.</p>

      {/* ── 서비스 10종 — 실제 작업 장면 ── */}
      <section className="mt-10">
        <h2 className="text-[1.3rem] font-extrabold">서비스</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">기업·병의원·학원·상가·빌딩 — 공간에 맞는 전문 관리를 제공합니다.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICE_TYPES.map((s) => {
            const src = photoOf(s)
            return (
              <button
                key={s}
                onClick={() => nav(`/care/requests?new=문의&topic=${encodeURIComponent('기타')}&memo=${encodeURIComponent(`${s} 상담을 원합니다. `)}`)}
                aria-label={`${s} 상담 요청`}
                className="group overflow-hidden rounded-2xl border border-line bg-card text-left transition-all hover:border-primary hover:shadow-card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ivory">
                  <img
                    src={src}
                    alt={altOf(src)}
                    width={1448}
                    height={1086}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="px-3 py-2.5 text-[0.82rem] font-bold leading-snug text-ink group-hover:text-primary">{s}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Before / After — 관리 품질이 눈에 보이는 구간 ── */}
      <section className="mt-10">
        <h2 className="text-[1.3rem] font-extrabold">관리 전 · 후</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">모든 작업은 작업 전 · 후 사진과 함께 리포트로 남습니다.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: '바닥 세척 · 왁스', before: PHOTO.beforeFloor, after: PHOTO.afterFloor },
            { label: '유리 · 공용공간', before: PHOTO.beforeGlass, after: PHOTO.afterGlass },
          ].map((p) => (
            <Card key={p.label} className="overflow-hidden">
              <div className="grid grid-cols-2">
                {([['작업 전', p.before], ['작업 후', p.after]] as const).map(([tag, src]) => (
                  <figure key={tag} className="relative aspect-[4/3] overflow-hidden bg-ivory">
                    <img src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
                    <figcaption className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[0.72rem] font-extrabold tracking-wide ${
                      tag === '작업 전' ? 'bg-ink/75 text-white' : 'bg-primary text-white'
                    }`}>{tag}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="px-4 py-3 text-[0.88rem] font-bold">{p.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 현장 운영 방식 ── */}
      <section className="mt-10">
        <h2 className="text-[1.3rem] font-extrabold">현장이 기록되는 방식</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">작업은 사람이 하고, 기록은 시스템이 남깁니다.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { src: PHOTO.fieldMobile, t: '현장에서 바로 등록', d: '담당자가 체크리스트와 사진을 현장에서 직접 기록합니다.' },
            { src: PHOTO.managerInspection, t: '관리자 품질점검', d: '완료된 공간을 관리자가 다시 확인하고 기준을 맞춥니다.' },
            { src: PHOTO.equipment, t: '장비 · 소모품 관리', d: '전문 장비와 자재를 체계적으로 운영합니다.' },
          ].map((c) => (
            <Card key={c.t} className="overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-ivory">
                <img src={c.src} alt={altOf(c.src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-[0.95rem] font-extrabold">{c.t}</p>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-ink-soft">{c.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Portal 안내 ── */}
      <section className="mt-10 overflow-hidden rounded-3xl bg-mint/60">
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="flex items-center gap-1.5 text-[0.8rem] font-extrabold text-primary"><Sparkles size={14} /> 고객 플랫폼</p>
            <h2 className="mt-1.5 text-[1.35rem] font-extrabold leading-snug">전화하지 않아도, 관리 상태가 보입니다.</h2>
            <ul className="mt-3 space-y-1.5 text-[0.9rem] text-ink-soft">
              {['다음 방문 일정과 담당팀 확인', '작업 리포트 · 작업 전후 사진', '일정 변경 · 추가서비스 · 긴급 방문 요청', 'AI가 우리 시설에 필요한 관리를 먼저 제안'].map((x) => (
                <li key={x} className="flex gap-2"><FileText size={15} className="mt-0.5 shrink-0 text-primary" /> {x}</li>
              ))}
            </ul>
            <Btn size="lg" className="mt-5" onClick={() => nav('/care/home')}>포털 들어가기 <ArrowRight size={16} className="inline" /></Btn>
          </div>
          <figure className="overflow-hidden rounded-2xl">
            <img src={PHOTO.completionPhoto} alt={altOf(PHOTO.completionPhoto)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
            <figcaption className="mt-2 flex items-center gap-1.5 text-[0.74rem] text-ink-faint">
              <Camera size={12} /> 작업 완료 사진은 그대로 고객 리포트가 됩니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 앞으로 준비 중인 서비스 — Business AX 로드맵과 동일 원본, 고객 목소리로 ── */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[1.3rem] font-extrabold">앞으로 준비 중인 서비스</h2>
          <Badge tone="info">예정</Badge>
        </div>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          지금 제공되는 서비스는 아니며, 준비되는 대로 계약 고객께 먼저 안내드립니다.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CUSTOMER_ROADMAP.map((r) => (
            <Card key={r.key} className="flex flex-col gap-2 p-4">
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${r.color}1F`, color: r.color }}
                >
                  <r.icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-extrabold leading-tight">{r.customerLabel}</p>
                  <p className="mt-0.5 text-[0.72rem] font-bold tracking-wide text-ink-faint">
                    {STAGE_NOTE[r.stage]}
                  </p>
                </div>
              </div>
              <p className="text-[0.84rem] leading-relaxed text-ink-soft">{r.customerDesc}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-[0.76rem] text-ink-faint">
          필요한 서비스가 있으시면 요청 화면에서 알려주세요. 준비 순서를 정하는 데 반영합니다.
        </p>
      </section>

      <footer className="mt-12 flex flex-col items-center gap-3 border-t border-line pt-6 text-center text-[0.74rem] leading-relaxed text-ink-faint">
        <p>클린웨이파트너스㈜ · 사업시설 유지관리 및 현장 서비스<br />본 페이지는 가상 회사 데모입니다.</p>
        <MiraeCredit height={22} />
      </footer>
    </CareShell>
  )
}
