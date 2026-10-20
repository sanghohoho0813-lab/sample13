import type { RequestType } from '../../types'

/**
 * 요청 유형별 첫 회신 목표 — 고객 요청 시트가 고객에게 약속한 시간과 같다.
 * 본사 요청함은 이 목표를 그대로 보여 '언제까지 답해야 하는지'를 놓치지 않게 한다.
 */
export const REPLY_TARGET: Record<RequestType, string> = {
  긴급방문: '30분',
  문의: '1시간',
  일정변경: '2시간',
  추가서비스: '영업일 1일',
}
