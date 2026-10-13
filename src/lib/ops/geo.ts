// ─────────────────────────────────────────────────────────
// 이동시간 추정 — 지도 API 연결 전 단계의 규칙 기반 추정치
// 구 중심점(서울 시청 기준 km 좌표) 사이 직선거리 × 도로 보정 1.25, 시내 평균 25km/h + 주차·하차 8분
// 실서비스에서는 이 함수 하나만 지도 API(경로 소요시간)로 바꾼다.
// ─────────────────────────────────────────────────────────

export const DISTRICT_XY: Record<string, [number, number]> = {
  강남구: [9.5, -4.2],
  서초구: [6.2, -5.4],
  송파구: [14.2, -4.0],
  성동구: [8.8, 0.9],
  광진구: [13.0, 1.4],
  마포구: [-1.6, 2.6],
  구로구: [-6.4, -6.2],
  영등포구: [-2.6, -2.0],
}

/** 본사(차고지) — 첫 일정은 여기서 출발한다고 본다 */
export const HQ_DISTRICT = '성동구'

const ROAD_FACTOR = 1.25
const KM_PER_MIN = 25 / 60
const PARKING_MIN = 8

export function distanceKm(a: string, b: string): number {
  const pa = DISTRICT_XY[a]
  const pb = DISTRICT_XY[b]
  if (!pa || !pb) return 8
  return Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) * ROAD_FACTOR
}

/** 같은 현장이면 0분, 같은 구면 최소 10분 */
export function travelMinutes(fromDistrict: string, toDistrict: string, sameSite = false): number {
  if (sameSite) return 0
  if (fromDistrict === toDistrict) return 10
  return Math.round(PARKING_MIN + distanceKm(fromDistrict, toDistrict) / KM_PER_MIN)
}

// ── 시각 계산 ('HH:MM' ↔ 분) ──
export const toMin = (hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
export const toHM = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** 데모 기준 시각 — 시드 데이터의 진행 상태(완료 · 작업중 · 예정)가 이 시각을 기준으로 맞춰져 있다 */
export const DEMO_NOW = '14:20'
