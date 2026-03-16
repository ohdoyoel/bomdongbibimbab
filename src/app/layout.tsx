import type { Metadata, Viewport } from "next";
import "@seed-design/css/base.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "봄동비빔밥 - 조리 시뮬레이터",
  description: "봄의 맛을 담은 봄동비빔밥을 직접 만들어보세요!",
  openGraph: {
    title: "봄동비빔밥 조리 시뮬레이터",
    description: "봄의 맛을 담은 봄동비빔밥, 함께 만들어 볼까요?",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFF8F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-seed data-seed-color-mode="light-only">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
