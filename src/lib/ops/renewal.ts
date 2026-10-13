// ─────────────────────────────────────────────────────────
// 재계약 판단 — 고객 이탈 위험 · 계약 조건 · 추가매출을 한 번에 본다 (규칙 기반, 순수 함수)
//
// 이탈 위험(0~100) = 계약 시점 15 + 방문 이행 15 + 불만·요청 30 + 작업 품질 25 + 서비스 이용 15
// 고객 건강도 = 100 − 이탈 위험. 수익성은 이탈 위험과 섞지 않고 '재계약 조건'을 정하는 데 쓴다.
// 고객이 요청을 해결받거나 리포트를 평가하면 입력이 바뀌어 점수도 즉시 바뀐다.
// ─────────────────────────────────────────────────────────
import type { CustomerHealth, CustomerRequest, FieldIssue, ServiceReport, UpsellOpportunity } from '../../types'
import { customerById } from '../demo/company'
import { SEED_PROFITABILITY, SEED_QUALITY, VISIT_STATS } from '../demo/intelligence'

export type RiskKey = 'timing' | 'visits' | 'voice' | 'quality' | 'engagement'

export const RISK_WEIGHTS: Record<RiskKey, number> = { timing: 15, visits: 15, voice: 30, quality: 25, engagement: 15 }
export const RISK_LABEL: Record<RiskKey, string> = {
  timing: '계약 시점',
  visits: '방문 이력',
  voice: '불만 · 요청',
  quality: '작업 품질',
  engagement: '이용 서비스',
}

export interface RiskFactor {
  key: RiskKey
  label: string
  weight: number
  /** 0~100 — 높을수록 이탈 위험 */
  risk: number
  detail: string
}

export interface RenewalInputs {
  requests: CustomerRequest[]
  reports: ServiceReport[]
  upsell: UpsellOpportunity[]
  issues: FieldIssue[]
}

