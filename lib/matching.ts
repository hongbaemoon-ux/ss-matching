import type { Senior, Job } from "@/lib/supabase"
import { getRegionScore } from "@/lib/geo"

const JOB_MAP: Record<string, string> = {
  "경비직": "경비",
  "청소직": "청소",
  "조리직": "조리",
  "돌봄직": "돌봄",
}

export function normalizeJob(v: string): string {
  return JOB_MAP[v] ?? v
}

/** 직종+3 / 경력+2 / 지역(30km 이내)+2 = 최대 7점 */
export function calcScore(
  s: Pick<Senior, "region" | "desired_job" | "career_years">,
  j: Pick<Job,    "region" | "job_type"    | "required_career">
): number {
  let score = 0
  if (normalizeJob(s.desired_job) === normalizeJob(j.job_type)) score += 3
  if (s.career_years >= j.required_career)                      score += 2
  score += getRegionScore(s.region, j.region)                   // 0 or 2
  return score
}
