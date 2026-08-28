import { ScrollText, CheckCircle2 } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { ENGINE_LABEL } from '../../types'
import { nowDateShort } from '../../lib/utils'

export default function Evidence() {
  const { evidence } = useDemo()

  return (
    <div className="fade-up">
      <PageHeader
        title="AX Evidence Log"
        desc="AI 추천 → 사람의 결정 → 실행 → 결과가 시간순으로 기록됩니다. AX 도입 실증·정부지원 결과보고·경영기록의 근거가 되는 데이터입니다."
        right={<DemoBadge />}
      />
      {evidence.length === 0 ? (
        <EmptyState title="기록된 Evidence가 없습니다." />
      ) : (
        <Card tour="evidence" className="p-5">
          <ol className="relative space-y-5 border-l-2 border-line pl-6 ml-2">
            {evidence.map((e) => (
              <li key={e.id} className="relative">
                <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card ${e.result ? 'bg-success' : 'bg-aqua'}`} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tnum text-[0.8rem] font-extrabold text-primary">{e.date === 'TODAY' ? nowDateShort() : e.date} {e.time}</span>
                  <Badge tone="ai">{ENGINE_LABEL[e.engine]}</Badge>
                </div>
                <p className="mt-1 text-[0.92rem] font-semibold leading-relaxed">{e.text}</p>
                {e.result && (
                  <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-1.5 text-[0.82rem] font-bold text-success w-fit">
                    <CheckCircle2 size={14} /> Result — {e.result}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}
      <p className="mt-5 flex items-center gap-1.5 text-[0.76rem] text-ink-faint">
        <ScrollText size={13} /> Evidence는 AI 추천 성과 측정과 향후 모델 고도화의 학습 데이터가 됩니다. (현재 DEMO 기록)
      </p>
    </div>
  )
}
