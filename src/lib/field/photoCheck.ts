// ─────────────────────────────────────────────────────────
// 현장 사진 화질 검사 — 브라우저에서 바로 계산한다 (서버 전송 전)
//   밝기(평균 휘도) · 선명도(라플라시안 분산) · 대비(휘도 표준편차) · 해상도 · 중복(평균 해시)
// 계산부는 순수 함수(회색조 배열 입력)라 단위 테스트로 기준을 고정한다.
// ─────────────────────────────────────────────────────────

export interface PhotoMetrics {
  width: number
  height: number
  brightness: number
  contrast: number
  sharpness: number
  hash: string
}

export interface PhotoVerdict {
  ok: boolean
  /** 다시 찍어야 하는 문제 — '그대로 사용'을 막는다 */
  blocking: string[]
  /** 확인하고 그대로 쓸 수 있는 경고 */
  warnings: string[]
}

/** 판정 기준 — 현장 실내 조명 기준으로 맞췄다 */
export const PHOTO_RULES = {
  minSide: 320,
  dark: 45,
  bright: 235,
  minContrast: 12,
  minSharpness: 40,
  duplicateDistance: 5,
} as const

/** RGBA → 회색조(0~255) */
export function toGray(rgba: ArrayLike<number>, w: number, h: number): Float32Array {
  const g = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) g[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2]
  return g
}

/** 밝기 · 대비 · 선명도 · 해시 */
export function measure(gray: Float32Array, w: number, h: number, original = { width: w, height: h }): PhotoMetrics {
  let sum = 0
  for (const v of gray) sum += v
  const mean = sum / gray.length
  let sq = 0
  for (const v of gray) sq += (v - mean) ** 2
  const contrast = Math.sqrt(sq / gray.length)

  // 라플라시안(4-이웃) 분산 — 초점이 흐리거나 흔들리면 경계가 뭉개져 작아진다
  let lsum = 0, lsq = 0, n = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap = gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i]
      lsum += lap; lsq += lap * lap; n++
    }
  }
  const sharpness = n ? lsq / n - (lsum / n) ** 2 : 0
  return {
    width: original.width, height: original.height,
    brightness: Math.round(mean), contrast: Math.round(contrast), sharpness: Math.round(sharpness),
    hash: averageHash(gray, w, h),
  }
}

/** 8×8 평균 해시 — 같은 장면을 다시 올렸는지 비교용 (16자리 16진수) */
export function averageHash(gray: Float32Array, w: number, h: number): string {
  const cells: number[] = []
  for (let cy = 0; cy < 8; cy++) {
    for (let cx = 0; cx < 8; cx++) {
      const x0 = Math.floor((cx * w) / 8), x1 = Math.max(x0 + 1, Math.floor(((cx + 1) * w) / 8))
      const y0 = Math.floor((cy * h) / 8), y1 = Math.max(y0 + 1, Math.floor(((cy + 1) * h) / 8))
      let s = 0, c = 0
      for (let y = y0; y < y1 && y < h; y++) for (let x = x0; x < x1 && x < w; x++) { s += gray[y * w + x]; c++ }
      cells.push(c ? s / c : 0)
    }
  }
  const avg = cells.reduce((a, b) => a + b, 0) / 64
  let hex = ''
  for (let i = 0; i < 64; i += 4) {
    const nib = (cells[i] > avg ? 8 : 0) | (cells[i + 1] > avg ? 4 : 0) | (cells[i + 2] > avg ? 2 : 0) | (cells[i + 3] > avg ? 1 : 0)
    hex += nib.toString(16)
  }
  return hex
}

export function hamming(a: string, b: string): number {
  let d = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    while (x) { d += x & 1; x >>= 1 }
  }
  return d
}

/** 판정 — otherHash 는 반대쪽(작업 전 ↔ 후) 사진의 해시 */
export function judge(m: PhotoMetrics, otherHash?: string): PhotoVerdict {
  const blocking: string[] = []
  const warnings: string[] = []
  if (otherHash && hamming(m.hash, otherHash) <= PHOTO_RULES.duplicateDistance) blocking.push('반대쪽 사진과 같은 장면입니다 — 작업 전 · 후를 각각 찍어주세요')
  if (m.contrast < PHOTO_RULES.minContrast) blocking.push('화면이 거의 한 색입니다 — 렌즈가 가려졌는지 확인해주세요')
  if (m.brightness < PHOTO_RULES.dark) warnings.push('너무 어둡습니다 — 조명을 켜거나 플래시를 사용해주세요')
  else if (m.brightness > PHOTO_RULES.bright) warnings.push('빛 번짐 — 창을 등지고 다시 찍어주세요')
  if (m.sharpness < PHOTO_RULES.minSharpness && m.contrast >= PHOTO_RULES.minContrast) warnings.push('흔들렸거나 초점이 맞지 않습니다')
  if (Math.min(m.width, m.height) < PHOTO_RULES.minSide) warnings.push(`해상도가 낮습니다 (${m.width}×${m.height})`)
  return { ok: !blocking.length && !warnings.length, blocking, warnings }
}

/**
 * 파일 → 축소 이미지 + 측정값 (브라우저 전용)
 * 저장 · 전송량을 줄이려고 긴 변 480px JPEG 로 줄여 data URL 로 보관한다.
 */
export async function readPhoto(file: File): Promise<{ dataUrl: string; metrics: PhotoMetrics }> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일이 아닙니다')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image()
      el.onload = () => res(el)
      el.onerror = () => rej(new Error('사진을 열 수 없습니다 — 다른 사진을 선택해주세요'))
      el.src = url
    })
    const W = img.naturalWidth, H = img.naturalHeight
    const scale = Math.min(1, 480 / Math.max(W, H))
    const w = Math.max(1, Math.round(W * scale)), h = Math.max(1, Math.round(H * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('이 기기에서는 사진 검사를 할 수 없습니다')
    ctx.drawImage(img, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)
    const metrics = measure(toGray(data, w, h), w, h, { width: W, height: H })
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.72), metrics }
  } finally {
    URL.revokeObjectURL(url)
  }
}
