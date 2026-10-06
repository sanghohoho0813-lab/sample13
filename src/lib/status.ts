import { HEALTH_STATUS_LABEL } from '../types'
import type { Tone } from './tone'

// 상태값 → 의미색 · 화면 표기. 데이터 값은 그대로 두고 표기만 바꾼다 (예: 실행 단계 '확인' → '검토 중')

const TONE_BY_STATUS: Record<string, Tone> = {
  완료: 'success', 성사: 'success', 해결: 'success',
  작업중: 'info', 실행중: 'info', 처리중: 'info', 협의중: 'info', 조치중: 'info',
  이동중: 'brand', 제안됨: 'brand', 확인: 'brand',
  확인필요: 'danger', Risk: 'danger', 위험: 'danger', 보류: 'danger',
  추천됨: 'warning', 발견됨: 'warning', 접수: 'warning', '재계약 주의': 'warning', 'Retention Watch': 'warning',
}

export const statusTone = (status: string): Tone => TONE_BY_STATUS[status] ?? 'neutral'

const DISPLAY_LABEL: Record<string, string> = { ...HEALTH_STATUS_LABEL, 확인: '검토 중', 실행중: '실행 중' }

export const statusLabel = (status: string): string => DISPLAY_LABEL[status] ?? status
