import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowRight, Send, Store, Sparkles, RefreshCcw, ChevronRight } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, StatusPill, StatTile } from '../../components/ui'
import { useToast } from '../../components/ui/toast-context'
import { WhyAIButton } from '../../components/ai'
import { Restricted } from '../../components/ops'
import { useDemo } from '../../lib/data/context'
import { customerById } from '../../lib/demo/company'
import { can } from '../../lib/ops/governance'
import { assessRenewal } from '../../lib/ops/renewal'
import { cx, fmtManwon } from '../../lib/utils'
import type { UpsellOpportunity } from '../../types'

const ORDER: Record<UpsellOpportunity['status'], number> = { 발견됨: 1, 제안됨: 2, 협의중: 0, 성사: 3, 보류: 4 }
// 영업 단계 — 왼쪽에서 오른쪽으로 진행. 보류는 흐름 밖에 따로
const STAGES: Array<UpsellOpportunity['status']> = ['발견됨', '제안됨', '협의중', '성사']

/**
 * 추가서비스 — 현장 기록(AI 발견)과 고객 직접 요청(포털)에서 온 매출 기회
 * 고객 요청에서 온 기회는 요청함의 견적 · 일정 확정으로 성사된다(요청 → 기회 → 일정 → 작업 → 리포트가 끊기지 않게).
 */
