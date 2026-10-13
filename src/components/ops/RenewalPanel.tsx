// 재계약 판단 — 이탈 위험 5요인 · 좋은 점 / 살펴볼 점 · 재계약 전략 · 예상 손실
import { Lock } from 'lucide-react'
import { Card, SectionTitle, StatusPill } from '../ui'
import { ScoreBar } from '.'
import { RISK_WEIGHTS, type RenewalAssessment } from '../../lib/ops/renewal'
import { cx } from '../../lib/utils'
import { toneBg } from '../../lib/tone'

export function HealthGauge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div className={cx('relative flex shrink-0 items-center justify-center', size === 'sm' ? 'h-14 w-14' : 'h-28 w-28')}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * 264} 264`} />
      </svg>
      <span className={cx('tnum absolute font-extrabold', size === 'sm' ? 'text-[0.95rem]' : 'text-[1.5rem]')} aria-label={`건강도 ${score}점`}>{score}</span>
    </div>
  )
}

export default function RenewalPanel({ a, showMoney, tour }: { a: RenewalAssessment; showMoney: boolean; tour?: string }) {
  // 단가 재협의는 수익성 근거가 필요해 대표에게만 보인다
  const strategy = a.strategy.filter((s) => showMoney || s.title !== '범위 · 단가 재협의')
  return (
    <Card tour={tour} className="p-5">
      <SectionTitle right={<StatusPill status={a.status} />}>고객 건강도 · 재계약 판단</SectionTitle>
      <div className="flex flex-wrap items-center gap-5">
        <HealthGauge score={a.health} />
        <div className="min-w-[240px] flex-1 space-y-1.5">
          <p className="text-[0.84rem] text-ink-soft">이탈 위험 <b className="tnum text-ink">{a.churnRisk}</b> = 5개 요인 가중 합 (건강도 = 100 − 위험)</p>
          {a.factors.map((f) => (
            <div key={f.key} className="grid grid-cols-[6.2rem_1fr_2rem] items-center gap-x-2">
              <span className="text-[0.78rem] font-bold text-ink-soft">{f.label} <span className="font-semibold text-ink-faint">{RISK_WEIGHTS[f.key]}%</span></span>
              <ScoreBar score={f.risk} tone={f.risk >= 60 ? 'danger' : f.risk >= 30 ? 'warning' : 'brand'} />
              <span className="tnum text-right text-[0.76rem] font-extrabold">{f.risk}</span>
              <span className="col-span-3 -mt-0.5 text-[0.74rem] leading-snug text-ink-faint sm:col-span-2 sm:col-start-2">{f.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[0.78rem] font-extrabold text-success">좋은 점</p>
          {a.positives.length === 0 ? <p className="text-[0.82rem] text-ink-faint">—</p> :
            <ul className="space-y-1">{a.positives.map((p) => <li key={p} className="flex gap-1.5 text-[0.82rem] text-ink-soft"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />{p}</li>)}</ul>}
        </div>
        <div>
          <p className="mb-1.5 text-[0.78rem] font-extrabold text-warning">살펴볼 점</p>
          {a.watch.length === 0 ? <p className="text-[0.82rem] text-ink-faint">관찰 항목 없음</p> :
            <ul className="space-y-1">{a.watch.filter((w) => showMoney || !w.includes('마진')).map((p) => <li key={p} className="flex gap-1.5 text-[0.82rem] text-ink-soft"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />{p}</li>)}</ul>}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3.5">
        <p className="mb-2 text-[0.84rem] font-extrabold">재계약 전략 <span className="text-[0.74rem] font-bold text-ink-faint">— 위험 · 수익성 · 추가서비스를 함께 보고 정함</span></p>
        <ol className="space-y-1.5">
          {strategy.length === 0 && <li className="rounded-xl bg-ivory px-3.5 py-2.5 text-[0.84rem] text-ink-soft"><Lock size={12} className="mr-1 inline" />재계약 조건은 수익성 검토가 필요합니다 — 대표 권한에서 확인</li>}
          {strategy.map((s, i) => (
            <li key={s.title} className={cx('rounded-xl px-3.5 py-2.5', i === 0 ? toneBg[s.tone] : 'bg-ivory')}>
              <p className={cx('text-[0.88rem] font-extrabold', i !== 0 && 'text-ink')}>{i + 1}. {s.title}</p>
              <p className="mt-0.5 text-[0.8rem] text-ink-soft">{s.why}</p>
            </li>
          ))}
        </ol>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
          <div className="rounded-xl bg-ivory px-2 py-2"><dt className="text-[0.7rem] font-bold text-ink-faint">계약 종료</dt><dd className="tnum font-extrabold">D-{a.dday}</dd></div>
          <div className="rounded-xl bg-ivory px-2 py-2"><dt className="text-[0.7rem] font-bold text-ink-faint">이탈 시 예상 손실</dt><dd className="tnum font-extrabold text-danger">{a.expectedLoss.toLocaleString()}만원</dd></div>
          <div className="col-span-2 rounded-xl bg-ivory px-2 py-2 sm:col-span-1">
            <dt className="text-[0.7rem] font-bold text-ink-faint">기여마진</dt>
            <dd className="tnum font-extrabold">{showMoney ? (a.margin ? `${a.margin.pct}% · ${a.margin.grade}` : '—') : <span className="inline-flex items-center gap-1 text-ink-faint"><Lock size={12} />대표 전용</span>}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
