import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, MapPin, Sparkles, FileCheck2, MessageCircle, RefreshCcw, Siren, PlusCircle, ChevronRight,
  Plus, AlertTriangle, Star, CalendarClock,
} from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import RequestSheet, { type RequestPreset } from './RequestSheet'
import { Btn, Modal, StatusPill } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { customerById, teamById, teamMembers } from '../../lib/demo/company'
import { VISIT_STATS } from '../../lib/demo/intelligence'
import { UPSELL_SERVICES } from '../../lib/demo/operations'
import { cx, dateWithOffset } from '../../lib/utils'
import { PHOTO, altOf, beforeAfterFor, photoOf } from '../../lib/demo/photos'
import type { RequestType, Schedule } from '../../types'
import { Photo } from '../../components/ui/Photo'
import { VISIT_STEPS, useCareToday } from './useCareToday'

const STEP_ICON = [CalendarCheck, MapPin, Sparkles, FileCheck2]
const when = (s: Schedule) => (s.dayOffset === 0 ? '오늘' : dateWithOffset(s.dayOffset))

/**
 * 고객 홈 — 신뢰 중심 하이브리드
 * ① 오늘 방문을 '배송 추적'처럼 — 단계 · 담당 팀장 · 현장 특이사항이 현장 앱 기록 그대로
 * ② 자주 하는 요청 4개를 첫 화면에  ③ 근거 사진이 붙은 AI 제안  ④ 함께 받으면 좋은 관리(사진 카드)
 * ⑤ 오른쪽(모바일은 아래): 최근 리포트 · 내 요청 · 계약 현황
 */
