import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react'
import { cx } from '../../lib/utils'

const STEPS = [
  { title: 'Why AX', to: '/why-ax', desc: '현장이 늘수록 복잡해지는 서비스 회사가 왜 지금 데이터·AI 운영체계를 갖춰야 하는지 — 기획의도 Story로 시작합니다.' },
  { title: 'Dashboard', to: '/', desc: 'Service Command Center — 오늘 예정 24건, 진행·완료·Risk·갱신·Upsell이 한 화면에 모입니다.' },
  { title: 'AI Daily Briefing', to: '/', desc: '대표가 아침에 가장 먼저 읽는 AI 종합 브리핑 — 오늘 확인할 현장 3곳과 기회 5건을 자연어로 설명합니다.' },
  { title: 'AI Smart Dispatch', to: '/schedule', desc: '미배정 일정에 대해 AI가 이동시간·숙련도·일정 여유를 비교해 추천 팀 1~3순위와 이유를 제시합니다. 최종 결정은 사람이 합니다.' },
  { title: 'Employee Mobile', to: '/field', desc: '현장직원은 모바일에서 오늘 일정 → 체크인 → 체크리스트 → 사진 → 작업완료를 한 손으로 처리합니다.' },
  { title: '현장 작업 완료', to: '/sites/C07', desc: '작업이 완료되면 체크리스트·Before/After·특이사항이 하나의 Service Report로 자동 정리됩니다.' },
  { title: 'Customer Service Report', to: '/care/reports', desc: '고객은 Portal에서 작업 리포트와 사진, 다음 관리 추천을 직접 확인합니다.' },
  { title: 'Customer Portal', to: '/care/home', desc: '다음 방문 일정, 계약 현황, 요청 처리까지 — 전화 없이 한 화면에서 해결합니다.' },
  { title: 'Customer → AX 연결', to: '/requests', desc: '고객이 Portal에서 요청한 추가서비스가 내부 AX에 신규 Opportunity로 즉시 연결됩니다 (Closed Loop).' },
  { title: 'Retention / Upsell', to: '/renewals', desc: '계약 D-60부터 AI가 사전관리를 제안하고, 현장 기록에서 추가 매출 기회를 발굴합니다.' },
  { title: 'AX Evidence', to: '/evidence', desc: 'AI 추천 → 결정 → 실행 → 결과가 시간순으로 기록되어 AX 도입 실증 근거가 됩니다.' },
  { title: '확장 방향', to: '/settings', desc: 'Supabase·GPS·지도·알림·LLM API가 연결될 지점이 이미 준비되어 있습니다 — Data Layer만 교체하면 됩니다.' },
]

export default function Presentation() {
  const [step, setStep] = useState(0)
  const nav = useNavigate()
  const s = STEPS[step]

  return (
    <div className="flex min-h-screen flex-col bg-shell text-white">
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[0.95rem] font-extrabold tracking-wide">CLEANWAY PARTNERS</p>
          <p className="text-[0.75rem] font-bold tracking-[0.15em] text-champagne">SERVICE INTELLIGENCE AX · 시연 모드</p>
        </div>
        <button onClick={() => nav('/')} className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-[0.85rem] font-bold hover:bg-white/20">
          <X size={16} /> 시연 종료
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <p className="tnum text-[0.85rem] font-extrabold tracking-[0.25em] text-aqua">STEP {String(step + 1).padStart(2, '0')} / {STEPS.length}</p>
        <h1 className="mt-3 text-center text-[2rem] lg:text-[2.6rem] font-extrabold tracking-tight">{s.title}</h1>
        <p className="mt-4 max-w-xl text-center text-[1.02rem] leading-relaxed text-white/80">{s.desc}</p>
        <button
          onClick={() => nav(s.to)}
          className="mt-7 flex items-center gap-2 rounded-2xl bg-champagne px-6 py-3.5 text-[1rem] font-extrabold text-shell hover:opacity-90"
        >
          <ExternalLink size={18} /> 이 화면 열기
        </button>
        <p className="mt-2.5 text-[0.75rem] text-white/50">화면 확인 후 사이드바의 [시연 모드]로 돌아올 수 있습니다.</p>
      </div>

      <footer className="px-6 pb-8">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}
            className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 disabled:opacity-30"><ChevronLeft size={20} /></button>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
            {STEPS.map((st, i) => (
              <button key={st.title} onClick={() => setStep(i)} title={st.title}
                className={cx('h-2 rounded-full transition-all', i === step ? 'w-8 bg-champagne' : 'w-2 bg-white/25 hover:bg-white/50')} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2.5 text-[0.85rem] font-bold hover:bg-white/20">다음 <ChevronRight size={17} /></button>
          ) : (
            <button onClick={() => nav('/')} className="flex items-center gap-1 rounded-xl bg-champagne px-4 py-2.5 text-[0.85rem] font-extrabold text-shell hover:opacity-90"><Play size={15} /> 대시보드로</button>
          )}
        </div>
      </footer>
    </div>
  )
}
