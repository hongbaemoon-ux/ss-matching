import type { Senior, Job } from "@/lib/supabase"

const REGION_MAP: Record<string, string> = {
  "서울특별시": "서울",
  "경기도":     "경기",
  "인천광역시": "인천",
}

const JOB_MAP: Record<string, string> = {
  "경비직": "경비",
  "청소직": "청소",
  "조리직": "조리",
  "돌봄직": "돌봄",
}

export function normalizeRegion(v: string): string {
  return REGION_MAP[v] ?? v
}

export function normalizeJob(v: string): string {
  return JOB_MAP[v] ?? v
}

export function calcScore(
  s: Pick<Senior, "region" | "desired_job" | "career_years">,
  j: Pick<Job,    "region" | "job_type"    | "required_career">
): number {
  let score = 0
  if (normalizeJob(s.desired_job)  === normalizeJob(j.job_type))    score += 3
  if (s.career_years >= j.required_career)                          score += 2
  if (normalizeRegion(s.region)    === normalizeRegion(j.region))   score += 1
  return score
}
