import { describe, expect, it } from 'vitest'
import { averageHash, hamming, judge, measure, toGray } from './photoCheck'

const W = 64, H = 48
/** 테스트 이미지 — 체커보드(선명) · 단색 · 어두운 체커 · 부드러운 그라데이션(흐림) */
const img = (fn: (x: number, y: number) => number) => {
  const g = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = fn(x, y)
  return g
}
const sharp = img((x, y) => (((x >> 2) + (y >> 2)) % 2 ? 200 : 60))
const flat = img(() => 128)
const dark = img((x, y) => (((x >> 2) + (y >> 2)) % 2 ? 40 : 10))
const blurry = img((x) => 60 + (x / W) * 140)
const big = { width: 1600, height: 1200 }

describe('현장 사진 화질 검사', () => {
  it('선명하고 밝기가 적당한 사진은 통과', () => {
    const v = judge(measure(sharp, W, H, big))
    expect(v).toEqual({ ok: true, blocking: [], warnings: [] })
  })
  it('렌즈가 가려진 단색 화면은 다시 찍어야 한다', () => {
    expect(judge(measure(flat, W, H, big)).blocking[0]).toContain('렌즈')
  })
  it('어두운 사진 · 흐린 사진 · 저해상도는 경고', () => {
    expect(judge(measure(dark, W, H, big)).warnings.join()).toContain('어둡')
    expect(judge(measure(blurry, W, H, big)).warnings.join()).toContain('초점')
    expect(judge(measure(sharp, W, H, { width: 300, height: 200 })).warnings.join()).toContain('해상도')
  })
  it('작업 전 · 후에 같은 사진을 올리면 막는다', () => {
    const m = measure(sharp, W, H, big)
    expect(judge(m, m.hash).blocking[0]).toContain('같은 장면')
    const other = measure(img((x, y) => (x < W / 2 ? 220 : 30) + (y % 3)), W, H, big)
    expect(hamming(m.hash, other.hash)).toBeGreaterThan(5)
    expect(judge(m, other.hash).blocking).toEqual([])
  })
  it('RGBA → 회색조 변환과 해시 길이', () => {
    const rgba = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])
    expect(Array.from(toGray(rgba, 2, 1)).map(Math.round)).toEqual([255, 0])
    expect(averageHash(sharp, W, H)).toMatch(/^[0-9a-f]{16}$/)
  })
})
