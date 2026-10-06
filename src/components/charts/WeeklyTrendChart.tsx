import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, type TooltipProps } from 'recharts'
import { WEEKLY_TREND } from '../../lib/demo/intelligence'

/**
 * 주간 작업 추이 — recharts(약 106KB gzip)는 이 파일에만 있어 대시보드 본문보다 늦게 받아도 된다.
 * 선 색은 CSS 변수로 지정해 테마(6종)를 바꾸면 차트도 같이 바뀐다.
 */
const SERIES = [
  { key: '예정', color: 'var(--color-aqua)', width: 2.5 },
  { key: '완료', color: 'var(--color-primary)', width: 2.5 },
  { key: '지연', color: 'var(--color-danger)', width: 2 },
] as const

function TrendTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 shadow-pop">
      <p className="mb-1 text-[0.78rem] font-extrabold text-ink">{label}요일</p>
      {payload.map((p) => (
        <p key={p.dataKey as string} className="flex items-center gap-2 text-[0.78rem] font-semibold text-ink-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey}<span className="tnum ml-auto pl-3 font-extrabold text-ink">{p.value}건</span>
        </p>
      ))}
    </div>
  )
}

export default function WeeklyTrendChart() {
  const done = WEEKLY_TREND.reduce((a, d) => a + d.완료, 0)
  const late = WEEKLY_TREND.reduce((a, d) => a + d.지연, 0)
  return (
    <div role="img" aria-label={`최근 7일 작업 추이 — 완료 ${done}건, 지연 ${late}건`} className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={WEEKLY_TREND} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="3 4" />
          <XAxis dataKey="day" tick={{ fontSize: 13, fontWeight: 700, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--color-line)', strokeWidth: 1.5 }} />
          <Legend iconType="circle" iconSize={9} formatter={(v) => <span className="text-[0.8rem] font-semibold text-ink-soft">{v}</span>} />
          {SERIES.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={s.width} dot={{ r: 3, fill: s.color }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
