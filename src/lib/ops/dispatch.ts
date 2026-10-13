// ─────────────────────────────────────────────────────────
// Smart Dispatch — 배정 후보 평가 엔진 (규칙 기반, 순수 함수)
//
// 한 일정에 대해 모든 팀을 7가지 요인으로 점수화한다.
//   이동거리 · 직원 역량 · 현재 일정 · 현장 난이도 · 고객 선호 · 연속근무 · 예상 소요시간
// 일정이 겹치거나 근무 인원이 없으면 '배정 불가'로 따로 표시한다(점수로 덮지 않는다).
// 결과의 모든 숫자는 화면에 그대로 근거로 노출되므로, 계산식은 단순하고 설명 가능해야 한다.
// ─────────────────────────────────────────────────────────
import type { Schedule } from '../../types'
import { TEAMS, customerById, siteProfile, teamMembers, workingMembers } from '../demo/company'
import { HQ_DISTRICT, toHM, toMin, travelMinutes } from './geo'

export type FactorKey = 'travel' | 'skill' | 'schedule' | 'difficulty' | 'preference' | 'fatigue' | 'duration'

/** 가중치 합 100 — 역량과 소요시간을 가장 크게 본다 (품질 · 다음 일정 보호) */
export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  skill: 25,
  duration: 15,
  travel: 15,
  schedule: 15,
  difficulty: 10,
  preference: 10,
  fatigue: 10,
}

export const FACTOR_LABEL: Record<FactorKey, string> = {
  travel: '이동거리',
  skill: '직원 역량',
  schedule: '현재 일정',
  difficulty: '현장 난이도',
  preference: '고객 선호',
  fatigue: '연속근무',
  duration: '예상 소요시간',
}

export interface Factor {
  key: FactorKey
  label: string
  weight: number
  /** 0~100 */
  score: number
  detail: string
  level: 'good' | 'warn' | 'bad'
}

export interface DispatchEval {
  teamId: string
  /** 가중 합계 0~100 */
  total: number
  eligible: boolean
  /** 배정 불가 사유 (일정 겹침 · 인원 없음) */
  blockers: string[]
  /** 배정은 가능하지만 확인할 점 */
  warnings: string[]
  factors: Factor[]
  travelMin: number
  fromLabel: string
  arrival: string
  start: string
  end: string
  expectedMin: number
  slackMin: number | null
  next?: { time: string; customer: string }
  crew: number
  members: string[]
  isCurrent: boolean
}

// 서비스 → 필요한 전문 분야. 장비·숙련이 필요한 분야는 전문팀이 아니면 크게 감점한다.
const SERVICE_TAG: Array<[RegExp, string]> = [
  [/유리/, '유리'],
  [/바닥|왁스/, '바닥'],
  [/소독|위생/, '소독'],
  [/에어컨|입주|퇴거|특수/, '특수청소'],
  [/병·의원|병원/, '병의원'],
  [/학원|교육/, '학원'],
  [/공용부|빌딩/, '빌딩'],
  [/매장/, '프랜차이즈'],
  [/상가/, '상가'],
  [/사무실/, '사무실'],
]
const EQUIPMENT_TAGS = new Set(['유리', '바닥', '소독', '특수청소'])

