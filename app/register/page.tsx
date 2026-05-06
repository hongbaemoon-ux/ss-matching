import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const JOB_TYPES = ["경비·보안", "청소·미화", "배달·운반", "요양보호", "조리·식음", "사무지원", "판매·서비스", "농업·원예", "기타"];

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">프로필 등록</h1>
        <p className="text-xl text-gray-500">정보를 입력하시면 맞는 일자리를 찾아드립니다.</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">내 정보 입력</CardTitle>
          <CardDescription className="text-lg">
            * 표시된 항목은 필수 입력 사항입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: 기능 구현 — onSubmit 연결 */}
          <form className="space-y-8">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl font-semibold">
                이름 *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="홍길동"
                className="text-xl py-6 border-2"
                disabled
              />
            </div>

            {/* 지역 */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-xl font-semibold">
                거주 지역 *
              </Label>
              <Select disabled>
                <SelectTrigger id="region" className="text-xl py-6 border-2 h-auto">
                  <SelectValue placeholder="지역을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xl py-3">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 희망 직종 */}
            <div className="space-y-2">
              <Label htmlFor="desired_job" className="text-xl font-semibold">
                희망 직종 *
              </Label>
              <Select disabled>
                <SelectTrigger id="desired_job" className="text-xl py-6 border-2 h-auto">
                  <SelectValue placeholder="희망 직종을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => (
                    <SelectItem key={j} value={j} className="text-xl py-3">
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 경력 */}
            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-xl font-semibold">
                경력 (년)
              </Label>
              <Input
                id="career_years"
                name="career_years"
                type="number"
                min={0}
                max={50}
                placeholder="0"
                className="text-xl py-6 border-2"
                disabled
              />
              <p className="text-base text-gray-400">경력이 없으시면 0을 입력하세요.</p>
            </div>

            {/* 제출 */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-2xl py-8 bg-blue-600 hover:bg-blue-700 rounded-xl"
              disabled
            >
              등록하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
