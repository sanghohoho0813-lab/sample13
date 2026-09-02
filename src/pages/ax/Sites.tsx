import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, StatusPill } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { CUSTOMERS, SITES, teamById } from '../../lib/demo/company'
import { photoOf, altOf } from '../../lib/demo/photos'

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
          return (
            <Card key={c.id} onClick={() => nav(`/sites/${c.id}`)} className="overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden bg-ivory">
                <img
                  src={photoOf(todayJobs[0]?.service ?? c.contract.serviceSummary)}
                  alt={altOf(photoOf(todayJobs[0]?.service ?? c.contract.serviceSummary))}
                  width={1448} height={1086} loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[1.05rem] font-extrabold">{site?.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.76rem] text-ink-faint"><MapPin size={12} /> {c.address}</p>
                </div>
                <Badge tone="brand">{c.type}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.8rem]">
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
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
