"use client"

import { useState, useEffect } from "react"
import { supabase, type Job } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const REGIONS = ["서울", "경기", "인천", "기타"]
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"]

type JobForm = { title: string; region: string; job_type: string; required_career: number }
const EMPTY_FORM: JobForm = { title: "", region: "", job_type: "", required_career: 0 }

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [form, setForm] = useState<JobForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<JobForm>>({})
  const [addStatus, setAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [addError, setAddError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoadingJobs(true)
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) setJobs(data as Job[])
    setLoadingJobs(false)
  }

  function validateForm(): Partial<JobForm> {
    const errs: Partial<JobForm> = {}
    if (!form.title.trim()) errs.title = "공고명을 입력해 주세요."
    if (!form.region)       errs.region = "지역을 선택해 주세요."
    if (!form.job_type)     errs.job_type = "직종을 선택해 주세요."
    return errs
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateForm()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setAddStatus("loading")
    setAddError("")

    const { error } = await supabase.from("jobs").insert({
      title: form.title.trim(),
      region: form.region,
      job_type: form.job_type,
      required_career: form.required_career,
    })

    if (error) {
      setAddStatus("error")
      setAddError(error.message)
    } else {
      setAddStatus("success")
      setForm(EMPTY_FORM)
      setFormErrors({})
      await fetchJobs()
      setTimeout(() => setAddStatus("idle"), 3000)
    }
  }

  async function handleDeleteJob(id: string) {
    if (!confirm("이 일자리를 삭제하시겠습니까?")) return
    setDeletingId(id)
    await supabase.from("jobs").delete().eq("id", id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">담당자 대시보드</h1>
        <p className="text-xl text-gray-500">일자리 등록 및 매칭 현황을 관리하세요.</p>
      </div>

      {/* ─── 일자리 관리 섹션 ─── */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 pb-3">📋 일자리 관리</h2>

        {/* 일자리 추가 폼 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">일자리 추가</CardTitle>
          </CardHeader>
          <CardContent>
            {addStatus === "success" && (
              <div className="mb-6 bg-green-100 border-2 border-green-600 rounded-xl p-4 text-green-800 text-xl font-semibold">
                ✅ 일자리가 등록되었습니다.
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
                  {formErrors.title && (
                    <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">
                      ⚠ {formErrors.title}
                    </div>
                  )}
                  <Input
                    id="job-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="예: 아파트 경비원"
                    className="text-lg py-5 border-2"
                  />
                </div>

                {/* 요구 경력 */}
                <div className="space-y-2">
                  <Label htmlFor="job-career" className="text-lg font-semibold">요구 경력 (년)</Label>
                  <Input
                    id="job-career"
                    type="number"
                    min={0}
                    max={50}
                    value={form.required_career}
                    onChange={(e) => setForm({ ...form, required_career: Number(e.target.value) })}
                    className="text-lg py-5 border-2"
                  />
                </div>

                {/* 지역 */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">지역 *</Label>
                  {formErrors.region && (
                    <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">
                      ⚠ {formErrors.region}
                    </div>
                  )}
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v ?? "" })}>
                    <SelectTrigger className="text-lg border-2 h-12 w-full">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r} className="text-lg py-2">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 직종 */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">직종 *</Label>
                  {formErrors.job_type && (
                    <div className="bg-red-100 border border-red-500 rounded-lg px-3 py-2 text-red-700 text-base font-medium">
                      ⚠ {formErrors.job_type}
                    </div>
                  )}
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v ?? "" })}>
                    <SelectTrigger className="text-lg border-2 h-12 w-full">
                      <SelectValue placeholder="직종 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((j) => (
                        <SelectItem key={j} value={j} className="text-lg py-2">{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-xl py-7 bg-blue-600 hover:bg-blue-700 rounded-xl"
                disabled={addStatus === "loading"}
              >
                {addStatus === "loading" ? "등록 중…" : "➕ 일자리 등록"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 등록된 일자리 목록 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              등록된 일자리
              <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-700">
                {jobs.length}건
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingJobs ? (
              <p className="text-xl text-gray-400 text-center py-10">불러오는 중…</p>
            ) : jobs.length === 0 ? (
              <p className="text-xl text-gray-400 text-center py-10">
                등록된 일자리가 없습니다. 위 폼으로 추가하세요.
              </p>
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
                        <Button
                          size="sm"
                          className="text-base px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                        >
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

      {/* ─── 매칭 현황 섹션 (다음 단계에서 연결) ─── */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 pb-3">🔗 매칭 현황</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["미매칭", "매칭 대기", "배정 완료"] as const).map((status) => (
            <Card key={status} className="border-2 text-center">
              <CardHeader>
                <CardTitle className="text-2xl">{status}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-3xl font-bold px-6 py-3 bg-gray-100 text-gray-500">
                  —
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-lg text-gray-400 text-center py-4">
          매칭 기능은 다음 단계에서 구현됩니다.
        </p>
      </section>
    </div>
  )
}
