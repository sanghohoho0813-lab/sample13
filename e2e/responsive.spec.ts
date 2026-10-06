import { test, expect } from './fixtures'

const ROUTES = ['/', '/today', '/schedule', '/sites', '/sites/C01', '/work', '/team', '/customers', '/customers/C01', '/requests',
  '/quality', '/renewals', '/upsell', '/profitability', '/ai', '/evidence', '/why-ax', '/settings',
  '/care', '/care/home', '/care/reports', '/care/requests', '/field']

// 가로 스크롤 · 화면 밖으로 넘치는 글자가 없는지 (표처럼 의도된 가로 스크롤 영역은 제외)
for (const width of [360, 768, 1024]) {
  test(`${width}px — 전 화면 가로 넘침 없음`, async ({ page, errors: _ }) => {
    test.skip(test.info().project.name !== 'desktop', '폭을 직접 지정하므로 한 번만')
    test.setTimeout(120_000) // 23개 화면을 한 테스트에서 차례로 확인
    await page.setViewportSize({ width, height: 900 })
    for (const r of ROUTES) {
      await page.goto(r)
      // 화면 코드 로딩(자리표시)이 끝나고 본문이 그려진 뒤 측정
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
      await page.waitForTimeout(150)
      const res = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth
        const over = [...document.querySelectorAll('main *, header *')].filter((el) => {
          const box = el.getBoundingClientRect()
          if (!box.width || el.closest('.overflow-x-auto, .overflow-auto, [data-mirae-history-nav]')) return false
          return box.right > vw + 1
        }).map((el) => (el.textContent ?? '').trim().slice(0, 20))
        return { scroll: document.documentElement.scrollWidth - vw, over: over.slice(0, 3) }
      })
      expect(res, r).toEqual({ scroll: 0, over: [] })
    }
  })
}
