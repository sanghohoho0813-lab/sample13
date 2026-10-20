import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCircle2, Siren } from 'lucide-react'
import { Modal, Btn, Field, TextArea, ChoiceGroup } from '../../components/ui'
import { useDemo } from '../../lib/data/context'
import { UPSELL_SERVICES } from '../../lib/demo/operations'
import { cx, dateWithOffset } from '../../lib/utils'
import type { RequestType } from '../../types'
import { CARE_CUSTOMER_ID } from './CareShell'
import { TOPIC, composeRequestDetail, hasErrors, validateRequest, type RequestFields, type Topic } from './requestForm'

/**
 * 고객 요청 시트 — 추가서비스 · 일정 변경 · 긴급 방문 · 담당자 문의를 한 흐름으로.
 * 1) 필요한 것만 고르고  2) 필요하면 메모를 남기고  3) 접수 완료 화면에서 접수번호와 회신 시간을 확인한다.
 * 검증은 "보내기"를 눌렀을 때 빠진 항목만 짚어준다 (처음부터 빨간 글씨로 겁주지 않는다).
 */

const TITLE: Record<RequestType, string> = {
  추가서비스: '추가서비스 요청',
  일정변경: '방문 일정 변경 요청',
  긴급방문: '긴급 방문 요청',
  문의: '담당자 문의',
}
const REPLY: Record<RequestType, string> = {
  추가서비스: '담당자가 영업일 1일 이내에 견적과 가능한 일정을 안내드립니다.',
  일정변경: '배정 가능 여부를 확인해 2시간 이내에 확정 안내드립니다.',
  긴급방문: '가장 빠른 팀을 확인해 30분 이내에 연락드립니다.',
  문의: '담당자가 영업시간 내 1시간 이내에 회신드립니다.',
}
// 접수 뒤 이어지는 단계 — 요청 상태(접수 → 검토중 → 처리중 → 완료)와 같은 순서. 요청 현황 화면도 이 순서로 보여준다
const NEXT_STEP: Record<RequestType, string> = {
  추가서비스: '견적 · 방문 일정을 확정하고 현장팀을 배정합니다',
  일정변경: '변경된 일정을 확정해 현장팀 앱에 반영합니다',
  긴급방문: '가장 가까운 팀이 출동합니다',
  문의: '담당자가 내용을 확인해 답변을 준비합니다',
}
const LAST_STEP: Record<RequestType, string> = {
  추가서비스: '작업이 끝나면 사진 리포트가 이 앱에 도착합니다',
  일정변경: '확정된 방문 일정이 홈 화면에 표시됩니다',
  긴급방문: '조치 후 사진 리포트가 이 앱에 도착합니다',
  문의: '회신 내용이 요청 현황에 표시됩니다',
}

const WHEN = ['다음 정기방문 때', '이번 주 안에', '다음 주 이후'] as const
const SLOTS = [
  { value: '오전', label: '오전', desc: '09:00 ~ 12:00' },
  { value: '오후', label: '오후', desc: '13:00 ~ 17:00' },
  { value: '저녁', label: '저녁', desc: '17:00 ~ 20:00' },
] as const
const URGENT = [
  { value: '오염·누수', label: '오염 · 누수', desc: '바닥 오염, 누수, 파손 잔해' },
  { value: '행사 전후 정리', label: '행사 전후 정리', desc: '갑작스런 일정·방문객 대응' },
  { value: '위생·소독', label: '위생 · 소독', desc: '감염 의심, 위생 점검 대응' },
] as const

// 다음 방문 이후 영업일 4일을 희망 날짜 후보로 (주말 제외)
const dateChoices = () => {
  const out: Array<{ value: string; label: string }> = []
  for (let off = 1; out.length < 4 && off < 10; off++) {
    const d = new Date(); d.setDate(d.getDate() + off)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const label = dateWithOffset(off)
    out.push({ value: label, label })
  }
  return out
}

export interface RequestPreset { service?: string; topic?: Topic; memo?: string }

