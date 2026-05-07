"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { supabase, SUPABASE_CONFIGURED, type Job, type Senior } from "@/lib/supabase"
import { EnvWarning } from "@/components/env-warning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

/* ─── 상수 ─── */
const REGIONS   = ["서울", "경기", "인천", "기타"]
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"]

type JobForm = { title: string; region: string; job_type: string; required_career: number }
const EMPTY_FORM: JobForm = { title: "", region: "", job_type: "", required_career: 0 }

/* ─── 시니어 + 매치 타입 ─── */
type MatchRow = { id: string; score: number; status: string }
type SeniorRow = Senior & { matches: MatchRow[] }

/* ─── 헬퍼: 시니어 매칭 상태 판단 ─── */
function getSeniorStatus(matches: MatchRow[]): "미매칭" | "매칭 대기" | "배정 완료" {
  const valid = matches.filter((m) => m.score > 0)
  if (valid.length === 0) return "미매칭"
  if (valid.some((m) => m.status === "assigned" || m.status === "done")) return "배정 완료"
  return "매칭 대기"
}

function getBestScore(matches: MatchRow[]): number {
  return matches.reduce((max, m) => Math.max(max, m.score), 0)
}

/* ─── 앱 레이어 폴백용 점수 계산 ─── */
function calcScore(
  s: Pick<Senior, "region" | "desired_job" | "career_years">,
  j: Pick<Job,    "region" | "job_type"    | "required_career">
): number {
  let score = 0
  if (s.region      === j.region)           score += 3
  if (s.desired_job === j.job_type)         score += 2
  if (s.career_years >= j.required_career)  score += 1
  return score
}

/* ─── 배지 컴포넌트 ─── */
function StatusBadge({ status }: { status: "미매칭" | "매칭 대기" | "배정 완료" }) {
  const cls =
    status === "배정 완료" ? "bg-green-100 text-green-800"  :
    status === "매칭 대기" ? "bg-yellow-100 text-yellow-800" :
                             "bg-gray-100 text-gray-500"
  return <Badge className={`${cls} text-base px-3 py-1`}>{status}</Badge>
}

