import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Sparkles, FileText, MessageCircle, RefreshCcw, Siren, PlusCircle, ClipboardList, ArrowRight, ChevronRight } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import RequestSheet, { type RequestPreset } from './RequestSheet'
import { Card, Btn, Modal, StatusPill } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'
import { dateWithOffset } from '../../lib/utils'
import { PHOTO, altOf, photoOf } from '../../lib/demo/photos'
import type { RequestType } from '../../types'

/**
 * 고객 홈 — 고객이 이 화면에 오는 이유 순서대로:
 * ① 다음 방문이 언제인지  ② 요청을 보내는 것  ③ AI 제안  ④ 최근 리포트·내 요청 상태
 */
export default function CareHome() {
  const nav = useNavigate()
  const { requests, reports } = useDemo()
  const customer = customerById(CARE_CUSTOMER_ID)!
  const ct = customer.contract
  const myRequests = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)
  const openRequests = myRequests.filter((r) => r.status !== '완료')
  const myReport = reports.find((r) => r.customerId === CARE_CUSTOMER_ID) ?? reports[0]
  const [sheet, setSheet] = useState<RequestType | null>(null)
  const [preset, setPreset] = useState<RequestPreset | undefined>()
  const [contractOpen, setContractOpen] = useState(false)

  const request = (t: RequestType, p?: RequestPreset) => { setPreset(p); setSheet(t) }

  const QUICK: Array<{ icon: React.ReactNode; label: string; run: () => void; tone?: 'danger' }> = [
    { icon: <PlusCircle size={20} />, label: '추가서비스', run: () => request('추가서비스') },
    { icon: <RefreshCcw size={20} />, label: '일정 변경', run: () => request('일정변경') },
    { icon: <Siren size={20} />, label: '긴급 방문', run: () => request('긴급방문'), tone: 'danger' },
    { icon: <MessageCircle size={20} />, label: '담당자 문의', run: () => request('문의') },
    { icon: <FileText size={20} />, label: '작업 리포트', run: () => nav('/care/reports') },
    { icon: <ClipboardList size={20} />, label: '계약 정보', run: () => setContractOpen(true) },
  ]

  return (
    <CareShell>
      <div className="fade-up space-y-5">
        {/* ① 인사 + 다음 방문 */}
        <section className="relative overflow-hidden rounded-3xl bg-shell p-5 text-white sm:p-6">
          <img
            src={photoOf(ct.serviceSummary.includes('병') ? '병·의원 청소관리' : '건물 공용부 관리')}
            alt="" aria-hidden="true" width={1448} height={1086}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-shell via-shell/90 to-shell/60" />
          <div className="relative">
            <p className="text-[0.85rem] text-white/70">안녕하세요,</p>
            <h1 className="text-[1.4rem] font-extrabold leading-snug">{customer.name} 담당자님</h1>
            <div className="mt-4 rounded-2xl bg-white/10 p-4">
              <p className="flex items-center gap-1.5 text-[0.8rem] font-bold text-champagne"><CalendarClock size={14} /> 다음 방문</p>
              <p className="tnum mt-1 text-[1.15rem] font-extrabold">{dateWithOffset(1)} 09:00 ~ 11:00</p>
              <p className="mt-0.5 text-[0.84rem] text-white/75">{ct.serviceSummary} · 담당 {ct.internalManager} 팀장</p>
              <Btn size="sm" variant="outline" className="mt-3 border-white/30 bg-transparent text-white hover:border-champagne hover:text-champagne" onClick={() => request('일정변경')}>
                일정 변경 요청
              </Btn>
            </div>
          </div>
        </section>

        {/* ② 요청 — 가장 자주 하는 일을 첫 화면에 */}
        <section data-tour="care-quick" aria-labelledby="quick-title">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 id="quick-title" className="text-[1.08rem] font-extrabold">무엇을 도와드릴까요?</h2>
            {openRequests.length > 0 && (
              <button onClick={() => nav('/care/requests')} className="text-[0.84rem] font-bold text-primary hover:underline">처리 중 {openRequests.length}건</button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {QUICK.map((q) => (
              <button key={q.label} onClick={q.run}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-card px-1.5 py-3.5 text-[0.84rem] font-extrabold text-ink transition-colors hover:border-primary hover:text-primary">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${q.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-mint text-primary'}`}>{q.icon}</span>
                <span className="text-center leading-tight">{q.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ③ AI 시설관리 제안 — 근거 사진과 함께 */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-line bg-ai-soft px-5 py-3">
            <p className="flex items-center gap-1.5 text-[0.95rem] font-extrabold text-ai-strong"><Sparkles size={16} /> AI 시설관리 제안</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_180px] sm:items-start">
            <div>
              <p className="text-[0.93rem] leading-relaxed">
                최근 3개월 작업기록에서 <b>대기실 유리 얼룩 관련 특이사항이 반복</b>되었습니다.
                다음 정기관리 때 <b className="text-primary">유리 집중관리</b>를 함께 받으시길 권합니다.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Btn size="sm" variant="ai" onClick={() => request('추가서비스', { service: '유리창 집중청소' })}>유리 집중관리 요청</Btn>
                <Btn size="sm" variant="outline" onClick={() => nav('/care/reports')}>관련 리포트 보기</Btn>
              </div>
            </div>
            <figure className="order-first overflow-hidden rounded-xl border border-line sm:order-none">
              <img src={PHOTO.beforeGlass} alt={altOf(PHOTO.beforeGlass)} width={1448} height={1086} loading="lazy" className="aspect-[16/9] w-full object-cover sm:aspect-[4/3]" />
              <figcaption className="bg-ivory px-2 py-1 text-center text-[0.74rem] font-bold text-ink-faint">최근 방문 기록 사진</figcaption>
            </figure>
          </div>
        </Card>

        {/* ④ 최근 리포트 · 내 요청 */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[0.98rem] font-extrabold">최근 작업 리포트</h3>
              <button onClick={() => nav('/care/reports')} className="flex items-center gap-0.5 text-[0.82rem] font-bold text-primary">전체 <ArrowRight size={13} /></button>
            </div>
            {myReport ? (
              <button onClick={() => nav('/care/reports')} className="w-full rounded-xl bg-ivory px-3.5 py-3 text-left hover:bg-mint/50">
                <p className="text-[0.9rem] font-bold">{myReport.date} · 작업 {myReport.itemsDone}/{myReport.itemsTotal} 완료</p>
                <p className="mt-0.5 text-[0.82rem] text-ink-soft">{myReport.note}</p>
              </button>
            ) : <p className="text-[0.85rem] text-ink-faint">리포트가 준비 중입니다.</p>}
          </Card>
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[0.98rem] font-extrabold">내 요청</h3>
              <button onClick={() => nav('/care/requests')} className="flex items-center gap-0.5 text-[0.82rem] font-bold text-primary">전체 <ArrowRight size={13} /></button>
            </div>
            {myRequests.length === 0 ? <p className="text-[0.85rem] text-ink-faint">보낸 요청이 없습니다.</p> : (
              <div className="divide-y divide-line">
                {myRequests.slice(0, 3).map((r) => (
                  <button key={r.id} onClick={() => nav('/care/requests')} className="flex w-full items-center gap-2 py-2 text-left first:pt-0 last:pb-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.86rem] font-bold">{r.type}</span>
                      <span className="block truncate text-[0.8rem] text-ink-soft">{r.detail}</span>
                    </span>
                    <StatusPill status={r.status} />
                    <ChevronRight size={15} className="shrink-0 text-ink-faint" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      <RequestSheet type={sheet} preset={preset} onClose={() => setSheet(null)} />

      {/* 계약 정보 — 예전에는 토스트 한 줄로만 보였다 */}
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
