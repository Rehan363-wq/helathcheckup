"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Activity } from "lucide-react";

const navLinks = [
  { href: "/scan", label: "Skin Analyzer" },
  { href: "/report", label: "Report Explainer" },
  { href: "/doctors", label: "Find Doctors" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          ? "rgba(13, 10, 30, 0.85)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Activity size={20} color="white" />
        </div>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "20px",
            color: "var(--text-white)",
          }}
        >
          MediScan
        </span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "12px",
            color: "var(--purple-light)",
            background: "rgba(124,58,237,0.15)",
            padding: "2px 8px",
            borderRadius: "6px",
            marginLeft: "-4px",
          }}
        >
          AI
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
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
              color:
                pathname === link.href
                  ? "var(--text-white)"
                  : "var(--text-muted)",
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
                  width: "20px",
                  height: "2px",
                  background: "var(--purple-primary)",
                  borderRadius: "1px",
                }}
              />
            )}
          </Link>
        ))}

        {/* CTA */}
        <Link
          href="/scan"
          id="nav-cta-button"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            color: "white",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "14px",
            padding: "10px 20px",
            borderRadius: "10px",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
            transition: "all 0.2s ease",
          }}
        >
          Start Scanning
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "var(--text-white)",
          cursor: "pointer",
          padding: "8px",
        }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            right: 0,
            background: "rgba(13, 10, 30, 0.95)",
            backdropFilter: "blur(16px)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
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
                fontSize: "16px",
                color:
                  pathname === link.href
                    ? "var(--text-white)"
                    : "var(--text-muted)",
                textDecoration: "none",
                padding: "8px 0",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/scan"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 20px",
              borderRadius: "10px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Start Scanning
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
