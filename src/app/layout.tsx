import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import AutoCleanup from "@/components/AutoCleanup";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kahani Roz - A Story Every Day",
  description: "A public storytelling platform where one can share inspiring, raw, real-life journal entries. Viewers can anonymously react, comment, and filter through daily stories that reflect hope, struggle, and truth.",
  keywords: ["stories", "journal", "daily", "inspiration", "real-life", "anonymous"],
  authors: [{ name: "Kahani Roz" }],
  openGraph: {
    title: "Kahani Roz - A Story Every Day",
    description: "Share and discover inspiring real-life stories every day",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300`}
      >
        <AutoCleanup />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
