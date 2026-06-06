"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, LogOut, User } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { isOnboardingCompleted } from "@/lib/user-profile";
import Logo from "@/components/logo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; name: string } | null>(null);

  // Route Guard: enforce authentication and onboarding
  useEffect(() => {
    const session = localStorage.getItem("clinihome-session");
    const isPublicRoute = pathname === "/" || pathname === "/login";
    const isOnboardingRoute = pathname === "/onboarding";

    if (!session) {
      // User is NOT logged in
      if (!isPublicRoute && !isOnboardingRoute) {
        router.push("/login");
      }
    } else {
      // User IS logged in
      try {
        const parsed = JSON.parse(session);
        const role = parsed.role;
        const onboardingCompleted = isOnboardingCompleted(role);

        if (!onboardingCompleted) {
          // Logged in but onboarding not completed
          if (!isOnboardingRoute && !isPublicRoute) {
            router.push("/onboarding");
          }
        } else {
          // Logged in and onboarding completed
          if (isOnboardingRoute) {
            router.push(role === "doctor" ? "/doctor-dashboard" : "/dashboard");
          }
        }
      } catch (e) {
        console.error("Error in auth guard:", e);
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync session state from localStorage
  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("clinihome-session");
      if (session) {
        try {
          setUser(JSON.parse(session));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkSession();

    window.addEventListener("storage", checkSession);
    window.addEventListener("local-session-change", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("local-session-change", checkSession);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("clinihome-session");
    document.cookie = "clinihome-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    setUser(null);
    window.location.href = "/";
  };

  // Determine links based on user role
  const getNavLinks = () => {
    if (pathname === "/login" || pathname === "/onboarding") {
      return [];
    }
    if (user?.role === "doctor") {
      return [
        { href: "/doctor-dashboard", label: "Dashboard" },
        { href: "/chat", label: "Patient Chats" },
        { href: "/admin", label: "Admin Panel" },
      ];
    }
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/doctors", label: "Find Specialists" },
      { href: "/scan", label: "Skin Analyzer" },
      { href: "/report", label: "Report Explainer" },
      { href: "/health-bot", label: "CliniHome AI Bot" },
      { href: "/tracker", label: "Mood & Tracks" },
      { href: "/reminders", label: "Reminders" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav
      id="main-navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        transition: "all 0.3s ease",
        background: isScrolled
          ? theme === "dark" ? "rgba(28, 28, 30, 0.85)" : "rgba(255, 255, 255, 0.85)"
          : "transparent",
        backdropFilter: "blur(12px)",
        borderBottom: isScrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
      }}
    >
      <Link
        href="/"
        style={{
          textDecoration: "none",
        }}
      >
        <Logo size="md" showSubtitle={false} />
      </Link>

      {/* Navigation controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "14px",
                color: pathname === link.href ? "var(--purple-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s ease",
                position: "relative",
              }}
            >
              {link.label}
              {pathname === link.href && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "16px",
                    height: "2px",
                    background: "var(--purple-primary)",
                    borderRadius: "1px",
                  }}
                />
              )}
            </Link>
          ))}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Account / Login */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                <User size={14} style={{ color: "var(--purple-primary)" }} />
                {user.name.split(" ")[0]}
                <span
                  style={{
                    fontSize: "9px",
                    background: user.role === "doctor" ? "rgba(255, 149, 0, 0.15)" : "rgba(52, 199, 89, 0.15)",
                    color: user.role === "doctor" ? "var(--severity-med)" : "var(--severity-low)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--severity-high)",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "50%",
                }}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            pathname !== "/login" && pathname !== "/onboarding" && (
              <Link
                href="/login"
                id="nav-login-button"
                style={{
                  background: "var(--purple-primary)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 18px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0, 113, 227, 0.15)",
                  transition: "all 0.2s ease",
                }}
                className="hover:scale-105"
              >
                Access CliniHome
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Actions */}
        <div style={{ display: "none", alignItems: "center", gap: "10px" }} className="mobile-actions-row">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px",
            }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu animate-slide-down"
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "15px",
                color: pathname === link.href ? "var(--purple-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                padding: "8px 0",
              }}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                👤 {user.name} ({user.role})
              </span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "none",
                  color: "var(--severity-high)",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Logout <LogOut size={16} />
              </button>
            </div>
          ) : (
            pathname !== "/login" && pathname !== "/onboarding" && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: "var(--purple-primary)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "14px",
                  padding: "12px 20px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Access CliniHome
              </Link>
            )
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1150px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-actions-row {
            display: flex !important;
          }
          .emergency-label {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
