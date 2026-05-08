import { test, expect } from '@playwright/test'
import { resetDb, getSeniorsCount } from './helpers/db'

test.describe('실패 시나리오: 이름 없이 제출', () => {
  test.beforeEach(async () => {
    await resetDb()
  })

  test('이름 필드 위에 빨간 오류 박스가 표시되고 seniors 테이블에 레코드가 추가되지 않는다', async ({ page }) => {
    await page.goto('/register')

    // 이름 비움 (기본값이 빈 문자열이므로 의도적으로 미입력)
    // 지역 선택
    await page.getByText('지역을 선택하세요').click()
    await page.getByRole('option', { name: '서울' }).click()

    // 희망 직종 선택
    await page.getByText('희망 직종을 선택하세요').click()
    await page.getByRole('option', { name: '경비' }).click()

    // 경력 입력
    await page.fill('#career_years', '3')

    const countBefore = await getSeniorsCount()

    // 제출
    await page.click('button[type="submit"]')

    // 이름 오류 박스 표시 확인
    await expect(page.getByText('이름을 입력해 주세요')).toBeVisible()

    // DB: 새 레코드 미생성 확인
    const countAfter = await getSeniorsCount()
    expect(countAfter).toBe(countBefore)
  })
})
