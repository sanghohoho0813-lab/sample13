import { test, expect, isMobile } from './fixtures'

test.describe('운영 흐름', () => {
  test('대시보드 우선 항목 → 해당 일정이 바로 열림 → AI 배정', async ({ page, errors: _ }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /성수 B오피스/ }).first().click()
    await expect(page).toHaveURL(/\/schedule$/)
    if (isMobile(page)) {
      await expect(page.getByRole('dialog')).toContainText('성수 B오피스')
      await page.keyboard.press('Escape')
    } else {
      await expect(page.locator('main button[aria-current="true"]')).toContainText('성수 B오피스')
    }
    // 미배정 일정 배정
    await page.getByRole('button', { name: /미배정 일정/ }).click()
    const scope = isMobile(page) ? page.getByRole('dialog') : page.locator('main')
    await scope.getByRole('button', { name: /배정하기$/ }).first().click()
    await expect(scope.getByText('배정 완료').first()).toBeVisible()
  })

  test('오늘의 AX — 검토 시작 → 실행 시작 → 완료 처리, 진행률이 오른다', async ({ page, errors: _ }) => {
    await page.goto('/today')
    const progress = page.getByRole('progressbar')
    await expect(progress).toHaveAttribute('aria-valuenow', '0')
    const card = page.locator('main .space-y-3').first()
    await card.getByRole('button', { name: '검토 시작' }).click()
    await expect(card.getByText('검토 중')).toBeVisible()
    await card.getByRole('button', { name: '실행 시작' }).click()
    await card.getByRole('button', { name: '완료 처리' }).click()
    await expect(progress).toHaveAttribute('aria-valuenow', '1')
  })

  test('현장 앱 — 남은 항목을 채워야 완료, 완료하면 리포트가 생긴다', async ({ page, errors: _ }) => {
    await page.goto('/field')
    await page.getByRole('button', { name: '도착 체크인' }).click()
    await page.getByRole('button', { name: '작업 시작' }).click()
    const done = page.getByRole('button', { name: '작업 완료' })
    await expect(done).toBeDisabled()
    await expect(page.getByText(/남은 항목/)).toBeVisible()
    for (let i = 0; i < 10; i++) {
      const left = page.locator('div.space-y-1\\.5 > button.border-line')
      if (!(await left.count())) break
      await left.first().click()
    }
    await page.getByRole('button', { name: /작업 전 사진/ }).click()
    await page.getByRole('button', { name: /작업 후 사진/ }).click()
    await expect(done).toBeEnabled()
    await done.click()
    await page.getByRole('button', { name: '리포트' }).last().click()
    await expect(page.getByText('작업 완료 시 리포트가 생성됩니다')).toHaveCount(0)
  })

  test('작업현황 — 상태 탭 건수와 목록 수가 같다', async ({ page, errors: _ }) => {
    await page.goto('/work')
    for (const name of ['예정', '완료', '확인필요']) {
      const tab = page.getByRole('tab', { name: new RegExp(`^${name}`) })
      const n = Number((await tab.textContent())!.replace(/\D/g, ''))
      await tab.click()
      await expect(page.locator('main button').filter({ hasText: /^\d{2}:\d{2}/ })).toHaveCount(n)
    }
  })

  test('고객 검색 — 공백·대소문자 무시, 결과 없음 · 초기화', async ({ page, errors: _ }) => {
    await page.goto('/customers')
    const search = page.getByRole('searchbox', { name: '고객 검색' })
    await search.fill('강남 c')
    await expect(page.getByText('강남 C클리닉')).toBeVisible()
    await search.fill('없는고객사zz')
    await expect(page.getByText(/해당하는 고객이 없습니다/)).toBeVisible()
    await page.getByRole('button', { name: '조건 초기화' }).last().click()
    await expect(page.getByText(/^12곳/)).toBeVisible()
  })
})
