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

// TODO: 기능 구현 — Supabase에서 matches 상태별 조회
type MatchStatus = "미매칭" | "매칭 대기" | "배정 완료";

const SECTIONS: { status: MatchStatus; color: string; badgeClass: string }[] = [
  { status: "미매칭",   color: "border-red-300",    badgeClass: "bg-red-100 text-red-700" },
  { status: "매칭 대기", color: "border-yellow-300", badgeClass: "bg-yellow-100 text-yellow-700" },
  { status: "배정 완료", color: "border-green-300",  badgeClass: "bg-green-100 text-green-700" },
];

const PLACEHOLDER_ROWS: {
  id: string;
  seniorName: string;
  jobTitle: string;
  region: string;
  score: number;
  status: MatchStatus;
}[] = [];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">담당자 대시보드</h1>
        <p className="text-xl text-gray-500">
          시니어 매칭 현황을 한눈에 확인하고 관리하세요.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SECTIONS.map(({ status, badgeClass }) => {
          const count = PLACEHOLDER_ROWS.filter((r) => r.status === status).length;
          return (
            <Card key={status} className="border-2 text-center">
              <CardHeader>
                <CardTitle className="text-2xl">{status}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`text-3xl font-bold px-6 py-3 ${badgeClass}`}>
                  {count}건
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 상태별 섹션 */}
      {SECTIONS.map(({ status, color, badgeClass }) => {
        const rows = PLACEHOLDER_ROWS.filter((r) => r.status === status);
        return (
          <Card key={status} className={`border-2 ${color}`}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                {status}
                <Badge className={`text-lg px-3 py-1 ${badgeClass}`}>
                  {rows.length}건
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <p className="text-xl text-gray-400 text-center py-8">
                  해당 상태의 매칭이 없습니다.
                </p>
              ) : (
                /* TODO: 데이터 연결 후 표시될 테이블 */
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xl">시니어</TableHead>
                      <TableHead className="text-xl">일자리</TableHead>
                      <TableHead className="text-xl">지역</TableHead>
                      <TableHead className="text-xl text-right">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xl">{r.seniorName}</TableCell>
                        <TableCell className="text-xl">{r.jobTitle}</TableCell>
                        <TableCell className="text-xl">{r.region}</TableCell>
                        <TableCell className="text-xl font-bold text-right text-blue-600">
                          {r.score}점
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
