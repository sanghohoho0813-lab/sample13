// ─────────────────────────────────────────────────────────
// 고객 요청 처리 패널 — 접수 → 담당 지정 → 처리(일정 확정 · 시간 변경 · 회신) → 완료
// 고객 포털과 같은 기록(history)을 본다. visible=false 는 내부 메모로 고객 화면에 나가지 않는다.
// ─────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarPlus, Clock, Eye, EyeOff, MessageSquareReply, Store, TrendingUp } from 'lucide-react'
import { Badge, Btn, ChoiceGroup, StatusPill, TextArea } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { ReasonDialog, Restricted, Stepper } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { STAFF, customerById, teamById } from '../../lib/demo/company'
import { can } from '../../lib/ops/governance'
import { DEMO_NOW, toHM, toMin } from '../../lib/ops/geo'
import { cx, dateWithOffset } from '../../lib/utils'
import type { CustomerRequest } from '../../types'

const TYPE_TONE = { 긴급방문: 'danger', 추가서비스: 'success', 일정변경: 'warning', 문의: 'info' } as const
const STEPS = [{ label: '접수' }, { label: '담당 지정' }, { label: '처리 중' }, { label: '완료' }]
const stepOf = (r: CustomerRequest) => ({ 접수: 1, 검토중: 2, 처리중: 3, 완료: 4, 반려: 1 }[r.status])
const SLOTS = Array.from({ length: 23 }, (_, i) => toHM(8 * 60 + i * 30)) // 08:00 ~ 19:00
const REJECT_PRESETS = ['제공하지 않는 서비스', '현장 여건상 작업 불가', '고객 요청 철회', '중복 요청']
const nextSlot = () => SLOTS.find((s) => toMin(s) >= toMin(DEMO_NOW) + 30) ?? '16:00'

