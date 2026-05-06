import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// TODO: 기능 구현 — Supabase에서 matches JOIN seniors/jobs 조회 (score DESC)
const PLACEHOLDER_MATCHES: {
  rank: number;
  jobTitle: string;
  region: string;
  jobType: string;
  requiredCareer: number;
  score: number;
}[] = [];

export default function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">추천 일자리 목록</h1>
        <p className="text-xl text-gray-500">
          내 프로필과 가장 잘 맞는 일자리를 점수 순으로 보여드립니다.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            매칭 결과
            <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-700">
              {PLACEHOLDER_MATCHES.length}건
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {PLACEHOLDER_MATCHES.length === 0 ? (
            /* 빈 상태 */
            <div className="text-center py-20 space-y-4">
              <p className="text-5xl">📭</p>
              <p className="text-2xl font-semibold text-gray-500">
                아직 추천 일자리가 없습니다.
              </p>
              <p className="text-xl text-gray-400">
                프로필을 먼저 등록하시면 자동으로 매칭됩니다.
              </p>
            </div>
          ) : (
            /* TODO: 데이터 연결 후 표시될 테이블 */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xl">순위</TableHead>
                  <TableHead className="text-xl">직책명</TableHead>
                  <TableHead className="text-xl">지역</TableHead>
                  <TableHead className="text-xl">직종</TableHead>
                  <TableHead className="text-xl">요구 경력</TableHead>
                  <TableHead className="text-xl text-right">매칭 점수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PLACEHOLDER_MATCHES.map((m) => (
                  <TableRow key={m.rank}>
                    <TableCell className="text-xl font-bold">#{m.rank}</TableCell>
                    <TableCell className="text-xl">{m.jobTitle}</TableCell>
                    <TableCell className="text-xl">{m.region}</TableCell>
                    <TableCell className="text-xl">{m.jobType}</TableCell>
                    <TableCell className="text-xl">{m.requiredCareer}년 이상</TableCell>
                    <TableCell className="text-xl font-bold text-right text-blue-600">
                      {m.score}점
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
