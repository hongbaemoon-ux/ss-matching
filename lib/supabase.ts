import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
