import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결하는 매칭 시스템",
};

const navLinks = [
  { href: "/register", label: "프로필 등록" },
  { href: "/recommendations", label: "추천 일자리" },
  { href: "/admin", label: "담당자 대시보드" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              🌟 상상우리
            </Link>
            <nav className="flex gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-lg font-medium hover:underline underline-offset-4"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          {children}
        </main>

        <footer className="bg-gray-200 text-center text-base text-gray-500 py-4">
          © 2026 상상우리. 시니어 일자리 매칭 시스템.
        </footer>
      </body>
    </html>
  );
}
