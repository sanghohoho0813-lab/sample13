import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Sparkles, ShieldCheck, CalendarCheck, FileText, Star, Camera } from 'lucide-react'
import CareShell from './CareShell'
import { Card, Btn, Badge } from '../../components/ui'
import { cx } from '../../lib/utils'
import { SERVICE_TYPES } from '../../lib/demo/operations'
import { PHOTO, altOf, photoOf } from '../../lib/demo/photos'
import { MiraeCredit } from '../../components/brand/MiraeLogo'
import { CUSTOMER_ROADMAP, STAGE_NOTE } from '../../lib/demo/roadmap'
import { Photo } from '../../components/ui/Photo'

export default function CareLanding() {
  const nav = useNavigate()
  return (
    <CareShell wide>
      {/* ── Hero — 실제 현장 사진 위에 브랜드 메시지 ── */}
      <section className="fade-up relative -mx-4 -mt-5 overflow-hidden bg-shell sm:mx-0 sm:mt-0 sm:rounded-[2rem]">
        <Photo
          sizes="100vw"
          src={PHOTO.hero}
          alt={altOf(PHOTO.hero)}
          width={1448}
          height={1086}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Deep Teal 브랜드 톤을 유지하면서 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-gradient-to-t from-shell via-shell/80 to-shell/20 sm:bg-gradient-to-r sm:from-shell/95 sm:via-shell/75 sm:to-shell/20" />
        <div className="relative flex min-h-[30rem] flex-col justify-end px-5 pb-8 pt-24 sm:min-h-0 sm:justify-center sm:px-12 sm:py-20 lg:py-24">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[0.78rem] font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">B2B 시설관리 · 정기청소 전문</span>
          <h1 className="mt-4 max-w-xl text-[2rem] font-extrabold leading-[1.18] text-white sm:text-[2.6rem]">
            관리가 필요한 순간,<br /><span className="text-champagne">CLEANWAY</span>가<br className="sm:hidden" /> 먼저 움직입니다.
          </h1>
          <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-white/80">
            정기관리부터 작업 리포트, 일정 변경, 추가 요청까지 한 화면에서 확인하세요.
          </p>
          <div className="mt-7 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
            <button className="inline-flex min-h-[3rem] items-center justify-center gap-1.5 rounded-xl bg-champagne px-5 py-3 text-[0.95rem] font-extrabold text-shell transition-opacity hover:opacity-90 active:scale-[0.985]" onClick={() => nav('/care/home')}>
              내 관리현황 보기 <ArrowRight size={17} />
            </button>
            <button className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-white/35 bg-white/5 px-5 py-3 text-[0.95rem] font-bold text-white transition-colors hover:border-champagne hover:text-champagne" onClick={() => nav(`/care/requests?new=문의&topic=${encodeURIComponent('기타')}&memo=${encodeURIComponent('서비스 상담을 원합니다. ')}`)}>
              서비스 상담
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section aria-label="클린웨이 운영 규모" className="relative z-10 mx-0 mt-6 grid grid-cols-2 divide-line overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-line/60 sm:-mt-10 sm:mx-8 sm:grid-cols-4 sm:divide-x">
        {[
          [<Building2 key="i" size={16} />, '정기관리 고객사', '76곳'],
          [<CalendarCheck key="i" size={16} />, '월 정기 작업', '약 520건'],
          [<Star key="i" size={16} />, '평균 만족도', '4.5 / 5'],
          [<ShieldCheck key="i" size={16} />, '작업 리포트', '전 현장 제공'],
        ].map(([icon, l, v], i) => (
          <div key={l as string} className={cx('px-4 py-4 sm:px-5', i < 2 && 'border-b border-line sm:border-b-0', i % 2 === 0 && 'border-r border-line sm:border-r-0')}>
            <p className="flex items-center gap-1.5 text-[0.76rem] font-bold text-ink-faint"><span className="text-primary">{icon}</span>{l}</p>
            <p className="tnum mt-1 text-[1.2rem] font-extrabold text-shell">{v}</p>
          </div>
        ))}
      </section>
      <p className="mt-2 text-center text-[0.72rem] text-ink-faint">위 수치는 가상의 DEMO DATA입니다.</p>

      {/* ── 서비스 10종 — 실제 작업 장면 ── */}
      <section className="mt-12">
        <p className="text-[0.8rem] font-extrabold tracking-[0.14em] text-primary">SERVICES</p>
        <h2 className="mt-1 text-[1.4rem] font-extrabold">공간에 맞는 전문 관리</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">기업 · 병의원 · 학원 · 상가 · 빌딩 — 누르면 바로 상담을 요청할 수 있습니다.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICE_TYPES.map((s) => {
            const src = photoOf(s)
            return (
              <button
                key={s}
                onClick={() => nav(`/care/requests?new=문의&topic=${encodeURIComponent('기타')}&memo=${encodeURIComponent(`${s} 상담을 원합니다. `)}`)}
                className="group relative overflow-hidden rounded-2xl bg-shell text-left shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <div className="aspect-[4/5] overflow-hidden bg-ivory">
                  <Photo
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    src={src}
                    alt=""
                    width={1448}
                    height={1086}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-shell/90 via-shell/50 to-transparent px-3 pb-3 pt-10">
                  <span className="block text-[0.88rem] font-extrabold leading-snug text-white">{s}</span>
                  <span className="mt-0.5 flex items-center gap-0.5 text-[0.72rem] font-bold text-champagne">상담 요청 <ArrowRight size={11} /></span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Before / After — 관리 품질이 눈에 보이는 구간 ── */}
      <section className="mt-12">
        <p className="text-[0.8rem] font-extrabold tracking-[0.14em] text-primary">BEFORE · AFTER</p>
        <h2 className="mt-1 text-[1.4rem] font-extrabold">관리 전 · 후</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">모든 작업은 작업 전 · 후 사진과 함께 리포트로 남습니다.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: '바닥 세척 · 왁스', before: PHOTO.beforeFloor, after: PHOTO.afterFloor },
            { label: '유리 · 공용공간', before: PHOTO.beforeGlass, after: PHOTO.afterGlass },
          ].map((p) => (
            <Card key={p.label} className="overflow-hidden rounded-3xl shadow-soft">
              <div className="grid grid-cols-2 gap-0.5 bg-line/60">
                {([['작업 전', p.before], ['작업 후', p.after]] as const).map(([tag, src]) => (
                  <figure key={tag} className="relative aspect-[4/3] overflow-hidden bg-ivory">
                    <Photo src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
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
      <section className="mt-12">
        <p className="text-[0.8rem] font-extrabold tracking-[0.14em] text-primary">HOW WE WORK</p>
        <h2 className="mt-1 text-[1.4rem] font-extrabold">현장이 기록되는 방식</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">작업은 사람이 하고, 기록은 시스템이 남깁니다.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { src: PHOTO.fieldMobile, t: '현장에서 바로 등록', d: '담당자가 체크리스트와 사진을 현장에서 직접 기록합니다.' },
            { src: PHOTO.managerInspection, t: '관리자 품질점검', d: '완료된 공간을 관리자가 다시 확인하고 기준을 맞춥니다.' },
            { src: PHOTO.equipment, t: '장비 · 소모품 관리', d: '전문 장비와 자재를 체계적으로 운영합니다.' },
          ].map((c, i) => (
            <Card key={c.t} className="overflow-hidden rounded-3xl shadow-soft">
              <div className="aspect-[16/10] overflow-hidden bg-ivory">
                <Photo src={c.src} alt={altOf(c.src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <p className="tnum text-[0.78rem] font-extrabold text-champagne-deep">0{i + 1}</p>
                <p className="mt-0.5 text-[1rem] font-extrabold">{c.t}</p>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-ink-soft">{c.d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Portal 안내 ── */}
      <section className="mt-12 overflow-hidden rounded-[2rem] bg-mint/60">
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
            <Photo src={PHOTO.completionPhoto} alt={altOf(PHOTO.completionPhoto)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
            <figcaption className="mt-2 flex items-center gap-1.5 text-[0.74rem] text-ink-faint">
              <Camera size={12} /> 작업 완료 사진은 그대로 고객 리포트가 됩니다.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 앞으로 준비 중인 서비스 — Business AX 로드맵과 동일 원본, 고객 목소리로 ── */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[1.4rem] font-extrabold">앞으로 준비 중인 서비스</h2>
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
