import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { Card, PageHeader, Badge, DemoBadge } from '../../components/ui'
import { COMPANY } from '../../lib/demo/company'
import type { ReactNode } from 'react'

function Story({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <p className="tnum text-[0.8rem] font-extrabold tracking-[0.2em] text-champagne">{no}</p>
      <h2 className="mt-1 text-[1.35rem] font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink">{children}</div>
    </Card>
  )
}

const Chip = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'danger' | 'success' }) => (
  <span className={{
    neutral: 'rounded-lg bg-ivory px-3 py-1.5 text-[0.82rem] font-bold text-ink-soft',
    brand: 'rounded-lg bg-mint px-3 py-1.5 text-[0.82rem] font-bold text-primary-strong',
    danger: 'rounded-lg bg-danger-soft px-3 py-1.5 text-[0.82rem] font-bold text-danger',
    success: 'rounded-lg bg-success-soft px-3 py-1.5 text-[0.82rem] font-bold text-success',
  }[tone]}>{children}</span>
)

const FlowRow = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {items.map((x, i) => (
      <span key={x} className="flex items-center gap-1.5">
        <Chip tone="brand">{x}</Chip>
        {i < items.length - 1 && <ArrowRight size={14} className="text-ink-faint shrink-0" />}
      </span>
    ))}
  </div>
)

