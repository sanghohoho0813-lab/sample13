import { test, expect, isMobile } from './fixtures'
import type { Page } from '@playwright/test'

/** PC 는 오른쪽 상세 칸, 모바일은 하단 시트에서 처리한다 */
const panel = (page: Page) => (isMobile(page) ? page.getByRole('dialog') : page.locator('main'))

/**
 * 통합 사용자 흐름 — 세 화면(고객 포털 · 본사 AX · 현장직원 앱)이 하나의 기록으로 이어지는지
 * 고객 요청 → 본사 접수 · 담당 · 일정 확정 → Smart Dispatch 배정 승인 → 현장 앱 알림 · 수행 · 사진 · 완료
 * → 고객 리포트 · 평가 → 매출 기회 성사 · 고객 건강도 · 변경 이력
 */
test('고객 요청부터 재계약 판단까지 한 흐름으로 이어진다', async ({ page, errors: _ }) => {
  test.setTimeout(120_000)

  // ① 고객 — 추가서비스 요청
  await page.goto('/care/home')
  await page.locator('[data-tour="care-quick"]').getByRole('button', { name: '추가서비스' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByRole('radiogroup', { name: '필요한 서비스' }).getByRole('radio', { name: '유리창 집중청소' }).click()
  await sheet.getByRole('radiogroup', { name: '희망 시기' }).getByRole('radio', { name: '이번 주 안에' }).click()
  await sheet.getByRole('button', { name: '요청 보내기' }).click()
  const reqId = (await sheet.getByText(/접수번호 R-/).textContent())!.match(/R-\w+/)![0]

  // ② 본사 요청함 — 담당 지정 → 오늘 16:30 · 견적 90만원으로 일정 확정 → 배정안 생성
  await page.goto(`/requests?id=${reqId}`)
  let scope = panel(page)
  await expect(scope.getByText('유리창 집중청소 · 이번 주 안에').first()).toBeVisible()
  await scope.getByRole('button', { name: '담당 지정' }).click()
  await expect(scope.getByText(/담당자 배정 —/)).toBeVisible()
  await scope.getByRole('radiogroup', { name: '방문일' }).getByRole('radio', { name: '오늘' }).click()
  await scope.locator('label').filter({ hasText: /^시작/ }).locator('select').selectOption('16:30')
  await scope.locator('label').filter({ hasText: /^견적/ }).locator('input').fill('90')
  await scope.getByRole('button', { name: '일정 확정 · 배정안 만들기' }).click()

  // ③ Smart Dispatch — AI 1순위 팀으로 신규 배정 확정 → 현장 앱으로
  await expect(page).toHaveURL(/\/schedule/)
  scope = panel(page)
  await expect(scope.getByText(`고객 요청 ${reqId}로 생긴 일정입니다.`)).toBeVisible()
  await expect(scope.getByText('AI 1순위').first()).toBeVisible()
  await scope.getByRole('button', { name: /배정 확정$/ }).click()
  await expect(scope.getByText(/승인 · 일정 반영 완료/)).toBeVisible()
  await expect(scope.getByText('현장 수신 확인 대기')).toBeVisible()
  await scope.getByRole('button', { name: /팀장 앱으로 보기/ }).click()

  // ④ 현장직원 앱 — 새 배정 알림 확인 → 체크인 → 사진 → 체크리스트 → 사진 → 메모 → 완료 보고
  await expect(page).toHaveURL(/\/field$/)
  await expect(page.getByRole('alert').filter({ hasText: '새 배정' })).toBeVisible()
  await page.getByRole('button', { name: '확인했습니다' }).first().click()
  await expect(page.getByText('고객 요청 작업')).toBeVisible()
  await page.getByRole('button', { name: '도착 체크인' }).click()
  await page.getByRole('button', { name: '작업 시작' }).click()
  await page.getByRole('button', { name: '카메라 없이 예시 사진 사용 (데모)' }).first().click()
  const todo = page.locator('li > button[aria-pressed="false"]')
  for (let i = 0; i < 8 && (await todo.count()); i++) await todo.first().click()
  await expect(todo).toHaveCount(0)
  await page.getByRole('button', { name: '카메라 없이 예시 사진 사용 (데모)' }).click()
  await page.getByPlaceholder(/고객 리포트에 그대로/).fill('대기실 · 로비 유리 얼룩 집중 제거 완료')
  await page.getByRole('button', { name: '작업 완료 보고' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '완료 보고' }).click()
  await expect(page.getByText('완료한 현장')).toBeVisible()

  // ⑤ 고객 — 요청 완료 · 리포트 확인 · 평가
  await page.goto('/care/requests')
  await page.getByRole('tab', { name: /완료/ }).click()
  await expect(page.getByText('요청하신 작업을 완료했습니다', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: '작업 리포트 보기' }).click()
  await expect(page).toHaveURL(/\/care\/reports\?id=RP-/)
  await expect(page.getByText(`요청하신 ${reqId} 작업 리포트입니다.`)).toBeVisible()
  await expect(page.getByText('대기실 · 로비 유리 얼룩 집중 제거 완료')).toBeVisible()
  await page.getByRole('radiogroup', { name: '작업 평가' }).first().getByRole('radio', { name: '5점' }).click()
  await page.getByPlaceholder('한 줄 의견 (선택)').fill('요청한 당일 처리해주셔서 좋았습니다')
  await page.getByRole('button', { name: '평가 보내기' }).click()
  await expect(page.getByText('평가해 주셔서 감사합니다').first()).toBeVisible()

  // ⑥ 본사 — 매출 기회 성사 · 고객 건강도 · 변경 이력
  await page.goto('/upsell')
  const opp = page.locator('[data-tour="upsell"] > div').filter({ hasText: `고객 요청 ${reqId}` })
  await expect(opp).toContainText('성사')
  await expect(opp).toContainText('확정 90만원')
  await page.goto('/customers/C01')
  await expect(page.locator('main')).toContainText('요청 처리 완료')
  await expect(page.locator('main')).toContainText('추가서비스 이용 중')
  await expect(page.locator('main')).toContainText('평가 5점')
})
