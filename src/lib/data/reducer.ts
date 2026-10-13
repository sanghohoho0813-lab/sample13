// ─────────────────────────────────────────────────────────
// 데모 상태 변경 규칙 — 순수 함수 (같은 입력 → 같은 결과)
//
// · 시각 · ID · 처리자처럼 바깥에서 오는 값은 action.meta 로 받는다 (테스트에서 고정 가능)
// · 권한(governance.can)과 상태 전이표(canMove)를 여기서 다시 검사한다 — 화면의 버튼 비활성화에만 기대지 않는다
// · 사람이 바꾼 모든 것은 변경 이력(audit)에, AI 추천의 실행 결과는 실증 기록(evidence)에 남긴다
// ─────────────────────────────────────────────────────────
import type {
  ActionStatus, AuditEntry, CustomerRequest, DispatchProposal, EvidenceLog, FieldIssue, FieldNotice,
  PhotoRecord, RequestType, Role, Schedule, ServiceReport, UpsellOpportunity, WorkSession,
} from '../../types'
import { CHECKLIST_TEMPLATE } from '../demo/operations'
import { customerById, employeeById, teamById } from '../demo/company'
import {
  ACTION_FLOW, PROPOSAL_FLOW, REQUEST_FLOW, UPSELL_FLOW, can, canMove, needsSecondApprover, type Permission,
} from '../ops/governance'
import { dateWithOffset } from '../utils'
import { DEFAULT_FIELD_PERSONA, initialState, type DemoState } from './state'

/** 바깥에서 주입하는 값 — 현재 시각(HH:MM) · 고유 ID 조각 · 처리자 */
export interface Meta { now: string; uid: string; actor: string; role: Role | 'system' }

export type Prefs = Partial<Pick<DemoState, 'role' | 'theme' | 'fontScale' | 'reduceMotion' | 'tutorialSeen'>>

export type DemoAction =
  | { type: 'prefs'; patch: Prefs }
  | { type: 'reset' }
  | { type: 'hydrate'; state: DemoState }
  | { type: 'setFieldPersona'; employeeId: string }
  // 현장 작업 (현장직원 앱)
  | { type: 'checkin'; scheduleId: string; meta: Meta }
  | { type: 'startWork'; scheduleId: string; meta: Meta }
  | { type: 'toggleChecklist'; scheduleId: string; item: string; meta?: Meta }
  | { type: 'skipChecklist'; scheduleId: string; item: string; reason: string | null; meta?: Meta }
  | { type: 'setPhoto'; scheduleId: string; kind: 'before' | 'after'; photo?: PhotoRecord | null; meta?: Meta }
  | { type: 'setNote'; scheduleId: string; note: string }
  | { type: 'completeWork'; scheduleId: string; meta: Meta }
  | { type: 'reportIssue'; issue: Omit<FieldIssue, 'id' | 'at' | 'reportedBy' | 'status'>; meta: Meta }
  | { type: 'noticeAck'; noticeId: string; meta: Meta }
  // 본사 운영
  | { type: 'setScheduleStatus'; scheduleId: string; status: Schedule['status'] }
  | { type: 'createProposal'; proposal: Omit<DispatchProposal, 'status' | 'createdAt' | 'createdBy'>; meta: Meta }
  | { type: 'proposalReview'; proposalId: string; teamId: string; note: string; meta: Meta }
  | { type: 'proposalApprove'; proposalId: string; meta: Meta }
  | { type: 'proposalHold'; proposalId: string; reason: string; meta: Meta }
  | { type: 'proposalReject'; proposalId: string; reason: string; meta: Meta }
  | { type: 'setActionStatus'; actionId: string; status: ActionStatus; result?: string; reason?: string; meta: Meta }
  | { type: 'setActionOwner'; actionId: string; owner: string; meta: Meta }
  | { type: 'issueUpdate'; issueId: string; status: FieldIssue['status']; owner?: string; meta: Meta }
  | { type: 'requestAssign'; requestId: string; assignee: string; meta: Meta }
  | { type: 'requestReply'; requestId: string; text: string; close: boolean; meta: Meta }
  | { type: 'requestReject'; requestId: string; reason: string; meta: Meta }
  | { type: 'requestSchedule'; requestId: string; scheduleId: string; proposalId: string; dayOffset: number; time: string; durationMin: number; service: string; quote?: number; meta: Meta }
  | { type: 'requestReschedule'; requestId: string; targetScheduleId: string; toTime: string; proposalId: string; meta: Meta }
  | { type: 'setUpsellStatus'; id: string; status: UpsellOpportunity['status']; meta: Meta }
  | { type: 'addEvidence'; engine: EvidenceLog['engine']; text: string; result?: string; meta: Meta }
  // 고객 포털
  | { type: 'addRequest'; id: string; customerId: string; requestType: RequestType; detail: string; meta: Meta }
  | { type: 'rateReport'; reportId: string; rating: number; feedback: string; meta: Meta }

