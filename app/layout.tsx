import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/lib/theme-context";
import StorageMigration from "@/components/storage-migration";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "CliniHome — AI Health & Doctor Connect",
  description:
    "A premium, Apple-inspired healthcare web application designed to provide a serene, frictionless experience for patients and providers.",
  keywords: [
    "CliniHome",
    "CliniHome Health",
    "CliniHome AI",
    "Apple healthcare",
    "premium medical platform",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body
        className={inter.className}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThemeProvider>
          <StorageMigration />
          <Navbar />
          <main style={{ flex: 1, paddingTop: "64px" }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
