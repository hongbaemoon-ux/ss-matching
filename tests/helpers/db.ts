import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const db = createClient(url, key, { auth: { persistSession: false } })

/** matches → seniors → jobs 순으로 FK 제약 고려해 삭제 */
export async function resetDb() {
  for (const table of ['matches', 'seniors', 'jobs'] as const) {
    const { error } = await db.from(table).delete().gte('created_at', '2000-01-01')
    if (error) throw new Error(`resetDb: "${table}" 삭제 실패 — ${error.message}`)
  }
}

export async function insertJob(data: {
  title: string
  region: string
  job_type: string
  required_career: number
}) {
  const { data: row, error } = await db.from('jobs').insert(data).select('*').single()
  if (error) throw new Error(`insertJob 실패: ${error.message}`)
  return row as { id: string }
}

export async function getSeniorsCount(): Promise<number> {
  const { count, error } = await db
    .from('seniors')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`getSeniorsCount 실패: ${error.message}`)
  return count ?? 0
}
