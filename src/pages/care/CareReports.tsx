import { Camera, ImageOff, Sparkles, CheckCircle2 } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Card, Badge, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { SEED_REPORTS } from '../../lib/demo/intelligence'

export default function CareReports() {
  const { reports } = useDemo()
  // 고객에게는 본인 리포트만 표시 (Role 기반 데이터 접근)
  const mine = [
    ...reports.filter((r) => r.customerId === CARE_CUSTOMER_ID),
    ...SEED_REPORTS.filter((r) => r.customerId === CARE_CUSTOMER_ID && !reports.some((x) => x.id === r.id)),
  ]

  return (
    <CareShell>
      <div className="fade-up">
        <h1 className="text-[1.5rem] font-extrabold">작업 리포트</h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">방문마다 체크리스트·사진·특이사항이 리포트로 정리되어 도착합니다.</p>

        {mine.length === 0 ? (
          <div className="mt-6"><EmptyState title="아직 도착한 리포트가 없습니다." desc="다음 방문이 완료되면 이곳에 표시됩니다." /></div>
        ) : (
          <div className="mt-5 space-y-4">
            {mine.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[1.05rem] font-extrabold">{r.date} 정기관리</p>
                  <Badge tone="success"><CheckCircle2 size={12} /> 완료 {r.completedAt}</Badge>
                </div>
                <p className="mt-1 text-[0.82rem] text-ink-soft">담당팀 {r.team} · 작업항목 <b className="tnum">{r.itemsDone} / {r.itemsTotal}</b></p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {['Before', 'After'].map((k) => (
                    <div key={k} className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl bg-ivory border border-line">
                      {k === 'After' ? <Camera size={20} className="text-primary" /> : <ImageOff size={20} className="text-ink-faint" />}
                      <p className="text-[0.76rem] font-bold text-ink-soft">{k} Photo</p>
                      <p className="text-[0.62rem] text-ink-faint">DEMO PLACEHOLDER</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-xl bg-ivory px-3.5 py-2.5 text-[0.85rem]"><b>특이사항</b> — {r.note}</p>
                {r.nextRecommend && (
                  <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-ai-soft px-3.5 py-2.5 text-[0.85rem] font-bold text-ai-strong">
                    <Sparkles size={14} /> 다음 관리 추천 — {r.nextRecommend}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
        <p className="mt-5 text-center text-[0.7rem] text-ink-faint">본 화면에는 {'라온메디컬센터'} 리포트만 표시됩니다 (본인 데이터만 접근 — RLS Preview).</p>
      </div>
    </CareShell>
  )
}
