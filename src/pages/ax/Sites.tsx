import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, StatusPill } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { CUSTOMERS, SITES, teamById } from '../../lib/demo/company'
import { photoForSite, altOf } from '../../lib/demo/photos'
import { Photo } from '../../components/ui/Photo'

export default function Sites() {
  const { schedules } = useDemo()
  const nav = useNavigate()
  return (
    <div className="fade-up">
      <PageHeader title="현장관리" desc="정기관리 현장의 오늘 상태와 특이사항을 확인합니다." right={<DemoBadge />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CUSTOMERS.map((c) => {
          const site = SITES.find((s) => s.customerId === c.id)
          const todayJobs = schedules.filter((s) => s.dayOffset === 0 && s.customerId === c.id)
          const risk = todayJobs.find((s) => s.risk)
          // 썸네일은 "오늘의 작업"이 아니라 현장 유형을 나타낸다 (배지와 의미 일치)
          const thumb = photoForSite(c.type, todayJobs[0]?.service)
          return (
            <Card key={c.id} onClick={() => nav(`/sites/${c.id}`)} className="p-5">
              {/* 현장 식별: 소형 썸네일 + 이름/주소 — 데이터가 카드 상단을 차지한다 */}
              <div className="flex items-start gap-3">
                <Photo
                  sizes="80px"
                  src={thumb}
                  alt={altOf(thumb)}
                  width={1448}
                  height={1086}
                  loading="lazy"
                  className="h-[3.1rem] w-[4.1rem] shrink-0 rounded-xl border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  {/* 유형 배지는 아래 칩 줄로 내려 현장명이 잘리지 않게 한다 */}
                  <p className="text-[1.02rem] font-extrabold leading-snug">{site?.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.76rem] text-ink-faint">
                    <MapPin size={12} className="shrink-0" /> <span className="truncate">{c.address}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.8rem]">
                <Badge tone="brand">{c.type}</Badge>
                <span className="rounded-lg bg-ivory px-2.5 py-1 font-bold text-ink-soft">{site?.areaPyeong}평</span>
                <span className="rounded-lg bg-ivory px-2.5 py-1 font-bold text-ink-soft">{c.contract.serviceSummary}</span>
              </div>

              {site?.note && <p className="mt-2.5 rounded-lg bg-warning-soft px-2.5 py-1.5 text-[0.76rem] font-semibold text-warning">{site.note}</p>}

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                {todayJobs.length > 0 ? (
                  <span className="flex items-center gap-2 text-[0.8rem] font-bold">
                    오늘 {todayJobs[0].time} · {teamById(todayJobs[0].teamId)?.name ?? '미배정'}
                    <StatusPill status={todayJobs[0].status} />
                  </span>
                ) : (
                  <span className="text-[0.8rem] text-ink-faint">오늘 예정 없음</span>
                )}
                {risk ? <AlertTriangle size={16} className="text-danger" /> : <ArrowRight size={15} className="text-primary" />}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
