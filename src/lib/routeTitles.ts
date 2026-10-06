/** 브라우저 탭 제목 — 탭을 여러 개 열어도 어느 화면인지 구분되게 */
const TITLES: Array<[RegExp, string]> = [
  [/^\/$/, '대시보드'],
  [/^\/today$/, '오늘의 AX'],
  [/^\/schedule$/, '일정 / 배정'],
  [/^\/sites$/, '현장관리'],
  [/^\/sites\/.+/, '현장 상세'],
  [/^\/work$/, '작업현황'],
  [/^\/team$/, '직원 / 팀'],
  [/^\/customers$/, '고객 / 계약'],
  [/^\/customers\/.+/, '고객 상세'],
  [/^\/requests$/, '요청 / 문의'],
  [/^\/quality$/, '품질 / 만족도'],
  [/^\/renewals$/, '재계약 관리'],
  [/^\/upsell$/, '추가서비스'],
  [/^\/profitability$/, '수익성 분석'],
  [/^\/ai$/, 'AI 센터'],
  [/^\/evidence$/, 'AX 실증 기록'],
  [/^\/why-ax$/, '기획의도'],
  [/^\/settings$/, '설정'],
  [/^\/presentation$/, '시연 모드'],
  [/^\/field$/, '현장직원 앱'],
  [/^\/care$/, '서비스 소개 · 고객 플랫폼'],
  [/^\/care\/home$/, '내 관리현황 · 고객 플랫폼'],
  [/^\/care\/reports$/, '작업 리포트 · 고객 플랫폼'],
  [/^\/care\/requests$/, '요청 · 문의 · 고객 플랫폼'],
]
export const APP_NAME = 'CLEANWAY PARTNERS'

export function titleFor(pathname: string): string {
  const hit = TITLES.find(([re]) => re.test(pathname))
  return hit ? `${hit[1]} · ${APP_NAME}` : `페이지를 찾을 수 없음 · ${APP_NAME}`
}
