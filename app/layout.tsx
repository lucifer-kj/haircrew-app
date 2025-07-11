import React from "react";
import type { Metadata, Viewport } from "next";
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

// Viewport configuration (moved from metadata)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#9929EA",
};

export const metadata: Metadata = {
  title: "HairCrew - Professional Hair Care Products",
  description: "Your trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle.",
  // Improve SEO and sharing
  openGraph: {
    type: "website",
    title: "HairCrew - Professional Hair Care Products",
    description: "Your trusted partner for professional hair care products. Quality, innovation, and beauty in every bottle.",
    siteName: "HairCrew",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <ErrorBoundary>
            <ClientRoot>
              <AnimatedLayoutClient>
                <Header />
                <main>
                  {children}
                </main>
                <RoutePrefetcher />
                <Footer />
              </AnimatedLayoutClient>
            </ClientRoot>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
} 