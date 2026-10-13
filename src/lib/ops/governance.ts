// ─────────────────────────────────────────────────────────
// 내부통제 — 역할별 권한 · 상태 전이표 · 승인 정책 (단일 원본)
// 화면의 버튼 활성화, 리듀서의 검사, 설정 화면의 권한표가 모두 이 파일을 본다.
// ─────────────────────────────────────────────────────────
import type { ActionStatus, ProposalStatus, RequestStatus, Role, UpsellOpportunity } from '../../types'

export type Permission =
  | 'dispatch.review'      // 배정안 검토(팀 선택 · 사유)
  | 'dispatch.approve'     // 배정안 승인 · 반려 · 보류
  | 'request.handle'       // 고객 요청 담당 지정 · 회신 · 일정 확정
  | 'action.update'        // AI 조치 실행 단계 변경 · 담당자 변경
  | 'upsell.update'        // 매출 기회 단계 변경
  | 'issue.handle'         // 현장 이슈 조치
  | 'field.execute'        // 체크인 · 체크리스트 · 사진 · 완료
  | 'finance.view'         // 매출 · 수익성 · 기여마진
  | 'audit.view'           // 변경 이력 · 실증 기록
  | 'customer.request'     // 고객 요청 접수 · 평가

export const PERMISSION_LABEL: Record<Permission, string> = {
  'dispatch.review': '배정안 검토',
  'dispatch.approve': '배정 승인 · 반려',
  'request.handle': '고객 요청 처리',
  'action.update': 'AI 조치 실행 · 담당 변경',
  'upsell.update': '매출 기회 단계 변경',
  'issue.handle': '현장 이슈 조치',
  'field.execute': '현장 작업 수행 · 기록',
  'finance.view': '매출 · 수익성 열람',
  'audit.view': '변경 이력 열람',
  'customer.request': '요청 접수 · 서비스 평가',
}

/** 역할별 권한 — 대표는 승인권자, 운영관리자는 처리 담당, 현장직원은 수행, 고객은 요청 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ceo: ['dispatch.review', 'dispatch.approve', 'request.handle', 'action.update', 'upsell.update', 'issue.handle', 'finance.view', 'audit.view'],
  manager: ['dispatch.review', 'dispatch.approve', 'request.handle', 'action.update', 'upsell.update', 'issue.handle', 'audit.view'],
  field: ['field.execute'],
  customer: ['customer.request'],
}

export const can = (role: Role, p: Permission) => ROLE_PERMISSIONS[role].includes(p)

/** 권한이 없을 때 버튼 옆에 보여줄 이유 */
export const denyReason = (p: Permission) => `${PERMISSION_LABEL[p]} 권한 필요 (대표 · 운영관리자)`

/**
 * 승인 정책 — 직무 분리
 * 이미 담당팀이 있는 일정을 바꾸는 '재배정'은 고객 안내가 바뀌므로, 검토한 사람과 다른 사람이 승인한다.
 * 미배정 일정의 '신규 배정'은 검토자가 바로 승인할 수 있다.
 */
export const needsSecondApprover = (kind: string) => kind !== '신규 배정'

// ── 상태 전이표 — 표에 없는 전이는 리듀서가 무시한다 ──
export const PROPOSAL_FLOW: Record<ProposalStatus, ProposalStatus[]> = {
  추천: ['검토', '보류', '반려'],
  검토: ['승인', '보류', '반려', '추천'],
  승인: ['현장확인'],
  현장확인: [],
  보류: ['추천', '검토', '반려'],
  반려: [],
}

export const REQUEST_FLOW: Record<RequestStatus, RequestStatus[]> = {
  접수: ['검토중', '처리중', '반려'],
  검토중: ['처리중', '완료', '반려'],
  처리중: ['완료'],
  완료: [],
  반려: [],
}

export const ACTION_FLOW: Record<ActionStatus, ActionStatus[]> = {
  추천됨: ['확인', '보류', '무시'],
  확인: ['실행중', '보류'],
  실행중: ['완료', '보류'],
  완료: [],
  보류: ['확인', '무시'],
  무시: [],
}

export const UPSELL_FLOW: Record<UpsellOpportunity['status'], UpsellOpportunity['status'][]> = {
  발견됨: ['제안됨', '협의중', '보류'],
  제안됨: ['협의중', '성사', '보류'],
  협의중: ['성사', '보류'],
  성사: [],
  보류: ['발견됨'],
}

export const canMove = <S extends string>(flow: Record<S, S[]>, from: S, to: S) => from === to || (flow[from] ?? []).includes(to)

/** 화면 단계 표시용 — 배정안 */
export const PROPOSAL_STEPS: Array<{ status: ProposalStatus; label: string }> = [
  { status: '추천', label: 'AI 추천' },
  { status: '검토', label: '담당자 검토' },
  { status: '승인', label: '승인 · 일정 반영' },
  { status: '현장확인', label: '현장 수신 확인' },
]
