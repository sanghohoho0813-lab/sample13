import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, ArrowLeft, Camera, CheckCircle2, FileText, AlertTriangle, ArrowRight, ImageOff } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, StatusPill, DemoBadge, SectionTitle, EmptyState } from '../../components/ui'
import { WhyAIButton, AIReadyBadge } from '../../components/ai'
import { useDemo } from '../../lib/data/store'
import { customerById, siteByCustomer, teamById, teamMemberNames } from '../../lib/demo/company'
import { CHECKLIST_TEMPLATE } from '../../lib/demo/operations'
import { SEED_QUALITY } from '../../lib/demo/intelligence'
import { beforeAfterFor, altOf, photoOf } from '../../lib/demo/photos'

function WorkPhoto({ label, taken, src }: { label: string; taken: boolean; src: string }) {
  if (!taken) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-ivory">
        <ImageOff size={22} className="text-ink-faint" />
        <p className="text-[0.78rem] font-bold text-ink-soft">{label}</p>
        <p className="text-[0.65rem] text-ink-faint">미등록</p>
      </div>
    )
  }
  return (
    <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-ivory">
      <img src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
      <figcaption className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-ink/75 px-2 py-0.5 text-[0.66rem] font-extrabold text-white">
        <Camera size={11} /> {label}
      </figcaption>
    </figure>
  )
}

