import { createClient } from '@supabase/supabase-js'

// 환경변수 설정 여부 — 빌드 타임에 인라인되어 런타임에 안전하게 사용 가능
export const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 플레이스홀더: supabase-js가 JWT 파싱 시도 시 null/undefined 반환을 막기 위해
// 유효한 JWT 3-파트 구조 사용 (빌드-타임 throw 방지용, 실제 API 호출 안 됨)
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJpc3MiOiJwbGFjZWhvbGRlciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjI3MDAwMDAwMDB9' +
  '.placeholder-signature'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL     || PLACEHOLDER_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
)

export type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
  created_at: string
}

export type Job = {
  id: string
  title: string
  region: string
  job_type: string
  required_career: number
  created_at: string
}

export type Match = {
  id: string
  senior_id: string
  job_id: string
  score: number
  created_at: string
}
