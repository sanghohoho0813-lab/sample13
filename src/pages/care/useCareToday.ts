import { useMemo } from 'react'
import { useDemo } from '../../lib/data/context'
import { teamById } from '../../lib/demo/company'
import { toHM, toMin } from '../../lib/ops/geo'
import { CARE_CUSTOMER_ID } from './careIdentity'

/** 고객 화면의 '오늘 방문' 진행 단계 — 현장직원 앱 기록(체크인 · 작업 시작 · 완료)을 그대로 읽는다 */
export const VISIT_STEPS = ['방문 확정', '도착', '작업 중', '완료'] as const

export function useCareToday() {
  const { schedules, work, reports, issues } = useDemo()
  return useMemo(() => {
    const mine = schedules
      .filter((s) => s.customerId === CARE_CUSTOMER_ID)
      .sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time))
    const today = mine.find((s) => s.dayOffset === 0)
    const next = mine.find((s) => s.status !== '완료' && s.id !== today?.id)
    const ws = today ? work[today.id] : undefined
    const report = today ? reports.find((r) => r.scheduleId === today.id) : undefined
    const todayIssues = today ? issues.filter((i) => i.scheduleId === today.id && i.customerVisible) : []

    // 0 배정 중 · 1 방문 확정 · 2 도착 · 3 작업 중 · 4 완료
    const stage = !today ? -1
      : report || today.status === '완료' ? 4
      : ws?.startedAt || today.status === '작업중' ? 3
      : ws?.checkinAt ? 2
      : today.teamId ? 1 : 0
    const done = ws ? Object.values(ws.checklist).filter(Boolean).length : 0
    const total = ws ? Object.keys(ws.checklist).length : 0
    const team = teamById(today?.teamId ?? null)?.name

    const status = stage === 4 ? '완료' : stage === 3 ? '작업 중' : stage === 2 ? '도착' : stage === 1 ? (today?.status === '이동중' ? '이동 중' : '방문 예정') : '배정 중'
    const caption = !today ? ''
      : stage === 4 ? `${report?.completedAt ?? ''} 작업 완료 — 리포트가 도착했습니다`
      : stage === 3 ? (total ? `현장 점검 ${done}/${total} 진행 중` : '현장에서 작업 중입니다')
      : stage === 2 ? `${ws?.checkinAt} 도착 — 작업을 준비하고 있습니다`
      : stage === 1 ? (today.status === '이동중' ? `${team}이 현장으로 이동 중입니다` : `${team} · ${today.time} 도착 예정`)
      : '담당팀을 배정하고 있습니다'

    return {
      today, next, ws, report, todayIssues, stage, status, caption,
      endTime: (s: { time: string; durationMin: number }) => toHM(toMin(s.time) + s.durationMin),
    }
  }, [schedules, work, reports, issues])
}
