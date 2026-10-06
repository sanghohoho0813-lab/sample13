import type { RequestType } from '../../types'

// 고객 요청 폼의 규칙 — 화면과 분리해 단위 테스트한다

export const TOPIC = ['일정', '작업 품질', '계약 · 결제', '기타'] as const
export type Topic = (typeof TOPIC)[number]

/** 메모가 필수인 유형의 최소 글자 수 (공백 제외 앞뒤) */
export const MEMO_MIN = 5

export interface RequestFields {
  service: string | null
  when: string | null
  date: string | null
  slot: string | null
  urgent: string | null
  topic: string | null
  memo: string
}

export type RequestErrors = Record<keyof RequestFields, string | null>

/** 유형별 필수 항목 — 빠진 항목만 사람이 읽을 문장으로 돌려준다 */
export function validateRequest(type: RequestType, f: RequestFields): RequestErrors {
  const memo = f.memo.trim()
  const memoRequired = type === '긴급방문' || type === '문의'
  return {
    service: type === '추가서비스' && !f.service ? '필요한 서비스를 선택해 주세요.' : null,
    when: type === '추가서비스' && !f.when ? '희망 시기를 선택해 주세요.' : null,
    date: type === '일정변경' && !f.date ? '희망 날짜를 선택해 주세요.' : null,
    slot: type === '일정변경' && !f.slot ? '희망 시간대를 선택해 주세요.' : null,
    urgent: type === '긴급방문' && !f.urgent ? '상황 유형을 선택해 주세요.' : null,
    topic: type === '문의' && !f.topic ? '문의 유형을 선택해 주세요.' : null,
    memo: memoRequired && memo.length < MEMO_MIN
      ? (memo.length === 0 ? '내용을 입력해 주세요.' : `조금만 더 자세히 적어 주세요. (${MEMO_MIN}자 이상)`)
      : null,
  }
}

export const hasErrors = (e: RequestErrors) => Object.values(e).some(Boolean)

/** AX 요청함에 보일 한 줄 요약 — 담당자가 열어보지 않아도 무엇을 원하는지 알 수 있게 */
export function composeRequestDetail(type: RequestType, f: RequestFields): string {
  const memo = f.memo.trim()
  const head =
    type === '추가서비스' ? `${f.service} · ${f.when}` :
    type === '일정변경' ? `다음 방문 → ${f.date} ${f.slot} 희망` :
    type === '긴급방문' ? `[${f.urgent}] ${memo}` :
    `[${f.topic}] ${memo}`
  const extra = memo && (type === '추가서비스' || type === '일정변경') ? ` — ${memo}` : ''
  return head + extra
}
