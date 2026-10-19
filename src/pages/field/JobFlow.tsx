import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, Camera, Check, CheckCircle2, ClipboardCheck, Clock, MapPin, MessageSquareText, Navigation, Play, Sparkles, Undo2, Wrench,
} from 'lucide-react'
import { Badge, Btn, Card, Modal, StatusPill, TextArea } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { ReasonDialog } from '../../components/ops'
import { completionGaps, type DemoAction, type Meta } from '../../lib/data/reducer'
import type { DemoState } from '../../lib/data/state'
import { customerById, siteProfile } from '../../lib/demo/company'
import { CHECKLIST_TEMPLATE } from '../../lib/demo/operations'
import { beforeAfterFor } from '../../lib/demo/photos'
import type { Net } from '../../lib/field/outbox'
import { cx } from '../../lib/utils'
import type { Schedule } from '../../types'
import IssueSheet from './IssueSheet'
import PhotoSlot from './PhotoSlot'

const SKIP_PRESETS = ['고객 요청으로 제외', '출입 불가 (잠김 · 공사)', '자재 · 장비 부족', '시간 부족 — 다음 방문 처리']
const PHRASES = ['소모품 보충 필요', '고객 요청 사항 처리 완료', '다음 방문 시 재점검 필요', '파손 부위 사진 첨부']
const MEMO_MAX = 1000

/**
 * 한 현장의 작업 — 도착 → 작업 시작 → 작업 전 사진 → 체크리스트 → 작업 후 사진 → 완료
 * 다음에 할 일은 화면 아래 고정 버튼 하나로 안내한다(한 손 · 장갑 사용 기준 큰 버튼).
 */
