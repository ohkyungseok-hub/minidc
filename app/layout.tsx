import type { Metadata } from "next";

import "@/app/globals.css";
import Header from "@/components/common/Header";
import VisitTracker from "@/components/common/VisitTracker";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/config/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 익명 고백 커뮤니티, 위로와 공감을 나누는 공간`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
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
          <VisitTracker />
          <Header />
          <main className="flex-1 py-5 sm:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
