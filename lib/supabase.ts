import { createClient } from '@supabase/supabase-js'

// Vercel 빌드 환경에 환경변수가 없을 때 createClient 가 throw 하지 않도록 폴백 사용.
// 실제 API 호출은 브라우저(클라이언트 컴포넌트)에서만 일어나므로 문제 없음.
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
