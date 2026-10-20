import { AxeBuilder } from '@axe-core/playwright'
import { test, expect } from './fixtures'

/**
 * 접근성 자동 검사 — 모든 화면을 WCAG 2.1 A · AA 규칙(axe-core)으로 검사한다.
 * 글자 대비 · 이름 없는 버튼 · 보이는 글자와 다른 읽기 이름 · 키보드로 못 가는 스크롤 영역 등을 잡는다.
 * PC · 모바일 두 크기에서 모두 돈다 (모바일 전용 표 · 시트가 따로 있다).
 */
const ROUTES = [
  '/', '/today', '/schedule', '/sites', '/sites/C01', '/work', '/team', '/customers', '/customers/C01', '/requests',
  '/quality', '/renewals', '/upsell', '/profitability', '/ai', '/evidence', '/why-ax', '/settings',
  '/field', '/care', '/care/home', '/care/reports', '/care/requests',
]

test('전 화면 접근성 — WCAG 2.1 AA 위반 없음', async ({ page, errors: _ }) => {
  test.setTimeout(120_000)
  // 등장 애니메이션 중간(반투명)에 대비를 재면 실제와 다르게 나온다 — 움직임 줄이기 설정으로 즉시 그린다
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const found: string[] = []
  for (const path of ROUTES) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    for (const v of violations) {
      found.push(`${path} · ${v.id} (${v.nodes.length}) — ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
    }
  }
  expect(found, '접근성 위반').toEqual([])
})
