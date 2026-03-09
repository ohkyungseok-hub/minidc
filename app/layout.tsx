import type { Metadata } from "next";

import "@/app/globals.css";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: {
    default: "mini-dc",
    template: "%s | mini-dc",
  },
  description: "Supabase 기반으로 확장하기 쉬운 미니 커뮤니티 스캐폴드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-10 sm:px-5 lg:px-6">
          <Header />
          <main className="flex-1 py-5 sm:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