export default function SiteDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { schedules, work, reports } = useDemo()
  const customer = id ? customerById(id) : undefined
  const site = id ? siteByCustomer(id) : undefined

  if (!customer || !site) {
    return <EmptyState title="현장을 찾을 수 없습니다." desc="주소가 잘못되었거나 데이터가 없습니다." action={<Btn onClick={() => nav('/sites')}>현장 목록으로</Btn>} />
  }

  const jobs = schedules.filter((s) => s.customerId === customer.id && s.dayOffset === 0).sort((a, b) => a.time.localeCompare(b.time))
  const mainJob = jobs[0]
  const ws = mainJob ? work[mainJob.id] : undefined
  const report = reports.find((r) => r.customerId === customer.id)
  const issues = SEED_QUALITY.filter((q) => q.customerId === customer.id)
  const checklist = ws?.checklist ?? Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, mainJob?.status === '완료']))
  const ba = beforeAfterFor(`${mainJob?.service ?? ''} ${site.note ?? ''} ${ws?.note ?? ''}`)
  const siteHero = photoOf(mainJob?.service)

  return (
    <div className="fade-up">
      <button onClick={() => nav('/sites')} className="mb-3 flex items-center gap-1 text-[0.85rem] font-bold text-ink-soft hover:text-primary"><ArrowLeft size={15} /> 현장관리</button>
      <PageHeader
        title={site.name}
        desc={`${customer.address} · ${site.areaPyeong}평 · ${customer.contract.serviceSummary}`}
        right={<><Badge tone="brand">{customer.type}</Badge><DemoBadge /></>}
      />

      {mainJob && (
        <figure className="mb-4 overflow-hidden rounded-2xl border border-line">
          <img src={siteHero} alt={altOf(siteHero)} width={1448} height={1086} className="h-40 w-full object-cover object-[50%_30%] sm:h-56" />
        </figure>
      )}

      {site.note && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-2.5 text-[0.85rem] font-bold text-warning"><AlertTriangle size={15} /> {site.note}</p>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {/* 오늘 작업 */}
          <Card className="p-5">
            <SectionTitle>오늘 작업</SectionTitle>
            {mainJob ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="tnum text-[1.2rem] font-extrabold text-primary">{mainJob.time} <span className="text-[0.85rem] text-ink-soft font-semibold">({mainJob.durationMin}분 예상)</span></p>
                    <p className="text-[0.88rem] text-ink-soft">{mainJob.service} · {teamById(mainJob.teamId)?.name ?? '미배정'} ({teamMemberNames(mainJob.teamId)})</p>
                  </div>
                  <StatusPill status={mainJob.status} />
                </div>
                {mainJob.risk && (
                  <div className="rounded-xl bg-danger-soft p-3.5 text-[0.85rem]">
                    <p className="font-extrabold text-danger"><AlertTriangle size={14} className="mr-1 inline" /> {mainJob.risk.type}</p>
                    <p className="mt-0.5 text-ink">{mainJob.risk.detail}</p>
                  </div>
                )}
                {/* 체크인 흐름 */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
                  {[
                    ['체크인', ws?.checkinAt ?? (mainJob.status === '완료' ? '완료' : '-')],
                    ['작업시작', ws?.startedAt ?? (mainJob.status === '완료' ? '완료' : '-')],
                    ['작업완료', ws?.completedAt ?? (mainJob.status === '완료' ? '완료' : '-')],
                    ['체크아웃', ws?.checkoutAt ?? (mainJob.status === '완료' ? '완료' : '-')],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-ivory px-2 py-2.5">
                      <p className="text-[0.68rem] font-bold text-ink-faint">{l}</p>
                      <p className="tnum mt-0.5 text-[0.88rem] font-extrabold">{v}</p>
                    </div>
                  ))}
                </div>
                {/* 체크리스트 */}
                <div>
                  <p className="mb-2 text-[0.85rem] font-bold text-ink-soft">체크리스트</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {CHECKLIST_TEMPLATE.map((item) => (
                      <div key={item} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.78rem] font-bold ${checklist[item] ? 'bg-success-soft text-success' : 'bg-ivory text-ink-faint'}`}>
                        <CheckCircle2 size={14} /> {item}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Before / After */}
                <div className="grid grid-cols-2 gap-3">
                  <WorkPhoto label="Before" taken={!!ws?.beforePhoto || mainJob.status === '완료'} src={ba.before} />
                  <WorkPhoto label="After" taken={!!ws?.afterPhoto || mainJob.status === '완료'} src={ba.after} />
                </div>
                {ws?.note && <p className="rounded-xl bg-ivory p-3 text-[0.85rem]"><b>특이사항</b> — {ws.note}</p>}
              </div>
            ) : (
              <EmptyState title="오늘 예정된 작업이 없습니다." />
            )}
          </Card>

          {/* Service Report */}
          <Card className="p-5">
            <SectionTitle right={<Btn variant="ghost" size="sm" onClick={() => nav('/work')}>작업현황 <ArrowRight size={13} className="inline" /></Btn>}>최근 Service Report</SectionTitle>
            {report ? (
              <div className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[0.95rem] font-extrabold"><FileText size={16} className="text-primary" /> {report.date} · {report.team}</p>
                  <Badge tone="success">완료 {report.completedAt}</Badge>
                </div>
                <p className="mt-2 text-[0.85rem]">작업항목 <b className="tnum">{report.itemsDone} / {report.itemsTotal}</b></p>
                <p className="mt-1 text-[0.85rem] text-ink-soft">특이사항 — {report.note}</p>
                {report.nextRecommend && <p className="mt-2 rounded-lg bg-mint px-3 py-1.5 text-[0.8rem] font-bold text-primary-strong">다음 관리 추천 · {report.nextRecommend}</p>}
              </div>
            ) : (
              <EmptyState title="아직 생성된 리포트가 없습니다." desc="작업이 완료되면 Service Report가 자동 생성됩니다." />
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* 고객/계약 요약 */}
          <Card className="p-5">
            <SectionTitle>고객 / 계약</SectionTitle>
            <div className="space-y-2 text-[0.88rem]">
              {[
                ['고객사', customer.name],
                ['계약', customer.contract.serviceSummary],
                ['월 계약금액', `${customer.contract.monthlyFee}만원 (DEMO)`],
                ['고객 담당자', customer.contract.customerManager],
                ['내부 담당자', customer.contract.internalManager],
                ['계약 갱신', `D-${customer.contract.renewalDDay}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 border-b border-line/60 pb-1.5">
                  <span className="text-ink-faint font-semibold">{l}</span>
                  <span className="font-bold text-right">{v}</span>
                </div>
              ))}
            </div>
            <Btn variant="outline" size="sm" className="mt-3.5 w-full" onClick={() => nav(`/customers/${customer.id}`)}>고객 Detail <ArrowRight size={13} className="inline" /></Btn>
          </Card>

          {/* 품질 이력 */}
          <Card className="p-5">
            <SectionTitle right={<AIReadyBadge small />}>품질 / 특이사항 이력</SectionTitle>
            {issues.length === 0 ? (
              <p className="text-[0.85rem] text-ink-faint">최근 품질 이슈가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {issues.map((q) => (
                  <div key={q.id} className="rounded-xl bg-ivory p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={q.status === '해결' ? 'success' : q.status === '조치중' ? 'info' : 'warning'}>{q.category}</Badge>
                      <span className="text-[0.7rem] font-bold text-ink-faint">{q.date} · {q.status}</span>
                    </div>
                    <p className="mt-1.5 text-[0.84rem]">{q.detail}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3"><WhyAIButton dataViewed={['현장 특이사항', '품질문의 이력', '작업 사진 메모', '방문 기록']} /></div>
          </Card>

          <p className="text-[0.72rem] leading-relaxed text-ink-faint flex items-center gap-1.5"><MapPin size={12} /> GPS 체크인·Geofence·QR 인증은 Integration Ready — 실서비스 연결 시 활성화됩니다.</p>
        </div>
      </div>
    </div>
  )
}
