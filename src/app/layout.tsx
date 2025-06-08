import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import AutoCleanup from "@/components/AutoCleanup";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kahani Roz - A Story Every Day | Real Life Stories & Daily Inspiration",
    template: "%s | Kahani Roz - Daily Stories"
  },
  description: "Discover inspiring real-life stories every day on Kahani Roz. Share your journey, read authentic experiences, and connect through anonymous storytelling. Mental health, personal growth, and daily inspiration await.",
  keywords: [
    "daily stories", "real life stories", "personal experiences", "mental health stories", 
    "inspiration", "journal entries", "anonymous storytelling", "life experiences",
    "personal growth", "healing stories", "authentic stories", "daily inspiration",
    "emotional wellness", "self care stories", "vulnerability", "hope stories",
    "resilience", "mindfulness", "gratitude", "life lessons"
  ],
  authors: [{ name: "Kahani Roz Community", url: "https://kahaniroz.com" }],
  creator: "Kahani Roz",
  publisher: "Kahani Roz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kahaniroz.com",
    siteName: "Kahani Roz",
    title: "Kahani Roz - A Story Every Day | Real Life Stories & Daily Inspiration",
    description: "Discover inspiring real-life stories every day. Share your journey, read authentic experiences, and connect through anonymous storytelling.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kahani Roz - Daily Stories Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kahani Roz - A Story Every Day",
    description: "Discover inspiring real-life stories every day. Share your journey and connect through authentic storytelling.",
    images: ["/og-image.jpg"],
    creator: "@kahaniroz",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://kahaniroz.com",
  },
  category: "lifestyle",
  classification: "Personal Stories and Mental Health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://kahaniroz.com" />
        <meta name="theme-color" content="#f43f5e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300`}
      >
        <AutoCleanup />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
