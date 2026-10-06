import { test, expect, isMobile } from './fixtures'

test.describe('앱 셸 · 접근성 · 예외 화면', () => {
  test('화면마다 탭 제목이 바뀐다', async ({ page, errors: _ }) => {
    await page.goto('/schedule')
    await expect(page).toHaveTitle('일정 / 배정 · CLEANWAY PARTNERS')
    await page.goto('/care/home')
    await expect(page).toHaveTitle(/내 관리현황/)
  })

  test('없는 주소는 안내 화면과 돌아갈 길을 보여준다', async ({ page, errors: _ }) => {
    await page.goto('/no-such-page')
    await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toBeVisible()
    await page.getByRole('button', { name: '대시보드로' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('대화상자 — 포커스가 안으로 들어가고, Tab 이 갇히고, ESC 로 닫히면 연 버튼으로 돌아온다', async ({ page, errors: _ }) => {
    await page.goto('/settings')
    const opener = page.getByRole('button', { name: '데모 초기화' })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeFocused()
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test('PC — 화면을 옮겨도 사이드바를 다시 만들지 않는다', async ({ page, errors: _ }) => {
    test.skip(isMobile(page), 'PC 사이드바')
    await page.goto('/')
    await page.evaluate(() => { (document.querySelector('aside') as HTMLElement & { __keep?: number }).__keep = 1 })
    await page.locator('aside nav').getByRole('button', { name: /현장 운영/ }).click()
    await page.locator('aside').getByRole('link', { name: '작업현황' }).click()
    await expect(page).toHaveURL(/\/work$/)
    expect(await page.evaluate(() => (document.querySelector('aside') as HTMLElement & { __keep?: number }).__keep)).toBe(1)
  })

  test('첫 방문이면 튜토리얼이 시작되고, 건너뛰면 다시 뜨지 않는다', async ({ page, errors: _ }) => {
    await page.addInitScript(() => { if (!sessionStorage.getItem('tut')) { sessionStorage.setItem('tut', '1'); localStorage.clear() } })
    await page.goto('/')
    await expect(page.getByText('튜토리얼 01 / 05')).toBeVisible()
    await page.getByRole('button', { name: '건너뛰기' }).click()
    await page.reload()
    await page.waitForTimeout(1200)
    await expect(page.getByText(/튜토리얼 01/)).toHaveCount(0)
  })
})
