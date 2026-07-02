import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "РобоГодини • Облік робочого часу",
  description: "Сучасний застосунок для обліку робочого часу та заробітку",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="bg-zinc-950 text-zinc-200 antialiased">
        {children}
      </body>
    </html>
  );
}