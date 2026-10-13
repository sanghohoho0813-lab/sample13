import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, BellRing, CalendarDays, CheckCircle2, CloudOff, FileText, Signal, SignalLow, Star, User, Wifi,
} from 'lucide-react'
import { Badge, Btn, Card, DemoBadge, StatusPill } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { useDemo } from '../../lib/data/context'
import { EMPLOYEES, TEAMS, customerById, employeeById, personaName, teamById, teamMemberNames } from '../../lib/demo/company'
import type { Net } from '../../lib/field/outbox'
import { cx, nowClock, nowDateCompact } from '../../lib/utils'
import { MiraeCredit } from '../../components/brand/MiraeLogo'
import { SampleBridgeMini } from '../../components/brand/SampleBridgeCTA'
import JobFlow from './JobFlow'
import { useFieldSync } from './useFieldSync'

type Tab = 'today' | 'alerts' | 'reports' | 'me'

const NET_LABEL: Record<Net, { label: string; icon: ReactNode; cls: string }> = {
  online: { label: '온라인', icon: <Wifi size={13} />, cls: 'bg-white/10 text-white' },
  weak: { label: '약한 신호', icon: <SignalLow size={13} />, cls: 'bg-warning text-white' },
  offline: { label: '오프라인', icon: <CloudOff size={13} />, cls: 'bg-danger text-white' },
}

/**
 * 현장직원 앱 — 행동 중심
 * · 화면은 '지금 현장' 하나에 집중하고, 다음 할 일은 아래 고정 버튼 하나로 안내한다
 * · 신호가 약하거나 끊겨도 기록은 기기에 쌓였다가 연결되면 순서대로 전송된다(useFieldSync)
 * · 본사에서 승인한 배정 · 시간 변경은 알림으로 오고, '확인'을 누르면 본사 화면에 수신 확인이 남는다
 */
