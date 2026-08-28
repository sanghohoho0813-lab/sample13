import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCcw, TrendingUp, ClipboardX, ArrowRight, UserMinus } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, EmptyState } from '../../components/ui'
import { ActionLifecycle, AIReadyBadge } from '../../components/ai'
import { useDemo } from '../../lib/data/store'

const ICONS = {
  danger: <AlertTriangle size={19} />,
  warning: <RefreshCcw size={19} />,
  success: <TrendingUp size={19} />,
  info: <ClipboardX size={19} />,
  neutral: <UserMinus size={19} />,
}

export default function TodayAx() {
  const { actions } = useDemo()
  const nav = useNavigate()

  const cards = [
    { tone: 'danger' as const, badge: '방문지연 Risk', title: '성수 B오피스', desc: '담당팀 이전 작업 32분 지연 — 예상 도착 15:47. 재배정 또는 고객 사전 안내가 필요합니다.', to: '/schedule', actionId: 'A-01' },
    { tone: 'warning' as const, badge: '재계약 사전관리', title: '라온메디컬센터', desc: '계약 종료 D-32 · 최근 60일 일정변경 3회 · 품질문의 2회. 이번 주 내 담당자 미팅을 권장합니다.', to: '/customers/C01', actionId: 'A-02' },
    { tone: 'success' as const, badge: '추가서비스 제안', title: '에이원교육센터', desc: '유리 오염 특이사항 4회 반복 — 외부 유리 집중관리 제안 (예상 DEMO 85만원).', to: '/upsell', actionId: 'A-03' },
    { tone: 'info' as const, badge: '미완료 보고', title: '강남 C클리닉', desc: '08:30 작업의 완료 보고가 아직 제출되지 않았습니다. 체크리스트·사진 확인이 필요합니다.', to: '/sites/C04', actionId: 'A-04' },
    { tone: 'neutral' as const, badge: '직원 결원', title: 'Clean Team G', desc: '신우철 결원 — 오늘 소독 일정 2건 단독 작업. 오후 지원 배치 검토가 필요합니다.', to: '/team' },
  ]

  return (
    <div className="fade-up">
      <PageHeader
        title="오늘의 AX"
        desc="AI가 오늘 실제로 행동해야 할 것을 우선순위로 정리했습니다."
        right={<><AIReadyBadge /><DemoBadge /></>}
      />
      {cards.length === 0 ? (
        <EmptyState title="현재 확인이 필요한 현장이 없습니다." desc="AI Risk Radar가 새 위험을 발견하면 이곳에 표시됩니다." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const action = c.actionId ? actions.find((a) => a.id === c.actionId) : undefined
            return (
              <Card key={c.title} className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={c.tone}>{ICONS[c.tone]} {c.badge}</Badge>
                  {action && <span className="text-[0.7rem] font-bold text-ink-faint">{action.createdAt}</span>}
                </div>
                <p className="text-[1.15rem] font-extrabold">{c.title}</p>
                <p className="text-[0.88rem] leading-relaxed text-ink-soft">{c.desc}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <Btn size="sm" variant="outline" onClick={() => nav(c.to)}>상세보기 <ArrowRight size={13} className="inline" /></Btn>
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
