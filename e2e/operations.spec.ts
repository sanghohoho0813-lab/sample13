import { test, expect, isMobile } from './fixtures'
import type { Page } from '@playwright/test'

const panel = (page: Page) => (isMobile(page) ? page.getByRole('dialog') : page.locator('main'))

/** 캔버스로 만든 시험용 사진 — 'sharp' 선명한 체커, 'dark' 어두운 화면, 'other' 다른 장면 */
async function photo(page: Page, kind: 'sharp' | 'dark' | 'other') {
  const dataUrl = await page.evaluate((k) => {
    const c = document.createElement('canvas')
    c.width = 800; c.height = 600
    const g = c.getContext('2d')!
    for (let y = 0; y < 600; y += 20) {
      for (let x = 0; x < 800; x += 20) {
        const on = ((x + y) / 20) % 2 === 0
        g.fillStyle = k === 'dark' ? (on ? '#202020' : '#080808') : k === 'other' ? (x < 400 ? (on ? '#e0e0e0' : '#909090') : (on ? '#303030' : '#606060')) : (on ? '#d8d8d8' : '#404040')
        g.fillRect(x, y, 20, 20)
      }
    }
    return c.toDataURL('image/png')
  }, kind)
  return { name: `${kind}.png`, mimeType: 'image/png', buffer: Buffer.from(dataUrl.split(',')[1], 'base64') }
}

