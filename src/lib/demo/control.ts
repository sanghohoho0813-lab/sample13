// ─────────────────────────────────────────────────────────
// 운영 통제 시드 (DEMO) — 배정 변경안 · 현장 이슈 · 변경 이력
// 오늘 아침부터 기준 시각(14:20)까지 실제로 있었던 일처럼 구성한다.
// ─────────────────────────────────────────────────────────
import type { AuditEntry, DispatchProposal, FieldIssue } from '../../types'

export const SEED_PROPOSALS: DispatchProposal[] = [
  {
    id: 'P-01', scheduleId: 'SC-16', kind: '신규 배정', status: '추천', fromTeamId: null,
    reason: '미배정 일정 — 15:30 유리창 집중청소', createdAt: '08:45', createdBy: 'AI 스마트 배정', actionId: 'A-08',
  },
  {
    id: 'P-02', scheduleId: 'SC-14', kind: '재배정', status: '추천', fromTeamId: 'T-C',
    reason: '담당팀 이전 작업 32분 지연 — 15:30 약속 시각 도착 불가 예측', createdAt: '14:12', createdBy: 'AI 서비스 위험 감지', actionId: 'A-01',
  },
  {
    id: 'P-03', scheduleId: 'SC-18', kind: '재배정', status: '추천', fromTeamId: 'T-G',
    reason: '신우철 결원 — 1인 작업 시 18:30 해온아동병원 일정과 겹침', createdAt: '08:20', createdBy: 'AI 서비스 위험 감지',
  },
]

export const SEED_ISSUES: FieldIssue[] = [
  {
    id: 'FI-01', scheduleId: 'SC-11', customerId: 'C09', type: '소모품 부족', severity: '보통',
    detail: '2층 화장실 핸드타월 디스펜서 고장 — 소모품 보충 불가, 교체 부품 필요',
    reportedBy: '이준호 팀장', at: '12:15', status: '조치중', owner: '최은지 운영관리자', customerVisible: true,
  },
]

export const SEED_AUDIT: AuditEntry[] = [
  { id: 'AU-07', day: 'TODAY', at: '14:12', actor: 'AI 서비스 위험 감지', role: 'system', entity: '배정', entityId: 'P-02', target: '성수 B오피스', action: '재배정안 생성', note: '이전 작업 32분 지연' },
  { id: 'AU-06', day: 'TODAY', at: '12:20', actor: '최은지 운영관리자', role: 'manager', entity: '현장 이슈', entityId: 'FI-01', target: '서초 E의원', action: '담당 지정', from: '접수', to: '조치중' },
  { id: 'AU-05', day: 'TODAY', at: '12:15', actor: '이준호 팀장', role: 'field', entity: '현장 이슈', entityId: 'FI-01', target: '서초 E의원', action: '이슈 보고', note: '소모품 부족 · 보통' },
  { id: 'AU-04', day: 'TODAY', at: '09:30', actor: '최은지 운영관리자', role: 'manager', entity: '요청', entityId: 'R-01', target: '라온메디컬센터', action: '담당 지정', from: '접수', to: '처리중' },
  { id: 'AU-03', day: 'TODAY', at: '08:50', actor: '김도윤 팀장', role: 'manager', entity: '조치', entityId: 'A-02', target: '라온메디컬센터', action: '검토 시작', from: '추천됨', to: '확인' },
  { id: 'AU-02', day: 'TODAY', at: '08:45', actor: 'AI 스마트 배정', role: 'system', entity: '배정', entityId: 'P-01', target: '강남 C클리닉', action: '신규 배정안 생성' },
  { id: 'AU-01', day: 'D-2', at: '17:40', actor: '문성재 팀장', role: 'manager', entity: '조치', entityId: 'A-06', target: '누리컨벤션', action: '보류', from: '추천됨', to: '보류', note: '행사 시즌 종료 후 재협의' },
]
