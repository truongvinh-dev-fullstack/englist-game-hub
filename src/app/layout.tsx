import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Game Hub — Luyện tiếng Anh cho người đi làm",
  description: "Mini-game luyện tiếng Anh văn phòng và giao tiếp hàng ngày trong 2–5 phút mỗi ngày.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background text-appText antialiased">
        {children}
      </body>
    </html>
  );
}

