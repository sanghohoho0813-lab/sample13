import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, SectionTitle, StatTile, type Tone } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { TEAMS, EMPLOYEES, customerById } from '../../lib/demo/company'

export default function Team() {
  const nav = useNavigate()
  const { schedules } = useDemo()
  const today = schedules.filter((s) => s.dayOffset === 0)

  return (
    <div className="fade-up">
      <PageHeader title="직원 / 팀" desc="8개 현장팀의 구성·전문 서비스·오늘 가동현황을 확인합니다." right={<DemoBadge />} />

      <div className="mb-5 grid grid-cols-3 gap-3 sm:max-w-md">
        {[
          ['근무', EMPLOYEES.filter((e) => e.status === '근무').length, 'success'],
          ['휴무', EMPLOYEES.filter((e) => e.status === '휴무').length, 'neutral'],
          ['결원', EMPLOYEES.filter((e) => e.status === '결원').length, 'danger'],
        ].map(([l, v, tone]) => (
          <StatTile key={l as string} label={l as string} value={`${v}명`} tone={tone as Tone} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TEAMS.map((t) => {
          const members = EMPLOYEES.filter((e) => e.teamId === t.id)
          const jobs = today.filter((s) => s.teamId === t.id)
          const hasGap = members.some((m) => m.status !== '근무')
          return (
            <Card key={t.id} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[1rem] font-extrabold"><Users size={17} className="text-primary" /> {t.name}</p>
                <Badge tone="brand">{jobs.length}건</Badge>
              </div>
              <p className="mt-1 text-[0.74rem] text-ink-faint">{t.specialty.join(' · ')}</p>
              <div className="mt-3 space-y-1.5">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-ivory px-2.5 py-1.5 text-[0.82rem]">
                    <span className="font-bold">{m.name} <span className="text-[0.72rem] font-semibold text-ink-faint">{m.position}</span></span>
                    <Badge tone={m.status === '근무' ? 'success' : m.status === '휴무' ? 'neutral' : 'danger'}>{m.status}</Badge>
                  </div>
                ))}
              </div>
              {hasGap && <p className="mt-2.5 flex items-center gap-1 text-[0.74rem] font-bold text-danger"><AlertTriangle size={12} /> 인원 공백 — 일정 영향 확인 필요</p>}
              <div className="mt-3 border-t border-line pt-2.5">
                <SectionTitle className="mb-1.5"><span className="text-[0.78rem] text-ink-faint font-bold">오늘 일정</span></SectionTitle>
                {jobs.length === 0 ? (
                  <p className="text-[0.76rem] text-ink-faint">배정 없음</p>
                ) : (
                  <div className="space-y-1">
                    {jobs.sort((a, b) => a.time.localeCompare(b.time)).map((s) => (
                      <button key={s.id} onClick={() => nav(`/schedule?id=${s.id}`)} className="-mx-1.5 flex w-[calc(100%+0.75rem)] gap-2 rounded-md px-1.5 py-0.5 text-left text-[0.8rem] hover:bg-mint/50">
                        <span className="tnum font-extrabold text-primary">{s.time}</span>
                        <span className="min-w-0 flex-1 truncate font-semibold">{customerById(s.customerId)?.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
