import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cards = [
  {
    href: "/register",
    title: "📝 프로필 등록",
    description: "이름, 지역, 희망 직종, 경력을 입력하고 일자리 매칭을 시작하세요.",
    btn: "등록하러 가기",
  },
  {
    href: "/recommendations",
    title: "💼 추천 일자리",
    description: "나에게 맞는 일자리를 점수 순으로 확인하세요.",
    btn: "추천 보기",
  },
  {
    href: "/admin",
    title: "🗂️ 담당자 대시보드",
    description: "매칭 현황을 한눈에 관리하세요.",
    btn: "대시보드 열기",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold text-blue-700">시니어 일자리 매칭</h1>
        <p className="text-2xl text-gray-600">
          내 경력과 희망 직종에 맞는 일자리를 자동으로 찾아드립니다.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ href, title, description, btn }) => (
          <Card key={href} className="border-2 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-lg">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full text-xl py-6 bg-blue-600 hover:bg-blue-700">
                <Link href={href}>{btn}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
