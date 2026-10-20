import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, Clock, Inbox, Store } from 'lucide-react'
import { Badge, Card, DemoBadge, EmptyState, Modal, PageHeader, StatusPill, Btn } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { REPLY_TARGET } from '../../lib/ops/requestSla'
import { useIsWide } from '../../lib/useMedia'
import { cx } from '../../lib/utils'
import type { CustomerRequest } from '../../types'
import RequestPanel from './RequestPanel'

type Filter = '처리 필요' | '진행 중' | '완료' | '반려' | '전체'
const TYPE_TONE = { 긴급방문: 'danger', 추가서비스: 'success', 일정변경: 'warning', 문의: 'info' } as const
const MATCH: Record<Filter, (r: CustomerRequest) => boolean> = {
  '처리 필요': (r) => r.status === '접수',
  '진행 중': (r) => r.status === '검토중' || r.status === '처리중',
  완료: (r) => r.status === '완료',
  반려: (r) => r.status === '반려',
  전체: () => true,
}
const filterOf = (r: CustomerRequest) => (Object.keys(MATCH) as Filter[]).find((f) => f !== '전체' && MATCH[f](r)) ?? '전체'
// 처리 필요 → 진행 중 → 완료 · 반려, 같은 단계에서는 긴급 방문을 맨 위로
const rank = (r: CustomerRequest) => ({ 접수: 0, 검토중: 1, 처리중: 2, 완료: 3, 반려: 4 }[r.status]) * 10 + (r.type === '긴급방문' ? 0 : 1)

/**
 * 요청 / 문의 — 처리 화면
 * 왼쪽 목록 · 오른쪽 처리 패널(모바일은 하단 시트). /requests?id=R-01 로 바로 열 수 있다.
 */
export default function Requests() {
  const { requests } = useDemo()
  const wide = useIsWide()
  const [params, setParams] = useSearchParams()
  const deepId = params.get('id')
  // 첫 탭 — 주소로 연 요청이 있으면 그 요청의 탭, 아니면 비어 있지 않은 첫 탭(처리 필요 → 진행 중 → 전체)
  const [filter, setFilter] = useState<Filter>(() => {
    const r = deepId ? requests.find((x) => x.id === deepId) : undefined
    if (r) return filterOf(r)
    return (['처리 필요', '진행 중'] as Filter[]).find((f) => requests.some(MATCH[f])) ?? '전체'
  })
  const list = requests.filter(MATCH[filter]).sort((a, b) => rank(a) - rank(b))
  const [selectedId, setSelectedId] = useState<string | null>(() => deepId ?? null)
  const [sheet, setSheet] = useState(() => !!deepId && !wide)
  useEffect(() => {
    if (!deepId) return
    const r = requests.find((x) => x.id === deepId)
    // 이미 요청함에 있을 때(전역 검색 등) 열어도 목록과 선택이 어긋나지 않게 탭도 맞춘다
    if (r) { setSelectedId(deepId); setFilter((f) => (MATCH[f](r) ? f : filterOf(r))); if (!wide) setSheet(true) }
    setParams({}, { replace: true })
  }, [deepId, requests, wide, setParams])

  const selected = requests.find((r) => r.id === selectedId) ?? (wide ? list[0] : undefined)
  const open = (id: string) => { setSelectedId(id); if (!wide) setSheet(true) }

  return (
    <div className="fade-up">
      <PageHeader
        title="요청 / 문의"
        desc="고객 플랫폼 요청이 바로 들어옵니다. 담당 지정 → 일정 확정 · 시간 변경 · 회신까지 여기서 처리하고, 모든 진행은 고객 화면에 같은 기록으로 보입니다."
        right={<DemoBadge />}
      />

      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="요청 상태" className="flex w-max gap-1 rounded-xl border border-line bg-card p-1">
          {(Object.keys(MATCH) as Filter[]).map((f) => {
            const n = requests.filter(MATCH[f]).length
            return (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[0.88rem] font-bold',
                filter === f ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary',
              )}>
                {f}
                <span className={cx('tnum rounded-full px-1.5 text-[0.74rem]', filter === f ? 'text-white/85' : f === '처리 필요' && n > 0 ? 'bg-danger-soft text-danger' : 'text-ink-faint')}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 오른쪽 처리 칸 — 처리 중인 요청이 있거나 목록이 있을 때만 (둘 다 없으면 빈 칸 두 개가 되지 않게) */}
      <div className={cx('grid items-start gap-5', (list.length > 0 || (wide && selected)) && 'xl:grid-cols-[minmax(320px,400px)_1fr]')}>
        <div data-tour="requests" className="space-y-2">
          {list.length === 0 ? (
            <EmptyState
              title={filter === '처리 필요' ? '새로 처리할 요청이 없습니다.' : '해당하는 요청이 없습니다.'}
              desc={filter === '처리 필요' ? '고객 플랫폼에서 요청이 들어오면 이곳에 표시됩니다.' : undefined}
              action={filter !== '전체' ? <Btn variant="outline" size="sm" onClick={() => setFilter('전체')}>전체 요청 보기</Btn> : undefined}
            />
          ) : list.map((r) => {
            const active = wide && selected?.id === r.id
            return (
              <button key={r.id} onClick={() => open(r.id)} aria-current={active ? 'true' : undefined}
                className={cx('flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors', active ? 'border-primary bg-mint/50' : 'border-line bg-card hover:border-primary/60', r.type === '긴급방문' && r.status !== '완료' && !active && 'border-danger/40')}>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
                    {r.fromPortal && <Store size={12} className="text-ai-strong" aria-label="고객 플랫폼" />}
                    <span className="text-[0.92rem] font-extrabold">{customerById(r.customerId)?.name}</span>
                  </span>
                  <span className="mt-1 block truncate text-[0.84rem] text-ink-soft">{r.detail}</span>
                  <span className="tnum mt-0.5 block text-[0.74rem] text-ink-faint">{r.createdAt} · 담당 {r.assignee ?? <span className="font-bold text-warning">미지정</span>}</span>
                  {/* 아직 고객에게 답하지 않은 요청 — 고객에게 약속한 회신 시간 */}
                  {(r.status === '접수' || (r.status === '검토중' && !r.reply)) && (
                    <span className={cx('mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.72rem] font-bold', r.type === '긴급방문' ? 'bg-danger-soft text-danger' : 'bg-ivory text-ink-soft')}>
                      <Clock size={11} /> 회신 약속 {REPLY_TARGET[r.type]} 이내
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1"><StatusPill status={r.status} />{!wide && <ChevronRight size={15} className="text-ink-faint" />}</span>
              </button>
            )
          })}
        </div>

        {wide && (list.length > 0 || selected) && (selected
          ? <Card className="p-5"><RequestPanel key={selected.id} r={selected} /></Card>
          : <EmptyState title="요청을 선택해주세요." />)}
      </div>

      {!wide && selected && (
        <Modal open={sheet} onClose={() => setSheet(false)} title={`${customerById(selected.customerId)?.name} · ${selected.type}`} wide>
          <RequestPanel key={selected.id} r={selected} />
        </Modal>
      )}
      <p className="mt-5 flex items-center gap-1.5 text-[0.78rem] text-ink-faint"><Inbox size={13} /> 문자 · 카카오톡 · 이메일 채널 연동은 연동 준비 상태입니다.</p>
    </div>
  )
}
