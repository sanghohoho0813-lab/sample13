import { Check, Minus, X, RotateCcw, Upload, FileSpreadsheet, Database, HelpCircle } from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge, SectionTitle, useToast } from '../../components/ui'
import { useDemo } from '../../lib/data/store'

const MATRIX: Array<{ item: string; ceo: 0 | 1 | 2; manager: 0 | 1 | 2; field: 0 | 1 | 2; customer: 0 | 1 | 2 }> = [
  { item: '전체 매출 / 수익성', ceo: 2, manager: 0, field: 0, customer: 0 },
  { item: '전체 일정 / 배정', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: '전체 고객 / 계약', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: '직원 / 팀 관리', ceo: 2, manager: 2, field: 0, customer: 0 },
  { item: 'AI 전략 (Retention·Profit)', ceo: 2, manager: 1, field: 0, customer: 0 },
  { item: '본인 일정 / 현장 업무', ceo: 2, manager: 2, field: 2, customer: 0 },
  { item: '체크인 / 체크리스트 / 사진', ceo: 1, manager: 2, field: 2, customer: 0 },
  { item: '본인 계약 / Service Report', ceo: 2, manager: 2, field: 0, customer: 2 },
  { item: '본인 요청 / 일정변경', ceo: 2, manager: 2, field: 0, customer: 2 },
  { item: 'AX Evidence / 설정', ceo: 2, manager: 0, field: 0, customer: 0 },
]

const Mark = ({ v }: { v: 0 | 1 | 2 }) =>
  v === 2 ? <Check size={17} className="mx-auto text-success" strokeWidth={3} />
  : v === 1 ? <Minus size={17} className="mx-auto text-warning" strokeWidth={3} />
  : <X size={16} className="mx-auto text-ink-faint/60" strokeWidth={3} />

export default function SettingsPage() {
  const { resetDemo, markTutorialSeen } = useDemo()
  const toast = useToast()

  return (
    <div className="fade-up">
      <PageHeader title="설정" desc="권한 구조(RLS Preview), 데이터 연결 준비 상태, 데모 관리를 확인합니다." right={<DemoBadge />} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <SectionTitle>Permission Matrix — 역할별 접근 (RLS Preview)</SectionTitle>
          <p className="mb-3 text-[0.82rem] text-ink-soft">
            RLS(사용자별로 볼 수 있는 데이터를 나누는 보안기능 <HelpCircle size={12} className="inline text-ink-faint" />)는
            실서비스에서 Supabase <code className="rounded bg-ivory px-1 text-[0.75rem]">profiles.role</code> + RLS Policy로 전환됩니다.
            지금은 Demo Role Switcher로 실제 화면이 달라지는 것을 체감할 수 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.84rem]">
              <thead>
                <tr className="border-b border-line bg-ivory text-[0.74rem] text-ink-faint">
                  <th className="px-3 py-2.5 text-left font-bold">항목</th>
                  {['대표', '관리자', '현장직원', '고객'].map((r) => <th key={r} className="px-3 py-2.5 font-bold whitespace-nowrap">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.item} className="border-b border-line/60">
                    <td className="px-3 py-2.5 font-bold">{row.item}</td>
                    <td className="px-3 py-2.5"><Mark v={row.ceo} /></td>
                    <td className="px-3 py-2.5"><Mark v={row.manager} /></td>
                    <td className="px-3 py-2.5"><Mark v={row.field} /></td>
                    <td className="px-3 py-2.5"><Mark v={row.customer} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex flex-wrap gap-3 text-[0.74rem] font-bold text-ink-faint">
            <span className="flex items-center gap-1"><Check size={13} className="text-success" /> 전체 접근</span>
            <span className="flex items-center gap-1"><Minus size={13} className="text-warning" /> 부분 접근</span>
            <span className="flex items-center gap-1"><X size={13} /> 접근 불가</span>
          </p>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>데이터 연결 (Data Intake Ready)</SectionTitle>
            <p className="mb-3 text-[0.82rem] text-ink-soft">실제 데이터가 준비되면 UI 재작성 없이 Data Layer만 교체합니다.</p>
            <div className="space-y-2">
              <Btn variant="outline" size="sm" className="w-full justify-center" onClick={() => toast('CSV 가져오기는 실서비스 전환 시 활성화됩니다. (Integration Ready)', 'info')}>
                <Upload size={14} className="mr-1 inline" /> CSV 가져오기
              </Btn>
              <Btn variant="outline" size="sm" className="w-full justify-center" onClick={() => toast('고객·일정·직원·계약 샘플 필드 구조가 준비되어 있습니다. (docs/PROJECT_SPEC.md)', 'info')}>
                <FileSpreadsheet size={14} className="mr-1 inline" /> 샘플 파일 / 필드 구조 보기
              </Btn>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[0.78rem]">
              {[
                ['Demo Repository', 'ACTIVE', 'success'],
                ['Supabase (Auth·DB·RLS)', 'READY', 'neutral'],
                ['지도 / GPS / Geofence', 'READY', 'neutral'],
                ['문자 / 알림 API', 'READY', 'neutral'],
                ['LLM API (GPT / Claude)', 'AI READY', 'ai'],
              ].map(([l, s, t]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-ink-soft"><Database size={12} /> {l}</span>
                  <Badge tone={t as 'success'}>{s}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>데모 관리</SectionTitle>
            <div className="space-y-2">
              <Btn variant="outline" size="sm" className="w-full justify-center" onClick={() => {
                if (confirm('Action 상태·배정·고객 요청·튜토리얼을 초기 시연 상태로 되돌릴까요?')) { resetDemo(); toast('데모를 초기화했습니다.') }
              }}>
                <RotateCcw size={14} className="mr-1 inline" /> 데모 초기화
              </Btn>
              <Btn variant="ghost" size="sm" className="w-full justify-center" onClick={() => {
                try { localStorage.removeItem('cleanway-ax-demo-v1') } catch { /* noop */ }
                resetDemo(); markTutorialSeen()
                toast('튜토리얼을 다음 새로고침에 다시 볼 수 있습니다.', 'info')
                setTimeout(() => window.location.reload(), 600)
              }}>튜토리얼 다시 보기</Btn>
            </div>
            <p className="mt-3 text-[0.74rem] leading-relaxed text-ink-faint">
              본 시스템은 미래AI랩 Website Reference MVP로, 모든 데이터는 가상의 Sample Data입니다. 실제 회사·고객 정보가 아닙니다.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