/* ══════════════════════════════════════════════ */
export default function AdminPage() {
  /* ─── 일자리 상태 ─── */
  const [jobs,        setJobs]        = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [fetchError,  setFetchError]  = useState("")
  const [form,        setForm]        = useState<JobForm>(EMPTY_FORM)
  const [formErrors,  setFormErrors]  = useState<Partial<JobForm>>({})
  const [addStatus,   setAddStatus]   = useState<"idle"|"loading"|"success"|"error">("idle")
  const [addError,    setAddError]    = useState("")
  const [deletingId,  setDeletingId]  = useState<string | null>(null)

  /* ─── 시니어 상태 ─── */
  const [seniors,        setSeniors]        = useState<SeniorRow[]>([])
  const [loadingSeniors, setLoadingSeniors] = useState(true)
  const [seniorsError,   setSeniorsError]   = useState("")

  /* ─── 데이터 로드 ─── */
  const fetchJobs = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) {
      setFetchError("ENV_NOT_SET"); setLoadingJobs(false); return
    }
    setLoadingJobs(true); setFetchError("")
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
    if (error) setFetchError("일자리 목록 로드 실패: " + error.message)
    else if (data) setJobs(data as Job[])
    setLoadingJobs(false)
  }, [])

  const fetchSeniorsWithMatches = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) {
      setSeniorsError("ENV_NOT_SET"); setLoadingSeniors(false); return
    }
    setLoadingSeniors(true); setSeniorsError("")
    const { data, error } = await supabase
      .from("seniors")
      .select("*, matches(id, score, status)")
      .order("created_at", { ascending: false })
    if (error) setSeniorsError("시니어 목록 로드 실패: " + error.message)
    else if (data) setSeniors(data as SeniorRow[])
    setLoadingSeniors(false)
  }, [])

  useEffect(() => {
    fetchJobs()
    fetchSeniorsWithMatches()
  }, [fetchJobs, fetchSeniorsWithMatches])

  /* ─── 일자리 추가 ─── */
  function validateForm(): Partial<JobForm> {
    const errs: Partial<JobForm> = {}
    if (!form.title.trim()) errs.title    = "공고명을 입력해 주세요."
    if (!form.region)       errs.region   = "지역을 선택해 주세요."
    if (!form.job_type)     errs.job_type = "직종을 선택해 주세요."
    return errs
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateForm()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setAddStatus("loading"); setAddError("")

    const { data: newJob, error } = await supabase
      .from("jobs")
      .insert({ title: form.title.trim(), region: form.region, job_type: form.job_type, required_career: form.required_career })
      .select("*")
      .single()

    if (error || !newJob) {
      setAddStatus("error"); setAddError(error?.message ?? "저장 실패"); return
    }

    // 매칭 재계산: RPC 시도 → 실패 시 앱 레이어 폴백
    const { error: rpcErr } = await supabase.rpc("match_job", { p_job_id: newJob.id })
    if (rpcErr) {
      const { data: allSeniors } = await supabase.from("seniors").select("*")
      if (allSeniors && allSeniors.length > 0) {
        const rows = (allSeniors as Senior[]).map((s) => ({
          senior_id: s.id,
          job_id:    newJob.id,
          score:     calcScore(s, newJob as Job),
          status:    "pending",
        }))
        await supabase.from("matches").upsert(rows, { onConflict: "senior_id,job_id" })
      }
    }

    setAddStatus("success")
    setForm(EMPTY_FORM); setFormErrors({})
    await Promise.all([fetchJobs(), fetchSeniorsWithMatches()])
    setTimeout(() => setAddStatus("idle"), 3000)
  }

  /* ─── 일자리 삭제 ─── */
  async function handleDeleteJob(id: string) {
    if (!confirm("이 일자리를 삭제하시겠습니까?")) return
    setDeletingId(id)
    const { error } = await supabase.from("jobs").delete().eq("id", id)
    if (error) { alert("삭제 실패: " + error.message) }
    else       { setJobs((prev) => prev.filter((j) => j.id !== id)) }
    setDeletingId(null)
    await fetchSeniorsWithMatches()
  }

  /* ─── 집계 ─── */
  const stats = {
    unmatched: seniors.filter((s) => getSeniorStatus(s.matches) === "미매칭").length,
    pending:   seniors.filter((s) => getSeniorStatus(s.matches) === "매칭 대기").length,
    assigned:  seniors.filter((s) => getSeniorStatus(s.matches) === "배정 완료").length,
  }

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">담당자 대시보드</h1>
        <p className="text-xl text-gray-500">일자리 등록 및 매칭 현황을 관리하세요.</p>
      </div>

      {!SUPABASE_CONFIGURED && <EnvWarning />}

      {/* ══ 일자리 관리 섹션 ══ */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 pb-3">📋 일자리 관리</h2>

        {/* 추가 폼 */}
        <Card className="border-2">
          <CardHeader><CardTitle className="text-2xl">일자리 추가</CardTitle></CardHeader>
          <CardContent>
            {addStatus === "success" && (
              <div className="mb-6 bg-green-100 border-2 border-green-600 rounded-xl p-4 text-green-800 text-xl font-semibold">
                ✅ 일자리가 등록되고 매칭이 자동 계산되었습니다.
              </div>
            )}
            {addStatus === "error" && (
              <div className="mb-6 bg-red-100 border-2 border-red-600 rounded-xl p-4 text-red-800 text-xl font-semibold">
                ❌ 오류: {addError}
              </div>
            )}
            <form onSubmit={handleAddJob} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 공고명 */}
                <div className="space-y-2">
                  <Label htmlFor="job-title" className="text-lg font-semibold">공고명 *</Label>
                  {formErrors.title && <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">⚠ {formErrors.title}</div>}
                  <Input id="job-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="예: 아파트 경비원" className="text-lg py-5 border-2" />
                </div>
                {/* 요구 경력 */}
                <div className="space-y-2">
                  <Label htmlFor="job-career" className="text-lg font-semibold">요구 경력 (년)</Label>
                  <Input id="job-career" type="number" min={0} max={50}
                    value={form.required_career} onChange={(e) => setForm({ ...form, required_career: Number(e.target.value) })}
                    className="text-lg py-5 border-2" />
                </div>
                {/* 지역 */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">지역 *</Label>
                  {formErrors.region && <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">⚠ {formErrors.region}</div>}
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v ?? "" })}>
                    <SelectTrigger className="text-lg border-2 h-12 w-full"><SelectValue placeholder="지역 선택" /></SelectTrigger>
                    <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r} className="text-lg py-2">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {/* 직종 */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">직종 *</Label>
                  {formErrors.job_type && <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">⚠ {formErrors.job_type}</div>}
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v ?? "" })}>
                    <SelectTrigger className="text-lg border-2 h-12 w-full"><SelectValue placeholder="직종 선택" /></SelectTrigger>
                    <SelectContent>{JOB_TYPES.map((j) => <SelectItem key={j} value={j} className="text-lg py-2">{j}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" size="lg"
                className="w-full text-xl py-7 bg-blue-600 hover:bg-blue-700 rounded-xl"
                disabled={addStatus === "loading"}>
                {addStatus === "loading" ? "등록 중…" : "➕ 일자리 등록"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 일자리 목록 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              등록된 일자리
              <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-700">{jobs.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchError && <div className="mb-4 bg-red-100 border border-red-500 rounded-lg px-4 py-3 text-red-700 text-lg font-medium">❌ {fetchError}</div>}
            {loadingJobs ? (
              <p className="text-xl text-gray-400 text-center py-10">불러오는 중…</p>
            ) : jobs.length === 0 ? (
              <p className="text-xl text-gray-400 text-center py-10">등록된 일자리가 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg">공고명</TableHead>
                    <TableHead className="text-lg">지역</TableHead>
                    <TableHead className="text-lg">직종</TableHead>
                    <TableHead className="text-lg">요구 경력</TableHead>
                    <TableHead className="text-lg text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="text-lg font-medium">{job.title}</TableCell>
                      <TableCell className="text-lg">{job.region}</TableCell>
                      <TableCell className="text-lg">{job.job_type}</TableCell>
                      <TableCell className="text-lg">{job.required_career}년 이상</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm"
                          className="text-base px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          onClick={() => handleDeleteJob(job.id)} disabled={deletingId === job.id}>
                          {deletingId === job.id ? "삭제 중…" : "삭제"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ══ 매칭 현황 섹션 ══ */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 pb-3">🔗 매칭 현황</h2>

        {/* 집계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            { label: "미매칭",   count: stats.unmatched, cls: "bg-gray-100 text-gray-600" },
            { label: "매칭 대기", count: stats.pending,   cls: "bg-yellow-100 text-yellow-800" },
            { label: "배정 완료", count: stats.assigned,  cls: "bg-green-100 text-green-800"  },
          ] as const).map(({ label, count, cls }) => (
            <Card key={label} className="border-2 text-center">
              <CardHeader><CardTitle className="text-2xl">{label}</CardTitle></CardHeader>
              <CardContent>
                <Badge className={`${cls} text-3xl font-bold px-6 py-3`}>
                  {loadingSeniors ? "…" : `${count}명`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 시니어 목록 테이블 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              시니어 목록
              <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-700">{seniors.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seniorsError && (
              <div className="mb-4 bg-red-100 border border-red-500 rounded-lg px-4 py-3 text-red-700 text-lg font-medium">
                ❌ {seniorsError}
              </div>
            )}
            {loadingSeniors ? (
              <p className="text-xl text-gray-400 text-center py-10">불러오는 중…</p>
            ) : seniors.length === 0 ? (
              <p className="text-xl text-gray-400 text-center py-10">등록된 시니어가 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-lg">이름</TableHead>
                    <TableHead className="text-lg">지역</TableHead>
                    <TableHead className="text-lg">희망 직종</TableHead>
                    <TableHead className="text-lg text-center">최고 점수</TableHead>
                    <TableHead className="text-lg text-center">상태</TableHead>
                    <TableHead className="text-lg text-right">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seniors.map((s) => {
                    const matchStatus = getSeniorStatus(s.matches)
                    const bestScore   = getBestScore(s.matches)
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="text-lg font-medium">{s.name}</TableCell>
                        <TableCell className="text-lg">{s.region}</TableCell>
                        <TableCell className="text-lg">{s.desired_job}</TableCell>
                        <TableCell className="text-lg text-center font-bold text-blue-600">
                          {bestScore > 0 ? `${bestScore}점` : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={matchStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/recommendations?senior_id=${s.id}`}
                            className={cn(
                              buttonVariants({ size: "sm" }),
                              "text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            )}
                          >
                            상세 보기
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