const emptyWork = (scheduleId: string): WorkSession => ({
  scheduleId,
  checklist: Object.fromEntries(CHECKLIST_TEMPLATE.map((c) => [c, false])),
  beforePhoto: false,
  afterPhoto: false,
  note: '',
})

const allowed = (meta: Meta | undefined, p: Permission) => !meta || meta.role === 'system' || can(meta.role, p)

const patchSchedule = (s: DemoState, id: string, p: Partial<Schedule>): DemoState => ({
  ...s, schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...p } : sc)),
})
const patchWork = (s: DemoState, id: string, p: Partial<WorkSession>): DemoState => ({
  ...s, work: { ...s.work, [id]: { ...(s.work[id] ?? emptyWork(id)), ...p } },
})
const patchRequest = (s: DemoState, id: string, fn: (r: CustomerRequest) => CustomerRequest): DemoState => ({
  ...s, requests: s.requests.map((r) => (r.id === id ? fn(r) : r)),
})
const patchProposal = (s: DemoState, id: string, p: Partial<DispatchProposal>): DemoState => ({
  ...s, proposals: s.proposals.map((x) => (x.id === id ? { ...x, ...p } : x)),
})
const patchUpsell = (s: DemoState, id: string | undefined, p: Partial<UpsellOpportunity>): DemoState =>
  id ? { ...s, upsell: s.upsell.map((u) => (u.id === id ? { ...u, ...p } : u)) } : s

/** 고객 요청 진행 기록 — visible=false 는 내부 메모 (고객 화면에 안 보임) */
const historyEntry = (meta: Meta, text: string, visible = true) => ({ at: meta.now, actor: meta.actor, text, visible })
const addHistory = (r: CustomerRequest, meta: Meta, text: string, visible = true): CustomerRequest =>
  ({ ...r, history: [...(r.history ?? []), historyEntry(meta, text, visible)] })

/** 변경 이력 — 같은 동작에서 여러 건을 남기면 n 으로 ID 를 구분한다 */
const withAudit = (s: DemoState, meta: Meta, e: Omit<AuditEntry, 'id' | 'at' | 'day' | 'actor' | 'role'>, n = 1): DemoState => ({
  ...s, audit: [{ id: `AU-${meta.uid}${n > 1 ? `-${n}` : ''}`, day: 'TODAY', at: meta.now, actor: meta.actor, role: meta.role, ...e }, ...s.audit],
})

/** AX 실증 기록 — AI 추천에 대한 사람의 결정 · 실행 · 결과 */
const withEvidence = (s: DemoState, meta: Meta, engine: EvidenceLog['engine'], text: string, result?: string): DemoState => ({
  ...s, evidence: [{ id: `EV-${meta.uid}`, date: 'TODAY', time: meta.now, engine, text, result }, ...s.evidence],
})

const custName = (customerId: string) => customerById(customerId)?.name ?? customerId
const schedOf = (s: DemoState, id: string) => s.schedules.find((x) => x.id === id)
const when = (sc: Schedule) => `${sc.dayOffset === 0 ? '오늘' : dateWithOffset(sc.dayOffset)} ${sc.time}`

/** 완료 조건 — 화면과 같은 규칙을 상태에서도 검사한다 (체크리스트는 수행 또는 사유 있는 제외) */
export function completionGaps(ws: WorkSession | undefined): string[] {
  if (!ws?.checkinAt) return ['도착 체크인']
  const left = CHECKLIST_TEMPLATE.filter((i) => !ws.checklist[i] && !ws.skipped?.[i]).length
  return [
    left > 0 && `체크리스트 ${left}개`,
    !ws.beforePhoto && '작업 전 사진',
    !ws.afterPhoto && '작업 후 사진',
  ].filter(Boolean) as string[]
}