export default function Upsell() {
  const st = useDemo()
  const { upsell, setUpsellStatus, addEvidence, role } = st
  const nav = useNavigate()
  const toast = useToast()
  const allowed = can(role, 'upsell.update')
  const totalExpected = upsell.filter((u) => u.status !== '성사' && u.status !== '보류').reduce((a, u) => a + u.expectedRevenue, 0)
  const closed = upsell.filter((u) => u.status === '성사').reduce((a, u) => a + u.expectedRevenue, 0)
  const fromPortal = upsell.filter((u) => u.source === 'portal' && u.status !== '성사' && u.status !== '보류').length
  const [stage, setStage] = useState<UpsellOpportunity['status'] | '전체'>('전체')
  const list = [...upsell].filter((u) => stage === '전체' || u.status === stage).sort((a, b) => ORDER[a.status] - ORDER[b.status] || Number(b.source === 'portal') - Number(a.source === 'portal') || b.expectedRevenue - a.expectedRevenue)

  return (
    <div className="fade-up">
      <PageHeader
        title="추가서비스"
        desc="현장 기록에서 AI가 찾은 기회와 고객이 포털에서 직접 요청한 기회를 함께 관리합니다. 재계약이 가까운 고객은 묶음 재계약으로 제안합니다."
        right={<DemoBadge />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:max-w-2xl lg:grid-cols-3">
        <StatTile label="진행 중인 기회" value={fmtManwon(totalExpected)} />
        <StatTile label="성사" value={fmtManwon(closed)} tone="success" />
        <StatTile label="고객 직접 요청" value={`${fromPortal}건`} tone="ai" className="col-span-2 lg:col-span-1" />
      </div>

      {/* 영업 단계 — 단계별 건수 · 금액. 누르면 그 단계만 */}
      <div className="mb-4 overflow-x-auto pb-1">
        <div role="group" aria-label="영업 단계로 보기" className="flex min-w-max items-stretch gap-1">
          <button
            onClick={() => setStage('전체')}
            aria-pressed={stage === '전체'}
            className={cx('rounded-xl border px-3.5 py-2 text-left', stage === '전체' ? 'border-primary bg-primary text-white' : 'border-line bg-card hover:border-primary/50')}
          >
            <span className={cx('block text-[0.74rem] font-bold', stage === '전체' ? 'text-white/90' : 'text-ink-faint')}>전체</span>
            <span className="tnum block text-[0.95rem] font-extrabold">{upsell.length}건</span>
          </button>
          {[...STAGES, '보류' as const].map((sg, i) => {
            const items = upsell.filter((u) => u.status === sg)
            const sum = items.reduce((a, u) => a + u.expectedRevenue, 0)
            const on = stage === sg
            return (
              <div key={sg} className="flex items-center">
                {i > 0 && i < STAGES.length && <ChevronRight size={14} className="mx-0.5 shrink-0 text-ink-faint/60" aria-hidden="true" />}
                {i === STAGES.length && <span className="mx-1.5 h-8 w-px bg-line" aria-hidden="true" />}
                <button
                  onClick={() => setStage(on ? '전체' : sg)}
                  aria-pressed={on}
                  className={cx(
                    'min-w-[6.5rem] rounded-xl border px-3.5 py-2 text-left transition-colors',
                    on ? 'border-primary bg-primary text-white' : sg === '성사' ? 'border-success/30 bg-success-soft/60 hover:border-success' : 'border-line bg-card hover:border-primary/50',
                  )}
                >
                  <span className={cx('block text-[0.74rem] font-bold', on ? 'text-white/85' : 'text-ink-faint')}>{sg}</span>
                  <span className="tnum block text-[0.95rem] font-extrabold">{items.length}건 <span className={cx('text-[0.76rem] font-bold', on ? 'text-white/85' : sg === '성사' ? 'text-success' : 'text-ink-soft')}>{sum ? `${sum}만원` : ''}</span></span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {list.length === 0 && (
        <p className="mb-4 rounded-2xl border border-dashed border-line bg-card/60 px-5 py-8 text-center text-[0.9rem] font-bold text-ink-soft">
          '{stage}' 단계의 기회가 없습니다. <button onClick={() => setStage('전체')} className="ml-1 text-primary hover:underline">전체 보기</button>
        </p>
      )}

      <div data-tour="upsell" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((u) => {
          const c = customerById(u.customerId)
          const r = assessRenewal(u.customerId, st)
          const bundle = r && r.dday <= 90 && u.status !== '성사' && u.status !== '보류'
          const portal = u.source === 'portal' && u.requestId
          return (
            <Card key={u.id} className="flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                {portal
                  ? <Badge tone="ai"><Store size={11} /> 고객 요청 {u.requestId}</Badge>
                  : <Badge tone="success"><Sparkles size={11} /> AI 발견</Badge>}
                <StatusPill status={u.status} />
              </div>
              <button onClick={() => nav(`/customers/${u.customerId}`)} className="mt-2.5 text-left text-[1.05rem] font-extrabold hover:text-primary">{c?.name}</button>
              <div className="mt-2 space-y-1.5 text-[0.82rem]">
                <p><span className="font-bold text-ink-faint">현재</span> — {u.currentService}</p>
                <p><span className="font-bold text-ink-faint">발견 신호</span> — {u.signal}</p>
                <p className="rounded-lg bg-mint px-2.5 py-1.5 font-extrabold text-primary-strong">추천 · {u.recommendedService}</p>
                <p className="text-ink-soft">{u.reason}</p>
                {bundle && (
                  <p className="flex items-start gap-1.5 rounded-lg bg-warning-soft/70 px-2.5 py-1.5 font-bold text-warning">
                    <RefreshCcw size={13} className="mt-0.5 shrink-0" /> 재계약 D-{r!.dday} · 건강도 {r!.health} — 재계약과 묶어 제안
                  </p>
                )}
              </div>
              <p className="tnum mt-2.5 text-[1.1rem] font-extrabold text-success">{u.status === '성사' ? '확정' : '예상'} {u.expectedRevenue}만원 <span className="text-[0.7rem] font-bold text-ink-faint">DEMO</span></p>
              <p className="text-[0.76rem] text-ink-faint">담당 {u.owner ?? '미지정'}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3 [&:not(:first-child)]:mt-3">
                {!allowed ? <Restricted>매출 기회 단계 변경 권한 필요</Restricted> : portal && u.status !== '성사' && u.status !== '보류' ? (
                  <Btn size="sm" variant="ai" onClick={() => nav(`/requests?id=${u.requestId}`)}>요청에서 견적 · 일정 확정 <ArrowRight size={12} className="inline" /></Btn>
                ) : (
                  <>
                    {u.status === '발견됨' && (
                      <Btn size="sm" onClick={() => {
                        setUpsellStatus(u.id, '제안됨')
                        addEvidence('upsell', `${c?.name} — ${u.recommendedService} 고객 제안 발송`)
                        toast('고객에게 제안했습니다.', 'success')
                      }}><Send size={13} className="inline" /> 고객에게 제안</Btn>
                    )}
                    {u.status === '제안됨' && <Btn size="sm" variant="outline" onClick={() => { setUpsellStatus(u.id, '협의중'); toast('협의중으로 변경했습니다.', 'info') }}>협의 시작</Btn>}
                    {u.status === '협의중' && (
                      <Btn size="sm" variant="success" onClick={() => {
                        setUpsellStatus(u.id, '성사')
                        addEvidence('upsell', `${c?.name} — ${u.recommendedService} 계약 성사`, `추가매출 ${u.expectedRevenue}만원 (DEMO)`)
                        toast('추가서비스 성사! 실증 기록에 남겼습니다.')
                      }}>성사 처리</Btn>
                    )}
                    {['발견됨', '제안됨', '협의중'].includes(u.status) && <Btn size="sm" variant="ghost" onClick={() => { setUpsellStatus(u.id, '보류'); toast('보류했습니다 — 변경 이력에 남았습니다.', 'warning') }}>보류</Btn>}
                    {u.status === '보류' && <Btn size="sm" variant="outline" onClick={() => { setUpsellStatus(u.id, '발견됨'); toast('다시 검토 대상으로 돌렸습니다.', 'info') }}>다시 검토</Btn>}
                  </>
                )}
              </div>
              {!portal && <div className="mt-2"><WhyAIButton dataViewed={['현재 계약 서비스', '현장 특이사항 기록', '고객 요청 이력', '서비스 이용 패턴']} /></div>}
            </Card>
          )
        })}
      </div>
      <p className="mt-5 flex items-center gap-1.5 text-[0.76rem] text-ink-faint"><TrendingUp size={13} /> 성사 금액은 고객 건강도의 '이용 서비스' 요인과 재계약 전략에 바로 반영됩니다.</p>
    </div>
  )
}
