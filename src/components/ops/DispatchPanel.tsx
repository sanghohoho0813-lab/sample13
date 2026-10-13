// ─────────────────────────────────────────────────────────
// Smart Dispatch 실행 패널 — 추천 → 검토 → 승인 · 일정 반영 → 현장 수신 확인
// 점수는 dispatch.ts 엔진이 계산하고, 상태 변경은 리듀서가 권한 · 전이표 · 직무 분리를 다시 검사한다.
// ─────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Clock, MapPin, ShieldCheck, Smartphone, Sparkles, Users, XCircle,
} from 'lucide-react'
import { Badge, Btn, Card } from '../ui'
import { useToast } from '../ui/toast-context'
import { AuditTrail, ReasonDialog, Restricted, ScoreBar, Stepper } from '.'
import { useDemo } from '../../lib/data/context'
import { teamById, teamMembers } from '../../lib/demo/company'
import { evaluateDispatch, type DispatchEval } from '../../lib/ops/dispatch'
import { PROPOSAL_STEPS, can, needsSecondApprover } from '../../lib/ops/governance'
import { cx } from '../../lib/utils'
import type { DispatchProposal, ProposalKind, Schedule } from '../../types'

const OPEN = ['추천', '검토', '보류']
const HOLD_PRESETS = ['고객과 시간 협의 중', '현장 팀장 의견 확인 중', '대체 인력 확인 중']
const REJECT_PRESETS = ['현재 배정 유지가 더 적합', '고객이 기존 팀 유지를 요청', '일정 자체가 변경됨']

const stepIndex = (p?: DispatchProposal) =>
  !p ? 0 : p.status === '추천' || p.status === '보류' ? 1 : p.status === '검토' ? 2 : p.status === '승인' ? 3 : p.status === '현장확인' ? 4 : 1

const leaderOf = (teamId: string) => teamMembers(teamId).find((e) => e.position === '팀장')

