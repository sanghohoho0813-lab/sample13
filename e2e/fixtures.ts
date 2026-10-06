import { test as base, expect, type Page } from '@playwright/test'

/**
 * 모든 테스트는 깨끗한 데모 상태에서 시작하고, 첫 진입 튜토리얼은 건너뛴다.
 * (튜토리얼 자체는 shell.spec 에서 따로 확인)
 * 콘솔 오류 · 페이지 오류가 하나라도 나면 테스트를 실패시킨다.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
    await page.addInitScript(() => {
      if (sessionStorage.getItem('e2e-init')) return
      sessionStorage.setItem('e2e-init', '1')
      localStorage.clear()
      localStorage.setItem('cleanway-ax-demo-v1', JSON.stringify({ tutorialSeen: true }))
    })
    await use(errors)
    expect(errors, '콘솔/페이지 오류').toEqual([])
  },
})
export { expect }

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024
