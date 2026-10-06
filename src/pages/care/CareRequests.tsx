import { useState } from 'react'
import { PlusCircle, RefreshCcw, Siren, MessageCircle } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import RequestSheet from './RequestSheet'
import { Card, Badge, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { cx } from '../../lib/utils'
import type { RequestType } from '../../types'

const STEPS = ['접수', '처리중', '완료'] as const
const TYPE_TONE = { 긴급방문: 'danger', 추가서비스: 'success', 일정변경: 'warning', 문의: 'info' } as const

export default function CareRequests() {
  const { requests } = useDemo()
  const [sheet, setSheet] = useState<RequestType | null>(null)
  const [filter, setFilter] = useState<'진행' | '완료'>('진행')
  const mine = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)
  const open = mine.filter((r) => r.status !== '완료')
  const done = mine.filter((r) => r.status === '완료')
  const list = filter === '진행' ? open : done

  return (
    <CareShell>
      <div className="fade-up space-y-5">
        <div>
          <h1 className="text-[1.5rem] font-extrabold">요청 · 문의</h1>
          <p className="mt-1 text-[0.9rem] text-ink-soft">보내신 요청의 처리 상태를 확인하고, 새 요청을 보낼 수 있습니다.</p>
        </div>

        {/* 새 요청 — 홈으로 돌아가지 않고 여기서 바로 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ['추가서비스', '추가서비스', <PlusCircle key="i" size={17} />],
            ['일정변경', '일정 변경', <RefreshCcw key="i" size={17} />],
            ['긴급방문', '긴급 방문', <Siren key="i" size={17} />],
            ['문의', '담당자 문의', <MessageCircle key="i" size={17} />],
          ] as Array<[RequestType, string, React.ReactNode]>).map(([t, label, icon]) => (
            <button key={t} onClick={() => setSheet(t)} className={cx(
              'flex items-center justify-center gap-1.5 rounded-xl border bg-card px-3 py-3 text-[0.88rem] font-bold transition-colors',
              t === '긴급방문' ? 'border-danger/30 text-danger hover:border-danger' : 'border-line text-ink hover:border-primary hover:text-primary',
            )}>
              {icon}{label}
            </button>
          ))}
        </div>

        <div role="tablist" className="flex w-fit gap-1 rounded-xl border border-line bg-card p-1">
          {(['진행', '완료'] as const).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
              'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[0.88rem] font-bold',
              filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary',
            )}>
              {f === '진행' ? '진행 중' : '완료'}
              <span className={cx('tnum text-[0.76rem]', filter === f ? 'text-white/80' : 'text-ink-faint')}>{f === '진행' ? open.length : done.length}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            title={filter === '진행' ? '처리 중인 요청이 없습니다.' : '완료된 요청이 없습니다.'}
            desc={filter === '진행' ? '위의 버튼으로 필요한 요청을 보내주세요.' : undefined}
          />
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const cur = STEPS.indexOf(r.status)
              return (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
                    <span className="tnum text-[0.78rem] font-bold text-ink-faint">{r.createdAt}</span>
                  </div>
                  <p className="mt-2 text-[0.96rem] font-bold leading-relaxed">{r.detail}</p>
                  {/* 처리 단계 — 지금 어디까지 왔는지 한 줄로 */}
                  <ol className="mt-3.5 flex items-center gap-2" aria-label={`처리 단계: ${r.status}`}>
                    {STEPS.map((step, i) => (
                      <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
                        <span className={cx('flex items-center gap-1 text-[0.8rem] font-bold', i <= cur ? 'text-primary' : 'text-ink-faint')}>
                          <span className={cx('h-2.5 w-2.5 rounded-full', i <= cur ? 'bg-primary' : 'bg-line')} />{step}
                        </span>
                        {i < STEPS.length - 1 && <span className={cx('h-0.5 flex-1 rounded-full', i < cur ? 'bg-primary' : 'bg-line')} />}
                      </li>
                    ))}
                  </ol>
                </Card>
              )
            })}
          </div>
        )}
        <p className="text-center text-[0.78rem] leading-relaxed text-ink-faint">
          요청은 클린웨이 운영화면(AX)에 실시간 접수되어 담당자가 확인합니다.
        </p>
      </div>
      <RequestSheet type={sheet} onClose={() => setSheet(null)} />
    </CareShell>
  )
}