export default function WhyAx() {
  return (
    <div className="fade-up mx-auto max-w-4xl">
      <PageHeader
        title="기획의도 — Why Service Intelligence AX"
        desc="클린웨이파트너스가 왜 지금 AX를 도입해야 하는지, 무엇이 달라지는지에 대한 이야기입니다."
        right={<DemoBadge label="가상 회사 · DEMO" />}
      />
      <div className="space-y-5">
        <Story no="01" title="클린웨이파트너스의 현재">
          <p>클린웨이파트너스는 기업 사무실·병의원·학원·상가·중소형 빌딩을 대상으로 정기청소와 시설관리를 제공하는 현장 서비스 회사입니다.</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[['연매출', COMPANY.annualRevenue], ['임직원·현장인력', `${COMPANY.headcount}명`], ['정기관리 고객사', `${COMPANY.regularCustomers}곳`], ['월 정기 작업', `약 ${COMPANY.monthlyRegularJobs}건`]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-ivory p-3 text-center">
                <p className="text-[0.72rem] font-bold text-ink-faint">{l}</p>
                <p className="tnum mt-0.5 text-[1.1rem] font-extrabold text-primary">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.78rem] text-ink-faint">모든 수치는 가상의 Demo Data입니다.</p>
        </Story>

        <Story no="02" title="현장이 늘수록 복잡해지는 이유">
          <p>고객사 30곳까지는 팀장의 기억과 단톡방으로 운영이 가능했습니다. 하지만 76곳, 월 520건이 되면서 <b>일정·배정·품질·계약 정보가 사람의 머릿속과 여러 파일에 흩어지기 시작</b>했습니다.</p>
          <p>회사가 성장할수록 대표가 직접 확인해야 하는 일이 늘어나는 구조 — 이것이 지금 바꿔야 하는 이유입니다.</p>
        </Story>

        <Story no="03" title="현재 업무 Flow">
          <FlowRow items={['고객 문의(전화·카톡)', '견적·계약(Excel)', '일정(Calendar·Excel)', '단톡방 배정', '현장 방문', '사진 전송', '팀장 확인', '월말 정산']} />
          <p>각 단계가 서로 다른 도구에 있어 <b>한 번 입력한 정보가 다음 단계로 자동으로 흐르지 않습니다.</b></p>
        </Story>

        <Story no="04" title="시간·돈·매출기회가 새는 곳">
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="danger">일정 겹침·지각으로 인한 클레임</Chip>
            <Chip tone="danger">완료 보고 누락</Chip>
            <Chip tone="danger">이동시간 과다 동선</Chip>
            <Chip tone="danger">갱신일을 놓친 재계약</Chip>
            <Chip tone="danger">보이지 않는 저수익 현장</Chip>
            <Chip tone="danger">제안하지 못한 추가서비스</Chip>
          </div>
          <p>단순한 비효율이 아니라, <b>매달 돈이 새고 매출 기회를 놓치는 구조적 누수</b>입니다.</p>
        </Story>

        <Story no="05" title="AX란 무엇인가">
          <p>회사의 일을 하나의 데이터 흐름으로 연결하고, 반복 업무는 시스템이 처리하며, <b>중요한 판단에는 AI가 근거와 다음 행동을 제안</b>하도록 만드는 것입니다.</p>
          <p>AI 챗봇을 하나 붙이는 것이 아니라, 배정·위험·재계약·추가매출처럼 실제 돈이 걸린 판단에 AI를 넣는 것입니다.</p>
        </Story>

        <Story no="06" title="클린웨이라면 무엇을 연결해야 하는가">
          <p className="rounded-xl bg-mint p-4 font-semibold text-primary-strong">
            클린웨이파트너스라면 — 현장이 여러 곳에 흩어져 있고 일정과 사람이 매일 움직이기 때문에,
            <b> 고객 계약 → 일정 → 직원 배정 → 현장 작업 → 품질 리포트</b>를 하나로 묶는 것이 핵심입니다.
            그 위에서만 재계약과 추가매출 판단이 가능해집니다.
          </p>
        </Story>

        <Story no="07" title="Service Intelligence Architecture">
          <div className="flex flex-col items-center gap-1">
            {['Customer / Client', 'Customer Care Portal', 'Contract / Request', 'Schedule / Dispatch', 'Employee Mobile', 'Field Work / Quality', 'Service Data Layer', 'AI Operations Layer', 'Action / Evidence / Growth'].map((x, i, arr) => (
              <div key={x} className="flex w-full max-w-sm flex-col items-center">
                <div className={`w-full rounded-xl border px-4 py-2.5 text-center text-[0.88rem] font-extrabold ${
                  i === 7 ? 'border-ai bg-ai-soft text-ai-strong' : i >= 6 ? 'border-primary bg-mint text-primary-strong' : 'border-line bg-card'
                }`}>{i === 7 && <Sparkles size={13} className="mr-1 inline" />}{x}</div>
                {i < arr.length - 1 && <ArrowDown size={15} className="my-0.5 text-ink-faint" />}
              </div>
            ))}
          </div>
        </Story>

        <Story no="08" title="고객 → 일정 → 직원 → 현장 → 리포트">
          <p>고객 계약이 만들어지면 일정이 생성되고, AI가 배정을 추천하고, 직원 모바일로 업무가 전달되고, 현장 체크인·체크리스트·사진이 기록되고, 작업이 끝나면 <b>Service Report가 자동으로 만들어져 고객 Portal에 도착</b>합니다.</p>
          <p>한 번 발생한 업무가 다시 입력 없이 끝까지 흐르는 것 — 이것이 이 시스템의 뼈대입니다.</p>
        </Story>

        <Story no="09" title="6개의 AI Engine">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['AI Smart Dispatch', '누구를 어디에 배정하는 것이 합리적인지 추천'],
              ['AI Service Risk Radar', '지연·겹침·미완료·결원을 미리 탐지'],
              ['AI Customer Retention', '이탈 가능성이 있는 고객을 먼저 발견'],
              ['AI Upsell Finder', '현장 기록에서 추가 매출 기회를 발굴'],
              ['AI Service Profitability', '표면 마진이 아닌 실제 기여마진 판단'],
              ['AI Executive Briefing', '대표가 아침에 봐야 할 것을 종합 브리핑'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[0.9rem] font-extrabold text-ai-strong"><Sparkles size={14} /> {t}</p>
                <p className="mt-1 text-[0.82rem] text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </Story>

        <Story no="10" title="Before / After">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-danger-soft/60 p-4">
              <Badge tone="danger">BEFORE</Badge>
              <ul className="mt-2 space-y-1.5 text-[0.86rem]">
                {['사람의 기억 + Excel + 단톡방', '대표가 전화로 현장 확인', '완료 보고는 사진 메시지', '재계약은 갱신일이 닥쳐서', '수익성은 감으로 판단'].map((x) => <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />{x}</li>)}
              </ul>
            </div>
            <div className="rounded-xl bg-success-soft/60 p-4">
              <Badge tone="success">AFTER</Badge>
              <ul className="mt-2 space-y-1.5 text-[0.86rem]">
                {['한 번 입력 → 자동 연결', 'Dashboard + AI Briefing으로 시작', '체크인·사진·리포트 자동 축적', 'D-60부터 AI가 사전관리 제안', '현장별 기여마진이 숫자로 보임'].map((x) => <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />{x}</li>)}
              </ul>
            </div>
          </div>
        </Story>

        <Story no="11" title="재계약 구조 — 놓치지 않는 갱신">
          <FlowRow items={['계약 D-60 감지', 'Customer Health 확인', 'AI Retention 제안', '담당자 사전 미팅', '재계약']} />
          <p>서비스업의 매출 기반은 신규 영업보다 <b>기존 계약의 유지</b>입니다. AI는 갱신일과 품질·문의·만족도 데이터를 함께 읽어 위험 고객을 먼저 알려줍니다.</p>
        </Story>

        <Story no="12" title="추가매출 구조 — 현장 기록이 영업이 된다">
          <FlowRow items={['현장 특이사항 기록', 'AI Upsell Finder', '제안', '협의', '성사']} />
          <p>"외부 유리 오염 4회 반복" 같은 현장 기록이 유리 집중관리 제안으로 이어집니다. <b>현장 직원의 기록 하나하나가 영업 데이터가 되는 구조</b>입니다.</p>
        </Story>

        <Story no="13" title="수익성 관리 — 계약금액의 함정">
          <p>월 420만원짜리 계약이 실제로는 기여마진 18%일 수 있습니다. 투입인원·실제 작업시간·이동·소모품·긴급방문을 반영하면 <b>어떤 현장을 지키고 어떤 계약을 재협의해야 하는지</b>가 보입니다.</p>
        </Story>

        <Story no="14" title="현장 데이터 자산화">
          <FlowRow items={['업무 발생', '기록', '축적', '비교', 'Pattern', 'AI', '더 나은 판단']} />
          <p>시간이 갈수록 회사에는 현장·고객·품질·수익성 데이터가 쌓입니다. 이 데이터는 직원이 바뀌어도 남는 <b>회사의 기술·데이터 자산</b>이며, 정책자금·벤처·기술사업화 설명력의 근거가 됩니다.</p>
        </Story>

        <Story no="15" title="Customer Portal — 고객이 직접 확인하는 관리품질">
          <p>고객은 전화하지 않아도 다음 방문 일정, 작업 리포트, Before/After 사진을 확인하고 추가 요청까지 한 화면에서 처리합니다. <b>관리품질이 눈에 보이는 회사</b>는 재계약 협상에서 강합니다.</p>
        </Story>

        <Story no="16" title="AX Evidence와 향후 확장">
          <p>AI 추천 → 사람의 결정 → 실행 → 결과가 Evidence Log로 남습니다. 이 실증 기록 위에서 다음 단계로 확장합니다.</p>
          <div className="space-y-1.5">
            <p className="text-[0.88rem]"><b>1단계</b> — 운영 효율화 + 기존 계약 유지·수익성 개선 (현재 MVP)</p>
            <p className="text-[0.88rem]"><b>2단계</b> — Supabase·GPS·지도·알림·LLM API 실연결, 고객 Portal 확대</p>
            <p className="text-[0.88rem]"><b>3단계</b> — 축적된 운영 데이터 기반의 현장 서비스 운영 표준화</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip tone="success">업무시간 ↓</Chip><Chip tone="success">누락 ↓</Chip><Chip tone="success">데이터 ↑</Chip>
            <Chip tone="success">매출기회 ↑</Chip><Chip tone="success">반복매출 ↑</Chip><Chip tone="success">정책·투자 설명력 ↑</Chip>
          </div>
        </Story>
      </div>
      <p className="mt-6 text-center text-[0.76rem] text-ink-faint">
        정책환경(중진공·신보·기보·정부지원) 연계 Story는 실제 프로젝트 제작 시점의 공식기관 최신 자료를 확인 후 작성합니다. (본 Reference에서는 생략)
      </p>
    </div>
  )
}
