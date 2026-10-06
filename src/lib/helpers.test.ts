import { describe, expect, it } from 'vitest'
import { matchesQuery, normalizeQuery } from './search'
import { statusLabel, statusTone } from './status'
import { photoSrcSet } from './photoSrcSet'
import { titleFor } from './routeTitles'
import { fmtManwon, fmtWon } from './utils'

describe('검색', () => {
  it('공백 · 대소문자를 무시한다', () => {
    expect(normalizeQuery(' 강남  C클리닉 ')).toBe('강남c클리닉')
    expect(matchesQuery(['강남 C클리닉', '강남구'], '강남c')).toBe(true)
    expect(matchesQuery(['누리컨벤션'], '강남')).toBe(false)
  })
  it('검색어가 비어 있거나 공백뿐이면 모두 통과', () => {
    expect(matchesQuery(['아무거나'], '   ')).toBe(true)
  })
  it('비어 있는 필드는 건너뛴다', () => {
    expect(matchesQuery([undefined, null, '병의원'], '병의원')).toBe(true)
  })
})

describe('상태 표기', () => {
  it('데이터 값은 그대로, 화면 표기만 자연스럽게', () => {
    expect(statusLabel('확인')).toBe('검토 중')
    expect(statusLabel('Retention Watch')).toBe('재계약 주의')
    expect(statusLabel('완료')).toBe('완료')
  })
  it('의미색 — 모르는 상태는 중립', () => {
    expect(statusTone('완료')).toBe('success')
    expect(statusTone('확인필요')).toBe('danger')
    expect(statusTone('처음 보는 상태')).toBe('neutral')
  })
})

describe('사진 파생본 경로', () => {
  it('현장 사진은 WebP 3종 srcset', () => {
    expect(photoSrcSet('/photos/01-hero-lobby-service.png')).toBe(
      '/photos/opt/01-hero-lobby-service-480.webp 480w, /photos/opt/01-hero-lobby-service-960.webp 960w, /photos/opt/01-hero-lobby-service-1448.webp 1448w',
    )
  })
  it('현장 사진이 아니면 null (원본 그대로 사용)', () => {
    expect(photoSrcSet('/brand/logo.png')).toBeNull()
    expect(photoSrcSet(undefined)).toBeNull()
  })
})

describe('탭 제목', () => {
  it('화면마다 구분되는 제목', () => {
    expect(titleFor('/')).toBe('대시보드 · CLEANWAY PARTNERS')
    expect(titleFor('/customers/C01')).toBe('고객 상세 · CLEANWAY PARTNERS')
    expect(titleFor('/nope')).toContain('찾을 수 없음')
  })
})

describe('금액 표기', () => {
  it('만원 단위 데이터를 원으로', () => {
    expect(fmtWon(320)).toBe('3,200,000원')
    expect(fmtManwon(85)).toContain('85')
  })
})
