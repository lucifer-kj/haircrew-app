import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import ClientRoot from "@/components/providers/client-root";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import AnimatedLayoutClient from "@/components/providers/animated-layout-client";
import RoutePrefetcher from "@/components/providers/route-prefetch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Naaz Book Depot - Islamic Books & Knowledge",
  description: "Your trusted source for authentic Islamic books. Spreading knowledge, faith, and light.",
  openGraph: {
    type: "website",
    title: "Naaz Book Depot - Islamic Books & Knowledge",
    description: "Your trusted source for authentic Islamic books. Spreading knowledge, faith, and light.",
    siteName: "Naaz Book Depot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to important domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical assets */}
        <link rel="preload" href="/Images/Image+Background.jpg" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientRoot>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <ErrorBoundary>
                  <AnimatedLayoutClient>{children}</AnimatedLayoutClient>
                </ErrorBoundary>
              </main>
              <Footer />
              {/* Route prefetcher - improves navigation performance */}
              <RoutePrefetcher />
            </div>
          </ClientRoot>
        </AuthProvider>
      </body>
    </html>
  );
} 