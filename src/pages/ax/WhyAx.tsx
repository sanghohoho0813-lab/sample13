import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowDown, Sparkles, LayoutDashboard, TrendingUp, RefreshCcw,
  ShieldCheck, Database, Building2, ChevronDown, Target,
} from 'lucide-react'
import { Card, PageHeader, Badge, Btn, DemoBadge } from '../../components/ui'
import { COMPANY } from '../../lib/demo/company'
import { cx } from '../../lib/utils'

// ─── Story building blocks ───────────────────────────────
function Section({ no, title, children, tour }: { no: string; title: string; children: ReactNode; tour?: string }) {
  return (
    <Card tour={tour} className="p-6 sm:p-7">
      <p className="tnum text-[0.78rem] font-extrabold tracking-[0.22em] text-champagne">{no}</p>
      <h2 className="mt-1.5 text-[1.3rem] font-extrabold leading-snug tracking-tight sm:text-[1.45rem]">{title}</h2>
      <div className="mt-3.5 space-y-3.5 text-[0.95rem] leading-relaxed text-ink">{children}</div>
    </Card>
  )
}

/** 일반론 → 이 회사의 해석 (Story Gate 필수 블록) */
function CleanwayNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-l-[3px] border-primary bg-mint/50 p-4">
      <p className="flex items-center gap-1.5 text-[0.8rem] font-extrabold text-primary-strong">
        <Building2 size={14} /> CLEANWAY라면
      </p>
      <div className="mt-1.5 space-y-2 text-[0.92rem] leading-relaxed text-ink">{children}</div>
    </div>
  )
}

const Chip = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'danger' | 'success' }) => (
  <span className={{
    neutral: 'rounded-lg bg-ivory px-3 py-1.5 text-[0.8rem] font-bold text-ink-soft',
    brand: 'rounded-lg bg-mint px-3 py-1.5 text-[0.8rem] font-bold text-primary-strong',
    danger: 'rounded-lg bg-danger-soft px-3 py-1.5 text-[0.8rem] font-bold text-danger',
    success: 'rounded-lg bg-success-soft px-3 py-1.5 text-[0.8rem] font-bold text-success',
  }[tone]}>{children}</span>
)

