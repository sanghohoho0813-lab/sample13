import { test, expect } from './fixtures'

test.describe('고객 요청 → AX 처리 → 고객 화면 반영', () => {
  test('입력 검증 · 접수번호 · 처리 단계가 양쪽 화면에 이어진다', async ({ page, errors: _ }) => {
    await page.goto('/care/home')
    await page.locator('[data-tour="care-quick"]').getByRole('button', { name: '담당자 문의' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 빈 제출 → 빠진 항목 2개만 안내
    await dialog.getByRole('button', { name: '요청 보내기' }).click()
    await expect(dialog.getByRole('alert')).toHaveCount(2)

    // 너무 짧은 내용은 다시 안내
    await dialog.getByRole('radiogroup', { name: '문의 유형' }).getByRole('radio').first().click()
    await dialog.locator('textarea').fill('짧음')
    await expect(dialog.getByRole('alert')).toHaveText(/5자 이상/)

    const memo = `E2E 문의 ${Date.now() % 100000} 방문 시간 확인 부탁드립니다`
    await dialog.locator('textarea').fill(memo)
    await expect(dialog.getByRole('alert')).toHaveCount(0)
    await dialog.getByRole('button', { name: '요청 보내기' }).click()
    await expect(dialog.getByText(/접수번호 R-/)).toBeVisible()

    // AX 요청함 — 처리 필요 → 처리중 → 완료
    await page.goto('/requests')
    const card = page.locator('[data-tour="requests"] > div').filter({ hasText: memo.slice(0, 14) })
    await expect(card).toHaveCount(1)
    await card.getByRole('button', { name: '담당자 확인' }).click()
    await page.getByRole('tab', { name: /처리중/ }).click()
    await page.locator('[data-tour="requests"] > div').filter({ hasText: memo.slice(0, 14) }).getByRole('button', { name: '완료 처리' }).click()
    await page.getByRole('tab', { name: /^완료/ }).click()
    await expect(page.locator('[data-tour="requests"] > div').filter({ hasText: memo.slice(0, 14) })).toHaveCount(1)

    // 고객 화면 완료 탭
    await page.goto('/care/requests')
    await page.getByRole('tab', { name: /^완료/ }).click()
    await expect(page.getByText(memo.slice(0, 14))).toBeVisible()
  })

  test('서비스 소개의 "서비스 상담"은 내용이 채워진 문의 폼을 바로 연다', async ({ page, errors: _ }) => {
    await page.goto('/care')
    await page.getByRole('button', { name: '서비스 상담' }).click()
    await expect(page).toHaveURL(/\/care\/requests$/)
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('textarea')).toHaveValue(/상담을 원합니다/)
    await dialog.getByRole('button', { name: '요청 보내기' }).click()
    await expect(dialog.getByText(/접수번호 R-/)).toBeVisible()
  })
})
