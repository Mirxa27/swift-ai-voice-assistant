import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { MobileNav, DesktopNav } from '@/components/ui/mobile-nav'

const geist = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist",
	weight: "100 900",
	display: "swap",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Newomen - AI Companion for Personal Growth",
	description: "Your emotionally intelligent AI companion for transformation and personal growth",
	keywords: ["AI companion", "personal growth", "emotional intelligence", "transformation", "wellness"],
	authors: [{ name: "Newomen Team" }],
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Newomen",
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: "Newomen",
		title: "Newomen - AI Companion for Personal Growth",
		description: "Your emotionally intelligent AI companion for transformation and personal growth",
	},
	twitter: {
		card: "summary_large_image",
		title: "Newomen - AI Companion for Personal Growth",
		description: "Your emotionally intelligent AI companion for transformation and personal growth",
	},
};

export const viewport: Viewport = {
	themeColor: "#8B5CF6",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
			</head>
			<body className={`${geist.variable} ${geistMono.variable} antialiased`}>
				<DesktopNav />
				<MobileNav />
				<Toaster />
				{children}
				<Analytics />
			</body>
		</html>
	);
}
