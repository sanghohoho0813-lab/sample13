// ─────────────────────────────────────────────────────────
// 현장 서비스 사진 Layer
// public/photos/ 의 원본 이미지(1448×1086 PNG, 무손실 그대로)를 참조한다.
// 톤: Deep Teal + White · 밝은 자연광 · 전문 장비 · 실제 서비스 현장 리얼리즘
// ─────────────────────────────────────────────────────────

export const PHOTO = {
  /** 01 메인 HERO — 로비에서 전문 장비로 바닥을 관리하는 현장 */
  hero: '/photos/01-hero-lobby-service.png',
  /** 02 사무실 정기청소 */
  office: '/photos/02-office-regular.png',
  /** 03 상가 정기관리 */
  retail: '/photos/03-retail-regular.png',
  /** 04 병·의원 청소관리 */
  clinic: '/photos/04-clinic-care.png',
  /** 05 학원·교육시설 관리 */
  academy: '/photos/05-academy-care.png',
  /** 06 건물 공용부 관리 */
  commonArea: '/photos/06-common-area.png',
  /** 07 바닥 세척 / 왁스 */
  floorWax: '/photos/07-floor-wax.png',
  /** 08 유리창 집중청소 */
  glass: '/photos/08-glass-cleaning.png',
  /** 09 소독 / 위생관리 */
  disinfection: '/photos/09-disinfection.png',
  /** 10 에어컨 세척 */
  aircon: '/photos/10-aircon-cleaning.png',
  /** 11 입주·퇴거 특수청소 */
  moveInOut: '/photos/11-move-in-out.png',
  /** 12 Before ① 바닥 — 얼룩·오염이 남은 상업시설 바닥 */
  beforeFloor: '/photos/12-before-floor.png',
  /** 13 After ① 바닥 — 같은 공간, 세척·왁스 후 광택 */
  afterFloor: '/photos/13-after-floor.png',
  /** 14 Before ② 유리/공용공간 — 손자국·먼지 */
  beforeGlass: '/photos/14-before-glass.png',
  /** 15 After ② 유리/공용공간 — 깨끗하게 완료 */
  afterGlass: '/photos/15-after-glass.png',
  /** 16 현장 직원 모바일 작업등록 — 현장 → AX 연결 */
  fieldMobile: '/photos/16-field-mobile-report.png',
  /** 17 관리자 품질점검 — Evidence / 품질관리 */
  managerInspection: '/photos/17-manager-inspection.png',
  /** 18 장비·소모품 관리 — 운영 시스템을 가진 회사 */
  equipment: '/photos/18-equipment-supplies.png',
  /** 19 작업 완료 증빙촬영 — 현장 사진 → 작업 리포트 → 고객 포털 */
  completionPhoto: '/photos/19-completion-photo.png',
  /** 20 AX 연결 대표 이미지 — 현장 작업 + 관리자 데이터 확인 */
  axConnect: '/photos/20-ax-connect.png',
} as const

export const PHOTO_ALT: Record<string, string> = {
  [PHOTO.hero]: '건물 로비에서 전문 장비로 바닥을 관리하는 클린웨이 현장 담당자',
  [PHOTO.office]: '사무실 책상과 공용공간을 정기 관리하는 현장 담당자',
  [PHOTO.retail]: '카페·매장 등 상업공간 바닥을 관리하는 현장 담당자',
  [PHOTO.clinic]: '병원 대기공간을 위생적으로 관리하는 현장 담당자',
  [PHOTO.academy]: '강의실 책상과 집기를 정돈하고 청소하는 현장 담당자',
  [PHOTO.commonArea]: '빌딩 복도·엘리베이터 앞 공용공간을 관리하는 현장 담당자',
  [PHOTO.floorWax]: '전문 바닥 세척기로 로비 바닥을 광택 관리하는 현장 담당자',
  [PHOTO.glass]: '대형 유리창을 전문 스퀴지로 청소하는 현장 담당자',
  [PHOTO.disinfection]: '엘리베이터 버튼 등 접촉면을 소독하는 현장 담당자',
  [PHOTO.aircon]: '벽걸이 에어컨을 분해·세척하는 전문 관리 장면',
  [PHOTO.moveInOut]: '입주 전 빈 사무실을 집중 청소하는 현장 담당자',
  [PHOTO.beforeFloor]: 'Before — 얼룩과 오염이 남아 있는 상업시설 바닥',
  [PHOTO.afterFloor]: 'After — 세척·왁스 후 광택이 살아난 같은 공간의 바닥',
  [PHOTO.beforeGlass]: 'Before — 손자국과 먼지가 보이는 유리문과 공용공간',
  [PHOTO.afterGlass]: 'After — 깨끗하게 완료된 유리와 공용공간',
  [PHOTO.fieldMobile]: '현장에서 스마트폰으로 작업 완료를 등록하는 현장 담당자',
  [PHOTO.managerInspection]: '태블릿으로 작업 완료 공간을 점검하는 관리자',
  [PHOTO.equipment]: '청소 카트·세제·장비가 체계적으로 정리된 자재 관리 공간',
  [PHOTO.completionPhoto]: '작업이 끝난 공간을 스마트폰으로 촬영해 기록하는 현장 담당자',
  [PHOTO.axConnect]: '현장에서는 담당자가 관리하고 관리자는 데이터를 확인하는 운영 장면',
}

/** 서비스명 → 대표 사진 (계약 서비스·추가서비스 모두 포함) */
export const SERVICE_PHOTO: Record<string, string> = {
  '사무실 정기청소': PHOTO.office,
  '상가 정기관리': PHOTO.retail,
  '매장 정기관리': PHOTO.retail,
  '병·의원 청소관리': PHOTO.clinic,
  '학원·교육시설 관리': PHOTO.academy,
  '건물 공용부 관리': PHOTO.commonArea,
  '바닥 세척 / 왁스': PHOTO.floorWax,
  '바닥 집중관리': PHOTO.floorWax,
  '유리창 집중청소': PHOTO.glass,
  '유리 집중관리': PHOTO.glass,
  '소독 / 위생관리': PHOTO.disinfection,
  '정기 소독 패키지': PHOTO.disinfection,
  '에어컨 세척': PHOTO.aircon,
  '입주·퇴거 특수청소': PHOTO.moveInOut,
  '대청소': PHOTO.commonArea,
  '소모품 관리': PHOTO.equipment,
}

export const photoOf = (service?: string) =>
  (service && SERVICE_PHOTO[service]) || PHOTO.commonArea

export const altOf = (src: string) => PHOTO_ALT[src] ?? '클린웨이파트너스 현장 서비스 사진'

/**
 * Before / After 쌍 — 리포트의 작업 성격에 맞춰 선택한다.
 * 유리·공용공간 관련이면 glass 쌍, 그 외에는 floor 쌍.
 */
export const beforeAfterFor = (note?: string) => {
  const glassish = !!note && /유리|창|공용|로비/.test(note)
  return glassish
    ? { before: PHOTO.beforeGlass, after: PHOTO.afterGlass, subject: '유리 · 공용공간' }
    : { before: PHOTO.beforeFloor, after: PHOTO.afterFloor, subject: '바닥' }
}
