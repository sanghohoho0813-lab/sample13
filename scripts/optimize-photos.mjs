// 현장 사진 표시용 파생본 생성 — 원본 PNG(public/photos/*.png)는 그대로 두고,
// 화면 크기에 맞는 WebP 3종(480·960·1448px)을 public/photos/opt/ 에 만든다.
// 사용: npm run photos   (원본이 바뀌었을 때만 다시 실행 — 결과물은 저장소에 커밋)
import { readdir, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'public/photos'
const OUT = 'public/photos/opt'
export const WIDTHS = [480, 960, 1448]

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'))
let before = 0, after = 0
for (const f of files) {
  const src = path.join(SRC, f)
  before += (await stat(src)).size
  for (const w of WIDTHS) {
    const dst = path.join(OUT, f.replace(/\.png$/, `-${w}.webp`))
    // 사진 디테일이 보이는 품질(82) + 느린 압축(effort 6) — 시각적으로 원본과 구분되지 않는 수준
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(dst)
    if (w === 1448) after += (await stat(dst)).size
  }
}
const mb = (n) => (n / 1024 / 1024).toFixed(1)
console.log(`${files.length}장 · 원본 PNG ${mb(before)}MB → WebP(1448px) ${mb(after)}MB`)