export default function DispatchPanel({ s, tour }: { s: Schedule; tour?: boolean }) {
  const {
    schedules, proposals, notices, audit, role, actor,
    createProposal, reviewProposal, approveProposal, holdProposal, rejectProposal, setRole, setFieldPersona,
  } = useDemo()
  const toast = useToast()
  const nav = useNavigate()

  const proposal = proposals.find((p) => p.scheduleId === s.id)
  const open = proposal && OPEN.includes(proposal.status) ? proposal : undefined
  // 시간 변경안은 바뀔 시각 기준으로 평가한다 — 그 시각에 실제로 갈 수 있는지
  const newTime = open?.kind === '시간 변경' ? open.toTime : undefined
  const evals = useMemo(() => evaluateDispatch(newTime ? { ...s, time: newTime } : s, schedules), [s, newTime, schedules])
  const eligible = evals.filter((e) => e.eligible)
  const blocked = evals.filter((e) => !e.eligible)
  const best = eligible[0]
  const current = s.teamId ? evals.find((e) => e.teamId === s.teamId) : undefined
  const inProgress = s.status !== '예정' && s.status !== '확인필요'

  const [picked, setPicked] = useState<string>(() => open?.toTeamId ?? best?.teamId ?? evals[0].teamId)
  const [note, setNote] = useState('')
  const [showBlocked, setShowBlocked] = useState(false)
  const [force, setForce] = useState(false)
  const [dialog, setDialog] = useState<'hold' | 'reject' | null>(null)

  const chosenTeam = open?.status === '검토' ? open.toTeamId ?? picked : picked
  const chosen = evals.find((e) => e.teamId === chosenTeam)
  const gap = current && best ? best.total - current.total : 0
  const needsChange = !s.teamId || (current && !current.eligible) || gap >= 10 || !!s.risk
  const kind: ProposalKind = s.teamId ? '재배정' : '신규 배정'
  const pkind = open?.kind ?? kind
  const twoPerson = needsSecondApprover(pkind)
  const mayReview = can(role, 'dispatch.review')
  const mayApprove = can(role, 'dispatch.approve')
  const selfReviewed = open?.status === '검토' && twoPerson && open.reviewer === actor
  const decided = proposal?.status === '승인' || proposal?.status === '현장확인'
  const showReview = open?.status !== '검토' && (!!open || needsChange || force)
  const ack = proposal ? notices.find((n) => n.proposalId === proposal.id && n.kind !== '배정 해제') : undefined
  const history = audit.filter((a) => a.entityId === s.id || proposals.some((p) => p.scheduleId === s.id && p.id === a.entityId))

  // 후보 — 배정 가능 상위 4팀 + (현재 팀이 밖에 있으면) 현재 팀
  const shortlist = [...eligible.slice(0, 4)]
  if (current && !shortlist.includes(current)) shortlist.push(current)

  const teamName = (id?: string | null) => teamById(id ?? null)?.name ?? '미배정'

  const review = (andApprove: boolean) => {
    if (!chosen?.eligible) { toast('배정 불가 팀은 선택할 수 없습니다.', 'warning'); return }
    if (pkind !== '시간 변경' && s.teamId === chosenTeam) { toast('현재 담당팀과 같습니다 — 다른 팀을 선택하세요.', 'warning'); return }
    const id = open?.id ?? createProposal(s.id, kind, s.risk ? `${s.risk.type} — ${s.risk.detail}` : !s.teamId ? `미배정 일정 — ${s.time} ${s.service}` : `더 적합한 팀 (+${gap}점)`)
    reviewProposal(id, chosenTeam, note)
    if (andApprove) {
      approveProposal(id)
      toast(`${teamName(chosenTeam)} 배정 확정 — 현장 앱에 알림을 보냈습니다.`)
    } else {
      toast(`검토 완료 — ${twoPerson ? '다른 승인권자의 승인을 기다립니다.' : '승인하면 일정에 반영됩니다.'}`, 'info')
    }
    setNote('')
  }

  const approve = () => {
    if (!open) return
    approveProposal(open.id)
    toast(`승인 — ${teamName(open.toTeamId)} 일정에 반영하고 현장 앱에 알렸습니다.`)
  }

  const openFieldAs = (teamId: string) => {
    const leader = leaderOf(teamId)
    if (leader) setFieldPersona(leader.id)
    nav('/field')
  }

  // ── 진행 중 · 완료 일정 — 배정 변경 대신 현장 상황을 보여준다 ──
  if (inProgress) {
    return (
      <Card tour={tour ? 'dispatch' : undefined} className="p-4">
        <p className="flex items-center gap-1.5 text-[0.95rem] font-extrabold"><Sparkles size={16} className="text-ai" /> Smart Dispatch</p>
        <p className="mt-1.5 text-[0.86rem] text-ink-soft">
          {s.status === '완료' ? '완료된 일정입니다 — 배정 변경 대상이 아닙니다.' : `${s.status} — 현장에서 진행 중인 일정은 배정을 바꾸지 않습니다.`}
          {current && s.status !== '완료' && current.next && <> 이 팀의 다음 일정 <b>{current.next.time} {current.next.customer}</b>에 미치는 영향은 해당 일정에서 확인하세요.</>}
        </p>
        {proposal && <div className="mt-3"><AuditTrail entries={history} limit={3} compact /></div>}
      </Card>
    )
  }

  return (
    <Card tour={tour ? 'dispatch' : undefined} className="overflow-hidden">
      {/* 머리 — 현재 판단 한 줄 */}
      <div className="border-b border-line px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[1rem] font-extrabold"><Sparkles size={16} className="text-ai" /> Smart Dispatch</p>
          <span className="text-[0.74rem] font-bold text-ink-faint">7개 요인 · {evals.length}개 팀 비교</span>
        </div>
        <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-soft">
          {open?.kind === '시간 변경'
            ? <>고객 요청 시간 변경 {open.fromTime} → <b className="text-ink">{open.toTime}</b> — {teamName(s.teamId)} {current?.total}점 · 도착 {current?.arrival}{current && !current.eligible ? ` · ${current.blockers[0]}` : ''}</>
            : !s.teamId
            ? <>담당팀이 없습니다 — <b className="text-ink">{teamName(best?.teamId)} {best?.total}점</b>이 가장 적합합니다.</>
            : current && !current.eligible
              ? <>현재 {teamName(s.teamId)}는 <b className="text-danger">배정 불가</b>({current.blockers[0]}) — {teamName(best?.teamId)} {best?.total}점 추천.</>
              : gap >= 10
                ? <>현재 {teamName(s.teamId)} {current?.total}점 → <b className="text-ink">{teamName(best?.teamId)} {best?.total}점</b> (+{gap}점)</>
                : <>현재 {teamName(s.teamId)} {current?.total}점 — {s.risk ? '위험 대응을 위해 재배정을 검토할 수 있습니다.' : '현재 배정이 적합합니다.'}</>}
        </p>
      </div>

      {/* 단계 */}
      {(proposal || needsChange) && (
        <div className="border-b border-line bg-ivory/60 px-4 py-3">
          <Stepper
            current={stepIndex(proposal)}
            steps={PROPOSAL_STEPS.map((st) => ({
              label: st.label,
              sub: !proposal ? undefined
                : st.status === '추천' ? `${proposal.createdAt} ${proposal.createdBy}`
                : st.status === '검토' ? proposal.reviewer
                : st.status === '승인' ? (proposal.approver ? `${proposal.decidedAt} ${proposal.approver}` : twoPerson ? '검토자 외 승인권자' : '검토자 승인 가능')
                : ack?.ackBy ? `${ack.ackAt} ${ack.ackBy}` : undefined,
            }))}
            branch={proposal?.status === '보류' ? { label: '보류', tone: 'warning', note: proposal.holdReason }
              : proposal?.status === '반려' ? { label: '반려 — 현재 배정 유지', tone: 'danger', note: proposal.holdReason } : undefined}
          />
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* 후보 팀 */}
        <div role="radiogroup" aria-label="배정 후보 팀" className="space-y-2">
          {shortlist.map((e) => (
            <Candidate
              key={e.teamId}
              e={e}
              rank={eligible.indexOf(e) + 1}
              selected={chosenTeam === e.teamId}
              disabled={open?.status === '검토'}
              currentTotal={current?.total}
              onPick={() => setPicked(e.teamId)}
            />
          ))}
        </div>

        {blocked.length > 0 && (
          <div>
            <button onClick={() => setShowBlocked((v) => !v)} aria-expanded={showBlocked} className="flex items-center gap-1 text-[0.8rem] font-bold text-ink-soft hover:text-primary">
              <ChevronDown size={14} className={cx('transition-transform', showBlocked && 'rotate-180')} /> 배정 불가 {blocked.length}팀 — 사유 보기
            </button>
            {showBlocked && (
              <ul className="mt-1.5 space-y-1">
                {blocked.map((b) => (
                  <li key={b.teamId} className="flex gap-2 rounded-lg bg-neutral-soft px-3 py-1.5 text-[0.8rem]">
                    <XCircle size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                    <span><b>{teamName(b.teamId)}</b>{b.isCurrent && ' (현재)'} — {b.blockers.join(' · ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 결정 영역 */}
        <div className="rounded-xl border border-line p-3.5">
          {open?.status === '검토' ? (
            <div className="space-y-3">
              <p className="text-[0.88rem]">
                <b>{open.reviewer}</b> 검토 — <b className="text-primary-strong">{teamName(open.toTeamId)}</b> 선택
                {open.reviewNote && <span className="block text-[0.82rem] text-ink-soft">“{open.reviewNote}”</span>}
              </p>
              <ImpactPreview s={s} toTeam={open.toTeamId!} kind={open.kind} toTime={open.toTime} />
              {!mayApprove ? (
                <Restricted>배정 승인 권한 필요 (대표 · 운영관리자)</Restricted>
              ) : selfReviewed ? (
                <div className="space-y-2 rounded-lg bg-warning-soft/70 p-3">
                  <p className="flex items-start gap-1.5 text-[0.84rem] font-bold text-warning"><ShieldCheck size={15} className="mt-0.5 shrink-0" /> 직무 분리 — {open.kind}는 검토자와 다른 승인권자가 승인합니다.</p>
                  <p className="text-[0.8rem] text-ink-soft">고객 안내와 현장 동선이 바뀌는 결정이라 1인 처리를 막습니다. 데모에서는 역할을 바꿔 승인해보세요.</p>
                  <Btn size="sm" variant="outline" onClick={() => { setRole(role === 'manager' ? 'ceo' : 'manager'); toast(`${role === 'manager' ? '대표' : '운영관리자'} 역할로 전환했습니다.`, 'info') }}>
                    {role === 'manager' ? '대표' : '운영관리자'}로 전환해 승인하기
                  </Btn>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Btn onClick={approve}><CheckCircle2 size={15} className="mr-1 inline" />승인 · 일정 반영</Btn>
                  <Btn variant="outline" onClick={() => setDialog('hold')}>보류</Btn>
                  <Btn variant="ghost" onClick={() => setDialog('reject')}>반려</Btn>
                </div>
              )}
            </div>
          ) : proposal?.status === '승인' || proposal?.status === '현장확인' ? (
            <div className="space-y-2.5">
              <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold text-success"><CheckCircle2 size={16} /> {proposal.decidedAt} 승인 · 일정 반영 완료</p>
              <p className="text-[0.82rem] text-ink-soft">
                {teamName(proposal.fromTeamId)} {proposal.fromTime ?? ''} → <b className="text-ink">{teamName(proposal.toTeamId)} {proposal.toTime ?? s.time}</b> · 검토 {proposal.reviewer} · 승인 {proposal.approver}
              </p>
              {ack?.ackAt ? (
                <p className="flex items-center gap-1.5 text-[0.84rem] font-bold text-primary-strong"><Smartphone size={14} /> 현장 수신 확인 — {ack.ackBy} {ack.ackAt}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[0.84rem] font-bold text-warning"><Clock size={14} /> 현장 수신 확인 대기</span>
                  <Btn size="sm" variant="outline" onClick={() => openFieldAs(proposal.toTeamId!)}>
                    {leaderOf(proposal.toTeamId!)?.name} 팀장 앱으로 보기 <ArrowRight size={13} className="inline" />
                  </Btn>
                </div>
              )}
            </div>
          ) : null}

          {/* 검토 입력 — 배정안이 없거나 추천 · 보류 · 반려 · 승인 이후 새 판단 */}
          {showReview && (
            <div className={cx('space-y-2.5', decided && 'mt-3 border-t border-line pt-3')}>
              {!mayReview ? (
                <Restricted>배정안 검토 권한 필요 (대표 · 운영관리자)</Restricted>
              ) : (
                <>
                  <p className="text-[0.86rem]">
                    선택 — <b className="text-primary-strong">{teamName(chosenTeam)}</b>
                    {chosen && <span className="text-ink-soft"> · {chosen.total}점 · 도착 {chosen.arrival} · 예상 {chosen.expectedMin}분</span>}
                    {chosenTeam !== best?.teamId && best && <span className="block text-[0.78rem] font-bold text-warning">AI 1순위({teamName(best.teamId)})와 다른 선택 — 검토 의견을 남겨주세요.</span>}
                  </p>
                  <label className="block">
                    <span className="sr-only">검토 의견</span>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={120}
                      placeholder="검토 의견 (선택) — 예: 고객에게 15:40 도착 안내 완료"
                      className="w-full rounded-xl border border-line bg-card px-3 py-2 text-[0.86rem] outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {twoPerson ? (
                      <Btn onClick={() => review(false)} disabled={!chosen?.eligible}>검토 완료 · 승인 요청</Btn>
                    ) : (
                      <>
                        <Btn onClick={() => review(true)} disabled={!chosen?.eligible}><CheckCircle2 size={15} className="mr-1 inline" />{teamName(chosenTeam)} 배정 확정</Btn>
                        <Btn variant="outline" onClick={() => review(false)} disabled={!chosen?.eligible}>검토만 하기</Btn>
                      </>
                    )}
                    {open && <Btn variant="ghost" onClick={() => setDialog(open.status === '보류' ? 'reject' : 'hold')}>{open.status === '보류' ? '반려' : '보류'}</Btn>}
                  </div>
                  <p className="text-[0.76rem] text-ink-faint">
                    {pkind === '신규 배정' ? '미배정 일정의 신규 배정은 검토자가 바로 확정할 수 있습니다.' : `${pkind}는 검토 후 다른 승인권자가 승인해야 일정에 반영됩니다.`}
                  </p>
                </>
              )}
            </div>
          )}

          {!showReview && !open && !decided && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[0.86rem] font-bold text-success"><CheckCircle2 size={15} /> 현재 배정 유지 — 바꿀 이유가 없습니다.</p>
              {mayReview && <button onClick={() => setForce(true)} className="text-[0.8rem] font-bold text-ink-soft underline-offset-2 hover:text-primary hover:underline">그래도 재배정 검토</button>}
            </div>
          )}
        </div>

        {/* 이력 */}
        {history.length > 0 && (
          <div>
            <p className="mb-2 text-[0.8rem] font-bold text-ink-faint">이 일정의 변경 이력</p>
            <AuditTrail entries={history} limit={4} compact />
          </div>
        )}
        <p className="text-[0.74rem] text-ink-faint">이동시간은 구 단위 거리 모델 추정치(DEMO) — 지도 · 실시간 교통 API 연동 시 교체됩니다.</p>
      </div>

      <ReasonDialog
        open={dialog === 'hold'} onClose={() => setDialog(null)}
        title="배정안 보류" confirmLabel="보류" presets={HOLD_PRESETS}
        desc="보류 사유는 변경 이력에 남고, 다시 검토하면 이어서 진행할 수 있습니다."
        onConfirm={(r) => { if (open) { holdProposal(open.id, r); toast('배정안을 보류했습니다.', 'warning') } }}
      />
      <ReasonDialog
        open={dialog === 'reject'} onClose={() => setDialog(null)} danger
        title="배정안 반려" confirmLabel="반려" presets={REJECT_PRESETS}
        desc="반려하면 현재 배정이 유지됩니다. 반려 사유는 AI 추천 개선 근거로 함께 기록됩니다."
        onConfirm={(r) => { if (open) { rejectProposal(open.id, r); toast('배정안을 반려했습니다 — 현재 배정 유지.', 'warning') } }}
      />
    </Card>
  )
}

/** 후보 팀 한 줄 — 선택하면 7개 요인 점수 분해가 펼쳐진다 */
function Candidate({ e, rank, selected, disabled, currentTotal, onPick }: {
  e: DispatchEval; rank: number; selected: boolean; disabled: boolean; currentTotal?: number; onPick: () => void
}) {
  const team = teamById(e.teamId)
  const delta = currentTotal !== undefined && !e.isCurrent ? e.total - currentTotal : null
  return (
    <div className={cx('rounded-xl border transition-colors', selected ? 'border-primary bg-mint/40' : 'border-line')}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled && !selected}
        onClick={onPick}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left disabled:cursor-default"
      >
        <span className={cx('tnum flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-[0.95rem] font-extrabold leading-none', rank === 1 ? 'bg-ai text-white' : 'bg-ivory text-ink')}>
          {e.total}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.92rem] font-extrabold">{team?.name}</span>
            {rank === 1 && <Badge tone="ai">AI 1순위</Badge>}
            {e.isCurrent && <Badge tone="neutral">현재 담당</Badge>}
            {delta !== null && delta > 0 && <span className="tnum text-[0.76rem] font-bold text-success">+{delta}</span>}
          </span>
          <span className="mt-0.5 flex flex-wrap gap-x-2.5 text-[0.76rem] text-ink-faint">
            <span className="inline-flex items-center gap-0.5"><MapPin size={11} />{e.fromLabel}에서 {e.travelMin}분</span>
            <span className={cx('tnum', e.warnings.some((w) => w.includes('늦음')) && 'font-bold text-danger')}>도착 {e.arrival}</span>
            <span className="tnum">예상 {e.expectedMin}분</span>
            <span className="inline-flex items-center gap-0.5"><Users size={11} />{e.crew}명</span>
          </span>
        </span>
      </button>
      {selected && (
        <div className="space-y-1.5 border-t border-line/70 px-3.5 py-3">
          {e.factors.map((f) => (
            <div key={f.key} className="grid grid-cols-[5.6rem_1fr_2rem] items-center gap-x-2 gap-y-0.5">
              <span className="text-[0.76rem] font-bold text-ink-soft">{f.label} <span className="font-semibold text-ink-faint">{f.weight}%</span></span>
              <ScoreBar score={f.score} tone={f.level === 'good' ? 'brand' : f.level === 'warn' ? 'warning' : 'danger'} />
              <span className="tnum text-right text-[0.76rem] font-extrabold">{f.score}</span>
              <span className="col-span-3 -mt-0.5 text-[0.74rem] leading-snug text-ink-faint sm:col-start-2 sm:col-span-2">{f.detail}</span>
            </div>
          ))}
          {e.warnings.length > 0 && (
            <ul className="space-y-0.5 pt-1">
              {e.warnings.map((w) => (
                <li key={w} className="flex gap-1.5 text-[0.78rem] font-bold text-warning"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{w}</li>
              ))}
            </ul>
          )}
          <p className="pt-0.5 text-[0.72rem] text-ink-faint">팀원 {e.members.join(' · ')} · 종료 예상 {e.end}{e.next ? ` · 다음 ${e.next.time} ${e.next.customer} (여유 ${e.slackMin}분)` : ''}</p>
        </div>
      )}
    </div>
  )
}

/** 승인하면 무엇이 바뀌는지 — 결정 전에 영향 범위를 보여준다 */
function ImpactPreview({ s, toTeam, kind, toTime }: { s: Schedule; toTeam: string; kind: ProposalKind; toTime?: string }) {
  const { actions, requests } = useDemo()
  const linkedAction = actions.find((a) => a.customerId === s.customerId && a.status !== '완료' && /배정|지연|결원/.test(a.title))
  const linkedReq = s.requestId ? requests.find((r) => r.id === s.requestId) : undefined
  const items = [
    kind === '시간 변경' ? `방문 시간 ${s.time} → ${toTime}` : `담당팀 ${teamById(s.teamId)?.name ?? '미배정'} → ${teamById(toTeam)?.name}`,
    `${teamById(toTeam)?.name} 현장 앱에 ${kind === '시간 변경' ? '시간 변경' : '새 배정'} 알림`,
    s.teamId && s.teamId !== toTeam ? `${teamById(s.teamId)?.name}에 배정 해제 알림` : null,
    s.risk && ['방문지연', '직원결원'].includes(s.risk.type) && toTeam !== s.teamId ? `${s.risk.type} 위험 해소 처리` : null,
    linkedAction ? `AI 조치 “${linkedAction.title}” 완료 처리` : null,
    linkedReq ? `고객 요청 ${linkedReq.id} 진행 기록 갱신 (고객 화면에 표시)` : null,
  ].filter(Boolean) as string[]
  return (
    <div className="rounded-lg bg-ivory px-3 py-2.5">
      <p className="mb-1 text-[0.76rem] font-bold text-ink-faint">승인하면 함께 바뀌는 것</p>
      <ul className="space-y-0.5">
        {items.map((t) => <li key={t} className="flex gap-1.5 text-[0.8rem] text-ink-soft"><ArrowRight size={12} className="mt-1 shrink-0 text-primary" />{t}</li>)}
      </ul>
    </div>
  )
}
