// ─────────────────────────────────────────────────────────
// Device Preview 모드 감지
// Preview는 "같은 Route · 같은 Data · 같은 State · 같은 Role · 같은 Theme를
// 다른 Viewport에서 보는 것" 이며, Preview 내부에서는 Device Switch를 숨긴다
// (Recursive Preview 금지 — Preview Safety Gate).
// ─────────────────────────────────────────────────────────
export type PreviewKind = 'mobile' | 'pc'

export const PREVIEW_PARAM = 'preview'

/** 현재 문서가 Preview iframe 내부인지 */
export function isInPreview(): boolean {
  if (typeof window === 'undefined') return false
  const p = new URLSearchParams(window.location.search).get(PREVIEW_PARAM)
  return p === 'mobile' || p === 'pc'
}

export function previewKind(): PreviewKind | null {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search).get(PREVIEW_PARAM)
  return p === 'mobile' || p === 'pc' ? p : null
}

/** 현재 Route(+query) 에 preview 파라미터를 붙인 URL */
export function previewUrl(pathname: string, search: string, kind: PreviewKind): string {
  const params = new URLSearchParams(search)
  params.set(PREVIEW_PARAM, kind)
  return `${pathname}?${params.toString()}`
}

export const MOBILE_PREVIEW = { w: 390, h: 844 }
export const PC_PREVIEW = { w: 1440, h: 900 }
