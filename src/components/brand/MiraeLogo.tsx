import { cx } from '../../lib/utils'

/**
 * 미래AI랩 브랜드 마크
 * public/brand/ 의 원본 로고를 그대로 사용한다. (보이는 픽셀 무변경 — 색·형태 재가공 없음)
 * 로고의 워드마크가 진한 남색이라 어두운 면에서는 묻히므로,
 * 다크 배경에서는 밝은 칩(surface) 위에 올려 원본 색을 그대로 유지한다.
 */

export const MIRAE_LOGO = '/brand/mirae-ai-lab-logo.png'

/** 로고 이미지 단독 (밝은 배경 전용) */
export function MiraeLogo({ className, height = 22 }: { className?: string; height?: number }) {
  return (
    <img
      src={MIRAE_LOGO}
      alt="미래AI랩"
      width={828}
      height={250}
      loading="lazy"
      className={cx('w-auto', className)}
      style={{ height }}
    />
  )
}


/**
 * 제작사 크레딧 — "Powered by 미래AI랩"
 * tone="light"  밝은 배경 위 (로고 그대로)
 * tone="dark"   어두운 배경 위 (밝은 칩 위에 로고 그대로)
 */
export function MiraeCredit({
  tone = 'light',
  label = 'Powered by',
  height = 20,
  className,
}: {
  tone?: 'light' | 'dark'
  label?: string
  height?: number
  className?: string
}) {
  const dark = tone === 'dark'
  return (
    <div className={cx('flex items-center gap-2', className)}>
      <span className={cx('text-[0.72rem] font-bold tracking-[0.14em] whitespace-nowrap', dark ? 'text-white/45' : 'text-ink-faint')}>
        {label}
      </span>
      <span
        className={cx(
          'inline-flex items-center rounded-lg',
          dark ? 'bg-white px-2.5 py-1.5 shadow-[0_1px_6px_rgba(0,0,0,0.22)]' : '',
        )}
      >
        <MiraeLogo height={height} />
      </span>
    </div>
  )
}
