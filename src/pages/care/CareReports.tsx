import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Camera, CheckCircle2, Clock, MapPin, Sparkles, Star, User } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Btn, EmptyState, TextArea } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { useDemo } from '../../lib/data/context'
import { SEED_REPORTS } from '../../lib/demo/intelligence'
import { CHECKLIST_TEMPLATE } from '../../lib/demo/operations'
import { beforeAfterFor, altOf } from '../../lib/demo/photos'
import { Photo } from '../../components/ui/Photo'
import { cx } from '../../lib/utils'
import type { ServiceReport } from '../../types'

/**
 * 작업 리포트 — 신뢰 중심 · 사진이 먼저
 * 현장에서 실제 찍은 사진 · 체크리스트(못 한 항목은 사유까지) · 특이사항 · 담당자 · 시각을 숨김없이 보여주고,
 * 고객 평가는 바로 본사 고객 건강도와 현장팀 리포트에 반영된다.
 */
export default function CareReports() {
  const { reports, issues } = useDemo()
  const [params] = useSearchParams()
  const focus = params.get('id')
  // 고객에게는 본인 리포트만 표시 (역할 기반 데이터 접근)
  const mine = [
    ...reports.filter((r) => r.customerId === CARE_CUSTOMER_ID),
    ...SEED_REPORTS.filter((r) => r.customerId === CARE_CUSTOMER_ID && !reports.some((x) => x.id === r.id)),
  ]

  return (
    <CareShell>
      <div className="fade-up">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[1.45rem] font-extrabold sm:text-[1.6rem]">작업 리포트</h1>
            <p className="mt-1 text-[0.88rem] text-ink-soft">방문마다 현장 사진 · 체크리스트 · 특이사항이 작업 직후 그대로 도착합니다.</p>
          </div>
          {mine.length > 0 && <span className="tnum shrink-0 rounded-full bg-card px-3 py-1 text-[0.8rem] font-bold text-ink-soft ring-1 ring-line">{mine.length}건</span>}
        </header>

        {mine.length === 0 ? (
          <div className="mt-6"><EmptyState title="아직 도착한 리포트가 없습니다." desc="다음 방문이 완료되면 이곳에 표시됩니다." /></div>
        ) : (
          <div className="mt-5 space-y-5">
            {mine.map((r) => <ReportCard key={r.id} r={r} focused={focus === r.id} issues={issues.filter((i) => (r.issueIds ?? []).includes(i.id) && i.customerVisible)} />)}
          </div>
        )}
        <p className="mt-5 text-center text-[0.72rem] text-ink-faint">본 화면에는 라온메디컬센터 리포트만 표시됩니다 (본인 데이터만 접근).</p>
      </div>
    </CareShell>
  )
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-ivory px-3 py-2.5">
      <dt className="flex items-center gap-1 text-[0.7rem] font-bold text-ink-faint">{icon}{label}</dt>
      <dd className="tnum mt-0.5 truncate text-[0.9rem] font-extrabold">{value}</dd>
    </div>
  )
}

