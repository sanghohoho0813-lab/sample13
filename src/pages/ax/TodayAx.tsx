import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCcw, TrendingUp, ClipboardX, ArrowRight, UserMinus } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, EmptyState } from '../../components/ui'
import { ActionLifecycle } from '../../components/ai'
import { cx } from '../../lib/utils'
import { useDemo } from '../../lib/data/store'

const ICONS = {
  danger: <AlertTriangle size={13} />,
  warning: <RefreshCcw size={13} />,
  success: <TrendingUp size={13} />,
  info: <ClipboardX size={13} />,
  neutral: <UserMinus size={13} />,
}

export default function TodayAx() {
  const { actions } = useDemo()
  const nav = useNavigate()
  const ids = ['A-01', 'A-02', 'A-03', 'A-04']
  const tracked = ids.length
  const done = actions.filter((a) => ids.includes(a.id) && a.status === '완료').length

  const cards = [
    { tone: 'danger' as const, badge: '방문지연 위험', title: '성수 B오피스', desc: '담당팀 이전 작업 32분 지연 — 예상 도착 15:47. 재배정 또는 고객 사전 안내가 필요합니다.', to: '/schedule?id=SC-14', link: '일정 보기', actionId: 'A-01' },
    { tone: 'warning' as const, badge: '재계약 사전관리', title: '라온메디컬센터', desc: '계약 종료 D-32 · 최근 60일 일정변경 3회 · 품질문의 2회. 이번 주 내 담당자 미팅을 권장합니다.', to: '/customers/C01', link: '고객 보기', actionId: 'A-02' },
    { tone: 'success' as const, badge: '추가서비스 제안', title: '에이원교육센터', desc: '유리 오염 특이사항 4회 반복 — 외부 유리 집중관리 제안 (예상 DEMO 85만원).', to: '/upsell', link: '매출 기회 보기', actionId: 'A-03' },
    { tone: 'info' as const, badge: '미완료 보고', title: '강남 C클리닉', desc: '08:30 작업의 완료 보고가 아직 제출되지 않았습니다. 체크리스트·사진 확인이 필요합니다.', to: '/sites/C04', link: '현장 보기', actionId: 'A-04' },
    { tone: 'neutral' as const, badge: '직원 결원', title: 'Clean Team G', desc: '신우철 결원 — 오늘 소독 일정 2건 단독 작업. 오후 지원 배치 검토가 필요합니다.', to: '/team', link: '팀 일정 보기' },
  ]

  return (
    <div className="fade-up">
      <PageHeader
        title="오늘의 AX"
        desc="AI가 오늘 실제로 행동해야 할 것을 우선순위로 정리했습니다."
        right={<DemoBadge />}
      />
      {/* 오늘 처리 진행률 — 끝낸 것과 남은 것을 한눈에 */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
        <p className="shrink-0 text-[0.9rem] font-extrabold">
          {done === tracked
            ? <span className="text-success">오늘 할 일을 모두 마쳤습니다</span>
            : <>오늘 할 일 <span className="tnum text-primary">{done}</span><span className="tnum text-ink-faint"> / {tracked}</span> 완료</>}
        </p>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={tracked} aria-label="오늘 할 일 완료">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${tracked ? (done / tracked) * 100 : 0}%` }} />
        </div>
      </div>
      {cards.length === 0 ? (
        <EmptyState title="현재 확인이 필요한 현장이 없습니다." desc="AI 위험 감지가 새 위험을 발견하면 이곳에 표시됩니다." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const action = c.actionId ? actions.find((a) => a.id === c.actionId) : undefined
            return (
              <Card key={c.title} className={cx('p-5 space-y-3 transition-opacity', action?.status === '완료' && 'opacity-60')}>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={c.tone}>{ICONS[c.tone]} {c.badge}</Badge>
                  {action && <span className="text-[0.7rem] font-bold text-ink-faint">{action.createdAt}</span>}
                </div>
                <p className="text-[1.15rem] font-extrabold">{c.title}</p>
                <p className="text-[0.88rem] leading-relaxed text-ink-soft">{c.desc}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <Btn size="sm" variant="outline" onClick={() => nav(c.to)}>{c.link} <ArrowRight size={13} className="inline" /></Btn>
                  {action && <ActionLifecycle actionId={action.id} status={action.status} compact />}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
