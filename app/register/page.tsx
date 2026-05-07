"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase"
import type { Senior, Job } from "@/lib/supabase"
import { EnvWarning } from "@/components/env-warning"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const REGIONS   = ["서울", "경기", "인천", "기타"]
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"]

type FormErrors = { name?: string; region?: string; desired_job?: string }

/** 앱 레이어 폴백용 점수 계산 */
function calcScore(
  s: Pick<Senior, "region" | "desired_job" | "career_years">,
  j: Pick<Job,    "region" | "job_type"   | "required_career">
): number {
  let score = 0
  if (s.region      === j.region)           score += 3
  if (s.desired_job === j.job_type)         score += 2
  if (s.career_years >= j.required_career)  score += 1
  return score
}

export default function RegisterPage() {
  const [name,        setName]        = useState("")
  const [region,      setRegion]      = useState("")
  const [desiredJob,  setDesiredJob]  = useState("")
  const [careerYears, setCareerYears] = useState(0)
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [status,      setStatus]      = useState<"idle" | "loading" | "success" | "error">("idle")
  const [dbError,     setDbError]     = useState("")
  const [newSeniorId, setNewSeniorId] = useState<string | null>(null)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!name.trim()) errs.name       = "이름을 입력해 주세요."
    if (!region)      errs.region     = "지역을 선택해 주세요."
    if (!desiredJob)  errs.desired_job = "희망 직종을 선택해 주세요."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setStatus("idle")
      return
    }

    if (!SUPABASE_CONFIGURED) {
      setStatus("error")
      setDbError("Supabase 환경변수가 설정되지 않았습니다. Vercel 대시보드에서 환경변수를 추가하고 재배포해 주세요.")
      return
    }

    setStatus("loading")
    setDbError("")

    // 1) 시니어 INSERT (ID 반환)
    const { data: newSenior, error: insertErr } = await supabase
      .from("seniors")
      .insert({ name: name.trim(), region, desired_job: desiredJob, career_years: careerYears })
      .select("*")
      .single()

    if (insertErr || !newSenior) {
      setStatus("error")
      setDbError(insertErr?.message ?? "저장 실패")
      return
    }

    // 2) 매칭 재계산: RPC 시도 → 실패 시 앱 레이어 폴백
    const { error: rpcErr } = await supabase.rpc("match_senior", { p_senior_id: newSenior.id })

    if (rpcErr) {
      // 폴백: 모든 jobs를 읽어 직접 계산
      const { data: allJobs } = await supabase.from("jobs").select("*")
      if (allJobs && allJobs.length > 0) {
        const rows = (allJobs as Job[]).map((job) => ({
          senior_id: newSenior.id,
          job_id:    job.id,
          score:     calcScore(newSenior as Senior, job),
          status:    "pending",
        }))
        await supabase.from("matches").upsert(rows, { onConflict: "senior_id,job_id" })
      }
    }

    setNewSeniorId(newSenior.id)
    setStatus("success")
    setName(""); setRegion(""); setDesiredJob(""); setCareerYears(0); setErrors({})
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">프로필 등록</h1>
        <p className="text-xl text-gray-500">정보를 입력하시면 맞는 일자리를 찾아드립니다.</p>
      </div>

      {!SUPABASE_CONFIGURED && <EnvWarning />}

      {/* 성공 */}
      {status === "success" && newSeniorId && (
        <div className="bg-green-100 border-2 border-green-600 rounded-xl p-6 space-y-4">
          <p className="text-xl font-semibold text-green-800">✅ 등록이 완료되었습니다!</p>
          <Link
            href={`/recommendations?senior_id=${newSeniorId}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full text-xl py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-center"
            )}
          >
            추천 일자리 보러 가기 →
          </Link>
        </div>
      )}

      {/* DB 오류 */}
      {status === "error" && (
        <div className="bg-red-100 border-2 border-red-600 rounded-xl p-6 text-red-800 text-xl font-semibold">
          ❌ 저장 중 오류: {dbError}
        </div>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">내 정보 입력</CardTitle>
          <CardDescription className="text-lg">* 필수 입력 항목입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl font-semibold">이름 *</Label>
              {errors.name && (
                <div className="bg-red-100 border border-red-500 rounded-lg px-4 py-3 text-red-700 text-lg font-medium">
                  ⚠ {errors.name}
                </div>
              )}
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="홍길동" className="text-xl py-6 border-2" />
            </div>

            {/* 지역 */}
            <div className="space-y-2">
              <Label className="text-xl font-semibold">거주 지역 *</Label>
              {errors.region && (
                <div className="bg-red-100 border border-red-500 rounded-lg px-4 py-3 text-red-700 text-lg font-medium">
                  ⚠ {errors.region}
                </div>
              )}
              <Select value={region} onValueChange={(v) => setRegion(v ?? "")}>
                <SelectTrigger className="text-xl border-2 h-14 w-full">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 희망 직종 */}
            <div className="space-y-2">
              <Label className="text-xl font-semibold">희망 직종 *</Label>
              {errors.desired_job && (
                <div className="bg-red-100 border border-red-500 rounded-lg px-4 py-3 text-red-700 text-lg font-medium">
                  ⚠ {errors.desired_job}
                </div>
              )}
              <Select value={desiredJob} onValueChange={(v) => setDesiredJob(v ?? "")}>
                <SelectTrigger className="text-xl border-2 h-14 w-full">
                  <SelectValue placeholder="희망 직종을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 경력 */}
            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-xl font-semibold">경력 (년)</Label>
              <Input id="career_years" type="number" min={0} max={50}
                value={careerYears} onChange={(e) => setCareerYears(Number(e.target.value))}
                className="text-xl py-6 border-2" />
              <p className="text-base text-gray-400">경력이 없으시면 0을 입력하세요.</p>
            </div>

            <Button type="submit" size="lg"
              className="w-full text-2xl py-8 bg-blue-600 hover:bg-blue-700 rounded-xl"
              disabled={status === "loading"}>
              {status === "loading" ? "등록 중…" : "등록하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