export const serviceTag = (service: string) => SERVICE_TAG.find(([re]) => re.test(service))?.[1] ?? '사무실'

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)))
const level = (score: number): Factor['level'] => (score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad')

/** 진행 중 지연을 반영한 실제 종료 시각(분) */
export const effectiveEnd = (s: Schedule) => toMin(s.time) + s.durationMin + (s.status === '완료' ? 0 : s.delayMin ?? 0)

const districtOf = (customerId: string) => customerById(customerId)?.district ?? HQ_DISTRICT
const nameOf = (customerId: string) => customerById(customerId)?.name ?? customerId

function teamDay(teamId: string, target: Schedule, schedules: Schedule[]) {
  return schedules
    .filter((s) => s.teamId === teamId && s.dayOffset === target.dayOffset && s.id !== target.id)
    .sort((a, b) => toMin(a.time) - toMin(b.time))
}

/** 한 팀을 대상 일정에 넣었을 때의 평가 */
export function evaluateTeam(teamId: string, target: Schedule, schedules: Schedule[]): DispatchEval {
  const team = TEAMS.find((t) => t.id === teamId)!
  const customer = customerById(target.customerId)
  const profile = siteProfile(target.customerId)
  const day = teamDay(teamId, target, schedules)
  const targetStart = toMin(target.time)
  const tag = serviceTag(target.service)
  const typeTag = customer?.type ?? ''
  const specialty = team.specialty
  const crew = workingMembers(teamId).length
  const blockers: string[] = []
  const warnings: string[] = []

  // ── 직전 일정 → 이동 ──
  const prev = [...day].reverse().find((s) => toMin(s.time) < targetStart)
  const prevEnd = prev ? effectiveEnd(prev) : 8 * 60
  const fromDistrict = prev ? districtOf(prev.customerId) : HQ_DISTRICT
  const travel = travelMinutes(fromDistrict, districtOf(target.customerId), prev?.customerId === target.customerId)
  const arrival = prevEnd + travel
  const late = Math.max(0, arrival - targetStart)
  const start = Math.max(targetStart, arrival)

  // ── 예상 소요시간 — 전문팀 0.9배, 일반 1.0배, 전문 장비 분야 비전문팀 1.25배 · 1인이면 1.4배 ──
  const isSpecialist = specialty.includes(tag)
  const typeMatch = specialty.includes(typeTag)
  // 팀 전문분야가 아니어도 그 기술을 가진 팀원이 있으면 반영 (예: 병의원팀의 소독 숙련 직원)
  const skilled = workingMembers(teamId).find((e) => e.skills.some((k) => k.includes(tag) || (tag === '특수청소' && /에어컨|특수/.test(k))))
  const speed = isSpecialist ? 0.9 : skilled ? 1.0 : EQUIPMENT_TAGS.has(tag) ? 1.25 : typeMatch ? 1.0 : 1.1
  const crewFactor = crew >= 2 ? 1 : 1.4
  const expected = Math.round(target.durationMin * speed * crewFactor)
  const end = start + expected

  // ── 일정 겹침 · 다음 일정 ──
  const next = day.find((s) => toMin(s.time) >= targetStart)
  if (crew === 0) blockers.push('근무 가능 인원 없음')
  if (prev && prevEnd > targetStart + 45) blockers.push(`직전 일정(${prev.time} ${nameOf(prev.customerId)})이 ${toHM(prevEnd)}까지 — 시작 불가`)
  let slack: number | null = null
  if (next) {
    const toNext = travelMinutes(districtOf(target.customerId), districtOf(next.customerId), next.customerId === target.customerId)
    slack = toMin(next.time) - (end + toNext)
    // 다음 일정 시작 전에 끝낼 수 없으면(20분 이상) 배정 불가 — 조금 넘치는 정도는 경고로 남긴다
    if (slack < -20) blockers.push(`${next.time} ${nameOf(next.customerId)} 일정과 겹침`)
    else if (slack < 0) warnings.push(`다음 일정(${next.time} ${nameOf(next.customerId)}) ${-slack}분 지연 위험`)
  }
  if (late > 0) warnings.push(`도착 ${toHM(arrival)} — 고객 안내 필요 (${late}분 늦음)`)

  // ── 요인별 점수 ──
  const factors: Factor[] = []
  const push = (key: FactorKey, score: number, detail: string) =>
    factors.push({ key, label: FACTOR_LABEL[key], weight: FACTOR_WEIGHTS[key], score: clamp(score), detail, level: level(clamp(score)) })

  const fromLabel = prev ? nameOf(prev.customerId) : '본사'
  push('travel', 100 - Math.max(0, travel - 10) * 2.2 - Math.min(40, late * 1.5),
    `${fromLabel}에서 ${travel}분 · ${late > 0 ? `도착 ${toHM(arrival)} (${late}분 늦음)` : `${toHM(arrival)} 도착 가능`}`)

  push('skill', isSpecialist ? 100 : skilled ? 80 : EQUIPMENT_TAGS.has(tag) ? 30 : typeMatch ? 85 : 60,
    isSpecialist ? `${tag} 전문팀` : skilled ? `팀원 ${skilled.name} ${tag} 숙련` : EQUIPMENT_TAGS.has(tag) ? `${tag} 전문 장비·숙련 없음` : typeMatch ? `${typeTag} 현장 경험 보유` : '일반 정기청소 가능')

  const scheduleScore = slack === null ? 100 : slack >= 60 ? 100 : slack >= 30 ? 85 : slack >= 10 ? 65 : slack >= 0 ? 45 : 20
  // 약속 시각에 못 맞추면 일정 점수도 깎는다 — 고객 안내 · 마감 시간 위험
  push('schedule', blockers.some((b) => b.includes('겹침') || b.includes('시작 불가')) ? 0 : scheduleScore - Math.min(60, late * 1.2),
    `${late > 0 ? `약속 ${target.time}보다 ${late}분 늦음 · ` : ''}${next ? `이후 ${next.time} ${nameOf(next.customerId)} · 여유 ${slack}분` : '이후 일정 없음'}`)

  const capability = (typeMatch || isSpecialist ? 90 : 60) + (crew >= 2 ? 10 : -25)
  push('difficulty', profile.difficulty <= 50 ? 100 : 100 - Math.max(0, profile.difficulty - capability) * 2.5,
    `난이도 ${profile.difficulty}${profile.difficultyNotes[0] ? ` — ${profile.difficultyNotes[0]}` : ''}${crew < 2 ? ' · 1인 투입' : ''}`)

  const avoid = profile.avoid?.find((a) => a.teamId === teamId)
  const servedBefore = schedules.some((s) => s.teamId === teamId && s.customerId === target.customerId && s.id !== target.id)
  if (avoid) warnings.push(avoid.reason)
  push('preference',
    avoid ? 10 : profile.preferTeamId === teamId ? 100 : customer?.contract.teamId === teamId ? 95 : servedBefore ? 75 : 55,
    avoid ? '고객 기피 이력' : profile.preferTeamId === teamId ? `고객 지정 (${profile.preferNote ?? '선호팀'})` : customer?.contract.teamId === teamId ? '계약 담당팀 — 현장 숙지' : servedBefore ? '최근 방문 이력 있음' : '첫 방문 — 현장 안내 필요')

  const jobsToday = day.length
  const rest = prev ? start - prevEnd - travel : 999
  push('fatigue', 100 - jobsToday * 10 - (rest < 15 ? 15 : 0),
    `오늘 ${jobsToday}건${prev ? ` · 직전 휴식 ${Math.max(0, rest)}분` : ' · 첫 일정'}`)

  const ratio = expected / target.durationMin
  push('duration', ratio <= 1 ? 100 : ratio <= 1.1 ? 80 : ratio <= 1.25 ? 55 : 30,
    `예상 ${expected}분 (계획 ${target.durationMin}분)${crew < 2 ? ' · 1인 작업' : ''}`)

  const total = Math.round(factors.reduce((a, f) => a + (f.score * f.weight) / 100, 0))
  return {
    teamId, total, eligible: blockers.length === 0, blockers, warnings, factors,
    travelMin: travel, fromLabel, arrival: toHM(arrival), start: toHM(start), end: toHM(end),
    expectedMin: expected, slackMin: slack,
    next: next ? { time: next.time, customer: nameOf(next.customerId) } : undefined,
    crew, members: teamMembers(teamId).map((e) => `${e.name}${e.status !== '근무' ? `(${e.status})` : ''}`),
    isCurrent: target.teamId === teamId,
  }
}

/** 모든 팀 평가 — 배정 가능 팀을 점수순으로, 불가 팀은 뒤로 */
export function evaluateDispatch(target: Schedule, schedules: Schedule[]): DispatchEval[] {
  return TEAMS.map((t) => evaluateTeam(t.id, target, schedules))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.total - a.total)
}

/** 현재 배정 기준 도착 예측 — 이전 작업 지연이 다음 현장에 미치는 영향 (방문지연 위험 판단) */
export function arrivalForecast(target: Schedule, schedules: Schedule[]) {
  if (!target.teamId) return null
  const ev = evaluateTeam(target.teamId, target, schedules)
  const late = Math.max(0, toMin(ev.arrival) - toMin(target.time))
  return { arrival: ev.arrival, lateMin: late, from: ev.fromLabel, travelMin: ev.travelMin }
}
