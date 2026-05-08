import { test, expect } from '@playwright/test'
import { resetDb, insertJob } from './helpers/db'

test.describe('엣지 시나리오: 매칭되는 일자리 없음', () => {
  test.beforeEach(async () => {
    await resetDb()
    // region/job_type이 모두 다르고, required_career=99로 설정해
    // senior(서울/경비/career=3) 대비 score가 0점이 되도록 → .gt("score",0) 필터에서 제외됨
    // 참고: required_career=0 이면 career 조건(+1)을 충족해 score=1이 되므로 99로 설정
    await insertJob({ title: '기타 공고', region: '기타', job_type: '기타', required_career: 99 })
  })

  test('"현재 매칭되는 일자리가 없습니다" 안내 박스가 표시된다', async ({ page }) => {
    await page.goto('/register')

    await page.fill('#name', '테스트시니어_노매치')

    await page.getByText('지역을 선택하세요').click()
    await page.getByRole('option', { name: '서울' }).click()

    await page.getByText('희망 직종을 선택하세요').click()
    await page.getByRole('option', { name: '경비' }).click()

    await page.fill('#career_years', '3')

    await page.click('button[type="submit"]')

    // 등록 성공 확인
    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    // 추천 페이지로 이동
    const link = page.getByRole('link', { name: /추천 일자리 보러 가기/ })
    await link.click()
    await page.waitForURL(/\/recommendations\?senior_id=/, { timeout: 15_000 })

    // 매칭 없음 안내 박스 표시 확인
    await expect(page.getByText('현재 매칭되는 일자리가 없습니다')).toBeVisible({ timeout: 15_000 })
  })
})
