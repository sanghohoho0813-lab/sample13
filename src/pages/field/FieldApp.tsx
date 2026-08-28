import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navigation, MapPin, CheckCircle2, Camera, Sparkles, Bell, FileText, User,
  CalendarDays, ClipboardCheck, ArrowLeft, Play, Check, ImagePlus,
} from 'lucide-react'
import { Badge, Btn, Card, DemoBadge, StatusPill, useToast } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById, teamMemberNames } from '../../lib/demo/company'
import { CHECKLIST_TEMPLATE } from '../../lib/demo/operations'
import { cx, nowClock, nowDateCompact } from '../../lib/utils'

type Tab = 'today' | 'site' | 'alerts' | 'reports' | 'me'

// 현장직원 Demo Persona: 김도윤 (Clean Team B)
const MY_TEAM = 'T-B'
const MY_NAME = '김도윤'

export default function FieldApp() {
  const { schedules, work, checkin, startWork, toggleChecklist, setPhoto, setNote, completeWork, reports, setRole } = useDemo()
  const nav = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('today')
  const [noteDraft, setNoteDraft] = useState('')
  const [clock, setClock] = useState(nowClock())
  useEffect(() => {
    const id = setInterval(() => setClock(nowClock()), 1000)
    return () => clearInterval(id)
  }, [])

  const myJobs = useMemo(
    () => schedules.filter((s) => s.dayOffset === 0 && s.teamId === MY_TEAM).sort((a, b) => a.time.localeCompare(b.time)),
    [schedules],
  )
  const nextJob = myJobs.find((j) => j.status !== '완료')
  const ws = nextJob ? work[nextJob.id] : undefined
  const nextCustomer = nextJob ? customerById(nextJob.customerId) : undefined
  const checklist = ws?.checklist ?? Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, false]))
  const doneCount = Object.values(checklist).filter(Boolean).length
  const canComplete = !!ws?.checkinAt && doneCount === CHECKLIST_TEMPLATE.length && ws.beforePhoto && ws.afterPhoto
  const myReports = reports.filter((r) => r.team === 'Clean Team B')

  const aiNotes = nextJob?.customerId === 'C01'
    ? [
        '이 고객은 지난 방문에서 대기실 유리 얼룩 관련 요청이 있었습니다.',
        '오늘 해당 영역 작업 후 사진을 남겨주세요.',
        '진료시간 외 작업 필수 — 13:00~15:00 휴게시간에 진행합니다.',
      ]
    : ['이 현장의 최근 특이사항을 확인하고 작업을 시작하세요.']

  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-line bg-shell px-4 py-3 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.92rem] font-extrabold tracking-wide">CLEANWAY <span className="text-champagne">FIELD</span></p>
              <p className="tnum text-[0.68rem] text-white/75">{nowDateCompact()} · {clock} · {MY_NAME}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <DemoBadge label="DEMO" />
              <button
                onClick={() => { setRole('manager'); nav('/') }}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-[0.72rem] font-bold hover:bg-white/20"
                title="Business AX 보기 (Demo)"
              >
                <ArrowLeft size={14} /> AX
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 space-y-4">
          {tab === 'today' && (
            <>
              {/* 다음 현장 */}
              {nextJob && nextCustomer ? (
                <Card tour="field-next" className="overflow-hidden">
                  <div className="bg-primary px-4 py-3 text-white">
                    <p className="text-[0.72rem] font-bold text-white/80">다음 현장</p>
                    <p className="mt-0.5 text-[1.2rem] font-extrabold leading-tight">{nextCustomer.name}</p>
                    <p className="tnum mt-0.5 text-[0.95rem] font-bold text-champagne">{nextJob.time} · {nextJob.service}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-ink-soft">
                      <span className="flex items-center gap-1"><MapPin size={13} /> {nextCustomer.address}</span>
                      <span>예상 이동 {nextJob.travelMin}분 · 작업 {nextJob.durationMin}분</span>
                    </div>

                    {!ws?.checkinAt ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <Btn variant="outline" size="lg" onClick={() => toast('길찾기는 지도 API 연결 시 활성화됩니다. (Integration Ready)', 'info')}>
                          <Navigation size={17} className="mr-1 inline" /> 길찾기
                        </Btn>
                        <Btn size="lg" onClick={() => { checkin(nextJob.id); toast('체크인 완료 — 도착시간이 기록되었습니다.') }}>
                          <MapPin size={17} className="mr-1 inline" /> 도착 체크인
                        </Btn>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between rounded-xl bg-mint px-3.5 py-2.5 text-[0.85rem] font-bold text-primary-strong">
                          <span><Check size={14} className="mr-1 inline" /> 체크인 {ws.checkinAt}</span>
                          {ws.startedAt ? <span>작업시작 {ws.startedAt}</span> : (
                            <Btn size="sm" onClick={() => { startWork(nextJob.id); toast('작업을 시작합니다.', 'info') }}><Play size={13} className="mr-0.5 inline" /> 작업 시작</Btn>
                          )}
                        </div>

                        {ws.startedAt && (
                          <>
                            {/* 체크리스트 */}
                            <div>
                              <p className="mb-2 flex items-center justify-between text-[0.85rem] font-extrabold">
                                <span><ClipboardCheck size={15} className="mr-1 inline text-primary" /> 체크리스트</span>
                                <span className="tnum text-primary">{doneCount} / {CHECKLIST_TEMPLATE.length}</span>
                              </p>
                              <div className="space-y-1.5">
                                {CHECKLIST_TEMPLATE.map((item) => (
                                  <button key={item} onClick={() => toggleChecklist(nextJob.id, item)}
                                    className={cx(
                                      'flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[0.9rem] font-bold transition-colors',
                                      checklist[item] ? 'border-success bg-success-soft text-success' : 'border-line bg-card text-ink',
                                    )}>
                                    <CheckCircle2 size={19} className={checklist[item] ? '' : 'text-ink-faint/40'} />
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 사진 */}
                            <div className="grid grid-cols-2 gap-2.5">
                              {(['before', 'after'] as const).map((kind) => {
                                const taken = kind === 'before' ? ws.beforePhoto : ws.afterPhoto
                                return (
                                  <button key={kind} onClick={() => { setPhoto(nextJob.id, kind); toast(`${kind === 'before' ? 'Before' : 'After'} 사진을 등록했습니다. (DEMO)`) }}
                                    className={cx(
                                      'flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border text-[0.82rem] font-bold',
                                      taken ? 'border-primary bg-mint/60 text-primary' : 'border-dashed border-line bg-card text-ink-soft',
                                    )}>
                                    {taken ? <Camera size={22} /> : <ImagePlus size={22} />}
                                    {kind === 'before' ? 'Before Photo' : 'After Photo'}
                                    <span className="text-[0.64rem] font-semibold text-ink-faint">{taken ? '등록됨 (DEMO)' : '탭하여 등록'}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {/* 특이사항 */}
                            <div>
                              <p className="mb-1.5 text-[0.85rem] font-extrabold">특이사항</p>
                              <textarea
                                value={ws.note || noteDraft}
                                onChange={(e) => { setNoteDraft(e.target.value); setNote(nextJob.id, e.target.value) }}
                                placeholder="예) 대기실 유리 얼룩 재청소 완료, 소모품 보충 필요"
                                className="h-20 w-full rounded-xl border border-line bg-card p-3 text-[0.88rem] outline-none focus:border-primary"
                              />
                            </div>

                            <Btn size="lg" variant={canComplete ? 'success' : 'primary'} disabled={!canComplete} className="w-full"
                              onClick={() => { completeWork(nextJob.id); toast('작업 완료 — Service Report가 생성되었습니다.'); setNoteDraft('') }}>
                              <CheckCircle2 size={18} className="mr-1 inline" /> 작업 완료
                            </Btn>
                            {!canComplete && <p className="text-center text-[0.72rem] text-ink-faint">체크리스트 전체 완료 + Before/After 사진 등록 후 완료할 수 있습니다.</p>}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <CheckCircle2 size={30} className="mx-auto text-success" />
                  <p className="mt-2 text-[1.05rem] font-extrabold">오늘 배정된 작업을 모두 완료했습니다!</p>
                  <p className="mt-1 text-[0.82rem] text-ink-soft">Service Report는 리포트 탭에서 확인할 수 있습니다.</p>
                </Card>
              )}

              {/* AI 현장 알림 */}
              <Card className="p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[0.88rem] font-extrabold text-ai-strong"><Sparkles size={15} /> AI 현장 알림 <Badge tone="ai" className="text-[0.6rem]">AI READY</Badge></p>
                <ul className="space-y-1.5">
                  {aiNotes.map((n) => <li key={n} className="flex gap-2 rounded-lg bg-ai-soft/60 px-3 py-2 text-[0.82rem] leading-snug">{n}</li>)}
                </ul>
              </Card>

              {/* 오늘 타임라인 */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[0.9rem] font-extrabold"><CalendarDays size={15} className="text-primary" /> 오늘의 업무</p>
                <div className="space-y-2">
                  {myJobs.map((j) => {
                    const c = customerById(j.customerId)
                    const isNext = j.id === nextJob?.id
                    return (
                      <div key={j.id} className={cx('flex items-center gap-3 rounded-xl border px-3.5 py-3', isNext ? 'border-primary bg-mint/40' : 'border-line bg-card')}>
                        <span className="tnum w-12 shrink-0 text-[0.95rem] font-extrabold text-primary">{j.time}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.9rem] font-bold">{c?.name}</p>
                          <p className="truncate text-[0.72rem] text-ink-faint">{j.service}</p>
                        </div>
                        {isNext ? <Badge tone="brand">다음</Badge> : <StatusPill status={j.status} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'site' && (
            <div className="space-y-3">
              <p className="text-[1.05rem] font-extrabold">내 현장</p>
              {myJobs.map((j) => {
                const c = customerById(j.customerId)
                return (
                  <Card key={j.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.95rem] font-extrabold">{c?.name}</p>
                      <StatusPill status={j.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[0.78rem] text-ink-soft"><MapPin size={12} /> {c?.address}</p>
                    <p className="tnum mt-1 text-[0.8rem] font-bold text-primary">{j.time} · {j.service} · {j.durationMin}분</p>
                  </Card>
                )
              })}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-3">
              <p className="text-[1.05rem] font-extrabold">알림</p>
              {[
                { t: '오늘 14:00', m: '라온메디컬센터 — 진료시간 외 작업 필수 (13:00~15:00 휴게)' },
                { t: '오늘 08:45', m: '17:00 한빛프라자 일정이 확정되었습니다.' },
                { t: '어제', m: '에이원교육센터 특이사항(유리 오염)이 접수 처리되었습니다.' },
              ].map((a) => (
                <Card key={a.m} className="p-4">
                  <p className="text-[0.7rem] font-bold text-ink-faint">{a.t}</p>
                  <p className="mt-0.5 text-[0.88rem] font-semibold leading-snug">{a.m}</p>
                </Card>
              ))}
              <p className="text-center text-[0.72rem] text-ink-faint">Push 알림은 실서비스 연결 시 활성화됩니다. (Integration Ready)</p>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              <p className="text-[1.05rem] font-extrabold">내 Service Report</p>
              {myReports.length === 0 && <Card className="p-5 text-center text-[0.85rem] text-ink-faint">작업 완료 시 리포트가 생성됩니다.</Card>}
              {myReports.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[0.92rem] font-extrabold"><FileText size={15} className="text-primary" /> {customerById(r.customerId)?.name}</p>
                    <span className="tnum text-[0.72rem] font-bold text-ink-faint">{r.date} {r.completedAt}</span>
                  </div>
                  <p className="mt-1 text-[0.8rem] text-ink-soft">작업항목 {r.itemsDone}/{r.itemsTotal} · {r.note}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'me' && (
            <div className="space-y-3">
              <Card className="p-5 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint text-primary"><User size={28} /></span>
                <p className="mt-2 text-[1.1rem] font-extrabold">{MY_NAME} 팀장</p>
                <p className="text-[0.8rem] text-ink-soft">Clean Team B · {teamMemberNames(MY_TEAM)}</p>
                <p className="mt-1 text-[0.76rem] text-ink-faint">숙련 서비스 — 병의원 관리 · 품질점검</p>
              </Card>
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['오늘 배정', `${myJobs.length}건`], ['완료', `${myJobs.filter((j) => j.status === '완료').length}건`], ['이번 주', '18건']].map(([l, v]) => (
                    <div key={l}><p className="text-[0.7rem] font-bold text-ink-faint">{l}</p><p className="tnum text-[1.1rem] font-extrabold text-primary">{v}</p></div>
                  ))}
                </div>
              </Card>
              <p className="text-center text-[0.72rem] leading-relaxed text-ink-faint">
                현장직원 화면에는 경영 지표·수익성·전체 고객 정보가 표시되지 않습니다.<br />(Role 기반 접근 제어 — RLS Preview)
              </p>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
          {([
            ['today', '오늘', <CalendarDays key="i" size={21} />],
            ['site', '현장', <MapPin key="i" size={21} />],
            ['alerts', '알림', <Bell key="i" size={21} />],
            ['reports', '리포트', <FileText key="i" size={21} />],
            ['me', '내 정보', <User key="i" size={21} />],
          ] as Array<[Tab, string, React.ReactNode]>).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={cx('flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.66rem] font-bold', tab === id ? 'text-primary' : 'text-ink-faint')}>
              {icon}{label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
