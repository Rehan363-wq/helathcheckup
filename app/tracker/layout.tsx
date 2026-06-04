"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, MessageCircle, History, Music } from "lucide-react";

const TABS = [
  { href: "/tracker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker/log", label: "Log", icon: ClipboardList },
  { href: "/tracker/music", label: "Mind Relaxer", icon: Music },
  { href: "/tracker/chat", label: "AI Coach", icon: MessageCircle },
  { href: "/tracker/history", label: "History", icon: History },
];

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-surface)", display: "flex", flexDirection: "column" }}>
      
      {/* Tab Navigation */}
      <div
        style={{
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "6px",
            boxShadow: "var(--shadow-card)",
          }}
          className="tracker-tab-bar"
        >
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  color: isActive ? "white" : "var(--text-secondary)",
                  background: isActive ? "var(--purple-primary)" : "transparent",
                  boxShadow: isActive ? "var(--shadow-purple)" : "none",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <Icon size={18} />
                <span className="tracker-tab-label">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "24px" }}>
        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .tracker-tab-bar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 40 !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 8px !important;
            margin: 0 !important;
            backdrop-filter: blur(16px) !important;
          }
          .tracker-tab-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