export function demoReducer(s: DemoState, a: DemoAction): DemoState {
  switch (a.type) {
    case 'prefs':
      return { ...s, ...a.patch }

    case 'reset':
      // 업무 데이터만 처음 상태로 — 테마·글자·모션 같은 사용자 선호와 튜토리얼 완료 여부는 유지
      return { ...initialState(), theme: s.theme, fontScale: s.fontScale, reduceMotion: s.reduceMotion, tutorialSeen: s.tutorialSeen }

    case 'hydrate':
      return a.state

    case 'setFieldPersona':
      return employeeById(a.employeeId) ? { ...s, fieldPersona: a.employeeId } : { ...s, fieldPersona: DEFAULT_FIELD_PERSONA }

    // ───────────────────────── 현장 작업 ─────────────────────────
    case 'checkin': {
      if (!allowed(a.meta, 'field.execute')) return s
      const sc = schedOf(s, a.scheduleId)
      if (!sc || s.work[a.scheduleId]?.checkinAt) return s
      const next = patchSchedule(patchWork(s, a.scheduleId, { checkinAt: a.meta.now, worker: a.meta.actor }), a.scheduleId, { status: '작업중' })
      return withAudit(next, a.meta, { entity: '현장 작업', entityId: a.scheduleId, target: custName(sc.customerId), action: '도착 체크인', from: sc.status, to: '작업중' })
    }

    case 'startWork':
      if (!allowed(a.meta, 'field.execute') || !s.work[a.scheduleId]?.checkinAt || s.work[a.scheduleId]?.startedAt) return s
      return patchWork(s, a.scheduleId, { startedAt: a.meta.now })

    case 'toggleChecklist': {
      if (!allowed(a.meta, 'field.execute')) return s
      const cur = s.work[a.scheduleId] ?? emptyWork(a.scheduleId)
      const skipped = { ...(cur.skipped ?? {}) }
      delete skipped[a.item] // 수행으로 바꾸면 제외 사유는 지운다
      return patchWork(s, a.scheduleId, { checklist: { ...cur.checklist, [a.item]: !cur.checklist[a.item] }, skipped })
    }

    case 'skipChecklist': {
      if (!allowed(a.meta, 'field.execute')) return s
      const cur = s.work[a.scheduleId] ?? emptyWork(a.scheduleId)
      const skipped = { ...(cur.skipped ?? {}) }
      if (a.reason && a.reason.trim()) skipped[a.item] = a.reason.trim()
      else delete skipped[a.item]
      return patchWork(s, a.scheduleId, { skipped, checklist: { ...cur.checklist, [a.item]: false } })
    }

    case 'setPhoto': {
      if (!allowed(a.meta, 'field.execute')) return s
      const cur = s.work[a.scheduleId] ?? emptyWork(a.scheduleId)
      const photos = { ...(cur.photos ?? {}) }
      if (a.photo === null) {
        delete photos[a.kind] // 다시 찍기
        return patchWork(s, a.scheduleId, { photos, ...(a.kind === 'before' ? { beforePhoto: false } : { afterPhoto: false }) })
      }
      if (a.photo) photos[a.kind] = a.photo
      return patchWork(s, a.scheduleId, { photos, ...(a.kind === 'before' ? { beforePhoto: true } : { afterPhoto: true }) })
    }

    case 'setNote':
      return patchWork(s, a.scheduleId, { note: a.note })

    case 'completeWork': {
      if (!allowed(a.meta, 'field.execute')) return s
      const sc = schedOf(s, a.scheduleId)
      if (!sc || sc.status === '완료') return s // 이미 완료된 작업을 다시 완료해도 리포트가 두 번 생기지 않게
      if (completionGaps(s.work[a.scheduleId]).length) return s
      let next = patchWork(s, a.scheduleId, { completedAt: a.meta.now, checkoutAt: a.meta.now })
      next = patchSchedule(next, a.scheduleId, { status: '완료', risk: undefined })
      const ws = next.work[a.scheduleId]
      const name = custName(sc.customerId)
      const report: ServiceReport = {
        id: `RP-${a.meta.uid}`,
        scheduleId: a.scheduleId,
        customerId: sc.customerId,
        date: '오늘',
        team: teamById(sc.teamId)?.name ?? '미배정',
        completedAt: a.meta.now,
        itemsDone: Object.values(ws.checklist).filter(Boolean).length,
        itemsTotal: CHECKLIST_TEMPLATE.length,
        note: ws.note.trim() || '특이사항 없음',
        service: sc.service,
        checkinAt: ws.checkinAt,
        worker: ws.worker ?? a.meta.actor,
        skipped: ws.skipped && Object.keys(ws.skipped).length ? ws.skipped : undefined,
        photos: ws.photos,
        issueIds: next.issues.filter((i) => i.scheduleId === a.scheduleId).map((i) => i.id),
        requestId: sc.requestId,
      }
      next = { ...next, reports: [report, ...next.reports] }
      // 고객 요청으로 생긴 작업이면 요청도 함께 닫는다 — 고객 화면에 '완료 · 리포트 보기'
      if (sc.requestId) {
        next = patchRequest(next, sc.requestId, (r) => addHistory(
          { ...r, status: '완료', reply: '요청하신 작업을 완료했습니다. 작업 리포트에서 사진과 기록을 확인하실 수 있습니다.' },
          a.meta, '작업 완료 — 리포트 발송'))
      }
      next = withAudit(next, a.meta, { entity: '현장 작업', entityId: a.scheduleId, target: name, action: '작업 완료', from: sc.status, to: '완료', note: `리포트 ${report.id}` })
      return withEvidence(next, a.meta, 'risk', `현장 작업 완료 — ${name} · 작업 리포트 자동 생성`)
    }

    case 'reportIssue': {
      if (!allowed(a.meta, 'field.execute')) return s
      const issue: FieldIssue = { ...a.issue, id: `FI-${a.meta.uid}`, at: a.meta.now, reportedBy: a.meta.actor, status: '접수' }
      const next = { ...s, issues: [issue, ...s.issues] }
      return withAudit(next, a.meta, { entity: '현장 이슈', entityId: issue.id, target: custName(issue.customerId), action: '이슈 보고', note: `${issue.type} · ${issue.severity}` })
    }

    case 'noticeAck': {
      const n = s.notices.find((x) => x.id === a.noticeId)
      if (!n || n.ackAt) return s
      let next: DemoState = { ...s, notices: s.notices.map((x) => (x.id === a.noticeId ? { ...x, ackAt: a.meta.now, ackBy: a.meta.actor } : x)) }
      const p = n.proposalId ? next.proposals.find((x) => x.id === n.proposalId) : undefined
      if (p && p.status === '승인' && n.kind !== '배정 해제') next = patchProposal(next, p.id, { status: '현장확인' })
      const sc = schedOf(next, n.scheduleId)
      return withAudit(next, a.meta, { entity: '배정', entityId: n.proposalId ?? n.scheduleId, target: sc ? custName(sc.customerId) : n.scheduleId, action: '현장 수신 확인', note: n.text })
    }

    // ───────────────────────── 본사 운영 ─────────────────────────
    case 'setScheduleStatus':
      return patchSchedule(s, a.scheduleId, { status: a.status })

    case 'createProposal': {
      if (!allowed(a.meta, 'dispatch.review')) return s
      // 같은 일정에 진행 중인 배정안이 있으면 새로 만들지 않는다
      if (s.proposals.some((p) => p.scheduleId === a.proposal.scheduleId && ['추천', '검토', '보류'].includes(p.status))) return s
      const p: DispatchProposal = { ...a.proposal, status: '추천', createdAt: a.meta.now, createdBy: a.meta.actor }
      const sc = schedOf(s, p.scheduleId)
      return withAudit({ ...s, proposals: [p, ...s.proposals] }, a.meta, { entity: '배정', entityId: p.id, target: sc ? custName(sc.customerId) : p.scheduleId, action: `${p.kind}안 생성`, note: p.reason })
    }

    case 'proposalReview': {
      const p = s.proposals.find((x) => x.id === a.proposalId)
      if (!p || !allowed(a.meta, 'dispatch.review') || !canMove(PROPOSAL_FLOW, p.status, '검토') || !teamById(a.teamId)) return s
      const sc = schedOf(s, p.scheduleId)
      const next = patchProposal(s, p.id, { status: '검토', toTeamId: a.teamId, reviewer: a.meta.actor, reviewNote: a.note.trim() || undefined })
      return withAudit(next, a.meta, {
        entity: '배정', entityId: p.id, target: sc ? custName(sc.customerId) : p.scheduleId,
        action: '검토 완료', from: p.status, to: '검토', note: `${teamById(a.teamId)?.name} 선택${a.note.trim() ? ` — ${a.note.trim()}` : ''}`,
      })
    }

    case 'proposalApprove': {
      const p = s.proposals.find((x) => x.id === a.proposalId)
      if (!p || !allowed(a.meta, 'dispatch.approve') || p.status !== '검토' || !p.toTeamId) return s
      // 직무 분리 — 고객 안내가 바뀌는 재배정 · 시간 변경은 검토자와 다른 사람이 승인
      if (needsSecondApprover(p.kind) && p.reviewer === a.meta.actor) return s
      const sc = schedOf(s, p.scheduleId)
      if (!sc) return s
      const toTeam = p.toTeamId
      const toTime = p.toTime ?? sc.time
      const resolvedRisk = sc.risk && ['방문지연', '직원결원'].includes(sc.risk.type) && toTeam !== sc.teamId ? undefined : sc.risk
      let next = patchSchedule(s, sc.id, { teamId: toTeam, time: toTime, risk: resolvedRisk })
      next = patchProposal(next, p.id, { status: '승인', approver: a.meta.actor, decidedAt: a.meta.now })
      const name = custName(sc.customerId)
      const updated = schedOf(next, sc.id)!
      // 현장직원 앱 알림 — 새 팀에는 배정, 기존 팀에는 해제
      const notices: FieldNotice[] = [{
        id: `NT-${a.meta.uid}`, teamId: toTeam, scheduleId: sc.id, proposalId: p.id, at: a.meta.now,
        kind: p.kind === '시간 변경' ? '시간 변경' : '새 배정',
        text: p.kind === '시간 변경'
          ? `${name} 방문 시간 변경 ${sc.time} → ${toTime}`
          : `${when(updated)} ${name} · ${sc.service} 배정`,
      }]
      if (sc.teamId && sc.teamId !== toTeam) {
        notices.push({ id: `NT-${a.meta.uid}-2`, teamId: sc.teamId, scheduleId: sc.id, proposalId: p.id, at: a.meta.now, kind: '배정 해제', text: `${sc.time} ${name} 일정이 ${teamById(toTeam)?.name}로 이관되었습니다` })
      }
      next = { ...next, notices: [...notices, ...next.notices] }
      // 함께 닫히는 AI 조치 · 고객 요청
      if (p.actionId) next = { ...next, actions: next.actions.map((x) => (x.id === p.actionId ? { ...x, status: '완료' as const, result: `${teamById(toTeam)?.name} 배정 승인 (${a.meta.now})` } : x)) }
      if (p.requestId) {
        next = patchRequest(next, p.requestId, (r) => p.kind === '시간 변경'
          ? addHistory({ ...r, status: '완료', reply: `요청하신 대로 방문 시간을 ${toTime}로 변경했습니다.` }, a.meta, `일정 변경 확정 — ${sc.time} → ${toTime}`)
          : addHistory(r, a.meta, `담당팀 배정 — ${teamById(toTeam)?.name} (${when(updated)})`))
      }
      next = withEvidence(next, a.meta, 'dispatch',
        `배정안 승인 — ${name} ${when(updated)} · ${teamById(toTeam)?.name}${sc.teamId && sc.teamId !== toTeam ? ` (기존 ${teamById(sc.teamId)?.name})` : ''}`,
        resolvedRisk !== sc.risk ? `${sc.risk?.type} 위험 해소` : undefined)
      return withAudit(next, a.meta, {
        entity: '배정', entityId: p.id, target: name, action: '승인 · 일정 반영',
        from: `${teamById(sc.teamId)?.name ?? '미배정'} ${sc.time}`, to: `${teamById(toTeam)?.name} ${toTime}`,
        note: p.reviewer ? `검토 ${p.reviewer}` : undefined,
      })
    }

    case 'proposalHold':
    case 'proposalReject': {
      const p = s.proposals.find((x) => x.id === a.proposalId)
      const to = a.type === 'proposalHold' ? '보류' : '반려'
      if (!p || !allowed(a.meta, 'dispatch.approve') || !canMove(PROPOSAL_FLOW, p.status, to) || !a.reason.trim()) return s
      const sc = schedOf(s, p.scheduleId)
      let next = patchProposal(s, p.id, { status: to, holdReason: a.reason.trim(), decidedAt: a.meta.now })
      if (p.requestId) next = patchRequest(next, p.requestId, (r) => addHistory(r, a.meta, `배정 ${to} — ${a.reason.trim()}`, false))
      return withAudit(next, a.meta, { entity: '배정', entityId: p.id, target: sc ? custName(sc.customerId) : p.scheduleId, action: to, from: p.status, to, note: a.reason.trim() })
    }

    case 'setActionStatus': {
      const act = s.actions.find((x) => x.id === a.actionId)
      if (!act || !allowed(a.meta, 'action.update') || act.status === a.status || !canMove(ACTION_FLOW, act.status, a.status)) return s
      if (a.status === '보류' && !a.reason?.trim()) return s // 보류는 사유 필수
      let next: DemoState = {
        ...s,
        actions: s.actions.map((x) => (x.id === a.actionId
          ? { ...x, status: a.status, result: a.result ?? x.result, holdReason: a.status === '보류' ? a.reason?.trim() : x.holdReason }
          : x)),
      }
      next = withAudit(next, a.meta, { entity: '조치', entityId: act.id, target: act.target, action: a.status === '보류' ? '보류' : `${a.status}로 변경`, from: act.status, to: a.status, note: a.reason?.trim() })
      if (a.status !== '완료' && a.status !== '실행중') return next
      return withEvidence(next, a.meta, act.engine, `조치 ${a.status === '완료' ? '완료' : '실행'} — ${act.title}`, a.status === '완료' ? a.result ?? act.result : undefined)
    }

    case 'setActionOwner': {
      const act = s.actions.find((x) => x.id === a.actionId)
      if (!act || !allowed(a.meta, 'action.update') || act.owner === a.owner) return s
      const next = { ...s, actions: s.actions.map((x) => (x.id === a.actionId ? { ...x, owner: a.owner } : x)) }
      return withAudit(next, a.meta, { entity: '조치', entityId: act.id, target: act.target, action: '담당자 변경', from: act.owner, to: a.owner })
    }

    case 'issueUpdate': {
      const i = s.issues.find((x) => x.id === a.issueId)
      if (!i || !allowed(a.meta, 'issue.handle') || (i.status === a.status && (!a.owner || a.owner === i.owner))) return s
      const next = { ...s, issues: s.issues.map((x) => (x.id === a.issueId ? { ...x, status: a.status, owner: a.owner ?? x.owner } : x)) }
      return withAudit(next, a.meta, { entity: '현장 이슈', entityId: i.id, target: custName(i.customerId), action: a.status === '해결' ? '조치 완료' : '담당 지정', from: i.status, to: a.status, note: a.owner })
    }

    case 'requestAssign': {
      const r = s.requests.find((x) => x.id === a.requestId)
      if (!r || !allowed(a.meta, 'request.handle') || !canMove(REQUEST_FLOW, r.status, '검토중')) return s
      let next = patchRequest(s, r.id, (x) => addHistory({ ...x, status: '검토중', assignee: a.assignee }, a.meta, `담당자 배정 — ${a.assignee}`))
      const opp = r.opportunityId ? s.upsell.find((u) => u.id === r.opportunityId) : undefined
      if (opp && canMove(UPSELL_FLOW, opp.status, '협의중')) next = patchUpsell(next, opp.id, { status: '협의중', owner: a.assignee })
      return withAudit(next, a.meta, { entity: '요청', entityId: r.id, target: custName(r.customerId), action: '담당 지정', from: r.status, to: '검토중', note: a.assignee })
    }

    case 'requestReply': {
      const r = s.requests.find((x) => x.id === a.requestId)
      const text = a.text.trim()
      if (!r || !text || !allowed(a.meta, 'request.handle') || (a.close && !canMove(REQUEST_FLOW, r.status, '완료'))) return s
      const status = a.close ? '완료' : r.status
      const next = patchRequest(s, r.id, (x) => addHistory({ ...x, reply: text, status, assignee: x.assignee ?? a.meta.actor }, a.meta, a.close ? `회신 · 완료 — ${text}` : `회신 — ${text}`))
      return withAudit(next, a.meta, { entity: '요청', entityId: r.id, target: custName(r.customerId), action: a.close ? '회신 · 완료' : '회신', from: r.status, to: status })
    }

    case 'requestReject': {
      const r = s.requests.find((x) => x.id === a.requestId)
      const reason = a.reason.trim()
      if (!r || !reason || !allowed(a.meta, 'request.handle') || !canMove(REQUEST_FLOW, r.status, '반려')) return s
      let next = patchRequest(s, r.id, (x) => addHistory({ ...x, status: '반려', reply: reason }, a.meta, `처리 불가 안내 — ${reason}`))
      next = patchUpsell(next, r.opportunityId, { status: '보류' })
      return withAudit(next, a.meta, { entity: '요청', entityId: r.id, target: custName(r.customerId), action: '반려', from: r.status, to: '반려', note: reason })
    }

    case 'requestSchedule': {
      const r = s.requests.find((x) => x.id === a.requestId)
      if (!r || !allowed(a.meta, 'request.handle') || r.scheduleId || !canMove(REQUEST_FLOW, r.status, '처리중')) return s
      const sc: Schedule = {
        id: a.scheduleId, dayOffset: a.dayOffset, time: a.time, durationMin: a.durationMin, customerId: r.customerId,
        service: a.service, teamId: null, status: '예정', travelMin: 0, important: r.type === '긴급방문', requestId: r.id,
      }
      const proposal: DispatchProposal = {
        id: a.proposalId, scheduleId: sc.id, kind: '신규 배정', status: '추천', fromTeamId: null,
        reason: `고객 요청 ${r.id} — ${a.service}`, createdAt: a.meta.now, createdBy: a.meta.actor, requestId: r.id,
      }
      const name = custName(r.customerId)
      const quote = a.quote ? ` · 견적 ${a.quote}만원` : ''
      let next: DemoState = { ...s, schedules: [...s.schedules, sc], proposals: [proposal, ...s.proposals] }
      next = patchRequest(next, r.id, (x) => addHistory(
        { ...x, status: '처리중', scheduleId: sc.id, assignee: x.assignee ?? a.meta.actor, reply: `${when(sc)} 방문으로 확정했습니다. 담당팀을 배정하고 있습니다.` },
        a.meta, `일정 확정 — ${when(sc)}${quote}`))
      const opp = r.opportunityId ? next.upsell.find((u) => u.id === r.opportunityId) : undefined
      if (opp && canMove(UPSELL_FLOW, opp.status, '성사')) {
        next = patchUpsell(next, opp.id, { status: '성사', expectedRevenue: a.quote ?? opp.expectedRevenue, owner: opp.owner ?? a.meta.actor })
        next = withEvidence(next, a.meta, 'upsell', `고객 요청 추가서비스 수주 — ${name} · ${a.service}`, `추가매출 ${a.quote ?? opp.expectedRevenue}만원 (DEMO)`)
      }
      next = withAudit(next, a.meta, { entity: '요청', entityId: r.id, target: name, action: '일정 확정', from: r.status, to: '처리중', note: `${when(sc)} ${a.service}${quote}` })
      return withAudit(next, a.meta, { entity: '배정', entityId: proposal.id, target: name, action: '신규 배정안 생성', note: `요청 ${r.id}` }, 2)
    }

    case 'requestReschedule': {
      const r = s.requests.find((x) => x.id === a.requestId)
      const target = schedOf(s, a.targetScheduleId)
      if (!r || !target || !allowed(a.meta, 'request.handle') || !canMove(REQUEST_FLOW, r.status, '처리중')) return s
      if (s.proposals.some((p) => p.scheduleId === target.id && ['추천', '검토', '보류'].includes(p.status))) return s
      const proposal: DispatchProposal = {
        id: a.proposalId, scheduleId: target.id, kind: '시간 변경', status: '추천', fromTeamId: target.teamId, toTeamId: target.teamId ?? undefined,
        fromTime: target.time, toTime: a.toTime, reason: `고객 요청 ${r.id} — 방문 시간 변경`, createdAt: a.meta.now, createdBy: a.meta.actor, requestId: r.id,
      }
      let next: DemoState = { ...s, proposals: [proposal, ...s.proposals] }
      next = patchRequest(next, r.id, (x) => addHistory({ ...x, status: '처리중', scheduleId: target.id, assignee: x.assignee ?? a.meta.actor }, a.meta, `변경안 작성 — ${target.time} → ${a.toTime} (승인 후 확정)`))
      return withAudit(next, a.meta, { entity: '요청', entityId: r.id, target: custName(r.customerId), action: '시간 변경안 작성', from: target.time, to: a.toTime })
    }

    case 'setUpsellStatus': {
      const u = s.upsell.find((x) => x.id === a.id)
      if (!u || !allowed(a.meta, 'upsell.update') || u.status === a.status || !canMove(UPSELL_FLOW, u.status, a.status)) return s
      const next = patchUpsell(s, u.id, { status: a.status, owner: u.owner ?? a.meta.actor })
      return withAudit(next, a.meta, { entity: '매출 기회', entityId: u.id, target: custName(u.customerId), action: `${a.status}로 변경`, from: u.status, to: a.status, note: u.recommendedService })
    }

    case 'addEvidence':
      return withEvidence(s, a.meta, a.engine, a.text, a.result)

    // ───────────────────────── 고객 포털 ─────────────────────────
    case 'addRequest': {
      if (!allowed(a.meta, 'customer.request')) return s
      const c = customerById(a.customerId)
      const oppId = a.requestType === '추가서비스' ? `U-${a.id}` : undefined
      const request: CustomerRequest = {
        id: a.id, customerId: a.customerId, type: a.requestType, detail: a.detail,
        createdAt: `오늘 ${a.meta.now}`, status: '접수', fromPortal: true, opportunityId: oppId,
        history: [historyEntry(a.meta, '요청 접수')],
      }
      // Closed Loop: 추가서비스 요청 → 매출 기회 자동 생성 (출처: 고객 요청)
      const upsell: UpsellOpportunity[] = oppId
        ? [{
            id: oppId, customerId: a.customerId,
            currentService: c?.contract.serviceSummary ?? '-',
            signal: '고객 플랫폼 직접 요청',
            recommendedService: a.detail.split(' · ')[0],
            expectedRevenue: 85,
            reason: '고객이 플랫폼에서 직접 요청 — 담당자 견적 · 일정 확정 필요',
            status: '발견됨', source: 'portal', requestId: a.id,
          }, ...s.upsell]
        : s.upsell
      const follow = oppId ? ' → 매출 기회 자동 생성' : a.requestType === '일정변경' ? ' → 일정 변경 검토 대기' : ''
      let next = withEvidence({ ...s, requests: [request, ...s.requests], upsell }, a.meta,
        oppId ? 'upsell' : 'risk', `고객 플랫폼 요청 접수 — ${c?.name ?? a.customerId} · ${a.requestType}${follow}`)
      next = withAudit(next, a.meta, { entity: '요청', entityId: a.id, target: c?.name ?? a.customerId, action: '요청 접수', to: '접수', note: a.requestType })
      return next
    }

    case 'rateReport': {
      const r = s.reports.find((x) => x.id === a.reportId)
      if (!r || !allowed(a.meta, 'customer.request') || a.rating < 1 || a.rating > 5) return s
      const next = { ...s, reports: s.reports.map((x) => (x.id === a.reportId ? { ...x, rating: a.rating, feedback: a.feedback.trim() || undefined } : x)) }
      return withAudit(next, a.meta, { entity: '고객 평가', entityId: r.id, target: custName(r.customerId), action: `평가 ${a.rating}점`, note: a.feedback.trim() || undefined })
    }
  }
}
