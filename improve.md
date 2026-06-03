# HealFlow AI — Product Improvement Backlog (`improve.md`)

This document lists identified bugs, user experience improvements, and technical enhancements needed to elevate HealFlow AI from a hackathon MVP to a robust, enterprise-ready healthcare platform.

---

## 🚀 Critical UI/UX & Functional Improvements

### 1. One-Click Sandbox Quick Login
- **Issue**: Clicking "Patient Sandbox" or "Doctor Sandbox" in `/login` fills form fields but doesn't log in. Typing through test runners is difficult.
- **Fix**: Re-engineer `handleQuickLogin()` to immediately authenticate the demo session and redirect the user, eliminating the extra click.

### 2. Sandbox Doctor Chat with Real Gemini Responses
- **Issue**: Sandbox doctor chat replies are hardcoded templates (e.g. general paracetamol advice for fever).
- **Fix**: Connect sandbox doctor chat with the Gemini API route (`/api/chat/bot` or similar prompt-engineered assistant) so doctors dynamically reply to patient queries based on their specializing domains.

### 3. Real-Time Report Parsing During Onboarding
- **Issue**: Report upload in step 4 of onboarding only creates mock metadata and doesn't call Gemini to summarize.
- **Fix**: Send uploaded report files (base64 images/PDFs) to the Gemini vision API immediately during onboarding, extracting key parameters and generating summaries dynamically.

### 4. Dynamic Doctor Search with Database Queries
- **Issue**: Doctor searching on `/doctors` works on local mock lists.
- **Fix**: Query the Supabase `profiles` table filtering by specialization, fee limits, and city so real registered doctors show up dynamically.

### 5. Unified Global Theme & Font Styling Polish
- **Issue**: Font and color styling across sections (tracker, scan, report, chat) can feel disconnected without strict CSS variable enforcement.
- **Fix**: Enforce the new `Outfit` and `Plus Jakarta Sans` typography globally and polish layout margins for a perfect glassmorphic look.

---

## 🛠️ Implementation Progress Tracker

- [x] Task 1: One-Click Sandbox Quick Login (`app/login/page.tsx`)
- [x] Task 2: Supabase-Query Find Doctors Page (`app/doctors/page.tsx`)
- [x] Task 3: Real Gemini-Driven Sandbox Doctor Chat (`app/chat/page.tsx`)
- [x] Task 4: Dynamic PDF/Image Report Summary extraction in Onboarding (`app/onboarding/page.tsx`)
- [x] Task 5: Core CSS Design System Refinement & Styling Polish (`app/globals.css`)