const Flow = ({ items, tone = 'brand' }: { items: string[]; tone?: 'brand' | 'danger' | 'success' }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {items.map((x, i) => (
      <span key={x} className="flex items-center gap-1.5">
        <Chip tone={tone}>{x}</Chip>
        {i < items.length - 1 && <ArrowRight size={13} className="shrink-0 text-ink-faint" />}
      </span>
    ))}
  </div>
)

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="text-[0.9rem] font-extrabold">{title}</span>
        <ChevronDown size={17} className={cx('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-line px-4 py-3 text-[0.88rem] leading-relaxed text-ink-soft">{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
export default function WhyAx() {
  const nav = useNavigate()
  return (
    <div className="fade-up mx-auto max-w-4xl">
      <PageHeader
        title="기획의도 — Why Service Intelligence AX"
        desc="클린웨이파트너스가 왜 지금 AX를 도입하는지, 무엇이 달라지고 어떻게 매출이 되는지에 대한 이야기입니다."
        right={<DemoBadge label="가상 회사 · DEMO" />}
      />

      {/* HERO */}
      <section data-tour="why-hero" className="mb-6 overflow-hidden rounded-3xl bg-shell px-6 py-10 text-white sm:px-10 sm:py-14">
        <Badge tone="brand" className="bg-white/10 text-champagne">SERVICE INTELLIGENCE AX</Badge>
        <h1 className="mt-4 text-[1.65rem] font-extrabold leading-tight sm:text-[2.3rem]">
          청소 서비스를 제공하는 회사에서,<br />
          <span className="text-champagne">고객의 공간 운영을 데이터로 관리하는 회사로.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-white/80">
          CLEANWAY의 AX는 직원 일정표를 디지털로 바꾸는 것이 목적이 아닙니다.
          고객·계약·일정·현장·직원·품질 데이터를 연결하여
          <b className="text-white"> 어떤 현장을 먼저 확인해야 하는지, 어떤 고객을 사전에 관리해야 하는지,
          어디에서 추가매출을 만들 수 있는지</b>를 더 빠르게 판단하기 위한 Service Intelligence System입니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {['현장', '일정', '품질', '고객', '재계약', 'Growth'].map((k) => (
            <span key={k} className="rounded-lg bg-white/10 px-3 py-1.5 text-[0.8rem] font-bold text-champagne">{k}</span>
          ))}
        </div>
      </section>

      <div className="space-y-5">
        <Section no="01" title="서비스업의 일하는 방식이 바뀌고 있습니다">
          <p>
            제조업이 생산 데이터를, 유통업이 판매 데이터를 시스템으로 관리하기 시작한 것처럼
            현장 서비스업도 <b>일정과 사람, 그리고 서비스 품질을 데이터로 관리하는 단계</b>로 넘어가고 있습니다.
          </p>
          <p>
            고객이 요구하는 것도 달라졌습니다. 예전에는 "깨끗하게 해주세요"였다면
            지금은 "언제 왔고, 무엇을 했고, 어떤 상태인지 보여주세요"입니다.
          </p>
          <CleanwayNote>
            <p>
              기업·병원·학원 같은 B2B 고객은 내부 보고를 위해 관리 근거를 필요로 합니다.
              작업 리포트를 제공할 수 있는 업체와 그렇지 않은 업체는 재계약 협상에서부터 차이가 납니다.
            </p>
          </CleanwayNote>
        </Section>

        <Section no="02" title="AX는 무엇인가요?">
          <p>
            AX(AI Transformation)는 회사의 일을 하나의 데이터 흐름으로 연결하고,
            반복 업무는 시스템이 처리하며, <b>중요한 판단에는 AI가 근거와 다음 행동을 제안</b>하도록 만드는 것입니다.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3.5">
              <p className="text-[0.82rem] font-extrabold text-danger">AX가 아닌 것</p>
              <ul className="mt-1.5 space-y-1 text-[0.85rem] text-ink-soft">
                {['기존 Excel을 웹으로 옮기기', '관리자 페이지에 챗봇 하나 붙이기', '보기 좋은 대시보드만 만들기'].map((x) => (
                  <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line p-3.5">
              <p className="text-[0.82rem] font-extrabold text-success">AX인 것</p>
              <ul className="mt-1.5 space-y-1 text-[0.85rem] text-ink-soft">
                {['업무가 흐르며 데이터가 자동으로 쌓임', 'AI가 위험과 기회를 먼저 발견', '추천이 실제 Action과 결과로 이어짐'].map((x) => (
                  <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section no="03" title="왜 현장서비스에서 AX가 필요한가요?">
          <p>
            현장 서비스업은 사무실이 아니라 <b>여러 장소에서 동시에 일이 일어나는 구조</b>입니다.
            일정·사람·고객·품질 데이터가 각각 다른 곳에 분산되기 쉽고, 그럴수록 관리자의 확인 업무가 늘어납니다.
          </p>
          <CleanwayNote>
            <p>
              정기관리 고객사 {COMPANY.regularCustomers}곳과 월 약 {COMPANY.monthlyRegularJobs}건의 작업이 늘어날수록
              대표나 팀장이 일일이 전화로 확인하는 구조는 확장성이 떨어집니다.
            </p>
            <p>
              따라서 일정만 관리하는 것이 아니라 <b>고객 상태와 작업결과까지 연결</b>하는 것이 중요합니다.
            </p>
          </CleanwayNote>
        </Section>

        <Section no="04" title="CLEANWAY에는 이미 어떤 Data가 있나요?">
          <p>새로 만들 데이터가 아니라, <b>이미 매일 발생하고 있지만 흩어져 있는 데이터</b>입니다.</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ['연매출', COMPANY.annualRevenue], ['임직원·현장인력', `${COMPANY.headcount}명`],
              ['정기관리 고객사', `${COMPANY.regularCustomers}곳`], ['월 정기 작업', `약 ${COMPANY.monthlyRegularJobs}건`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-ivory p-3 text-center">
                <p className="text-[0.72rem] font-bold text-ink-faint">{l}</p>
                <p className="tnum mt-0.5 text-[1.05rem] font-extrabold text-primary">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['계약 정보', '방문 일정', '팀 배정', '작업 시간', '체크리스트', '현장 사진', '특이사항', '고객 문의', '민원·클레임', '소모품', '긴급 방문'].map((x) => (
              <Chip key={x}>{x}</Chip>
            ))}
          </div>
          <p className="text-[0.82rem] text-ink-faint">모든 수치는 가상의 Demo Data입니다.</p>
        </Section>

        <Section no="05" title="지금 가장 먼저 바꿔야 하는 문제는 무엇인가요?">
          <p>비효율이라는 막연한 표현 대신, 실제로 <b>돈과 시간과 매출이 새는 지점</b>으로 정리합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['일정 겹침 · 방문 지연', '클레임 발생 → 만족도 하락 → 재계약 위험'],
              ['완료 보고 누락', '고객 문의 대응 시간 증가 · 품질 근거 부재'],
              ['비효율 동선', '이동시간이 인건비를 잠식 (기여마진 하락)'],
              ['갱신일을 놓친 재계약', '경쟁 견적 노출 · 단가 인하 압박'],
              ['보이지 않는 저수익 현장', '매출은 크지만 실제로는 손해인 계약'],
              ['제안하지 못한 추가서비스', '이미 신호가 있었는데 놓친 매출 기회'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl bg-danger-soft/50 p-3.5">
                <p className="text-[0.88rem] font-extrabold text-danger">{t}</p>
                <p className="mt-0.5 text-[0.82rem] text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section no="06" title="현재 업무는 어떻게 흘러가나요?">
          <Flow tone="danger" items={['고객 연락', '일정', '단톡방', '직원', '현장', '사진', '팀장 확인', '고객 문의', '월말 정산']} />
          <p>
            각 단계가 서로 다른 도구(전화·카톡·Excel·Calendar)에 있어
            <b> 한 번 입력한 정보가 다음 단계로 자동으로 흐르지 않습니다.</b> 그래서 같은 정보를 여러 번 확인하게 됩니다.
          </p>
        </Section>

        <Section no="07" title="업무가 어떻게 달라지나요?">
          <Flow tone="success" items={['Customer Portal', '일정', 'AI Dispatch', 'Field Mobile', '작업', 'Service Report', 'Customer Data', 'Retention / Upsell', 'Action', 'Evidence']} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-danger-soft/50 p-4">
              <Badge tone="danger">BEFORE</Badge>
              <ul className="mt-2 space-y-1.5 text-[0.85rem]">
                {['사람의 기억 + Excel + 단톡방', '대표가 전화로 현장 확인', '완료 보고는 사진 메시지', '재계약은 갱신일이 닥쳐서', '수익성은 감으로 판단'].map((x) => (
                  <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-success-soft/50 p-4">
              <Badge tone="success">AFTER</Badge>
              <ul className="mt-2 space-y-1.5 text-[0.85rem]">
                {['한 번 입력 → 자동 연결', 'Dashboard + AI Briefing으로 시작', '체크인·사진·리포트 자동 축적', 'D-60부터 AI가 사전관리 제안', '현장별 기여마진이 숫자로 보임'].map((x) => (
                  <li key={x} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section no="08" title="하지만 목표는 일정관리만이 아닙니다">
          <div className="rounded-2xl bg-shell p-5 text-white sm:p-6">
            <p className="text-[1.15rem] font-extrabold leading-snug sm:text-[1.35rem]">
              일정이 편해지는 데서 끝나면<br />좋은 <span className="text-white/60">관리 프로그램</span>입니다.
            </p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-white/80">
              AX의 다음 단계는 현장 Data를 다시 <b className="text-champagne">고객과 매출</b>에 활용하는 것입니다.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 pt-1">
            {['작업 Data', '고객 상태', 'Retention Risk', 'Upsell Opportunity', '담당자 Action', '재계약 / 추가서비스', 'Result'].map((x, i, arr) => (
              <div key={x} className="flex w-full max-w-xs flex-col items-center">
                <div className={cx(
                  'w-full rounded-xl border px-4 py-2 text-center text-[0.86rem] font-extrabold',
                  i >= 4 ? 'border-primary bg-mint text-primary-strong' : 'border-line bg-card',
                )}>{x}</div>
                {i < arr.length - 1 && <ArrowDown size={14} className="my-0.5 text-ink-faint" />}
              </div>
            ))}
          </div>
        </Section>

        <Section no="09" title="재계약이 왜 중요한가요?">
          <p>
            정기관리 서비스업의 매출 기반은 신규 영업보다 <b>기존 계약의 유지</b>입니다.
            계약 하나가 이탈하면 그만큼을 신규로 채우는 데 훨씬 더 큰 비용이 듭니다.
          </p>
          <Flow items={['계약 종료 D-60 / D-30', '품질 · 상담 · 민원 확인', 'Customer Health', 'AI Retention 제안', '담당자 사전관리', '재계약']} />
          <CleanwayNote>
            <p>
              라온메디컬센터는 계약 종료 D-32이면서 최근 60일간 일정변경 3회, 품질문의 2회가 있었습니다.
              이 신호를 <b>갱신일이 닥쳐서가 아니라 지금</b> 발견하는 것이 재계약률을 바꿉니다.
            </p>
          </CleanwayNote>
        </Section>

        <Section no="10" title="추가서비스는 어떻게 매출이 되나요?">
          <p>추가매출은 새 고객을 찾는 것이 아니라, <b>이미 관리 중인 현장에서 발견</b>됩니다.</p>
          <Flow items={['작업기록 · 현장 특이사항', 'AI Upsell Finder', '담당자 제안', '협의', '성사']} />
          <div className="flex flex-wrap gap-1.5">
            {['유리 집중청소', '바닥 집중관리', '소독 / 위생', '에어컨 세척', '입주·퇴거 특수청소', '대청소', '소모품 관리'].map((x) => (
              <Chip key={x} tone="success">{x}</Chip>
            ))}
          </div>
          <CleanwayNote>
            <p>
              에이원교육센터는 최근 작업기록에 <b>유리 오염 특이사항이 4회 반복</b>되었습니다.
              현장 직원이 남긴 메모 한 줄이 곧 85만원 규모의 제안 근거가 됩니다.
            </p>
          </CleanwayNote>
        </Section>

        <Section no="11" title="AI는 실제로 무엇을 하나요?">
          <p>챗봇이 아니라, 업무 화면 안에서 <b>Data → 판단 → Action</b> 구조로 동작하는 6개의 Engine입니다.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['AI Smart Dispatch', '일정·위치·숙련도·여유', '누구를 어디에 배정할지 추천'],
              ['AI Service Risk Radar', '진행상황·이동·근태', '지연·겹침·미완료·결원을 먼저 탐지'],
              ['AI Customer Retention', '계약일·만족도·민원', '이탈 가능성 있는 고객 발견'],
              ['AI Upsell Finder', '작업기록·특이사항', '추가 매출 기회 발굴'],
              ['AI Service Profitability', '작업시간·이동·소모품', '표면 마진이 아닌 실제 기여마진 판단'],
              ['AI Executive Briefing', '위 5개 Engine 결과', '대표가 오늘 볼 것을 종합 설명'],
            ].map(([t, data, act]) => (
              <div key={t} className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[0.88rem] font-extrabold text-ai-strong"><Sparkles size={14} /> {t}</p>
                <p className="mt-1 text-[0.78rem] text-ink-faint">Data — {data}</p>
                <p className="text-[0.82rem] text-ink-soft">→ {act}</p>
              </div>
            ))}
          </div>
          <Accordion title="현재 AI는 어디까지 구현되어 있나요?">
            현재 MVP의 6개 Engine은 규칙 기반 Demo Logic으로 동작하며 <b>AI READY</b>로 명확히 표시됩니다.
            각 추천에는 "왜 이렇게 판단했나요?" 설명이 붙어 있고, 실서비스에서는 동일한 service interface에
            GPT/Claude 등 LLM API를 연결하면 됩니다. 단순 합계·성장률·재고일수 같은 계산은 AI가 아니라 코드로 처리합니다.
          </Accordion>
        </Section>

        <Section no="12" title="추천은 실제 Action으로 이어집니다">
          <p>AI가 추천만 하고 끝나면 데이터가 남지 않습니다. 그래서 모든 추천에 <b>상태</b>를 둡니다.</p>
          <Flow items={['추천됨', '확인', '실행중', '완료']} />
          <p className="text-[0.88rem] text-ink-soft">필요 시 <b>보류 / 무시</b>도 기록됩니다 — 무시한 이유 역시 회사의 판단 데이터입니다.</p>
          <div className="rounded-xl bg-ivory p-4 text-[0.86rem] leading-relaxed">
            <p className="font-extrabold">예시</p>
            <p className="mt-1 text-ink-soft">
              AI 방문지연 감지 (08:40) → 팀장 재배정 승인 (08:43) → 대체팀 현장 도착 (13:52) → 작업 완료 (15:21)
              <br /><b className="text-success">Result — 방문지연 방지 · 당일 완료율 유지</b>
            </p>
          </div>
        </Section>

        <Section no="13" title="고객 플랫폼과 왜 연결해야 하나요?">
          <p>
            Customer Portal이 필요한 이유는 <b>예쁜 고객 페이지가 필요해서가 아닙니다.</b>
            고객의 일정변경·추가서비스 요청·긴급요청·리포트 확인이 그대로 <b>Business AX의 데이터</b>가 되기 때문입니다.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3.5">
              <p className="text-[0.84rem] font-extrabold">고객이 하는 일</p>
              <ul className="mt-1.5 space-y-1 text-[0.84rem] text-ink-soft">
                {['다음 방문 일정 확인', '작업 리포트 · 사진 확인', '추가서비스 / 일정변경 요청', '긴급 방문 요청'].map((x) => <li key={x}>· {x}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-primary bg-mint/40 p-3.5">
              <p className="text-[0.84rem] font-extrabold text-primary-strong">AX에 남는 것</p>
              <ul className="mt-1.5 space-y-1 text-[0.84rem] text-ink-soft">
                {['신규 Service Opportunity', 'Dispatch 재검토 요청', 'Customer Health 신호', '요청 응답시간 기록'].map((x) => <li key={x}>· {x}</li>)}
              </ul>
            </div>
          </div>
          <p className="text-center text-[0.86rem] font-extrabold text-primary">Customer ↔ Business AX = 하나의 Data Loop</p>
        </Section>

        <Section no="14" title="서비스 Data가 왜 자산이 되나요?">
          <Flow items={['업무 발생', '기록', '축적', '비교', 'Pattern', 'AI', '더 나은 판단']} />
          <p>
            현장·고객·품질·수익성 데이터는 시간이 갈수록 쌓입니다. 이 데이터는
            <b> 담당 직원이 바뀌어도 회사에 남는 기술·데이터 자산</b>이며, 신규 직원의 학습 시간을 줄이고
            대표의 판단 근거가 됩니다.
          </p>
          <CleanwayNote>
            <p>
              "이 현장은 평균 작업시간이 예정보다 21% 길다"는 사실은 사람의 기억으로는 알 수 없지만
              1년치 작업 데이터로는 즉시 확인됩니다. 이것이 재계약 단가 협상의 근거가 됩니다.
            </p>
          </CleanwayNote>
        </Section>

        <Section no="15" title="정책 / 기술 / 사업화에는 어떤 의미가 있나요?">
          <p>
            AX 도입은 심사를 위한 화면을 만드는 것이 아니라,
            <b> 실제 도입·데이터·운영성과를 증거로 보여주는 구조</b>를 만드는 것입니다.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              [<Database key="i" size={16} />, '데이터 자산', '작업·고객·품질·수익성 데이터의 축적 구조'],
              [<ShieldCheck key="i" size={16} />, 'AX 실증', 'AI 추천 → Action → 결과가 Evidence Log로 기록'],
              [<TrendingUp key="i" size={16} />, '사업 확장성', '운영 표준화를 통한 서비스 확장 가능성'],
            ].map(([icon, t, d]) => (
              <div key={t as string} className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[0.86rem] font-extrabold text-primary">{icon}{t}</p>
                <p className="mt-1 text-[0.8rem] text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.8rem] text-ink-faint">
            중진공·신용보증기금·기술보증기금·정부지원사업 등 구체적인 정책환경 연계는
            실제 프로젝트 진행 시점의 공식기관 최신 공개자료를 확인한 뒤 작성합니다. (본 Reference에서는 생략)
          </p>
        </Section>

        <Section no="16" title="하나의 시스템에서 여러 성장경로가 열립니다">
          <div className="grid gap-2 sm:grid-cols-5">
            {[
              ['01', '운영효율'], ['02', '서비스품질'], ['03', '재계약'], ['04', '추가매출'], ['05', 'Data Asset'],
            ].map(([n, t]) => (
              <div key={n} className="rounded-xl bg-mint/60 p-3.5 text-center">
                <p className="tnum text-[0.7rem] font-extrabold text-primary">{n}</p>
                <p className="mt-0.5 text-[0.88rem] font-extrabold text-primary-strong">{t}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip tone="success">업무시간 ↓</Chip><Chip tone="success">누락 ↓</Chip><Chip tone="success">데이터 ↑</Chip>
            <Chip tone="success">매출기회 ↑</Chip><Chip tone="success">반복매출 ↑</Chip><Chip tone="success">설명력 ↑</Chip>
          </div>
          <div className="mt-3 rounded-2xl bg-shell p-6 text-center text-white">
            <Target size={22} className="mx-auto text-champagne" />
            <p className="mt-2 text-[1.1rem] font-extrabold leading-snug sm:text-[1.3rem]">
              현장을 관리하는 프로그램에서<br />
              <span className="text-champagne">고객과 사업의 성장을 관리하는 시스템으로.</span>
            </p>
          </div>
        </Section>
      </div>

      {/* Escape Path — 반드시 돌아갈 경로 제공 */}
      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Btn size="lg" onClick={() => nav('/')}>
          <LayoutDashboard size={17} className="mr-1 inline" /> AX Dashboard로 돌아가기
        </Btn>
        <Btn size="lg" variant="outline" onClick={() => nav('/renewals')}>
          <RefreshCcw size={16} className="mr-1 inline" /> 재계약 관리 보기
        </Btn>
        <Btn size="lg" variant="outline" onClick={() => nav('/evidence')}>
          AX Evidence 보기 <ArrowRight size={15} className="inline" />
        </Btn>
      </div>
    </div>
  )
}
