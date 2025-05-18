import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutWrapper from "@/components/global/root-layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/global/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoRFP - AI-Powered RFP Response Solution",
  description: "Automatically answer RFP questions with AI document agents powered by LlamaIndex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <RootLayoutWrapper>{children}</RootLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