export default function JobFlow({ job, view, send, meta, net }: {
  job: Schedule
  view: DemoState
  send: (a: DemoAction) => void
  meta: () => Meta
  net: Net
}) {
  const toast = useToast()
  const ws = view.work[job.id]
  const c = customerById(job.customerId)!
  const profile = siteProfile(job.customerId)
  const ba = beforeAfterFor(job.service)
  const checklist = ws?.checklist ?? Object.fromEntries(CHECKLIST_TEMPLATE.map((i) => [i, false]))
  const skipped = ws?.skipped ?? {}
  const done = CHECKLIST_TEMPLATE.filter((i) => checklist[i]).length
  const skippedN = CHECKLIST_TEMPLATE.filter((i) => skipped[i]).length
  const left = CHECKLIST_TEMPLATE.length - done - skippedN
  const gaps = completionGaps(ws)
  const issues = view.issues.filter((i) => i.scheduleId === job.id)
  const lastReport = view.reports.find((r) => r.customerId === job.customerId && r.scheduleId !== job.id)
  const openReq = view.requests.filter((r) => r.customerId === job.customerId && ['접수', '검토중', '처리중'].includes(r.status))
  const isDone = job.status === '완료'

  const [skipItem, setSkipItem] = useState<string | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const photosRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 메모 — 입력은 바로 화면에, 저장은 잠시 멈췄을 때(자동 저장)
  const [memo, setMemo] = useState(ws?.note ?? '')
  const [memoState, setMemoState] = useState<'saved' | 'typing'>('saved')
  useEffect(() => {
    if (memoState !== 'typing') return
    const t = window.setTimeout(() => { send({ type: 'setNote', scheduleId: job.id, note: memo }); setMemoState('saved') }, 600)
    return () => window.clearTimeout(t)
  }, [memo, memoState, job.id, send])

  const go = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const offlineNote = net === 'online' ? '' : ' (기기에 저장 — 신호 복구 시 전송)'

  // 다음 할 일 — 화면 아래 고정 버튼
  const cta: { label: string; tone: 'primary' | 'success' | 'outline'; run: () => void; sub?: string } | null = isDone ? null
    : !ws?.checkinAt ? { label: '도착 체크인', tone: 'primary', run: () => { send({ type: 'checkin', scheduleId: job.id, meta: meta() }); toast(`체크인 완료 — 도착 시각이 기록되었습니다${offlineNote}`) } }
    : !ws.startedAt ? { label: '작업 시작', tone: 'primary', run: () => { send({ type: 'startWork', scheduleId: job.id, meta: meta() }); toast(`작업 시작${offlineNote}`, 'info') } }
    : !ws.beforePhoto ? { label: '작업 전 사진 찍기', tone: 'outline', run: () => go(photosRef.current), sub: '다음 단계' }
    : left > 0 ? { label: `체크리스트 ${left}개 남음`, tone: 'outline', run: () => go(listRef.current), sub: '다음 단계' }
    : !ws.afterPhoto ? { label: '작업 후 사진 찍기', tone: 'outline', run: () => go(photosRef.current), sub: '다음 단계' }
    : { label: '작업 완료 보고', tone: 'success', run: () => setConfirm(true) }

  const started = !!ws?.startedAt
  const step = !ws?.checkinAt ? 0 : !started ? 1 : gaps.length ? 2 : 3

  return (
    <div className="space-y-3.5 pb-20">
      {/* 현장 정보 */}
      <Card tour="field-next" className="overflow-hidden">
        <div className="bg-primary px-4 py-3 text-white">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[0.72rem] font-bold text-white/80">{isDone ? '완료한 현장' : '지금 현장'}</p>
            {job.requestId && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[0.68rem] font-bold">고객 요청 작업</span>}
          </div>
          <p className="mt-0.5 text-[1.2rem] font-extrabold leading-tight">{c.name}</p>
          <p className="tnum mt-0.5 text-[0.95rem] font-bold text-champagne">{job.time} · {job.service} · {job.durationMin}분</p>
        </div>
        <div className="space-y-3 p-4">
          <ol className="flex items-center gap-1.5" aria-label="작업 진행 단계">
            {['도착', '작업 시작', '기록', '완료'].map((label, i) => (
              <li key={label} className="flex flex-1 flex-col items-center gap-1" aria-current={i === step ? 'step' : undefined}>
                <span className={cx('h-1.5 w-full rounded-full', isDone || i < step ? 'bg-primary' : i === step ? 'bg-primary/45' : 'bg-line')} />
                <span className={cx('text-[0.74rem] font-bold', isDone || i <= step ? 'text-primary' : 'text-ink-faint')}>{label}</span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-1 text-[0.82rem] text-ink-soft"><MapPin size={13} className="mt-0.5 shrink-0" /> {c.address}</p>
          {!ws?.checkinAt && !isDone && (
            <Btn variant="outline" className="w-full py-2.5" onClick={() => toast('길찾기는 지도 앱 연동 시 활성화됩니다 (연동 준비)', 'info')}>
              <Navigation size={16} className="mr-1 inline" /> 길찾기
            </Btn>
          )}
          {ws?.checkinAt && (
            <p className="flex flex-wrap gap-x-3 rounded-xl bg-mint px-3.5 py-2 text-[0.82rem] font-bold text-primary-strong">
              <span><Check size={13} className="mr-0.5 inline" />체크인 {ws.checkinAt}</span>
              {ws.startedAt && <span>작업 시작 {ws.startedAt}</span>}
              {ws.completedAt && <span>완료 {ws.completedAt}</span>}
            </p>
          )}
        </div>
      </Card>

      {/* 현장 메모 — 지난 리포트 · 고객 요청 · 현장 특성에서 자동으로 */}
      {!isDone && (
        <Card className="p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[0.88rem] font-extrabold text-ai-strong"><Sparkles size={15} /> 이 현장에서 챙길 것</p>
          <ul className="space-y-1.5 text-[0.82rem] leading-snug">
            {profile.difficultyNotes.map((n) => <li key={n} className="rounded-lg bg-ai-soft/60 px-3 py-2">{n}</li>)}
            {openReq.map((r) => <li key={r.id} className="rounded-lg bg-warning-soft/70 px-3 py-2"><b>고객 {r.type}</b> — {r.detail}</li>)}
            {lastReport && lastReport.note !== '특이사항 없음' && <li className="rounded-lg bg-ivory px-3 py-2">지난 방문 메모 — {lastReport.note}</li>}
            {!profile.difficultyNotes.length && !openReq.length && (!lastReport || lastReport.note === '특이사항 없음') && <li className="rounded-lg bg-ivory px-3 py-2">특이사항 없음 — 표준 체크리스트대로 진행</li>}
          </ul>
        </Card>
      )}

      {/* 사진 */}
      <div ref={photosRef}>
        <Card className={cx('p-4', !started && !isDone && 'opacity-60')}>
          <p className="mb-2.5 flex items-center justify-between text-[0.9rem] font-extrabold">
            <span><Camera size={15} className="mr-1 inline text-primary" /> 작업 전 · 후 사진</span>
            {!started && !isDone && <span className="text-[0.74rem] font-bold text-ink-faint">작업 시작 후</span>}
          </p>
          {started || isDone ? (
            <div className="grid grid-cols-2 gap-2.5">
              {(['before', 'after'] as const).map((kind) => (
                <PhotoSlot
                  key={kind}
                  kind={kind}
                  record={ws?.photos?.[kind] ?? (ws?.[kind === 'before' ? 'beforePhoto' : 'afterPhoto'] ? { at: '-', width: 0, height: 0, brightness: 0, sharpness: 0 } : undefined)}
                  otherHash={ws?.photos?.[kind === 'before' ? 'after' : 'before']?.hash}
                  exampleSrc={kind === 'before' ? ba.before : ba.after}
                  now={() => meta().now}
                  onSave={(photo) => { send({ type: 'setPhoto', scheduleId: job.id, kind, photo, meta: meta() }); toast(`${kind === 'before' ? '작업 전' : '작업 후'} 사진 저장${photo.flags ? ' — 경고 포함' : ''}${offlineNote}`) }}
                  onRetake={() => send({ type: 'setPhoto', scheduleId: job.id, kind, photo: null, meta: meta() })}
                />
              ))}
            </div>
          ) : <p className="text-[0.8rem] text-ink-faint">체크인 → 작업 시작 후 촬영할 수 있습니다.</p>}
        </Card>
      </div>

      {/* 체크리스트 */}
      <div ref={listRef}>
        <Card className={cx('p-4', !started && !isDone && 'opacity-60')}>
          <p className="mb-2 flex items-center justify-between text-[0.9rem] font-extrabold">
            <span><ClipboardCheck size={15} className="mr-1 inline text-primary" /> 체크리스트</span>
            <span className="tnum text-primary">{done + skippedN} / {CHECKLIST_TEMPLATE.length}{skippedN > 0 && <span className="text-[0.74rem] text-warning"> (제외 {skippedN})</span>}</span>
          </p>
          <ul className="space-y-1.5">
            {CHECKLIST_TEMPLATE.map((item) => {
              const on = checklist[item]
              const skip = skipped[item]
              return (
                <li key={item} className={cx('flex items-stretch overflow-hidden rounded-xl border', on ? 'border-success bg-success-soft' : skip ? 'border-warning/60 bg-warning-soft/60' : 'border-line bg-card')}>
                  <button
                    disabled={!started || isDone}
                    aria-pressed={on}
                    onClick={() => send({ type: 'toggleChecklist', scheduleId: job.id, item, meta: meta() })}
                    className={cx('flex min-h-[3.1rem] flex-1 items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.92rem] font-bold disabled:cursor-not-allowed', on ? 'text-success' : 'text-ink')}
                  >
                    <CheckCircle2 size={20} className={cx('shrink-0', !on && 'text-ink-faint/40')} />
                    <span className="min-w-0">
                      {item}
                      {skip && <span className="block text-[0.74rem] font-bold text-warning">수행 불가 — {skip}</span>}
                    </span>
                  </button>
                  {started && !isDone && !on && (
                    skip
                      ? <button onClick={() => send({ type: 'skipChecklist', scheduleId: job.id, item, reason: null, meta: meta() })} className="flex shrink-0 items-center gap-0.5 border-l border-line/70 px-3 text-[0.74rem] font-bold text-ink-soft"><Undo2 size={13} />되돌리기</button>
                      : <button onClick={() => setSkipItem(item)} className="shrink-0 border-l border-line/70 px-3 text-[0.74rem] font-bold text-ink-faint">수행 불가</button>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* 이슈 · 메모 */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold"><Wrench size={15} className="text-primary" /> 현장 이슈</p>
          {!isDone && ws?.checkinAt && <Btn size="sm" variant="outline" onClick={() => setIssueOpen(true)}><AlertTriangle size={13} className="mr-0.5 inline" />이슈 보고</Btn>}
        </div>
        {issues.length === 0
          ? <p className="text-[0.8rem] text-ink-faint">파손 · 누수 · 출입 불가 · 고객 추가 요청은 본사로 바로 보고하세요.</p>
          : (
            <ul className="space-y-1.5">
              {issues.map((i) => (
                <li key={i.id} className="rounded-lg bg-ivory px-3 py-2 text-[0.82rem]">
                  <span className="flex flex-wrap items-center gap-1.5"><b>{i.type}</b><Badge tone={i.severity === '긴급' ? 'danger' : 'warning'}>{i.severity}</Badge><StatusPill status={i.status} />{i.owner && <span className="text-[0.74rem] text-ink-faint">본사 {i.owner}</span>}</span>
                  <span className="mt-0.5 block text-ink-soft [overflow-wrap:anywhere]">{i.detail}</span>
                </li>
              ))}
            </ul>
          )}

        <div className="border-t border-line pt-3">
          <p className="mb-1.5 flex items-center justify-between text-[0.9rem] font-extrabold">
            <span><MessageSquareText size={15} className="mr-1 inline text-primary" />특이사항 메모</span>
            <span className={cx('text-[0.72rem] font-bold', memoState === 'typing' ? 'text-ink-faint' : net === 'online' ? 'text-success' : 'text-warning')} aria-live="polite">
              {memoState === 'typing' ? '입력 중…' : memo ? (net === 'online' ? '자동 저장됨' : '기기에 저장됨') : ''}
            </span>
          </p>
          <TextArea
            value={memo}
            onChange={(v) => { setMemo(v); setMemoState('typing') }}
            maxLength={MEMO_MAX}
            rows={memo.length > 160 ? 6 : 3}
            placeholder="고객 리포트에 그대로 전달됩니다 — 예) 대기실 유리 얼룩 재청소 완료"
          />
          {!isDone && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PHRASES.map((p) => (
                <button key={p} onClick={() => { setMemo((m) => (m.trim() ? `${m.trim()} · ${p}` : p).slice(0, MEMO_MAX)); setMemoState('typing') }}
                  className="rounded-full border border-line bg-card px-2.5 py-1 text-[0.74rem] font-bold text-ink-soft active:bg-mint">+ {p}</button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 다음 할 일 — 아래 고정 */}
      {cta && (
        <div className="fixed bottom-[calc(3.6rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-ivory via-ivory/90 to-transparent px-4 pb-2 pt-4">
          <button
            onClick={cta.run}
            className={cx(
              'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[1rem] font-extrabold shadow-pop transition-transform active:scale-[0.99]',
              cta.tone === 'success' ? 'bg-success text-white' : cta.tone === 'primary' ? 'bg-primary text-white' : 'border-2 border-primary bg-card text-primary-strong',
            )}
          >
            {cta.tone === 'success' ? <CheckCircle2 size={19} /> : !ws?.checkinAt ? <MapPin size={19} /> : !started ? <Play size={19} /> : <Clock size={18} />}
            {cta.label}
            {cta.sub && <span className="text-[0.74rem] font-bold opacity-70">· {cta.sub}</span>}
          </button>
        </div>
      )}

      <ReasonDialog
        open={!!skipItem} onClose={() => setSkipItem(null)}
        title={`수행 불가 — ${skipItem ?? ''}`} confirmLabel="사유 남기고 제외" presets={SKIP_PRESETS}
        desc="완료를 막지 않고, 사유가 본사와 고객 리포트에 함께 남습니다."
        onConfirm={(r) => { if (skipItem) { send({ type: 'skipChecklist', scheduleId: job.id, item: skipItem, reason: r, meta: meta() }); toast('제외 사유를 남겼습니다.', 'info') } }}
      />
      <IssueSheet
        open={issueOpen} onClose={() => setIssueOpen(false)} customerName={c.name}
        onSubmit={(d) => { send({ type: 'reportIssue', issue: { ...d, scheduleId: job.id, customerId: job.customerId }, meta: meta() }); toast(`본사에 이슈를 보고했습니다${offlineNote}`, d.severity === '긴급' ? 'warning' : 'success') }}
      />
      <Modal open={confirm} onClose={() => setConfirm(false)} title="작업 완료 보고">
        <dl className="space-y-2 text-[0.88rem]">
          {[
            ['현장', `${c.name} · ${job.service}`],
            ['시간', `체크인 ${ws?.checkinAt ?? '-'} → 완료 ${meta().now}`],
            ['체크리스트', `${done} / ${CHECKLIST_TEMPLATE.length} 수행${skippedN ? ` · 제외 ${skippedN} (${Object.values(skipped).join(', ')})` : ''}`],
            ['사진', [ws?.photos?.before?.flags?.length ? '작업 전 경고 있음' : '작업 전 정상', ws?.photos?.after?.flags?.length ? '작업 후 경고 있음' : '작업 후 정상'].join(' · ')],
            ['이슈', issues.length ? `${issues.length}건 보고 (${issues.map((i) => i.type).join(', ')})` : '없음'],
            ['메모', memo.trim() ? `${memo.trim().slice(0, 70)}${memo.trim().length > 70 ? `… (${memo.trim().length}자)` : ''}` : '특이사항 없음'],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-2"><dt className="font-bold text-ink-faint">{k}</dt><dd className="font-semibold [overflow-wrap:anywhere]">{v}</dd></div>
          ))}
        </dl>
        {net !== 'online' && <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-[0.8rem] font-bold text-warning">지금은 {net === 'offline' ? '오프라인' : '신호가 약합니다'} — 완료 기록은 기기에 저장되고 연결되면 자동 전송됩니다.</p>}
        <p className="mt-3 text-[0.8rem] text-ink-soft">완료하면 고객 리포트가 바로 발송되고{job.requestId ? ', 고객 요청도 완료로 바뀝니다' : ''}.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Btn variant="outline" size="lg" onClick={() => setConfirm(false)}>다시 확인</Btn>
          <Btn variant="success" size="lg" onClick={() => {
            if (memoState === 'typing') send({ type: 'setNote', scheduleId: job.id, note: memo })
            send({ type: 'completeWork', scheduleId: job.id, meta: meta() })
            setConfirm(false)
            toast(`작업 완료 — 고객 리포트가 생성되었습니다${offlineNote}`)
          }}>완료 보고</Btn>
        </div>
      </Modal>
    </div>
  )
}
