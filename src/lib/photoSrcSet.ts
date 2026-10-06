/** scripts/optimize-photos.mjs 가 만드는 WebP 파생본 폭 — 두 곳이 같아야 한다 */
const WIDTHS = [480, 960, 1448] as const
const PHOTO_RE = /^\/photos\/([\w-]+)\.png$/

/** `/photos/01-hero.png` → `/photos/opt/01-hero-480.webp 480w, …` (현장 사진이 아니면 null) */
export function photoSrcSet(src: string | undefined): string | null {
  const m = src?.match(PHOTO_RE)
  if (!m) return null
  return WIDTHS.map((w) => `/photos/opt/${m[1]}-${w}.webp ${w}w`).join(', ')
}
