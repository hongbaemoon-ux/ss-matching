import { test, expect } from '@playwright/test'
import { resetDb, insertJob } from './helpers/db'

test.describe('정상 시나리오: 시니어 등록 → 자동 매칭 → 6점 카드', () => {
  test.beforeEach(async () => {
    await resetDb()
    // 서울/경비/required_career=3 공고 1건 — senior(서울/경비/career=5)와 완벽 매칭 → 6점
    await insertJob({ title: '서울 경비원 모집', region: '서울', job_type: '경비', required_career: 3 })
  })

  test('등록 완료 메시지 표시 및 추천 페이지에 6점 금색 배지 카드가 상단에 표시된다', async ({ page }) => {
    await page.goto('/register')

    // 이름 입력
    await page.fill('#name', '테스트시니어')

    // 지역 선택
    await page.getByText('지역을 선택하세요').click()
    await page.getByRole('option', { name: '서울' }).click()

    // 희망 직종 선택
    await page.getByText('희망 직종을 선택하세요').click()
    await page.getByRole('option', { name: '경비' }).click()

    // 경력 입력 (5년 → required_career 3 충족 → +1점)
    await page.fill('#career_years', '5')

    // 제출
    await page.click('button[type="submit"]')

    // 성공 메시지 확인
    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    // 추천 페이지 링크에서 senior_id 확인 후 이동
    const link = page.getByRole('link', { name: /추천 일자리 보러 가기/ })
    const href = await link.getAttribute('href')
    expect(href).toMatch(/\/recommendations\?senior_id=/)

    await link.click()
    await page.waitForURL(/\/recommendations\?senior_id=/, { timeout: 15_000 })

    // 6점 금색 배지(⭐) 카드가 표시되는지 확인
    const goldBadge = page.getByText('6점')
    await expect(goldBadge.first()).toBeVisible({ timeout: 15_000 })
  })
})
