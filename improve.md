# CliniHome AI — Product Improvement Backlog (`improve.md`)

This document lists the completed bugs, visual issues, security upgrades, and architectural enhancements executed to elevate CliniHome AI to a robust, enterprise-ready healthcare platform.

---

## 🚀 Completed UI/UX & Technical Enhancements

### 1. One-Click Sandbox Quick Login
- **Fix**: Re-engineered `handleQuickLogin()` inside `/login` to immediately authenticate the demo session and redirect the user.

### 2. Sandbox Doctor Chat with Real Gemini Responses
- **Fix**: Integrated sandbox doctor chats with the Gemini API route (`/api/chat/doctor`) for specializing responses.

### 3. Real-Time Report Parsing During Onboarding
- **Fix**: Configured immediate visions/reports parsing with the Gemini vision API during step 4 of onboarding.

### 4. Dynamic Doctor Search with Database Queries
- **Fix**: Replaced local directories lists with dynamic filters querying Supabase `profiles` tables.

### 5. Unified Global Theme & Font Styling Polish
- **Fix**: Polished core layout CSS design variables, corrected dark mode report cards to use `rgba` transparencies, and added dynamic browser tab title handlers for all routes.

### 6. Emergency Button & Global Hinglish Clean-Up
- **Fix**: Removed the navigation bar emergency dialer and translated all residual Hinglish prompts, fallbacks, placeholders, and error messages to clean English.

### 7. Doctor Dashboard Responsiveness & Styling Highlights
- **Fix**: Corrected doctor dashboard responsive layout query constraint for mobile devices, standardized highlights to CSS custom properties, and added focus outline borders.

### 8. Mobile Responsiveness Polish
- **Fix**: Added media queries for narrow mobile screen width (`max-width: 480px`) to stack tracker dashboard stats columns vertically.

### 9. Accessibility Enhancements
- **Fix**: Implemented `aria-label` accessibility attributes on inputs, buttons, and select tags in critical forms (landing search, login, health bot).

### 10. Refactoring and Duplication Clean-Up
- **Fix**: Extracted sandbox login routines in `app/login/page.tsx` into a `loginToSandbox` helper, eliminating 200+ duplicate lines and strictly typing user/doctor context states.

### 11. Production Rate Limiting
- **Fix**: Added client IP-based in-memory rate limiting to protect Gemini AI endpoints against abuse.

### 12. Security Guards & HTTP Headers
- **Fix**: Configured Next.js proxy routing guards and injected HTTP headers (`X-Frame-Options`, `Strict-Transport-Security`, etc.) in `next.config.ts`.

### 13. Local Storage Disclaimer
- **Fix**: Added local storage data transparency notices in user profile settings.

### 14. Testing & DevOps Integration
- **Fix**: Set up Vitest test suite, designed a basic GitHub Actions compile workflow, and relocated demo assets.

---

## 🛠️ Implementation Progress Tracker

- [x] Task 1: One-Click Sandbox Quick Login (`app/login/page.tsx`)
- [x] Task 2: Supabase-Query Find Doctors Page (`app/doctors/page.tsx`)
- [x] Task 3: Real Gemini-Driven Sandbox Doctor Chat (`app/chat/page.tsx`)
- [x] Task 4: Dynamic PDF/Image Report Summary extraction in Onboarding (`app/onboarding/page.tsx`)
- [x] Task 5: Core CSS Design System Refinement & Styling Polish (`app/globals.css`)
- [x] Task 6: Rebrand all leftover "Vitalis" & "MediScan" to "CliniHome AI"
- [x] Task 7: Professionalize all Hinglish button labels/headers to English
- [x] Task 8: Implement dynamic page transitions screen loader (`app/loading.tsx`)
- [x] Task 9: Secure admin credentials and add authorization session checks to all API routes
- [x] Task 10: Build a local storage Backup & Recovery manager on `/profile`
- [x] Task 11: Remove navbar emergency button and translate remaining Hinglish UI prompts globally
- [x] Task 12: Audit and enhance Doctor Dashboard layout responsiveness and theme compliance
- [x] Task 13: Clean residual Hinglish labels in page chrome (`app/report/page.tsx`, `app/tracker/chat/page.tsx`)
- [x] Task 14: Support dynamic user language preference in AI Health Coach system prompt and client UI
- [x] Task 15: Support dynamic user language preference in AI Doctor Consultation Chat POST endpoint
- [x] Task 16: Support dynamic user language preference in AI skin analysis and AI report analysis prompts
- [x] Task 17: Support mobile layout responsiveness on tracker stats page (`app/tracker/page.tsx`)
- [x] Task 18: Add accessibility aria-label attributes to forms and buttons
- [x] Task 19: Refactor login duplication and eliminate loose type parameters
- [x] Task 20: Add in-memory client IP rate-limiting to protect Gemini endpoints
- [x] Task 21: Add root Next.js proxy guards, HTTP security headers, and local storage disclaimer
- [x] Task 22: Configure Vitest, set up CI/CD pipeline, relocate assets, and compile verify
