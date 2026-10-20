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

    const reqId = (await dialog.getByText(/접수번호 R-/).textContent())!.match(/R-\w+/)![0]

    // AX 요청함 — 담당 지정 → 회신하고 완료
    await page.goto(`/requests?id=${reqId}`)
    const panel = (page.viewportSize()?.width ?? 0) < 1280 ? page.getByRole('dialog') : page.locator('main')
    await expect(panel.getByText(memo).first()).toBeVisible()
    await panel.getByRole('button', { name: '담당 지정' }).click()
    await panel.getByPlaceholder('고객 화면에 그대로 표시됩니다').fill('내일 오전 방문 시간 그대로 진행합니다.')
    await panel.getByRole('button', { name: '회신하고 완료' }).click()
    await expect(panel.getByText('회신 · 완료 — 내일 오전 방문 시간 그대로 진행합니다.')).toBeVisible()

    // 고객 화면 — 완료 탭에서 회신과 진행 기록 확인
    await page.goto('/care/requests')
    await page.getByRole('tab', { name: /완료/ }).click()
    await expect(page.getByText(memo)).toBeVisible()
    await expect(page.getByText('내일 오전 방문 시간 그대로 진행합니다.').first()).toBeVisible()
    await page.getByRole('button', { name: /진행 기록 \d/ }).first().click()
    await expect(page.getByText(/담당자 배정 —/).first()).toBeVisible()
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

  test('접수 완료 화면 — 보낸 내용과 다음 단계를 보여준다', async ({ page, errors: _ }) => {
    await page.goto('/care/home')
    await page.locator('[data-tour="care-quick"]').getByRole('button', { name: '추가서비스' }).click()
    const sheet = page.getByRole('dialog')
    await sheet.getByRole('radiogroup', { name: '필요한 서비스' }).getByRole('radio', { name: '유리창 집중청소' }).click()
    await sheet.getByRole('radiogroup', { name: '희망 시기' }).getByRole('radio', { name: '이번 주 안에' }).click()
    await sheet.getByRole('button', { name: '요청 보내기' }).click()
    await expect(sheet.getByText('유리창 집중청소 · 이번 주 안에')).toBeVisible()
    const steps = sheet.getByRole('list', { name: '처리 단계' }).getByRole('listitem')
    await expect(steps).toHaveCount(4)
    await expect(steps.first()).toContainText('접수 완료')
  })

  test('리포트 사진 — 크게 보기 · 전후 비교 손잡이는 키보드로도 움직이고, ESC 로 닫으면 연 버튼으로 돌아온다', async ({ page, errors: _ }) => {
    await page.goto('/care/reports')
    const opener = page.getByRole('button', { name: '전 · 후 겹쳐 보기' }).first()
    await opener.click()
    const viewer = page.getByRole('dialog', { name: /사진$/ })
    await expect(viewer).toBeVisible()
    const slider = viewer.getByRole('slider', { name: '작업 전 · 후 비교 위치' })
    await expect(slider).toBeFocused()
    await expect(slider).toHaveValue('50')
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('51')
    await viewer.getByRole('tab', { name: '작업 후' }).click()
    await expect(viewer.getByRole('tab', { name: '작업 후' })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Escape')
    await expect(viewer).toHaveCount(0)
    await expect(opener).toBeFocused()
  })
})
