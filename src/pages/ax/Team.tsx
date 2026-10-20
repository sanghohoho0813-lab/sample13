import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, Check } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, SectionTitle, StatTile, type Tone } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { TEAMS, EMPLOYEES, customerById } from '../../lib/demo/company'
import { DEMO_NOW } from '../../lib/ops/geo'
import { cx } from '../../lib/utils'
import type { Schedule } from '../../types'

// 일정 상태 점 — 일정 / 배정 · 작업현황과 같은 의미색
const DOT: Record<Schedule['status'], string> = {
  완료: 'bg-success', 작업중: 'bg-primary', 이동중: 'bg-aqua', 예정: 'bg-line', 확인필요: 'bg-danger',
}

/** 팀이 '지금' 무엇을 하는지 — 오늘 일정 상태에서 계산 (작업중 → 이동중 → 다음 일정 → 끝) */
function nowOf(jobs: Schedule[]): { tone: string; text: string } {
  const name = (s: Schedule) => customerById(s.customerId)?.name ?? ''
  const working = jobs.find((s) => s.status === '작업중')
  if (working) return { tone: 'bg-mint text-primary-strong', text: `작업중 — ${name(working)} (${working.time}~)` }
  const moving = jobs.find((s) => s.status === '이동중')
  if (moving) return { tone: 'bg-info-soft text-info', text: `이동중 — ${name(moving)} ${moving.time} 도착 예정` }
  const next = jobs.find((s) => s.status === '예정' && s.time > DEMO_NOW)
  if (next) return { tone: 'bg-ivory text-ink-soft', text: `대기 — 다음 ${next.time} ${name(next)}` }
  if (jobs.length && jobs.every((s) => s.status === '완료')) return { tone: 'bg-success-soft text-success', text: '오늘 일정 모두 완료' }
  return { tone: 'bg-ivory text-ink-faint', text: jobs.length ? '확인 필요한 일정이 있습니다' : '오늘 배정 없음' }
}

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
          const sorted = [...jobs].sort((a, b) => a.time.localeCompare(b.time))
          const now = nowOf(sorted)
          const done = sorted.filter((s) => s.status === '완료').length
          return (
            <Card key={t.id} className="p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[1rem] font-extrabold"><Users size={17} className="text-primary" /> {t.name}</p>
                <Badge tone="brand">{jobs.length}건</Badge>
              </div>
              <p className="mt-1 text-[0.74rem] text-ink-faint">{t.specialty.join(' · ')}</p>
              {/* 지금 — 이 팀이 무엇을 하고 있는지 */}
              <p className={cx('mt-2.5 rounded-lg px-2.5 py-1.5 text-[0.78rem] font-bold', now.tone)}>
                <span className="mr-1 text-[0.68rem] font-extrabold">지금 {DEMO_NOW}</span> {now.text}
              </p>
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
                <SectionTitle className="mb-1.5" right={jobs.length ? <span className="tnum text-[0.72rem] font-bold text-ink-faint">완료 {done}/{jobs.length}</span> : undefined}><span className="text-[0.78rem] text-ink-faint font-bold">오늘 일정</span></SectionTitle>
                {jobs.length === 0 ? (
                  <p className="text-[0.76rem] text-ink-faint">배정 없음</p>
                ) : (
                  <div className="space-y-1">
                    {sorted.map((s) => (
                      <button key={s.id} onClick={() => nav(`/schedule?id=${s.id}`)} className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-0.5 text-left text-[0.8rem] hover:bg-mint/50">
                        <span className={cx('flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full', DOT[s.status])} aria-hidden="true" />
                        <span className={cx('tnum font-extrabold', s.status === '완료' ? 'text-ink-faint' : 'text-primary')}>{s.time}</span>
                        <span className={cx('min-w-0 flex-1 truncate font-semibold', s.status === '완료' && 'text-ink-soft')}>{customerById(s.customerId)?.name}</span>
                        {s.status === '완료' ? <><Check size={13} className="shrink-0 text-success" aria-hidden="true" /><span className="sr-only">완료</span></> : s.status !== '예정' ? <span className="shrink-0 text-[0.7rem] font-bold text-ink-faint">{s.status}</span> : <span className="sr-only">예정</span>}
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
