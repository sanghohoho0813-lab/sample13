import type { ImgHTMLAttributes } from 'react'
import { photoSrcSet } from '../../lib/photoSrcSet'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
  /** 대체 텍스트는 필수 — 장식용이면 빈 문자열을 명시한다 */
  alt: string
  /** 화면에 실제로 그려지는 폭 — 브라우저가 알맞은 크기의 파일을 고르는 기준 */
  sizes?: string
}

/**
 * 현장 사진 — 원본 PNG(평균 1.9MB)는 그대로 두고, 브라우저에는 화면 폭에 맞는 WebP(평균 20~90KB)를 준다.
 * WebP 를 지원하지 않는 환경에서는 원본 PNG 로 자연스럽게 대체된다.
 */
export function Photo({ src, alt, sizes = '(min-width: 1024px) 50vw, 100vw', loading = 'lazy', decoding = 'async', ...rest }: Props) {
  const srcSet = photoSrcSet(src)
  if (!srcSet) return <img src={src} alt={alt} loading={loading} decoding={decoding} {...rest} />
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} loading={loading} decoding={decoding} {...rest} />
    </picture>
  )
}
