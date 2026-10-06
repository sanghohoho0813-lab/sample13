import { ArrowUpRight, ExternalLink, Sparkles, LayoutGrid } from 'lucide-react'
import { cx } from '../../lib/utils'
import { MIRAE_LINKS, MIRAE_CTA_COPY } from '../../lib/mirae'

/**
 * 샘플 → 상담 브릿지 CTA
 *
 * 샘플을 다 본 사람이 "우리 회사도 이렇게 가능하겠다"까지 가도록 잇는 구간.
 * 로고는 이미 사이드바·푸터에 상시 노출되므로 여기서는 반복하지 않고
 * 브랜드명과 짧은 소개만 둔다.
 *
 * variant
 *  - 'section' : 화면 하단 공통 섹션 (기본)
 *  - 'compact' : 사이드바·모바일 등 좁은 자리의 3버튼 축약형
 * tone
 *  - 'light' : 밝은 배경 위 (고객 플랫폼 본문 등)
 *  - 'dark'  : Deep Teal 면 위 (AX 사이드바 등)
 *
 * 링크·문구 수정은 src/lib/mirae.ts 에서 한다. props 로 화면별 덮어쓰기도 가능.
 */

interface BridgeProps {
  consultHref?: string
  samplesHref?: string
  homeHref?: string
  className?: string
}

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

export function SampleBridgeCTA({
  consultHref = MIRAE_LINKS.consult,
  samplesHref = MIRAE_LINKS.samples,
  homeHref = MIRAE_LINKS.home,
  className,
}: BridgeProps) {
  const C = MIRAE_CTA_COPY
  return (
    <section
      aria-labelledby="mirae-bridge-title"
      className={cx(
        'relative overflow-hidden rounded-3xl border border-line bg-card shadow-card',
        className,
      )}
    >
      {/* 브랜드 톤의 아주 옅은 강조 — 페이지 전체보다 튀지 않는 선까지만 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-mint/70 via-card to-card" />
      <div className="relative px-6 py-8 sm:px-9 sm:py-10">
        <span className="cta-glow inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card px-3 py-1 text-[0.72rem] font-bold tracking-[0.16em] text-primary-strong">
          <Sparkles size={12} /> {C.badge}
        </span>

        <p className="mt-4 text-[0.82rem] font-bold text-primary">{C.eyebrow}</p>
        <h2
          id="mirae-bridge-title"
          className="mt-1.5 max-w-2xl whitespace-pre-line text-[1.35rem] font-extrabold leading-snug text-shell sm:text-[1.6rem]"
        >
          {C.headline}
        </h2>
        <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">{C.body}</p>
        <p className="mt-1.5 max-w-2xl text-[0.82rem] leading-relaxed text-ink-faint">{C.note}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* 메인 CTA — 이 구간에서 가장 먼저 눈에 들어와야 하는 하나 */}
          <a
            href={consultHref}
            {...ext}
            className="cta-sweep group relative inline-flex min-h-[3.1rem] w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl px-5 py-3.5 text-[0.95rem] font-extrabold text-white shadow-[0_6px_18px_-6px_rgba(14,109,113,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgba(14,109,113,0.6)] sm:w-auto sm:px-7 sm:text-[1rem]"
            style={{ background: 'linear-gradient(120deg, var(--color-primary-strong), var(--color-primary) 52%, var(--color-aqua))' }}
          >
            {C.primary}
            <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* 보조 액션 — 메인보다 확실히 덜 튀게 */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={samplesHref}
              {...ext}
              className="inline-flex min-h-[3rem] items-center gap-1.5 rounded-2xl border border-line bg-card px-4 py-3 text-[0.88rem] font-bold text-ink-soft transition-colors hover:border-primary hover:text-primary"
            >
              <LayoutGrid size={15} /> {C.samples}
            </a>
            <a
              href={homeHref}
              {...ext}
              className="inline-flex min-h-[3rem] items-center gap-1.5 rounded-2xl px-4 py-3 text-[0.88rem] font-bold text-ink-faint underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {C.home} <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * 축약형 — 사이드바 하단·모바일처럼 좁은 자리에 3개 링크만 둔다.
 * 섹션형과 같은 링크·같은 문구를 쓰되 시선은 훨씬 덜 끈다.
 */
export function SampleBridgeMini({
  consultHref = MIRAE_LINKS.consult,
  samplesHref = MIRAE_LINKS.samples,
  homeHref = MIRAE_LINKS.home,
  tone = 'light',
  compact,
  className,
}: BridgeProps & { tone?: 'light' | 'dark'; compact?: boolean }) {
  const C = MIRAE_CTA_COPY
  const dark = tone === 'dark'
  return (
    <div className={cx(compact ? 'space-y-1' : 'space-y-1.5', className)}>
      <a
        href={consultHref}
        {...ext}
        className={cx(
          'cta-sweep group relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl px-3 font-extrabold transition-all duration-200 hover:-translate-y-px',
          compact ? 'py-1.5 text-[0.76rem]' : 'py-2 text-[0.78rem]',
          dark
            ? 'bg-champagne text-shell shadow-[0_4px_12px_-4px_rgba(215,188,134,0.5)]'
            : 'bg-primary text-white shadow-[0_4px_12px_-4px_rgba(14,109,113,0.5)]',
        )}
      >
        {C.primary}
        <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
      <div className="flex gap-1.5">
        {([[samplesHref, C.samples], [homeHref, C.home]] as const).map(([href, label]) => (
          <a
            key={label}
            href={href}
            {...ext}
            className={cx(
              'flex flex-1 items-center justify-center gap-1 rounded-xl border px-2 text-[0.72rem] font-bold transition-colors',
              compact ? 'py-1' : 'py-1.5',
              dark
                ? 'border-white/18 text-white/65 hover:border-champagne/60 hover:text-champagne'
                : 'border-line text-ink-faint hover:border-primary hover:text-primary',
            )}
          >
            {label === C.samples ? <LayoutGrid size={11} /> : <ExternalLink size={11} />}
            {/* 좁은 자리라 라벨을 줄여 쓴다 — 링크·의미는 동일 */}
            <span className="truncate">{label === C.home ? '홈페이지' : '다른 샘플'}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