export default function RequestSheet({ type, onClose, preset }: { type: RequestType | null; onClose: () => void; preset?: RequestPreset }) {
  const { addRequest } = useDemo()
  const nav = useNavigate()
  const [service, setService] = useState<string | null>(null)
  const [when, setWhen] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [urgent, setUrgent] = useState<string | null>(null)
  const [topic, setTopic] = useState<string | null>(null)
  const [memo, setMemo] = useState('')
  const [tried, setTried] = useState(false)
  const [doneId, setDoneId] = useState<string | null>(null)
  const [sent, setSent] = useState('')

  // 시트를 열 때마다 깨끗한 상태로 (프리셋은 반영)
  useEffect(() => {
    if (!type) return
    setService(preset?.service ?? null); setWhen(null); setDate(null); setSlot(null)
    setUrgent(null); setTopic(preset?.topic ?? null); setMemo(preset?.memo ?? ''); setTried(false); setDoneId(null)
  }, [type, preset?.service, preset?.topic, preset?.memo])

  if (!type) return null

  const fields: RequestFields = { service, when, date, slot, urgent, topic, memo }
  const errors = validateRequest(type, fields)
  const invalid = hasErrors(errors)
  const show = (k: keyof RequestFields) => (tried ? errors[k] : null)

  const submit = () => {
    setTried(true)
    if (invalid) {
      // 첫 번째 오류 위치로 — 시트가 길어 오류가 화면 밖에 있을 수 있다
      window.setTimeout(() => document.querySelector('[role="dialog"] [role="alert"], .pop-in [role="alert"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 30)
      return
    }
    const detail = composeRequestDetail(type, fields)
    setSent(detail)
    setDoneId(addRequest(CARE_CUSTOMER_ID, type, detail))
  }

  return (
    <Modal open={!!type} onClose={onClose} title={doneId ? '요청이 접수되었습니다' : TITLE[type]}>
      {doneId ? (
        <div className="space-y-4">
          <div className="text-center">
            <span className="pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft ring-8 ring-success-soft/45">
              <CheckCircle2 size={34} className="text-success" />
            </span>
            <p className="mt-3 text-[1.08rem] font-extrabold">{TITLE[type]} 접수 완료</p>
            <p className="tnum mt-0.5 text-[0.86rem] font-bold text-ink-faint">접수번호 {doneId}</p>
          </div>

          {/* 보낸 내용 — 무엇을 요청했는지 다시 확인 */}
          <div className="rounded-2xl border border-line px-4 py-3">
            <p className="text-[0.74rem] font-bold text-ink-faint">보낸 내용</p>
            <p className="mt-0.5 text-[0.88rem] font-semibold leading-relaxed [overflow-wrap:anywhere]">{sent}</p>
          </div>

          {/* 다음 단계 — 지금 어디까지 왔고, 다음에 무엇이 오는지 */}
          <ol aria-label="처리 단계" className="rounded-2xl bg-ivory px-4 py-3.5">
            {[
              { t: '접수 완료', d: '본사 요청함에 도착했습니다' },
              { t: '담당자 확인', d: REPLY[type] },
              { t: '처리', d: NEXT_STEP[type] },
              { t: '완료', d: LAST_STEP[type] },
            ].map((step, i, all) => (
              <li key={step.t} className="relative flex gap-3 pb-3 last:pb-0">
                {i < all.length - 1 && <span aria-hidden="true" className={cx('absolute left-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-0.5', i === 0 ? 'bg-success/50' : 'bg-line')} />}
                <span className={cx('relative z-10 flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full', i === 0 ? 'bg-success text-white' : 'border-2 border-line bg-card')}>
                  {i === 0 && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="min-w-0 pt-px">
                  <span className={cx('block text-[0.86rem] font-extrabold', i === 0 ? 'text-success' : 'text-ink')}>{step.t}{i === 1 && <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-px text-[0.68rem] font-bold text-primary">다음</span>}</span>
                  <span className="block text-[0.8rem] leading-relaxed text-ink-soft">{step.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="outline" onClick={onClose}>닫기</Btn>
            <Btn onClick={() => { onClose(); nav('/care/requests') }}>요청 현황 보기</Btn>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate>
          {type === '추가서비스' && (
            <>
              <Field label="필요한 서비스" required error={show('service')}>
                <ChoiceGroup label="필요한 서비스" options={UPSELL_SERVICES} value={service} onChange={setService} invalid={!!show('service')} />
              </Field>
              <Field label="희망 시기" required error={show('when')}>
                <ChoiceGroup label="희망 시기" options={WHEN} value={when} onChange={setWhen} cols={3} invalid={!!show('when')} />
              </Field>
            </>
          )}

          {type === '일정변경' && (
            <>
              <p className="rounded-xl bg-ivory px-4 py-3 text-[0.86rem] text-ink-soft">
                변경할 방문 — <b className="text-ink">{dateWithOffset(1)} 09:00 ~ 11:00</b> 정기관리
              </p>
              <Field label="희망 날짜" required error={show('date')}>
                <ChoiceGroup label="희망 날짜" options={dateChoices()} value={date} onChange={setDate} invalid={!!show('date')} />
              </Field>
              <Field label="희망 시간대" required error={show('slot')}>
                <ChoiceGroup label="희망 시간대" options={SLOTS as unknown as Array<{ value: string; label: string; desc: string }>} value={slot} onChange={setSlot} cols={3} invalid={!!show('slot')} />
              </Field>
            </>
          )}

          {type === '긴급방문' && (
            <>
              <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.84rem] leading-relaxed text-ink">
                <Siren size={16} className="mt-0.5 shrink-0 text-danger" />
                정기 일정과 별도로 출동하는 요청입니다. 계약에 따라 추가 비용이 발생할 수 있습니다.
              </p>
              <Field label="상황 유형" required error={show('urgent')}>
                <ChoiceGroup label="상황 유형" options={URGENT as unknown as Array<{ value: string; label: string; desc: string }>} value={urgent} onChange={setUrgent} cols={1} invalid={!!show('urgent')} />
              </Field>
            </>
          )}

          {type === '문의' && (
            <Field label="문의 유형" required error={show('topic')}>
              <ChoiceGroup label="문의 유형" options={TOPIC} value={topic} onChange={setTopic} invalid={!!show('topic')} />
            </Field>
          )}

          <Field
            htmlFor="req-memo"
            label={type === '긴급방문' ? '현재 상황' : type === '문의' ? '문의 내용' : '추가 메모'}
            required={type === '긴급방문' || type === '문의'}
            error={show('memo')}
            hint={type === '긴급방문' ? '위치와 상황을 적어주시면 맞는 장비를 챙겨 갑니다.' : undefined}
          >
            <TextArea
              id="req-memo"
              value={memo}
              onChange={setMemo}
              maxLength={type === '문의' ? 300 : 200}
              invalid={!!show('memo')}
              placeholder={
                type === '긴급방문' ? '예) 2층 대기실 정수기 누수로 바닥 전체가 젖었습니다.'
                : type === '문의' ? '예) 다음 주 화요일 방문을 오후로 옮길 수 있을까요?'
                : type === '일정변경' ? '예) 내부 공사로 오전 출입이 어렵습니다.'
                : '예) 대기실 유리 위주로 부탁드립니다.'
              }
            />
          </Field>

          {/* 보내기 버튼은 시트 아래에 고정 — 긴 폼을 끝까지 내리지 않아도 누를 수 있게 */}
          <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-line bg-card/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
            <Btn size="lg" className="w-full" variant={type === '긴급방문' ? 'danger' : 'primary'}>
              {type === '긴급방문' ? '긴급 방문 요청하기' : '요청 보내기'}
            </Btn>
            <p className="mt-1.5 text-center text-[0.72rem] text-ink-faint">{REPLY[type]}</p>
          </div>
        </form>
      )}
    </Modal>
  )
}