export default function CareHome() {
  const nav = useNavigate()
  const { requests, reports } = useDemo()
  const customer = customerById(CARE_CUSTOMER_ID)!
  const ct = customer.contract
  const myRequests = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)
  const openRequests = myRequests.filter((r) => r.status !== '완료' && r.status !== '반려')
  const myReport = reports.find((r) => r.customerId === CARE_CUSTOMER_ID)
  const visits = VISIT_STATS[CARE_CUSTOMER_ID]
  const [sheet, setSheet] = useState<RequestType | null>(null)
  const [preset, setPreset] = useState<RequestPreset | undefined>()
  const [contractOpen, setContractOpen] = useState(false)

  const request = (t: RequestType, p?: RequestPreset) => { setPreset(p); setSheet(t) }

  const QUICK: Array<{ icon: ReactNode; label: string; run: () => void; danger?: boolean }> = [
    { icon: <PlusCircle size={21} />, label: '추가서비스', run: () => request('추가서비스') },
    { icon: <RefreshCcw size={21} />, label: '일정 변경', run: () => request('일정변경') },
    { icon: <Siren size={21} />, label: '긴급 방문', run: () => request('긴급방문'), danger: true },
    { icon: <MessageCircle size={21} />, label: '담당자 문의', run: () => request('문의') },
  ]

  return (
    <CareShell wide>
      <div className="fade-up">
        <header className="mb-4 sm:mb-5">
          <p className="text-[0.84rem] font-semibold text-ink-faint">{dateWithOffset(0)}</p>
          <h1 className="mt-0.5 text-[1.4rem] font-extrabold leading-snug sm:text-[1.6rem]">{ct.customerManager}님, 안녕하세요</h1>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
          {/* ── 왼쪽: 지금 · 행동 ── */}
          <div className="min-w-0 space-y-6">
            <LiveVisit onChangeVisit={() => request('일정변경')} onAsk={() => request('문의')} />

            {/* 자주 하는 요청 */}
            <section data-tour="care-quick" aria-labelledby="quick-title">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 id="quick-title" className="text-[1.08rem] font-extrabold">무엇을 도와드릴까요?</h2>
                {openRequests.length > 0 && (
                  <button onClick={() => nav('/care/requests')} className="flex items-center text-[0.82rem] font-bold text-primary hover:underline">
                    처리 중 {openRequests.length}건 <ChevronRight size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    onClick={q.run}
                    className="group flex flex-col items-center gap-2 rounded-2xl bg-card px-1 py-3.5 text-center shadow-soft ring-1 ring-line/60 transition-all hover:-translate-y-0.5 hover:ring-primary/40 sm:py-4"
                  >
                    <span className={cx('flex h-11 w-11 items-center justify-center rounded-2xl transition-colors', q.danger ? 'bg-danger-soft text-danger' : 'bg-mint text-primary group-hover:bg-primary group-hover:text-white')}>
                      {q.icon}
                    </span>
                    <span className="text-[0.8rem] font-bold leading-tight sm:text-[0.86rem]">{q.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* AI 제안 — 근거 사진과 함께, 광고가 아니라 우리 현장 기록에서 나온 제안 */}
            <section aria-label="AI 시설관리 제안" className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-line/60">
              <div className="grid sm:grid-cols-[1fr_200px]">
                <div className="p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-[0.78rem] font-extrabold text-ai-strong"><Sparkles size={14} /> AI 시설관리 제안</p>
                  <h3 className="mt-1.5 text-[1.12rem] font-extrabold leading-snug">대기실 유리 얼룩이<br className="sm:hidden" /> 3개월째 반복되고 있어요</h3>
                  <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-soft">
                    최근 작업 기록의 특이사항을 모았습니다. 다음 정기관리 때 <b className="text-ink">유리 집중관리</b>를 함께 받으시면 재발이 줄어듭니다.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Btn size="sm" variant="ai" onClick={() => request('추가서비스', { service: '유리창 집중청소' })}>유리 집중관리 요청</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => nav('/care/reports')}>관련 리포트 보기</Btn>
                  </div>
                </div>
                <figure className="relative order-first aspect-[16/8] overflow-hidden sm:order-none sm:aspect-auto">
                  <Photo sizes="(min-width: 640px) 200px, 100vw" src={PHOTO.beforeGlass} alt={altOf(PHOTO.beforeGlass)} width={1448} height={1086} className="h-full w-full object-cover" />
                  <figcaption className="absolute bottom-2 left-2 rounded-md bg-ink/70 px-2 py-0.5 text-[0.7rem] font-bold text-white">최근 방문 기록 사진</figcaption>
                </figure>
              </div>
            </section>

            {/* 함께 받으면 좋은 관리 — 사진 카드 가로 목록 → 바로 요청 */}
            <section aria-labelledby="picks-title">
              <div className="mb-2.5 flex items-end justify-between gap-2">
                <div>
                  <h2 id="picks-title" className="text-[1.08rem] font-extrabold">함께 받으면 좋은 관리</h2>
                  <p className="text-[0.8rem] text-ink-faint">정기관리 방문 때 함께 진행할 수 있습니다</p>
                </div>
              </div>
              <div className="scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
                {UPSELL_SERVICES.map((s) => {
                  const src = photoOf(s)
                  return (
                    <button
                      key={s}
                      onClick={() => request('추가서비스', { service: s })}
                      aria-label={`${s} 요청`}
                      className="group w-[9.6rem] shrink-0 text-left sm:w-[11rem] lg:w-auto"
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-mint">
                        <Photo sizes="180px" src={src} alt="" width={1448} height={1086} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card text-primary shadow-soft" aria-hidden="true"><Plus size={17} strokeWidth={2.6} /></span>
                      </span>
                      <span className="mt-2 block text-[0.86rem] font-bold leading-snug group-hover:text-primary">{s}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          {/* ── 오른쪽: 기록 · 계약 ── */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <RailCard title="최근 작업 리포트" action={myReport ? { label: '전체', run: () => nav('/care/reports') } : undefined}>
              {myReport ? (() => {
                const ba = beforeAfterFor(myReport.note + (myReport.service ?? ''))
                return (
                  <button onClick={() => nav(`/care/reports?id=${myReport.id}`)} className="group block w-full text-left">
                    <span className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
                      {(['before', 'after'] as const).map((k) => (
                        <span key={k} className="relative block aspect-[4/3] overflow-hidden bg-ivory">
                          {myReport.photos?.[k]?.dataUrl
                            ? <img src={myReport.photos[k]!.dataUrl} alt={`${k === 'before' ? '작업 전' : '작업 후'} 현장 사진`} className="h-full w-full object-cover" />
                            : <Photo sizes="170px" src={k === 'before' ? ba.before : ba.after} alt={altOf(k === 'before' ? ba.before : ba.after)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />}
                          <span className={cx('absolute left-1.5 top-1.5 rounded px-1.5 py-px text-[0.66rem] font-extrabold text-white', k === 'before' ? 'bg-ink/70' : 'bg-primary')}>{k === 'before' ? '전' : '후'}</span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[0.9rem] font-extrabold">{myReport.date} {myReport.completedAt}</span>
                      <span className="text-[0.76rem] font-bold text-success">작업 {myReport.itemsDone}/{myReport.itemsTotal}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[0.82rem] text-ink-soft">{myReport.note}</span>
                    <span className="mt-1.5 flex items-center gap-1 text-[0.78rem] font-bold text-primary">
                      {typeof myReport.rating === 'number'
                        ? <><Star size={13} className="fill-current text-warning" /> 내 평가 {myReport.rating}점</>
                        : <>평가 남기기 <ChevronRight size={13} /></>}
                    </span>
                  </button>
                )
              })() : <p className="text-[0.85rem] text-ink-faint">리포트가 준비 중입니다.</p>}
            </RailCard>

            <RailCard title="내 요청" action={{ label: '전체', run: () => nav('/care/requests') }}>
              {myRequests.length === 0 ? <p className="text-[0.85rem] text-ink-faint">보낸 요청이 없습니다.</p> : (
                <ul className="-my-1 divide-y divide-line/70">
                  {myRequests.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <button onClick={() => nav('/care/requests')} className="flex w-full items-center gap-2 py-2.5 text-left">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.86rem] font-bold">{r.type}</span>
                          <span className="block truncate text-[0.78rem] text-ink-soft">{r.detail}</span>
                        </span>
                        <StatusPill status={r.status} />
                        <ChevronRight size={15} className="shrink-0 text-ink-faint" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </RailCard>

            <RailCard title="계약 현황" action={{ label: '상세', run: () => setContractOpen(true) }}>
              <p className="text-[0.9rem] font-extrabold">{ct.serviceSummary}</p>
              {(() => {
                // 계약 기간 중 지난 비율 — 갱신 시점이 눈에 보이게
                const total = (new Date(ct.endDate).getTime() - new Date(ct.startDate).getTime()) || 1
                const pct = Math.min(100, Math.max(0, ((Date.now() - new Date(ct.startDate).getTime()) / total) * 100))
                return (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-ivory"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                    <p className="tnum mt-1.5 flex justify-between text-[0.74rem] text-ink-faint"><span>{ct.startDate}</span><span className={ct.renewalDDay <= 45 ? 'font-bold text-warning' : ''}>종료 {ct.endDate} · D-{ct.renewalDDay}</span></p>
                  </div>
                )
              })()}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-ivory px-2 py-2"><dt className="text-[0.7rem] font-bold text-ink-faint">최근 90일 방문</dt><dd className="tnum text-[0.95rem] font-extrabold">{visits.done}/{visits.planned}회</dd></div>
                <div className="rounded-xl bg-ivory px-2 py-2"><dt className="text-[0.7rem] font-bold text-ink-faint">담당 팀장</dt><dd className="text-[0.95rem] font-extrabold">{ct.internalManager}</dd></div>
              </dl>
            </RailCard>
          </aside>
        </div>
      </div>

      <RequestSheet type={sheet} preset={preset} onClose={() => setSheet(null)} />

      {/* 계약 정보 */}
      <Modal open={contractOpen} onClose={() => setContractOpen(false)} title="계약 정보">
        <dl className="divide-y divide-line text-[0.9rem]">
          {[
            ['서비스', ct.serviceSummary],
            ['방문 주기', `주 ${ct.visitsPerWeek}회`],
            ['계약 기간', `${ct.startDate} ~ ${ct.endDate}`],
            ['갱신까지', `D-${ct.renewalDDay}`],
            ['귀사 담당자', ct.customerManager],
            ['클린웨이 담당', `${ct.internalManager} 팀장`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="tnum text-right font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <Btn variant="outline" className="mt-4 w-full" onClick={() => { setContractOpen(false); request('문의', { topic: '계약 · 결제' }) }}>
          계약 · 갱신 문의하기
        </Btn>
      </Modal>
    </CareShell>
  )
}

/** 오른쪽 칸 카드 — 제목 · 전체 보기 · 본문 */
function RailCard({ title, action, children }: { title: string; action?: { label: string; run: () => void }; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-line/60">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[0.98rem] font-extrabold">{title}</h3>
        {action && <button onClick={action.run} className="flex items-center text-[0.8rem] font-bold text-primary hover:underline">{action.label}<ChevronRight size={14} /></button>}
      </div>
      {children}
    </section>
  )
}

/**
 * 오늘 방문 — 배송 추적처럼 지금 어디까지 왔는지
 * 위: 브랜드 띠(시간 · 서비스 · 상태) / 가운데: 4단계 진행 / 아래: 담당 팀장 · 현장 특이사항 · 다음 행동
 */
function LiveVisit({ onChangeVisit, onAsk }: { onChangeVisit: () => void; onAsk: () => void }) {
  const nav = useNavigate()
  const { today, next, stage, status, caption, todayIssues, report, ws, endTime } = useCareToday()
  const visit = today ?? next
  if (!visit) {
    return (
      <section className="rounded-3xl bg-card p-6 text-center shadow-soft ring-1 ring-line/60">
        <CalendarClock size={28} className="mx-auto text-ink-faint" />
        <p className="mt-2 font-extrabold">예정된 방문이 없습니다</p>
        <Btn size="sm" variant="outline" className="mt-3" onClick={onAsk}>담당자에게 문의</Btn>
      </section>
    )
  }
  const isToday = visit === today
  const team = teamById(visit.teamId)
  const lead = visit.teamId ? teamMembers(visit.teamId).find((e) => e.position === '팀장') : undefined
  const members = visit.teamId ? teamMembers(visit.teamId).map((e) => e.name).join(' · ') : ''

  return (
    <section data-tour="care-today" aria-label={isToday ? '오늘의 서비스' : '다음 방문'} className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-line/60">
      {/* 브랜드 띠 */}
      <div className="relative overflow-hidden bg-shell bg-[radial-gradient(circle_at_92%_-10%,color-mix(in_srgb,var(--color-primary)_70%,transparent),transparent_55%)] px-5 py-4 text-white sm:px-6 sm:py-5">
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.78rem] font-bold text-champagne">{isToday ? '오늘의 서비스' : '다음 방문'}</p>
            <p className="tnum mt-0.5 text-[1.55rem] font-extrabold leading-tight sm:text-[1.75rem]">
              {isToday ? '' : `${when(visit)} `}{visit.time}<span className="text-white/50"> – {endTime(visit)}</span>
            </p>
            <p className="mt-0.5 truncate text-[0.84rem] text-white/75">{visit.service} · {team?.name ?? '담당팀 배정 중'}</p>
          </div>
          {isToday && (
            <span className={cx('shrink-0 rounded-full px-2.5 py-1 text-[0.76rem] font-extrabold', stage === 4 ? 'bg-success text-white' : stage >= 2 ? 'bg-champagne text-shell' : 'bg-white/15 text-white')}>
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
        {isToday && (
          <div>
            {/* 4단계 진행 — 아이콘 원 + 연결선 */}
            <ol className="grid grid-cols-4" aria-label="오늘 방문 진행 단계">
              {VISIT_STEPS.map((label, i) => {
                const Icon = STEP_ICON[i]
                const reached = stage >= i + 1
                const current = stage === i + 1
                return (
                  <li key={label} className="relative flex flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
                    {i > 0 && <span className={cx('absolute right-1/2 top-4 z-0 h-0.5 w-full -translate-y-1/2', stage >= i + 1 ? 'bg-primary' : 'bg-line')} aria-hidden="true" />}
                    <span className={cx('relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-card transition-colors', reached ? 'bg-primary text-white' : 'bg-ivory text-ink-faint')}>
                      <Icon size={15} />
                    </span>
                    <span className={cx('mt-1.5 text-[0.76rem] font-bold', reached ? 'text-ink' : 'text-ink-faint')}>{label}</span>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 rounded-xl bg-ivory px-3.5 py-2.5 text-[0.86rem] font-semibold text-ink">
              {caption}
              {ws?.checkinAt && stage < 4 && <span className="tnum ml-1 text-ink-faint">· 도착 {ws.checkinAt}</span>}
            </p>
          </div>
        )}

        {/* 담당 팀장 */}
        {lead && (
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-[1rem] font-extrabold text-primary-strong" aria-hidden="true">{lead.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.92rem] font-extrabold">{lead.name} 팀장 <span className="text-[0.78rem] font-semibold text-ink-faint">· 오늘의 담당</span></p>
              <p className="truncate text-[0.78rem] text-ink-faint">{team?.name} · {members}</p>
            </div>
            <button onClick={onAsk} className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-[0.82rem] font-bold text-ink hover:border-primary hover:text-primary">
              <MessageCircle size={15} /> 문의
            </button>
          </div>
        )}

        {isToday && todayIssues.length > 0 && (
          <ul className="space-y-1.5">
            {todayIssues.map((i) => (
              <li key={i.id} className="flex gap-2 rounded-xl bg-warning-soft/70 px-3.5 py-2.5 text-[0.84rem]">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
                <span><b>현장 특이사항 · {i.type}</b> — {i.detail} <span className="font-bold text-ink-soft">({i.status === '해결' ? '조치 완료' : '본사 조치 중'})</span></span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-line/70 pt-3.5">
          {isToday && report ? (
            <Btn onClick={() => nav(`/care/reports?id=${report.id}`)}>오늘 리포트 보기 · 평가하기</Btn>
          ) : (
            <Btn variant="outline" onClick={onChangeVisit}>일정 변경 요청</Btn>
          )}
          {isToday && next && (
            <span className="tnum ml-auto text-[0.78rem] text-ink-faint">다음 방문 {when(next)} {next.time}</span>
          )}
        </div>
      </div>
    </section>
  )
}
