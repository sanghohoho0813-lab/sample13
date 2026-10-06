// 의미색 톤 — 배지 · 숫자 · 상태 글자가 같은 색 규칙을 쓰도록 한 곳에 모은다
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral' | 'brand'

/** 연한 배경 + 진한 글자 (배지 · 칩) */
export const toneBg: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  ai: 'bg-ai-soft text-ai-strong',
  neutral: 'bg-neutral-soft text-ink-soft',
  brand: 'bg-mint text-primary-strong',
}

/** 글자색만 (숫자 · 상태 글자) */
export const toneText: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  ai: 'text-ai-strong',
  neutral: 'text-ink-soft',
  brand: 'text-primary-strong',
}
