import { describe, expect, it } from 'vitest'
import { composeRequestDetail, hasErrors, validateRequest, type RequestFields } from './requestForm'

const empty: RequestFields = { service: null, when: null, date: null, slot: null, urgent: null, topic: null, memo: '' }

describe('고객 요청 폼 검증', () => {
  it('추가서비스 — 서비스와 시기가 필수, 메모는 선택', () => {
    expect(validateRequest('추가서비스', empty)).toMatchObject({ service: expect.any(String), when: expect.any(String), memo: null })
    expect(hasErrors(validateRequest('추가서비스', { ...empty, service: '유리창 집중청소', when: '이번 주 안에' }))).toBe(false)
  })

  it('일정변경 — 날짜와 시간대가 필수', () => {
    const e = validateRequest('일정변경', { ...empty, date: '10.08 목' })
    expect(e.date).toBeNull()
    expect(e.slot).toBe('희망 시간대를 선택해 주세요.')
  })

  it('문의 · 긴급 — 내용이 비었는지와 너무 짧은지를 구분해 알려준다', () => {
    expect(validateRequest('문의', { ...empty, topic: '일정' }).memo).toBe('내용을 입력해 주세요.')
    expect(validateRequest('문의', { ...empty, topic: '일정', memo: '짧음' }).memo).toContain('5자 이상')
    expect(validateRequest('긴급방문', { ...empty, urgent: '오염·누수', memo: '     ' }).memo).toBe('내용을 입력해 주세요.')
  })

  it('필요한 것만 채우면 통과 — 다른 유형의 항목은 묻지 않는다', () => {
    expect(hasErrors(validateRequest('긴급방문', { ...empty, urgent: '오염·누수', memo: '로비 누수 발생했습니다' }))).toBe(false)
  })

  it('요청함 요약 문장 — 유형별로 담당자가 바로 읽을 수 있게', () => {
    expect(composeRequestDetail('추가서비스', { ...empty, service: '에어컨 세척', when: '다음 정기방문 때', memo: ' 2대 ' })).toBe('에어컨 세척 · 다음 정기방문 때 — 2대')
    expect(composeRequestDetail('일정변경', { ...empty, date: '10.08 목', slot: '오후' })).toBe('다음 방문 → 10.08 목 오후 희망')
    expect(composeRequestDetail('문의', { ...empty, topic: '계약 · 결제', memo: '세금계산서 문의' })).toBe('[계약 · 결제] 세금계산서 문의')
  })
})