export interface RenewalAssessment {
  customerId: string
  dday: number
  annualValue: number // 만원/년
  churnRisk: number
  health: number
  status: CustomerHealth['aiStatus']
  factors: RiskFactor[]
  positives: string[]
  watch: string[]
  margin: { pct: number; grade: string; note: string } | null
  upsell: { open: UpsellOpportunity[]; won: UpsellOpportunity[]; revenue: number }
  /** 재계약 전략 — 1순위가 맨 앞 */
  strategy: Array<{ title: string; why: string; tone: 'danger' | 'warning' | 'success' | 'brand' }>
  /** 이탈 시 잃는 연 매출 × 이탈 가능성 */
  expectedLoss: number
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

export function assessRenewal(customerId: string, inp: RenewalInputs): RenewalAssessment | null {
  const c = customerById(customerId)
  if (!c) return null
  const dday = c.contract.renewalDDay
  const visits = VISIT_STATS[customerId] ?? { planned: 1, done: 1, late: 0, missed: 0 }
  const quality = SEED_QUALITY.filter((q) => q.customerId === customerId)
  const complaints = quality.filter((q) => q.category === '클레임' || q.category === '품질문의').length
  const openQuality = quality.filter((q) => q.status !== '해결').length
  const openRequests = inp.requests.filter((r) => r.customerId === customerId && r.status !== '완료' && r.status !== '반려')
  const doneRequests = inp.requests.filter((r) => r.customerId === customerId && r.status === '완료')
  const openIssues = inp.issues.filter((i) => i.customerId === customerId && i.status !== '해결' && i.customerVisible)
  const rated = inp.reports.filter((r) => r.customerId === customerId && typeof r.rating === 'number')
  const avgRating = rated.length ? rated.reduce((a, r) => a + (r.rating ?? 0), 0) / rated.length : null
  // 만족도 — 기존 만족도에 최근 리포트 평가를 가중 반영 (평가 1건 = 기존의 1/4 무게)
  const satisfaction = avgRating === null ? c.satisfaction : (c.satisfaction * 4 + avgRating * rated.length) / (4 + rated.length)
  const myUpsell = inp.upsell.filter((u) => u.customerId === customerId)
  const won = myUpsell.filter((u) => u.status === '성사')
  const open = myUpsell.filter((u) => u.status !== '성사' && u.status !== '보류')

  const factors: RiskFactor[] = []
  const push = (key: RiskKey, risk: number, detail: string) =>
    factors.push({ key, label: RISK_LABEL[key], weight: RISK_WEIGHTS[key], risk: clamp(risk), detail })

  push('timing', dday <= 21 ? 100 : dday <= 30 ? 85 : dday <= 60 ? 50 : dday <= 90 ? 30 : 10,
    `계약 종료 D-${dday}${dday <= 30 ? ' — 재계약 협의 시기' : dday <= 60 ? ' — 사전관리 구간' : ''}`)

  const lateRate = visits.late / visits.planned
  const missRate = visits.missed / visits.planned
  push('visits', lateRate * 300 + missRate * 600,
    `90일 ${visits.planned}회 중 지연 ${visits.late} · 누락 ${visits.missed}`)

  push('voice', complaints * 12 + (openQuality + openRequests.length + openIssues.length) * 10 + c.recentInquiries * 6 - doneRequests.length * 4,
    `품질 문의·클레임 ${complaints}건 · 미해결 ${openQuality + openRequests.length + openIssues.length}건 · 최근 문의 ${c.recentInquiries}회`)

  push('quality', (4.8 - satisfaction) * 45,
    `만족도 ${satisfaction.toFixed(1)}${avgRating !== null ? ` (최근 평가 ${rated.length}건 반영)` : ''}`)

  push('engagement', won.length ? 10 : open.length ? 20 : 30,
    won.length ? `추가서비스 이용 ${won.length}건` : open.length ? `추가서비스 검토 중 ${open.length}건` : '기본 계약만 이용 — 접점 적음')

  const churnRisk = clamp(factors.reduce((a, f) => a + (f.risk * f.weight) / 100, 0))
  const health = 100 - churnRisk
  const status: CustomerHealth['aiStatus'] = health >= 80 ? '안정' : health >= 60 ? 'Retention Watch' : 'Risk'

  const p = SEED_PROFITABILITY.find((x) => x.customerId === customerId)
  const margin = p ? { pct: p.contributionMarginPct, grade: p.grade, note: p.aiNote } : null
  const annualValue = c.contract.monthlyFee * 12
  const expectedLoss = Math.round(annualValue * (churnRisk / 100) * 0.8)

  // ── 좋은 점 / 살펴볼 점 — 요인에서 바로 만든다 (별도 문구 관리 없음) ──
  const positives: string[] = []
  const watch: string[] = []
  if (missRate === 0 && lateRate < 0.03) positives.push('정기방문 정상 이행'); else watch.push(`방문 지연·누락 ${visits.late + visits.missed}회 (90일)`)
  if (satisfaction >= 4.5) positives.push(`만족도 ${satisfaction.toFixed(1)}`); else if (satisfaction < 4.3) watch.push(`만족도 ${satisfaction.toFixed(1)}`)
  if (complaints + openRequests.length + openIssues.length === 0) positives.push('미해결 불만 없음')
  else if (openQuality + openRequests.length + openIssues.length > 0) watch.push(`미해결 요청·이슈 ${openQuality + openRequests.length + openIssues.length}건`)
  if (doneRequests.length > 0) positives.push(`요청 처리 완료 ${doneRequests.length}건`)
  if (won.length) positives.push('추가서비스 이용 중')
  if (dday <= 60) watch.push(`계약 종료 D-${dday}`)
  if (margin && margin.pct < 20) watch.push(`기여마진 ${margin.pct}% — 수익성 악화`)

  // ── 재계약 전략 ──
  const strategy: RenewalAssessment['strategy'] = []
  if (churnRisk >= 40) strategy.push({ title: '품질 회복 후 재계약 협의', why: `미해결 ${openQuality + openRequests.length + openIssues.length}건을 먼저 해결하고 담당자 미팅 — 이탈 시 연 ${annualValue.toLocaleString()}만원`, tone: 'danger' })
  if (margin && margin.pct < 20) strategy.push({ title: '범위 · 단가 재협의', why: `기여마진 ${margin.pct}% — ${margin.note}`, tone: 'warning' })
  if (open.length) strategy.push({ title: '추가서비스 묶음 재계약', why: `${open.map((u) => u.recommendedService).join(' · ')} — 예상 +${open.reduce((a, u) => a + u.expectedRevenue, 0)}만원`, tone: 'success' })
  if (!strategy.length) strategy.push({ title: dday <= 90 ? '현 조건 유지 · 조기 갱신 제안' : '정기 관리 유지', why: '위험 신호 없음 — 갱신 시점에 장기계약 할인 제안', tone: 'brand' })

  return {
    customerId, dday, annualValue, churnRisk, health, status, factors, positives, watch, margin,
    upsell: { open, won, revenue: open.reduce((a, u) => a + u.expectedRevenue, 0) },
    strategy, expectedLoss,
  }
}
