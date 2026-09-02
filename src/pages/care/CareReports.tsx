import { Sparkles, CheckCircle2 } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Card, Badge, EmptyState } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { SEED_REPORTS } from '../../lib/demo/intelligence'
import { beforeAfterFor, altOf } from '../../lib/demo/photos'

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
            {mine.map((r) => {
              const ba = beforeAfterFor(r.note + (r.nextRecommend ?? ''))
              return (
                <Card key={r.id} className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
                    <div>
                      <p className="text-[1.05rem] font-extrabold">{r.date} 정기관리</p>
                      <p className="mt-0.5 text-[0.82rem] text-ink-soft">담당팀 {r.team} · 작업항목 <b className="tnum">{r.itemsDone} / {r.itemsTotal}</b></p>
                    </div>
                    <Badge tone="success"><CheckCircle2 size={12} /> 완료 {r.completedAt}</Badge>
                  </div>

                  {/* Before / After — 실제 현장 사진 */}
                  <div className="grid grid-cols-2">
                    {([['BEFORE', ba.before], ['AFTER', ba.after]] as const).map(([tag, src]) => (
                      <figure key={tag} className="relative aspect-[4/3] overflow-hidden bg-ivory">
                        <img src={src} alt={altOf(src)} width={1448} height={1086} loading="lazy" className="h-full w-full object-cover" />
                        <figcaption className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[0.68rem] font-extrabold tracking-wide ${
                          tag === 'BEFORE' ? 'bg-ink/75 text-white' : 'bg-primary text-white'
                        }`}>{tag}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="border-b border-line px-5 py-2 text-center text-[0.74rem] font-semibold text-ink-faint">
                    {ba.subject} · 작업 전 / 후
                  </p>

                  <div className="p-5">
                    <p className="rounded-xl bg-ivory px-3.5 py-2.5 text-[0.85rem]"><b>특이사항</b> — {r.note}</p>
                    {r.nextRecommend && (
                      <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-ai-soft px-3.5 py-2.5 text-[0.85rem] font-bold text-ai-strong">
                        <Sparkles size={14} /> 다음 관리 추천 — {r.nextRecommend}
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        <p className="mt-5 text-center text-[0.7rem] text-ink-faint">본 화면에는 라온메디컬센터 리포트만 표시됩니다 (본인 데이터만 접근 — RLS Preview).</p>
      </div>
    </CareShell>
  )
}
