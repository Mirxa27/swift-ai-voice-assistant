import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Newomen - AI Conversational Platform",
  description: "Your AI companion for personal growth and transformation",
  keywords: "AI, personal growth, wellness, mental health, coaching",
  authors: [{ name: "Newomen Team" }],
  openGraph: {
    title: "Newomen - AI Conversational Platform",
    description: "Your AI companion for personal growth and transformation",
    url: "https://newomen.ai",
    siteName: "Newomen",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newomen - AI Conversational Platform",
    description: "Your AI companion for personal growth and transformation",
    images: ["/opengraph-image.png"],
  },
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
