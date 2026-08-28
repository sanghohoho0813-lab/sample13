import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Sparkles, FileText, Phone, RefreshCcw, Siren, PlusCircle, ClipboardList, ArrowRight } from 'lucide-react'
import CareShell, { CARE_CUSTOMER_ID } from './CareShell'
import { Card, Badge, Btn, Modal, StatusPill, useToast } from '../../components/ui'
import { useDemo } from '../../lib/data/store'
import { customerById } from '../../lib/demo/company'
import { UPSELL_SERVICES } from '../../lib/demo/operations'
import { dateWithOffset } from '../../lib/utils'
import type { RequestType } from '../../types'

export default function CareHome() {
  const nav = useNavigate()
  const toast = useToast()
  const { requests, addRequest, reports } = useDemo()
  const customer = customerById(CARE_CUSTOMER_ID)!
  const myRequests = requests.filter((r) => r.customerId === CARE_CUSTOMER_ID)
  const myReport = reports.find((r) => r.customerId === CARE_CUSTOMER_ID) ?? reports[0]
  const [modal, setModal] = useState<RequestType | null>(null)
  const [selService, setSelService] = useState(UPSELL_SERVICES[1])
  const [selSlot, setSelSlot] = useState('오전 (09:00~12:00)')

  const submit = (type: RequestType, detail: string) => {
    addRequest(CARE_CUSTOMER_ID, type, detail)
    setModal(null)
    toast(type === '추가서비스' ? '요청이 접수되어 담당자가 확인합니다.' : '요청이 접수되었습니다. 담당자가 곧 연락드립니다.')
  }

  return (
    <CareShell>
      <div className="fade-up space-y-5">
        {/* 인사 + 다음 방문 */}
        <section className="rounded-3xl bg-shell p-6 text-white">
          <p className="text-[0.82rem] text-white/70">안녕하세요,</p>
          <h1 className="text-[1.45rem] font-extrabold leading-snug">{customer.name} 관리 담당자님</h1>
          <div className="mt-4 rounded-2xl bg-white/10 p-4">
            <p className="flex items-center gap-1.5 text-[0.78rem] font-bold text-champagne"><CalendarClock size={14} /> 다음 방문 일정</p>
            <p className="mt-1 text-[1.15rem] font-extrabold">{dateWithOffset(1)} 09:00 ~ 11:00</p>
            <p className="mt-0.5 text-[0.82rem] text-white/75">{customer.contract.serviceSummary} · Clean Team B (2명) · 담당 {customer.contract.internalManager}</p>
            <Btn size="sm" variant="outline" className="mt-3 border-white/30 bg-transparent text-white hover:border-champagne hover:text-champagne" onClick={() => setModal('일정변경')}>
              일정 변경 요청
            </Btn>
          </div>
        </section>

        {/* 현황 카드 */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['현재 계약', `주 ${customer.contract.visitsPerWeek}회 정기관리`],
            ['이번 달 완료', '11회'],
            ['요청 처리중', `${myRequests.filter((r) => r.status !== '완료').length}건`],
            ['관리 상태', '정상'],
          ].map(([l, v], i) => (
            <Card key={l} className="p-4 text-center">
              <p className="text-[0.72rem] font-bold text-ink-faint">{l}</p>
              <p className={`mt-0.5 text-[1rem] font-extrabold leading-tight ${i === 3 ? 'text-success' : 'text-shell'}`}>{v}</p>
            </Card>
          ))}
        </section>

        {/* AI 시설관리 제안 */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-ai-soft px-5 py-3">
            <p className="flex items-center gap-1.5 text-[0.95rem] font-extrabold text-ai-strong"><Sparkles size={16} /> AI 시설관리 제안</p>
            <Badge tone="ai">NEW</Badge>
          </div>
          <div className="p-5">
            <p className="text-[0.92rem] leading-relaxed">
              최근 3개월 작업기록에서 <b>대기실 유리 얼룩 관련 특이사항이 반복</b>되었습니다.
              다음 정기관리 시 <b className="text-primary">유리 집중관리</b> 추가를 추천합니다.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Btn size="sm" variant="ai" onClick={() => { setSelService('유리창 집중청소'); setModal('추가서비스') }}>추가 관리 요청</Btn>
              <Btn size="sm" variant="outline" onClick={() => nav('/care/reports')}>서비스 자세히</Btn>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <section data-tour="care-quick">
          <h2 className="mb-2.5 text-[1.05rem] font-extrabold">빠른 요청</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {([
              [<PlusCircle key="i" size={20} />, '추가서비스 요청', () => setModal('추가서비스')],
              [<RefreshCcw key="i" size={20} />, '일정 변경 요청', () => setModal('일정변경')],
              [<Siren key="i" size={20} />, '긴급 방문 요청', () => setModal('긴급방문')],
              [<FileText key="i" size={20} />, '작업 리포트', () => nav('/care/reports')],
              [<Phone key="i" size={20} />, '담당자 문의', () => submit('문의', '담당자 통화 요청 (포털 문의)')],
              [<ClipboardList key="i" size={20} />, '계약 확인', () => toast(`${customer.contract.serviceSummary} · ${customer.contract.startDate} ~ ${customer.contract.endDate}`, 'info')],
            ] as Array<[React.ReactNode, string, () => void]>).map(([icon, label, fn]) => (
              <button key={label} onClick={fn}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card px-3 py-4 text-[0.85rem] font-extrabold text-ink hover:border-primary hover:text-primary transition-colors">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-primary">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* 최근 리포트 + 요청 상태 */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-2 text-[0.95rem] font-extrabold">최근 작업 리포트</h3>
            {myReport ? (
              <>
                <p className="text-[0.85rem] font-bold">{myReport.date} · {myReport.team}</p>
                <p className="mt-0.5 text-[0.8rem] text-ink-soft">작업항목 {myReport.itemsDone}/{myReport.itemsTotal} · 완료 {myReport.completedAt}</p>
                <p className="mt-1 text-[0.8rem] text-ink-faint">{myReport.note}</p>
                <Btn size="sm" variant="ghost" className="mt-2" onClick={() => nav('/care/reports')}>전체 보기 <ArrowRight size={12} className="inline" /></Btn>
              </>
            ) : <p className="text-[0.82rem] text-ink-faint">리포트가 준비 중입니다.</p>}
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-[0.95rem] font-extrabold">내 요청 현황</h3>
            {myRequests.length === 0 ? <p className="text-[0.82rem] text-ink-faint">진행 중인 요청이 없습니다.</p> : (
              <div className="space-y-1.5">
                {myRequests.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 text-[0.8rem]">
                    <span className="min-w-0 flex-1 truncate font-semibold">{r.type} — {r.detail}</span>
                    <StatusPill status={r.status} />
                  </div>
                ))}
              </div>
            )}
            <Btn size="sm" variant="ghost" className="mt-2" onClick={() => nav('/care/requests')}>요청 관리 <ArrowRight size={12} className="inline" /></Btn>
          </Card>
        </section>
      </div>

      {/* 선택형 요청 Modal */}
      <Modal open={modal === '추가서비스'} onClose={() => setModal(null)} title="추가서비스 요청">
        <div className="space-y-3">
          <p className="text-[0.85rem] text-ink-soft">필요한 서비스를 선택하세요. 담당자가 견적과 일정을 안내드립니다.</p>
          <div className="grid grid-cols-2 gap-2">
            {UPSELL_SERVICES.map((s) => (
              <button key={s} onClick={() => setSelService(s)}
                className={`rounded-xl border px-3 py-2.5 text-[0.85rem] font-bold ${selService === s ? 'border-primary bg-mint text-primary-strong' : 'border-line'}`}>{s}</button>
            ))}
          </div>
          <Btn className="w-full" onClick={() => submit('추가서비스', `${selService} 요청`)}>요청 보내기</Btn>
        </div>
      </Modal>

      <Modal open={modal === '일정변경'} onClose={() => setModal(null)} title="방문 일정 변경 요청">
        <div className="space-y-3">
          <p className="text-[0.85rem] text-ink-soft">희망 시간대를 선택하세요. AI Smart Dispatch가 재검토 후 담당자가 확정 안내드립니다.</p>
          {['오전 (09:00~12:00)', '오후 (13:00~17:00)', '저녁 (17:00~20:00)'].map((s) => (
            <button key={s} onClick={() => setSelSlot(s)}
              className={`w-full rounded-xl border px-3 py-3 text-[0.9rem] font-bold ${selSlot === s ? 'border-primary bg-mint text-primary-strong' : 'border-line'}`}>{s}</button>
          ))}
          <Btn className="w-full" onClick={() => submit('일정변경', `다음 방문 ${selSlot} 변경 희망`)}>변경 요청</Btn>
        </div>
      </Modal>

      <Modal open={modal === '긴급방문'} onClose={() => setModal(null)} title="긴급 방문 요청">
        <div className="space-y-3">
          <p className="text-[0.85rem] text-ink-soft">긴급 상황 유형을 선택하세요. 가능한 가장 빠른 팀을 배정해 연락드립니다.</p>
          {['오염·누수 긴급 청소', '행사 전후 긴급 정리', '위생·소독 긴급 대응'].map((s) => (
            <button key={s} onClick={() => submit('긴급방문', s)}
              className="w-full rounded-xl border border-line px-3 py-3 text-[0.9rem] font-bold hover:border-danger hover:text-danger">{s}</button>
          ))}
        </div>
      </Modal>
    </CareShell>
  )
}
