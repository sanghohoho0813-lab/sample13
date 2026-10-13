import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Camera, CheckCircle2, Clock, Sparkles, Star, User } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Badge, Btn, Card, EmptyState, TextArea } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { useDemo } from '../../lib/data/context'
import { SEED_REPORTS } from '../../lib/demo/intelligence'
import { CHECKLIST_TEMPLATE } from '../../lib/demo/operations'
import { beforeAfterFor, altOf } from '../../lib/demo/photos'
import { Photo } from '../../components/ui/Photo'
import { cx } from '../../lib/utils'
import type { ServiceReport } from '../../types'

/**
 * 작업 리포트 — 신뢰 중심
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
        <h1 className="text-[1.5rem] font-extrabold">작업 리포트</h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">방문마다 현장 사진 · 체크리스트 · 특이사항이 작업 직후 그대로 도착합니다.</p>

        {mine.length === 0 ? (
          <div className="mt-6"><EmptyState title="아직 도착한 리포트가 없습니다." desc="다음 방문이 완료되면 이곳에 표시됩니다." /></div>
        ) : (
          <div className="mt-5 space-y-4">
            {mine.map((r) => <ReportCard key={r.id} r={r} focused={focus === r.id} issues={issues.filter((i) => (r.issueIds ?? []).includes(i.id) && i.customerVisible)} />)}
          </div>
        )}
        <p className="mt-5 text-center text-[0.7rem] text-ink-faint">본 화면에는 라온메디컬센터 리포트만 표시됩니다 (본인 데이터만 접근).</p>
      </div>
    </CareShell>
  )
}

function ReportCard({ r, focused, issues }: { r: ServiceReport; focused: boolean; issues: ReturnType<typeof useDemo>['issues'] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: 'start' }) }, [focused])
  const ba = beforeAfterFor(r.note + (r.nextRecommend ?? '') + (r.service ?? ''))
  const real = !!(r.photos?.before?.dataUrl || r.photos?.after?.dataUrl)
  const skipped = Object.entries(r.skipped ?? {})
  return (
    <div ref={ref} className="scroll-mt-24">
      <Card className={cx('overflow-hidden', focused && 'ring-2 ring-primary')}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <p className="text-[1.05rem] font-extrabold">{r.date} {r.service ?? '정기관리'}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-[0.82rem] text-ink-soft">
              <span><User size={12} className="mr-0.5 inline" />{r.worker ?? r.team}</span>
              <span className="tnum"><Clock size={12} className="mr-0.5 inline" />{r.checkinAt ? `${r.checkinAt} 도착 → ` : ''}{r.completedAt} 완료</span>
            </p>
          </div>
          <Badge tone="success"><CheckCircle2 size={12} /> 작업 {r.itemsDone}/{r.itemsTotal}</Badge>
        </div>

        {/* 작업 전 / 후 */}
        <div className="grid grid-cols-2">
          {(['before', 'after'] as const).map((k) => {
            const tag = k === 'before' ? '작업 전' : '작업 후'
            const shot = r.photos?.[k]
            const src = k === 'before' ? ba.before : ba.after
            return (
              <figure key={k} className="relative aspect-[4/3] overflow-hidden bg-ivory">
                {shot?.dataUrl
                  ? <img src={shot.dataUrl} alt={`${tag} 현장 사진`} className="h-full w-full object-cover" />
                  : <Photo src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />}
                <figcaption className={cx('absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[0.72rem] font-extrabold tracking-wide text-white', k === 'before' ? 'bg-ink/75' : 'bg-primary')}>
                  {tag}{shot?.at && shot.at !== '-' ? ` · ${shot.at}` : ''}
                </figcaption>
              </figure>
            )
          })}
        </div>
        <p className="flex items-center justify-center gap-1 border-b border-line px-5 py-2 text-center text-[0.74rem] font-semibold text-ink-faint">
          <Camera size={12} /> {real ? '현장에서 촬영한 사진 (화질 자동 검사 통과)' : '대표 사진 (DEMO) — 실서비스에서는 현장 촬영 사진이 표시됩니다'}
        </p>

        <div className="space-y-2.5 p-5">
          {/* 체크리스트 — 못 한 항목도 사유와 함께 */}
          <div>
            <p className="mb-1.5 text-[0.84rem] font-extrabold">체크리스트</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {CHECKLIST_TEMPLATE.map((item) => {
                const reason = r.skipped?.[item]
                return (
                  <li key={item} className={cx('flex items-start gap-1.5 text-[0.82rem]', reason ? 'text-warning' : 'text-ink-soft')}>
                    {reason ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />}
                    <span>{item}{reason && <b> — 미실시: {reason}</b>}</span>
                  </li>
                )
              })}
            </ul>
            {skipped.length > 0 && <p className="mt-1.5 text-[0.76rem] text-ink-faint">미실시 항목은 다음 방문 때 우선 처리합니다.</p>}
          </div>

          <p className="rounded-xl bg-ivory px-3.5 py-2.5 text-[0.85rem] [overflow-wrap:anywhere]"><b>특이사항</b> — {r.note}</p>
          {issues.map((i) => (
            <p key={i.id} className="rounded-xl bg-warning-soft/60 px-3.5 py-2.5 text-[0.85rem]">
              <b>현장 보고 · {i.type}</b> — {i.detail} <span className="font-bold text-ink-soft">({i.status === '해결' ? '조치 완료' : `본사 ${i.status === '접수' ? '확인 중' : '조치 중'}`})</span>
            </p>
          ))}
          {r.nextRecommend && (
            <p className="flex items-center gap-1.5 rounded-xl bg-ai-soft px-3.5 py-2.5 text-[0.85rem] font-bold text-ai-strong">
              <Sparkles size={14} /> 다음 관리 추천 — {r.nextRecommend}
            </p>
          )}
          {r.requestId && <p className="text-[0.8rem] font-bold text-primary">요청하신 {r.requestId} 작업 리포트입니다.</p>}

          <Rating r={r} />
        </div>
      </Card>
    </div>
  )
}

