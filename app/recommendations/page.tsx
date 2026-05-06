"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MatchWithJob = {
  id: string
  score: number
  status: string
  jobs: {
    title: string
    region: string
    job_type: string
    required_career: number
  } | null
}

function ScoreBadge({ score }: { score: number }) {
  if (score === 6)
    return <Badge className="bg-yellow-400 text-yellow-900 font-bold text-lg px-4 py-1.5">⭐ {score}점</Badge>
  if (score >= 4)
    return <Badge className="bg-green-100 text-green-800 font-bold text-lg px-4 py-1.5">✓ {score}점</Badge>
  return <Badge className="bg-gray-100 text-gray-600 font-bold text-lg px-4 py-1.5">{score}점</Badge>
}

function RecommendationsContent() {
  const searchParams  = useSearchParams()
  const seniorId      = searchParams.get("senior_id")
  const [matches,     setMatches]  = useState<MatchWithJob[]>([])
  const [loading,     setLoading]  = useState(true)
  const [fetchError,  setFetchError] = useState("")

  useEffect(() => {
    if (!seniorId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      setFetchError("")
      const { data, error } = await supabase
        .from("matches")
        .select("id, score, status, jobs(title, region, job_type, required_career)")
        .eq("senior_id", seniorId!)
        .gt("score", 0)
        .order("score", { ascending: false })

      if (error) setFetchError(error.message)
      else       setMatches((data ?? []) as unknown as MatchWithJob[])
      setLoading(false)
    }
    load()
  }, [seniorId])

  /* senior_id 없음 */
  if (!seniorId) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-10 text-center space-y-6">
        <p className="text-5xl">⚠️</p>
        <p className="text-2xl font-semibold text-yellow-800">시니어 ID가 없습니다.</p>
        <p className="text-xl text-yellow-700">프로필을 먼저 등록하시면 맞는 일자리를 찾아드립니다.</p>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-block text-xl py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          )}
        >
          프로필 등록하러 가기
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-400 animate-pulse">매칭 결과를 불러오는 중…</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="bg-red-100 border-2 border-red-500 rounded-xl p-6 text-red-700 text-xl font-semibold">
        ❌ 불러오기 오류: {fetchError}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-12 text-center space-y-4">
        <p className="text-5xl">🔍</p>
        <p className="text-2xl font-semibold text-gray-600">현재 매칭되는 일자리가 없습니다.</p>
        <p className="text-xl text-gray-400">담당자가 일자리를 등록하면 자동으로 매칭됩니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map((m) => {
        if (!m.jobs) return null
        return (
          <Card key={m.id} className="border-2 hover:border-blue-400 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl">{m.jobs.title}</CardTitle>
                <ScoreBadge score={m.score} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xl">
              <p>📍 지역: <span className="font-medium">{m.jobs.region}</span></p>
              <p>💼 직종: <span className="font-medium">{m.jobs.job_type}</span></p>
              <p>📅 요구 경력: <span className="font-medium">{m.jobs.required_career}년 이상</span></p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
        <p className="text-xl text-gray-500">
          내 프로필과 가장 잘 맞는 일자리를 점수 순으로 보여드립니다.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 animate-pulse">불러오는 중…</p>
          </div>
        }
      >
        <RecommendationsContent />
      </Suspense>
    </div>
  )
}