test.describe('운영 흐름', () => {
  test('운영센터 — 판단 항목을 누르면 해당 처리 화면 상세가 바로 열린다', async ({ page, errors: _ }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '오늘의 운영센터' })).toBeVisible()
    for (const lane of ['사고 위험 일정', '배정 비효율', '인력 부족', '고객 불만 · 요청', '재계약 위험', '저마진 계약', '추가서비스 기회']) {
      await expect(page.getByRole('region', { name: '오늘 판단할 7개 영역' }).getByText(lane, { exact: true })).toBeVisible()
    }
    await page.locator('[data-tour="ai-briefing"]').getByRole('button', { name: /15:30 성수 B오피스/ }).first().click()
    await expect(page).toHaveURL(/\/schedule$/)
    await expect(panel(page).getByText('Smart Dispatch')).toBeVisible()
    await expect(panel(page).getByText(/약속보다 \d+분 늦음/)).toBeVisible()
  })

  test('Smart Dispatch — 7개 요인 근거 · 신규 배정 확정 → 현장 앱 알림 → 수신 확인이 본사에 남는다', async ({ page, errors: _ }) => {
    await page.goto('/schedule?id=SC-16')
    const p = panel(page)
    for (const f of ['이동거리', '직원 역량', '현재 일정', '현장 난이도', '고객 선호', '연속근무', '예상 소요시간']) {
      await expect(p.getByText(new RegExp(`^${f} \\d+%$`)).first()).toBeVisible()
    }
    await p.getByRole('button', { name: 'Clean Team E 배정 확정' }).click()
    await expect(p.getByText(/승인 · 일정 반영 완료/)).toBeVisible()
    await p.getByRole('button', { name: '강병철 팀장 앱으로 보기' }).click()
    await expect(page).toHaveURL(/\/field$/)
    await expect(page.getByText(/강남 C클리닉 · 유리창 집중청소 배정/)).toBeVisible()
    await page.getByRole('button', { name: '확인했습니다' }).click()
    await page.goto('/schedule?id=SC-16')
    await expect(panel(page).getByText(/현장 수신 확인 — 강병철 팀장/)).toBeVisible()
  })

  test('Smart Dispatch — 재배정은 직무 분리: 검토자는 승인할 수 없고, 다른 승인권자가 승인한다', async ({ page, errors: _ }) => {
    await page.goto('/schedule?id=SC-14')
    let p = panel(page)
    await p.getByRole('button', { name: '검토 완료 · 승인 요청' }).click()
    await expect(p.getByText(/직무 분리/).first()).toBeVisible()
    await expect(p.getByRole('button', { name: '승인 · 일정 반영' })).toHaveCount(0)
    await p.getByRole('button', { name: /전환해 승인하기/ }).click()
    p = panel(page)
    await p.getByRole('button', { name: '승인 · 일정 반영' }).click()
    await expect(p.getByText(/승인 · 일정 반영 완료/)).toBeVisible()
    // 변경 이력에 검토자 · 승인자가 따로 남는다
    await expect(p.getByText('승인 · 일정 반영', { exact: true }).first()).toBeVisible()
    await expect(p.getByText('검토 완료', { exact: true }).first()).toBeVisible()
  })

  test('운영 처리함 — 보류는 사유 없이 확정되지 않고, 사유가 남는다', async ({ page, errors: _ }) => {
    await page.goto('/today')
    await page.getByRole('tab', { name: /AI 조치/ }).click()
    const card = page.locator('main li').filter({ hasText: '에이원교육센터 유리 집중관리 제안' })
    await card.getByRole('button', { name: '보류' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '보류', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('비워둘 수 없습니다')
    await dialog.getByRole('button', { name: '담당자 부재' }).click()
    await dialog.getByRole('button', { name: '보류', exact: true }).click()
    await expect(card).toContainText('사유 — 담당자 부재')
    await card.getByRole('button', { name: '다시 진행' }).click()
    await expect(card).not.toContainText('사유 — 담당자 부재')
  })

  test('현장 앱 — 사진 화질 검사 · 수행 불가 사유 · 오프라인 저장 후 자동 전송', async ({ page, errors: _ }) => {
    await page.goto('/field')
    await page.getByRole('button', { name: '도착 체크인' }).click()
    await page.getByRole('button', { name: '작업 시작' }).click()

    // 어두운 사진 → 경고 → 다시 찍어 정상 저장
    await page.getByLabel('작업 전 사진 파일').setInputFiles(await photo(page, 'dark'))
    await expect(page.getByText(/너무 어둡습니다/)).toBeVisible()
    await page.getByLabel('작업 전 사진 파일').setInputFiles(await photo(page, 'sharp'))
    await expect(page.getByText('화질 정상')).toBeVisible()
    // 작업 후에 같은 사진 → 막힘 → 다른 장면으로 저장
    await page.getByLabel('작업 후 사진 파일').setInputFiles(await photo(page, 'sharp'))
    await expect(page.getByText(/같은 장면입니다/)).toBeVisible()
    await expect(page.getByRole('button', { name: '확인했음 · 그대로 사용' })).toHaveCount(0)
    await page.getByLabel('작업 후 사진 파일').setInputFiles(await photo(page, 'other'))
    await expect(page.getByText('화질 정상')).toHaveCount(2)

    // 한 항목은 수행 불가 사유를 남기고 나머지 체크
    await page.getByRole('button', { name: '수행 불가' }).first().click()
    await page.getByRole('dialog').getByRole('button', { name: '출입 불가 (잠김 · 공사)' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '사유 남기고 제외' }).click()
    await expect(page.getByText('수행 불가 — 출입 불가 (잠김 · 공사)')).toBeVisible()
    const todo = page.locator('li > button[aria-pressed="false"]').filter({ hasNotText: '수행 불가 —' })
    for (let i = 0; i < 8 && (await todo.count()); i++) await todo.first().click()

    // 오프라인에서 완료 → 기기에 저장 → 온라인 복귀 시 전송
    await page.getByRole('button', { name: /네트워크 상태/ }).click()
    await page.getByRole('button', { name: /오프라인/ }).last().click()
    await page.getByRole('button', { name: '작업 완료 보고' }).click()
    await expect(page.getByRole('dialog')).toContainText('기기에 저장')
    await page.getByRole('dialog').getByRole('button', { name: '완료 보고' }).click()
    await expect(page.getByRole('status').filter({ hasText: /오프라인 — 기록 \d+건/ })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('status').filter({ hasText: /오프라인 — 기록 \d+건/ })).toBeVisible() // 새로고침해도 대기열 유지
    await page.getByRole('button', { name: /네트워크 상태/ }).click()
    await page.getByRole('button', { name: /온라인/ }).last().click()
    await expect(page.getByText(/본사 전송 완료/)).toBeVisible()
    await page.getByRole('button', { name: '리포트' }).last().click()
    await expect(page.getByText(/제외 1/).first()).toBeVisible()
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