function ReportCard({ r, focused, issues }: { r: ServiceReport; focused: boolean; issues: ReturnType<typeof useDemo>['issues'] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: 'start' }) }, [focused])
  const ba = beforeAfterFor(r.note + (r.nextRecommend ?? '') + (r.service ?? ''))
  const real = !!(r.photos?.before?.dataUrl || r.photos?.after?.dataUrl)
  const skipped = Object.entries(r.skipped ?? {})
  const pct = Math.round((r.itemsDone / Math.max(1, r.itemsTotal)) * 100)
  return (
    <div ref={ref} className="scroll-mt-24">
      <article className={cx('overflow-hidden rounded-3xl bg-card shadow-soft ring-1', focused ? 'ring-2 ring-primary' : 'ring-line/60')}>
        {/* 작업 전 / 후 — 화면을 이끄는 건 사진 */}
        <div className="grid grid-cols-2 gap-0.5 bg-line/60">
          {(['before', 'after'] as const).map((k) => {
            const tag = k === 'before' ? '작업 전' : '작업 후'
            const shot = r.photos?.[k]
            const src = k === 'before' ? ba.before : ba.after
            return (
              <figure key={k} className="relative aspect-[4/3] overflow-hidden bg-ivory">
                {shot?.dataUrl
                  ? <img src={shot.dataUrl} alt={`${tag} 현장 사진`} className="h-full w-full object-cover" />
                  : <Photo src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />}
                <figcaption className={cx('absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold tracking-wide text-white backdrop-blur-sm', k === 'before' ? 'bg-ink/65' : 'bg-primary/90')}>
                  {tag}{shot?.at && shot.at !== '-' ? ` · ${shot.at}` : ''}
                </figcaption>
              </figure>
            )
          })}
        </div>
        <p className="flex items-center justify-center gap-1 px-5 py-2 text-center text-[0.72rem] font-semibold text-ink-faint">
          <Camera size={12} /> {real ? '현장에서 촬영한 사진 (화질 자동 검사 통과)' : '대표 사진 (DEMO) — 실서비스에서는 현장 촬영 사진이 표시됩니다'}
        </p>

        <div className="space-y-4 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.78rem] font-bold text-ink-faint">{r.date} 방문</p>
              <h2 className="text-[1.15rem] font-extrabold leading-snug">{r.service ?? '정기관리'}</h2>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[0.78rem] font-extrabold text-success"><CheckCircle2 size={13} /> 완료 {r.completedAt}</span>
          </div>

          <dl className="grid grid-cols-3 gap-2">
            <Meta icon={<MapPin size={11} />} label="도착" value={r.checkinAt ?? '—'} />
            <Meta icon={<Clock size={11} />} label="완료" value={r.completedAt} />
            <Meta icon={<User size={11} />} label="담당" value={r.worker ?? r.team.replace('Clean ', '')} />
          </dl>

          {/* 체크리스트 — 못 한 항목도 사유와 함께 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[0.88rem] font-extrabold">체크리스트</p>
              <span className="tnum text-[0.8rem] font-bold text-ink-soft">{r.itemsDone}/{r.itemsTotal} 항목</span>
            </div>
            <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-ivory"><div className={cx('h-full rounded-full', skipped.length ? 'bg-warning' : 'bg-success')} style={{ width: `${pct}%` }} /></div>
            <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {CHECKLIST_TEMPLATE.map((item) => {
                const reason = r.skipped?.[item]
                return (
                  <li key={item} className={cx('flex items-start gap-1.5 text-[0.84rem]', reason ? 'text-warning' : 'text-ink-soft')}>
                    {reason ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />}
                    <span>{item}{reason && <b> — 미실시: {reason}</b>}</span>
                  </li>
                )
              })}
            </ul>
            {skipped.length > 0 && <p className="mt-1.5 text-[0.76rem] text-ink-faint">미실시 항목은 다음 방문 때 우선 처리합니다.</p>}
          </div>

          <div className="space-y-2">
            <p className="rounded-2xl bg-ivory px-4 py-3 text-[0.86rem] leading-relaxed [overflow-wrap:anywhere]"><b className="mb-0.5 block text-[0.76rem] text-ink-faint">특이사항</b>{r.note}</p>
            {issues.map((i) => (
              <p key={i.id} className="rounded-2xl bg-warning-soft/60 px-4 py-3 text-[0.86rem] leading-relaxed">
                <b>현장 보고 · {i.type}</b> — {i.detail} <span className="font-bold text-ink-soft">({i.status === '해결' ? '조치 완료' : `본사 ${i.status === '접수' ? '확인 중' : '조치 중'}`})</span>
              </p>
            ))}
            {r.nextRecommend && (
              <p className="flex items-center gap-1.5 rounded-2xl bg-ai-soft px-4 py-3 text-[0.86rem] font-bold text-ai-strong">
                <Sparkles size={14} /> 다음 관리 추천 — {r.nextRecommend}
              </p>
            )}
            {r.requestId && <p className="text-[0.8rem] font-bold text-primary">요청하신 {r.requestId} 작업 리포트입니다.</p>}
          </div>

          <Rating r={r} />
        </div>
      </article>
    </div>
  )
}

/** 고객 평가 — 1~5점 + 한 줄 의견. 남긴 평가는 본사 고객 건강도와 현장팀 리포트에 바로 반영된다 */
function Rating({ r }: { r: ServiceReport }) {
  const { rateReport } = useDemo()
  const toast = useToast()
  const [score, setScore] = useState(0)
  const [text, setText] = useState('')
  if (typeof r.rating === 'number') {
    return (
      <div className="rounded-2xl border border-line px-4 py-3">
        <p className="flex flex-wrap items-center gap-1 text-[0.86rem] font-extrabold">
          {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= r.rating! ? 'fill-current text-warning' : 'text-line'} />)}
          <span className="ml-1">평가해 주셔서 감사합니다</span>
        </p>
        {r.feedback && <p className="mt-1 text-[0.84rem] text-ink-soft">“{r.feedback}”</p>}
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-line px-4 py-3.5">
      <p className="text-[0.9rem] font-extrabold">이번 작업은 어떠셨나요?</p>
      <p className="text-[0.76rem] text-ink-faint">평가는 담당 팀장에게 바로 전달됩니다</p>
      <div role="radiogroup" aria-label="작업 평가" className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={score === n} aria-label={`${n}점`} onClick={() => setScore(n)} className="rounded-xl p-1.5 transition-transform hover:bg-ivory active:scale-90">
            <Star size={28} className={n <= score ? 'fill-current text-warning' : 'text-ink-faint/35'} />
          </button>
        ))}
      </div>
      {score > 0 && (
        <div className="fade-up mt-2 space-y-2">
          <TextArea value={text} onChange={setText} maxLength={200} rows={2} placeholder={score <= 3 ? '아쉬웠던 점을 알려주시면 다음 방문에 바로 반영합니다' : '한 줄 의견 (선택)'} />
          <Btn size="md" className="w-full sm:w-auto" onClick={() => { rateReport(r.id, score, text); toast(score <= 3 ? '의견을 담당자에게 전달했습니다.' : '평가해 주셔서 감사합니다.') }}>평가 보내기</Btn>
        </div>
      )}
    </div>
  )
}