/** 고객 평가 — 1~5점 + 한 줄 의견. 남긴 평가는 본사 고객 건강도와 현장팀 리포트에 바로 반영된다 */
function Rating({ r }: { r: ServiceReport }) {
  const { rateReport } = useDemo()
  const toast = useToast()
  const [score, setScore] = useState(0)
  const [text, setText] = useState('')
  // 시드 리포트(이전 방문)는 상태에 있을 때만 평가 가능
  if (typeof r.rating === 'number') {
    return (
      <div className="rounded-xl border border-line px-3.5 py-2.5">
        <p className="flex items-center gap-1 text-[0.86rem] font-extrabold">
          {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} className={n <= r.rating! ? 'fill-current text-warning' : 'text-line'} />)}
          <span className="ml-1">평가해 주셔서 감사합니다</span>
        </p>
        {r.feedback && <p className="mt-1 text-[0.82rem] text-ink-soft">“{r.feedback}”</p>}
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-line px-3.5 py-3">
      <p className="text-[0.86rem] font-extrabold">이번 작업은 어떠셨나요?</p>
      <div role="radiogroup" aria-label="작업 평가" className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={score === n} aria-label={`${n}점`} onClick={() => setScore(n)} className="rounded-lg p-1.5 hover:bg-ivory">
            <Star size={24} className={n <= score ? 'fill-current text-warning' : 'text-ink-faint/40'} />
          </button>
        ))}
      </div>
      {score > 0 && (
        <div className="mt-2 space-y-2">
          <TextArea value={text} onChange={setText} maxLength={200} rows={2} placeholder={score <= 3 ? '아쉬웠던 점을 알려주시면 다음 방문에 바로 반영합니다' : '한 줄 의견 (선택)'} />
          <Btn size="sm" onClick={() => { rateReport(r.id, score, text); toast(score <= 3 ? '의견을 담당자에게 전달했습니다.' : '평가해 주셔서 감사합니다.') }}>평가 보내기</Btn>
        </div>
      )}
    </div>
  )
}
