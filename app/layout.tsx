import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/lib/theme-context";

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

export const metadata: Metadata = {
  title: "HealFlow AI — Care as it should be",
  description:
    "A premium, Apple-inspired healthcare web application designed to provide a serene, frictionless experience for patients and providers.",
  keywords: [
    "HealFlow",
    "HealFlow Health",
    "Serenity Health",
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
          <Navbar />
          <main style={{ flex: 1, paddingTop: "64px" }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
