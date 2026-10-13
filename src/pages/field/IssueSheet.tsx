import { useEffect, useId, useState } from 'react'
import { Btn, ChoiceGroup, Field, Modal, TextArea } from '../../components/ui'
import type { FieldIssue, IssueSeverity, IssueType } from '../../types'

const TYPES: IssueType[] = ['파손·누수', '소모품 부족', '출입 불가', '안전 위험', '고객 추가 요청', '기타']
const SEVERITY: Array<{ value: IssueSeverity; label: string; desc: string }> = [
  { value: '낮음', label: '낮음', desc: '다음 방문 때 처리' },
  { value: '보통', label: '보통', desc: '오늘 중 본사 확인' },
  { value: '긴급', label: '긴급', desc: '지금 본사 연락 필요' },
]

export type IssueDraft = Pick<FieldIssue, 'type' | 'severity' | 'detail' | 'customerVisible'>

/** 현장 이슈 보고 — 본사 처리함 · 고객 리포트로 이어진다 */
export default function IssueSheet({ open, onClose, onSubmit, customerName }: {
  open: boolean; onClose: () => void; onSubmit: (d: IssueDraft) => void; customerName: string
}) {
  const [type, setType] = useState<IssueType | null>(null)
  const [severity, setSeverity] = useState<IssueSeverity>('보통')
  const [detail, setDetail] = useState('')
  const [visible, setVisible] = useState(true)
  const [tried, setTried] = useState(false)
  const id = useId()
  useEffect(() => { if (open) { setType(null); setSeverity('보통'); setDetail(''); setVisible(true); setTried(false) } }, [open])
  // 안전 위험은 내부 처리 우선 — 기본값으로 고객 화면에 바로 띄우지 않는다
  useEffect(() => { if (type === '안전 위험') setVisible(false) }, [type])

  const detailOk = detail.trim().length >= 5
  const submit = () => {
    setTried(true)
    if (!type || !detailOk) return
    onSubmit({ type, severity, detail: detail.trim(), customerVisible: visible })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={`이슈 보고 — ${customerName}`}>
      <div className="space-y-4">
        <Field label="무슨 일인가요" required error={tried && !type ? '종류를 선택해주세요' : null}>
          <ChoiceGroup options={TYPES} value={type} onChange={setType} cols={3} invalid={tried && !type} label="이슈 종류" />
        </Field>
        <Field label="급한 정도" required>
          <ChoiceGroup options={SEVERITY} value={severity} onChange={setSeverity} cols={3} label="급한 정도" />
        </Field>
        <Field label="내용" required htmlFor={id} error={tried && !detailOk ? '5자 이상 적어주세요 — 본사가 전화 없이 판단할 수 있게' : null} hint="위치 · 상태 · 필요한 조치를 적어주세요">
          <TextArea id={id} value={detail} onChange={setDetail} maxLength={300} rows={3} invalid={tried && !detailOk} placeholder="예) 2층 남자화장실 세면대 배관 누수 — 바닥 물고임, 시설팀 확인 필요" />
        </Field>
        <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-ivory px-3 py-2.5 text-[0.84rem]">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]" />
          <span className="font-bold">고객 리포트에 표시<span className="block text-[0.76rem] font-normal text-ink-faint">끄면 본사 내부에서만 처리합니다</span></span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="outline" size="lg" onClick={onClose}>취소</Btn>
          <Btn variant={severity === '긴급' ? 'danger' : 'primary'} size="lg" onClick={submit}>본사로 보고</Btn>
        </div>
      </div>
    </Modal>
  )
}
