export function EnvWarning() {
  return (
    <div className="bg-orange-100 border-2 border-orange-500 rounded-xl p-6 space-y-3">
      <p className="text-2xl font-bold text-orange-800">⚙️ Supabase 환경변수 미설정</p>
      <p className="text-xl text-orange-700">
        데이터베이스에 연결하려면 Vercel 환경변수를 추가해야 합니다.
      </p>
      <ol className="text-lg text-orange-700 list-decimal list-inside space-y-1">
        <li>Vercel 대시보드 → 프로젝트 선택 → <strong>Settings → Environment Variables</strong></li>
        <li><code className="bg-orange-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> 추가</li>
        <li><code className="bg-orange-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 추가</li>
        <li>저장 후 <strong>Deployments → Redeploy</strong></li>
      </ol>
    </div>
  )
}
