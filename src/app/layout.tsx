import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Su Sayacı Okuyucu",
  description: "Su sayacınızı fotoğraf ile okuyun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
