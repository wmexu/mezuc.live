import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "muzec.live — Minimalist Pure-Black Monochromatic Music Player",
  description:
    "A clean, hyper-minimalist, Spotify-inspired monochromatic music player web application. Pure OLED black, liquid motion physics, and lossless sound.",
  keywords: [
    "muzec",
    "minimalist music player",
    "monochrome audio player",
    "OLED black",
    "lossless sound",
    "next.js music player",
  ],
  authors: [{ name: "muzec.live" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground selection:bg-foreground selection:text-background antialiased overflow-x-hidden font-normal">
        {/* OLED banding eliminator: Subtle 3.5% noise layer */}
        <div
          className="fixed inset-0 pointer-events-none z-50 bg-noise-overlay opacity-60 mix-blend-overlay"
          aria-hidden="true"
        />
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