export default function FieldApp() {
  const { setRole, setFieldPersona } = useDemo()
  const { view, send, net, setNet, pending, lastSync, meta } = useFieldSync()
  const nav = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('today')
  const [netMenu, setNetMenu] = useState(false)
  const [clock, setClock] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setClock(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])

  const me = employeeById(view.fieldPersona) ?? EMPLOYEES[2]
  const myTeam = me.teamId
  const myName = personaName(me.id)
  const myJobs = useMemo(
    () => view.schedules.filter((s) => s.dayOffset === 0 && s.teamId === myTeam).sort((a, b) => a.time.localeCompare(b.time)),
    [view.schedules, myTeam],
  )
  const [selected, setSelected] = useState<string | null>(null)
  useEffect(() => { setSelected(null) }, [myTeam])
  const nextJob = myJobs.find((j) => j.status !== '완료')
  const job = myJobs.find((j) => j.id === selected) ?? nextJob
  // 지금 작업할 현장 칩이 화면 안에 보이도록 가로 목록을 옮긴다 (완료한 현장이 앞을 가리지 않게)
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>(`[data-job="${job?.id}"]`)
    if (el && strip.current) strip.current.scrollLeft = Math.max(0, el.offsetLeft - 16 - strip.current.offsetLeft)
  }, [job?.id, tab])
  const myNotices = view.notices.filter((n) => n.teamId === myTeam)
  const unacked = myNotices.filter((n) => !n.ackAt)
  const myReports = view.reports.filter((r) => r.team === teamById(myTeam)?.name)
  const myIssues = view.issues.filter((i) => myJobs.some((j) => j.id === i.scheduleId) || i.reportedBy === myName)

  const ack = (id: string, scheduleId: string) => {
    send({ type: 'noticeAck', noticeId: id, meta: meta() })
    setSelected(scheduleId)
    setTab('today')
    toast(`확인 완료 — 본사에 수신 확인이 전달됩니다${net === 'online' ? '' : ' (연결 시)'}`)
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* 머리 — 누가 · 지금 연결 상태 */}
        <header className="sticky top-0 z-30 border-b border-line bg-shell px-4 py-3 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.92rem] font-extrabold tracking-wide">CLEANWAY <span className="text-champagne">FIELD</span></p>
              <p className="tnum truncate text-[0.72rem] text-white/75">{nowDateCompact()} · {clock} · {me.name} {me.position} · {teamById(myTeam)?.name.replace('Clean ', '')}</p>
            </div>
            <div className="relative flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setNetMenu((v) => !v)}
                aria-expanded={netMenu}
                aria-label={`네트워크 상태 ${NET_LABEL[net].label}${pending ? ` · 전송 대기 ${pending}건` : ''}`}
                className={cx('flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.72rem] font-bold', NET_LABEL[net].cls)}
              >
                {NET_LABEL[net].icon}{NET_LABEL[net].label}{pending > 0 && <span className="tnum rounded bg-white/25 px-1">{pending}</span>}
              </button>
              <button
                onClick={() => { setRole('manager'); nav('/') }}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-[0.72rem] font-bold hover:bg-white/20"
                title="AX 운영화면 보기 (데모)"
              >
                <ArrowLeft size={14} /> AX
              </button>
              {netMenu && (
                <div className="pop-in absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-line bg-card p-1.5 text-ink shadow-pop">
                  <p className="px-2.5 pb-1 pt-1 text-[0.72rem] font-bold text-ink-faint">네트워크 상황 재현 (데모)</p>
                  {(['online', 'weak', 'offline'] as Net[]).map((n) => (
                    <button key={n} onClick={() => { setNet(n); setNetMenu(false) }}
                      className={cx('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.86rem] font-bold hover:bg-mint', net === n && 'bg-mint text-primary-strong')}>
                      {n === 'online' ? <Signal size={15} /> : n === 'weak' ? <SignalLow size={15} /> : <CloudOff size={15} />}
                      {NET_LABEL[n].label}
                      <span className="ml-auto text-[0.7rem] font-semibold text-ink-faint">{n === 'online' ? '즉시 전송' : n === 'weak' ? '지연 전송' : '기기에 보관'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 동기화 상태 — 기록이 사라지지 않았다는 확신을 준다 */}
        {(pending > 0 || net !== 'online') && (
          <div role="status" className={cx('px-4 py-2 text-[0.8rem] font-bold', net === 'offline' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>
            {net === 'offline'
              ? `오프라인 — 기록 ${pending}건이 기기에 저장되어 있습니다. 연결되면 자동 전송됩니다.`
              : pending > 0 ? `신호 약함 — ${pending}건 전송 중…` : '신호가 약합니다 — 기록은 기기에 먼저 저장된 뒤 전송됩니다.'}
          </div>
        )}
        {pending === 0 && net === 'online' && lastSync && (
          <p className="px-4 pt-2 text-right text-[0.7rem] font-semibold text-ink-faint">본사 전송 완료 {lastSync}</p>
        )}

        <main id="main" tabIndex={-1} className="flex-1 space-y-4 px-4 py-4 pb-24">
          {tab === 'today' && (
            <>
              {/* 본사에서 온 배정 · 시간 변경 */}
              {unacked.map((n) => (
                <div key={n.id} role="alert" className={cx('rounded-2xl border px-4 py-3', n.kind === '배정 해제' ? 'border-line bg-card' : 'border-ai/40 bg-ai-soft')}>
                  <p className="flex items-center gap-1.5 text-[0.86rem] font-extrabold text-ai-strong"><BellRing size={15} /> {n.kind} · {n.at}</p>
                  <p className="mt-0.5 text-[0.9rem] font-bold leading-snug">{n.text}</p>
                  <Btn size="sm" className="mt-2" onClick={() => ack(n.id, n.scheduleId)}>확인했습니다</Btn>
                </div>
              ))}

              {/* 오늘의 업무 — 눌러서 작업할 현장 선택 */}
              <section aria-label="오늘의 업무">
                <p className="mb-2 flex items-center justify-between text-[0.88rem] font-extrabold">
                  <span><CalendarDays size={15} className="mr-1 inline text-primary" />오늘 {myJobs.length}건</span>
                  <span className="flex items-center gap-2"><span className="tnum text-[0.78rem] text-ink-faint">완료 {myJobs.filter((j) => j.status === '완료').length}</span><DemoBadge label="DEMO" /></span>
                </p>
                <div ref={strip} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                  {myJobs.map((j) => {
                    const on = j.id === job?.id
                    return (
                      <button key={j.id} data-job={j.id} onClick={() => setSelected(j.id)} aria-pressed={on}
                        className={cx('w-[9.5rem] shrink-0 rounded-xl border px-3 py-2 text-left', on ? 'border-primary bg-mint/60' : 'border-line bg-card', j.status === '완료' && !on && 'opacity-60')}>
                        <span className="flex items-center justify-between gap-1">
                          <span className="tnum text-[0.9rem] font-extrabold text-primary">{j.time}</span>
                          {j.status === '완료' ? <CheckCircle2 size={14} className="text-success" /> : j.id === nextJob?.id ? <Badge tone="brand">다음</Badge> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.82rem] font-bold">{customerById(j.customerId)?.name}</span>
                        <span className="block truncate text-[0.7rem] text-ink-faint">{j.service}</span>
                      </button>
                    )
                  })}
                  {myJobs.length === 0 && <p className="text-[0.84rem] text-ink-faint">오늘 배정된 일정이 없습니다.</p>}
                </div>
              </section>

              {job ? (
                <JobFlow key={job.id} job={job} view={view} send={send} meta={meta} net={net} />
              ) : myJobs.length > 0 && (
                <Card className="p-6 text-center">
                  <CheckCircle2 size={30} className="mx-auto text-success" />
                  <p className="mt-2 text-[1.05rem] font-extrabold">오늘 배정된 작업을 모두 완료했습니다!</p>
                  <p className="mt-1 text-[0.82rem] text-ink-soft">수고하셨습니다. 오늘 남긴 기록은 고객 리포트로 전달되었습니다.</p>
                  <Btn variant="outline" className="mt-4" onClick={() => setTab('reports')}>내 작업 리포트 보기</Btn>
                </Card>
              )}
            </>
          )}

          {tab === 'alerts' && (
            <div className="space-y-3">
              <p className="text-[1.05rem] font-extrabold">알림</p>
              {myNotices.length === 0 && myIssues.length === 0 && <Card className="p-5 text-center text-[0.85rem] text-ink-faint">새 알림이 없습니다.</Card>}
              {myNotices.map((n) => (
                <Card key={n.id} className="p-4">
                  <p className="flex items-center justify-between text-[0.72rem] font-bold text-ink-faint"><span>{n.kind} · {n.at}</span>{n.ackAt ? <span className="text-success">확인 {n.ackAt}</span> : <span className="text-ai-strong">미확인</span>}</p>
                  <p className="mt-0.5 text-[0.88rem] font-semibold leading-snug">{n.text}</p>
                  {!n.ackAt && <Btn size="sm" className="mt-2" onClick={() => ack(n.id, n.scheduleId)}>확인했습니다</Btn>}
                </Card>
              ))}
              {myIssues.map((i) => (
                <Card key={i.id} className="p-4">
                  <p className="flex items-center justify-between text-[0.72rem] font-bold text-ink-faint"><span>내 이슈 보고 · {i.at}</span><StatusPill status={i.status} /></p>
                  <p className="mt-0.5 text-[0.88rem] font-semibold leading-snug">{customerById(i.customerId)?.name} — {i.type}</p>
                  <p className="text-[0.8rem] text-ink-soft">{i.status === '해결' ? '본사 조치 완료' : i.owner ? `본사 담당 ${i.owner}` : '본사 확인 대기'}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              <p className="text-[1.05rem] font-extrabold">우리 팀 작업 리포트</p>
              {myReports.length === 0 && <Card className="p-5 text-center text-[0.85rem] text-ink-faint">작업 완료 시 리포트가 생성됩니다.</Card>}
              {myReports.map((r) => (
                <Card key={r.id} className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[0.92rem] font-extrabold"><FileText size={15} className="text-primary" /> {customerById(r.customerId)?.name}</p>
                    <span className="tnum text-[0.72rem] font-bold text-ink-faint">{r.date} {r.completedAt}</span>
                  </div>
                  <p className="text-[0.8rem] text-ink-soft">체크리스트 {r.itemsDone}/{r.itemsTotal}{r.skipped ? ` · 제외 ${Object.keys(r.skipped).length}` : ''} · {r.note}</p>
                  {(r.photos?.before?.dataUrl || r.photos?.after?.dataUrl) && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['before', 'after'] as const).map((k) => r.photos?.[k]?.dataUrl && <img key={k} src={r.photos[k]!.dataUrl} alt={`${k === 'before' ? '작업 전' : '작업 후'} 사진`} className="aspect-[4/3] w-full rounded-lg object-cover" />)}
                    </div>
                  )}
                  {typeof r.rating === 'number' && (
                    <p className="rounded-lg bg-champagne-soft/70 px-3 py-1.5 text-[0.8rem] font-bold">
                      <Star size={13} className="mr-0.5 inline fill-current text-warning" /> 고객 평가 {r.rating}점{r.feedback ? ` — “${r.feedback}”` : ''}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {tab === 'me' && (
            <div className="space-y-3">
              <Card className="p-5 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint text-primary"><User size={28} /></span>
                <p className="mt-2 text-[1.1rem] font-extrabold">{me.name} {me.position}</p>
                <p className="text-[0.8rem] text-ink-soft">{teamById(myTeam)?.name} · {teamMemberNames(myTeam)}</p>
                <p className="mt-1 text-[0.76rem] text-ink-faint">숙련 — {me.skills.join(' · ')}</p>
              </Card>
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['오늘 배정', `${myJobs.length}건`], ['완료', `${myJobs.filter((j) => j.status === '완료').length}건`], ['전송 대기', `${pending}건`]].map(([l, v]) => (
                    <div key={l}><p className="text-[0.7rem] font-bold text-ink-faint">{l}</p><p className="tnum text-[1.1rem] font-extrabold text-primary">{v}</p></div>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <label htmlFor="persona" className="text-[0.86rem] font-extrabold">사용자 전환 (데모)</label>
                <p className="text-[0.76rem] text-ink-faint">본사에서 배정한 팀의 팀장으로 바꿔 알림 · 작업을 확인합니다.</p>
                <select
                  id="persona"
                  value={me.id}
                  onChange={(e) => { setFieldPersona(e.target.value); toast(`${personaName(e.target.value)}(으)로 전환했습니다.`, 'info') }}
                  className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[0.9rem] font-bold"
                >
                  {TEAMS.map((t) => {
                    const lead = EMPLOYEES.find((e) => e.teamId === t.id && e.position === '팀장')!
                    return <option key={lead.id} value={lead.id}>{lead.name} 팀장 · {t.name}</option>
                  })}
                </select>
              </Card>
              <p className="text-center text-[0.72rem] leading-relaxed text-ink-faint">
                현장직원 화면에는 경영 지표 · 수익성 · 다른 팀 고객 정보가 표시되지 않습니다.<br />(역할 기반 접근 제어)
              </p>
              <div className="flex justify-center pt-1"><MiraeCredit height={19} /></div>
              <SampleBridgeMini className="pt-1" />
            </div>
          )}
        </main>

        {/* 하단 탭 */}
        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
          {([
            ['today', '오늘', <CalendarDays key="i" size={21} />],
            ['alerts', '알림', <Bell key="i" size={21} />],
            ['reports', '리포트', <FileText key="i" size={21} />],
            ['me', '내 정보', <User key="i" size={21} />],
          ] as Array<[Tab, string, ReactNode]>).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
              className={cx('relative flex min-h-[3.4rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[0.72rem] font-bold', tab === id ? 'text-primary' : 'text-ink-faint')}>
              {icon}{label}
              {id === 'alerts' && unacked.length > 0 && <span className="tnum absolute right-[calc(50%-1.3rem)] top-1.5 min-w-[1.1rem] rounded-full bg-danger px-1 text-[0.66rem] font-extrabold text-white">{unacked.length}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
