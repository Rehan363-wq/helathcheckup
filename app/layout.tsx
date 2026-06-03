import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "HealFlow AI — Apna Doctor, Apni Zeb Mein",
  description:
    "AI-powered healthcare: Scan skin conditions, understand medical reports, and find verified doctors near you. HealFlow AI se samjho, doctor se milo.",
  keywords: [
    "HealFlow",
    "AI healthcare",
    "skin analyzer",
    "medical report",
    "doctor finder",
    "India healthcare",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
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
