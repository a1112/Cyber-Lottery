import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "抽奖应用",
  description: "翻牌游戏和转盘抽奖",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