export default function RequestPanel({ r }: { r: CustomerRequest }) {
  const st = useDemo()
  const { role, actor, schedules, upsell, proposals, reports } = st
  const nav = useNavigate()
  const toast = useToast()
  const c = customerById(r.customerId)
  const allowed = can(role, 'request.handle')
  const open = r.status !== '완료' && r.status !== '반려'
  const opp = r.opportunityId ? upsell.find((u) => u.id === r.opportunityId) : undefined
  const sched = r.scheduleId ? schedules.find((s) => s.id === r.scheduleId) : undefined
  const proposal = sched ? proposals.find((p) => p.scheduleId === sched.id && p.requestId === r.id) : undefined
  const report = reports.find((x) => x.requestId === r.id)

  const [assignee, setAssignee] = useState(r.assignee ?? actor)
  const [reply, setReply] = useState('')
  const [rejecting, setRejecting] = useState(false)
  // 일정 확정 (추가서비스 · 긴급방문)
  const [day, setDay] = useState<'0' | '1' | '2'>(r.type === '긴급방문' ? '0' : '1')
  const [time, setTime] = useState(r.type === '긴급방문' ? nextSlot() : '10:00')
  const [dur, setDur] = useState<'60' | '90' | '120'>('90')
  const [service, setService] = useState(opp?.recommendedService ?? r.detail.split(' · ')[0].slice(0, 30))
  const [quote, setQuote] = useState(String(opp?.expectedRevenue ?? 85))
  // 시간 변경 (일정변경)
  const upcoming = useMemo(
    () => schedules.filter((s) => s.customerId === r.customerId && s.status === '예정' && (s.dayOffset > 0 || toMin(s.time) > toMin(DEMO_NOW))).sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time)),
    [schedules, r.customerId],
  )
  const [target, setTarget] = useState(upcoming[0]?.id ?? '')
  const [newTime, setNewTime] = useState('13:00')

  const canSchedule = open && !r.scheduleId && (r.type === '추가서비스' || r.type === '긴급방문')
  const canReschedule = open && !r.scheduleId && r.type === '일정변경' && upcoming.length > 0

  const doSchedule = () => {
    const ids = st.scheduleRequest(r.id, { dayOffset: Number(day), time, durationMin: Number(dur), service: service.trim() || r.type, quote: r.type === '추가서비스' ? Number(quote) || undefined : undefined })
    toast('일정 확정 · 배정안 생성 — 배정 화면에서 팀을 정하세요.')
    nav(`/schedule?id=${ids.scheduleId}`)
  }
  const doReschedule = () => {
    const sc = schedules.find((s) => s.id === target)
    if (!sc || sc.time === newTime) { toast('지금과 다른 시간을 선택하세요.', 'warning'); return }
    st.rescheduleRequest(r.id, target, newTime)
    toast('시간 변경안을 만들었습니다 — 승인되면 고객에게 자동 안내됩니다.')
    nav(`/schedule?id=${target}`)
  }

  return (
    <div className="space-y-4">
      {/* 요청 내용 */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
          {r.fromPortal && <span className="flex items-center gap-1 text-[0.78rem] font-bold text-ai-strong"><Store size={12} /> 고객 플랫폼</span>}
          <StatusPill status={r.status} />
          <span className="tnum ml-auto text-[0.76rem] font-bold text-ink-faint">{r.id} · {r.createdAt}</span>
        </div>
        <button onClick={() => nav(`/customers/${r.customerId}`)} className="mt-2 text-left text-[1.1rem] font-extrabold hover:text-primary">{c?.name}</button>
        <p className="mt-1 text-[0.92rem] leading-relaxed [overflow-wrap:anywhere]">{r.detail}</p>
      </div>

      <div className="rounded-xl bg-ivory/70 px-3.5 py-3">
        <Stepper steps={STEPS} current={stepOf(r)} branch={r.status === '반려' ? { label: '반려', tone: 'danger', note: r.reply } : undefined} />
      </div>

      {/* 연결된 일 — 매출 기회 · 일정 · 배정 · 리포트 */}
      {(opp || sched || report) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {opp && (
            <button onClick={() => nav('/upsell')} className="rounded-xl border border-line px-3 py-2.5 text-left hover:border-primary">
              <span className="flex items-center gap-1 text-[0.74rem] font-bold text-ink-faint"><TrendingUp size={12} /> 매출 기회 {opp.id}</span>
              <span className="mt-0.5 block text-[0.86rem] font-extrabold">{opp.recommendedService}</span>
              <span className="text-[0.78rem] text-ink-soft">{opp.status} · {opp.expectedRevenue}만원{opp.owner ? ` · ${opp.owner}` : ''}</span>
            </button>
          )}
          {sched && (
            <button onClick={() => nav(`/schedule?id=${sched.id}`)} className="rounded-xl border border-line px-3 py-2.5 text-left hover:border-primary">
              <span className="flex items-center gap-1 text-[0.74rem] font-bold text-ink-faint"><Clock size={12} /> 일정 {sched.id}</span>
              <span className="mt-0.5 block text-[0.86rem] font-extrabold">{sched.dayOffset === 0 ? '오늘' : dateWithOffset(sched.dayOffset)} {sched.time} · {teamById(sched.teamId)?.name ?? '미배정'}</span>
              <span className="text-[0.78rem] text-ink-soft">{sched.status}{proposal ? ` · 배정안 ${proposal.status}` : ''}</span>
            </button>
          )}
          {report && (
            <div className="rounded-xl border border-success/40 bg-success-soft/50 px-3 py-2.5">
              <span className="text-[0.74rem] font-bold text-success">작업 리포트 {report.id}</span>
              <span className="mt-0.5 block text-[0.86rem] font-extrabold">{report.completedAt} 완료 · {report.worker ?? report.team}</span>
              <span className="text-[0.78rem] text-ink-soft">{typeof report.rating === 'number' ? `고객 평가 ${report.rating}점` : '고객 평가 대기'}</span>
            </div>
          )}
        </div>
      )}

      {/* 처리 */}
      {open && !allowed && <Restricted>고객 요청 처리 권한 필요 (대표 · 운영관리자)</Restricted>}
      {open && allowed && (
        <div className="space-y-3 rounded-xl border border-line p-3.5">
          {/* 담당 */}
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="text-[0.78rem] font-bold text-ink-faint">담당자</span>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={r.status !== '접수'}
                className="mt-0.5 w-full rounded-xl border border-line bg-card px-3 py-2 text-[0.88rem] font-bold disabled:bg-ivory">
                {[...new Set([assignee, ...STAFF])].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            {r.status === '접수' && <Btn onClick={() => { st.assignRequest(r.id, assignee); toast(`${assignee} 담당 지정 — 고객 화면에 '담당 지정'으로 표시됩니다.`) }}>담당 지정</Btn>}
          </div>

          {canSchedule && (
            <div className="space-y-2.5 border-t border-line pt-3">
              <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold"><CalendarPlus size={15} className="text-primary" /> 일정 확정 → 배정안 생성</p>
              <ChoiceGroup
                label="방문일"
                cols={3}
                value={day}
                // 오늘로 바꾸면 이미 지난 시각은 고를 수 없다 — 가장 가까운 다음 시각으로 맞춘다
                onChange={(v) => { setDay(v); if (v === '0' && toMin(time) <= toMin(DEMO_NOW)) setTime(nextSlot()) }}
                options={[{ value: '0', label: '오늘' }, { value: '1', label: dateWithOffset(1) }, { value: '2', label: dateWithOffset(2) }]}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="text-[0.76rem] font-bold text-ink-faint">시작
                  <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink">
                    {SLOTS.filter((s) => day !== '0' || toMin(s) > toMin(DEMO_NOW)).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="text-[0.76rem] font-bold text-ink-faint">작업시간
                  <select value={dur} onChange={(e) => setDur(e.target.value as typeof dur)} className="mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink">
                    <option value="60">60분</option><option value="90">90분</option><option value="120">120분</option>
                  </select>
                </label>
                <label className="col-span-2 text-[0.76rem] font-bold text-ink-faint">서비스
                  <input value={service} onChange={(e) => setService(e.target.value)} maxLength={30} className="mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink" />
                </label>
                {r.type === '추가서비스' && (
                  <label className="col-span-2 text-[0.76rem] font-bold text-ink-faint">견적 (만원 · 매출 기회에 반영)
                    <input inputMode="numeric" value={quote} onChange={(e) => setQuote(e.target.value.replace(/\D/g, '').slice(0, 5))} className="tnum mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink" />
                  </label>
                )}
              </div>
              <Btn onClick={doSchedule}>일정 확정 · 배정안 만들기</Btn>
              <p className="text-[0.74rem] text-ink-faint">확정하면 고객에게 방문 일정이 안내되고{opp ? `, 매출 기회 ${opp.id}가 성사로 바뀝니다` : ''}. 담당팀은 Smart Dispatch에서 정합니다.</p>
            </div>
          )}

          {canReschedule && (
            <div className="space-y-2.5 border-t border-line pt-3">
              <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold"><Clock size={15} className="text-primary" /> 방문 시간 변경안</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[0.76rem] font-bold text-ink-faint">변경할 방문
                  <select value={target} onChange={(e) => setTarget(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink">
                    {upcoming.map((s) => <option key={s.id} value={s.id}>{s.dayOffset === 0 ? '오늘' : dateWithOffset(s.dayOffset)} {s.time}</option>)}
                  </select>
                </label>
                <label className="text-[0.76rem] font-bold text-ink-faint">새 시간
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="mt-0.5 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-[0.86rem] font-bold text-ink">
                    {SLOTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <Btn onClick={doReschedule}>변경안 만들기 → 승인 요청</Btn>
              <p className="text-[0.74rem] text-ink-faint">시간 변경은 고객 안내가 바뀌는 결정이라 검토자와 다른 승인권자가 승인합니다.</p>
            </div>
          )}

          {/* 회신 */}
          <div className="space-y-2 border-t border-line pt-3">
            <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold"><MessageSquareReply size={15} className="text-primary" /> 고객 회신</p>
            <TextArea value={reply} onChange={setReply} maxLength={300} rows={2} placeholder="고객 화면에 그대로 표시됩니다" />
            <div className="flex flex-wrap gap-2">
              <Btn size="sm" variant="outline" disabled={!reply.trim()} onClick={() => { st.replyRequest(r.id, reply, false); setReply(''); toast('회신을 보냈습니다.') }}>회신만</Btn>
              {(r.status === '검토중' || (r.status === '처리중' && !r.scheduleId)) && (
                <Btn size="sm" variant="success" disabled={!reply.trim()} onClick={() => { st.replyRequest(r.id, reply, true); setReply(''); toast('회신 · 완료 처리했습니다.') }}>회신하고 완료</Btn>
              )}
              {r.status !== '처리중' && <Btn size="sm" variant="ghost" onClick={() => setRejecting(true)}>처리 불가 (반려)</Btn>}
            </div>
            {r.status === '처리중' && r.scheduleId && <p className="text-[0.74rem] text-ink-faint">현장 작업이 완료되면 리포트와 함께 자동으로 완료됩니다.</p>}
          </div>
        </div>
      )}

      {/* 진행 기록 */}
      <div>
        <p className="mb-2 text-[0.8rem] font-bold text-ink-faint">진행 기록 — 고객 화면과 같은 기록</p>
        <ol className="relative space-y-2 border-l border-line pl-4">
          {(r.history ?? []).slice().reverse().map((h, i) => (
            <li key={`${h.at}-${i}`} className="relative">
              <span className={cx('absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full ring-2 ring-card', h.visible ? 'bg-primary' : 'bg-neutral-mid')} />
              <p className="text-[0.84rem]"><span className="tnum font-bold text-ink-faint">{h.at}</span> <b>{h.text}</b></p>
              <p className="flex items-center gap-1 text-[0.74rem] text-ink-faint">{h.actor} · {h.visible ? <><Eye size={11} /> 고객에게 표시</> : <><EyeOff size={11} /> 내부 메모</>}</p>
            </li>
          ))}
        </ol>
        {r.reply && <p className="mt-2.5 rounded-lg bg-mint/60 px-3 py-2 text-[0.84rem]"><b>고객에게 보이는 회신</b> — {r.reply}</p>}
      </div>

      <div className="flex justify-end">
        <Btn variant="ghost" size="sm" onClick={() => nav(`/customers/${r.customerId}`)}>고객 상세 <ArrowRight size={13} className="inline" /></Btn>
      </div>

      <ReasonDialog
        open={rejecting} onClose={() => setRejecting(false)} danger
        title="요청 반려 — 처리 불가 안내" confirmLabel="반려하고 안내"
        desc="입력한 사유가 고객 화면에 회신으로 표시됩니다. 연결된 매출 기회는 보류됩니다."
        presets={REJECT_PRESETS}
        onConfirm={(reason) => { st.rejectRequest(r.id, reason); toast('반려 사유를 고객에게 안내했습니다.', 'warning') }}
      />
    </div>
  )
}
