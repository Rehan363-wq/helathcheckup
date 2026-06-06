# CliniHome AI — Technology Stack Document

This document catalogs the frameworks, core engines, styling methodologies, testing configurations, and deployment pipelines utilized in the CliniHome AI healthcare application.

---

## 1. Core Framework & Engines

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | `16.2.7` | React server-rendered app router framework with Turbopack support. |
| **React** | `19.2.4` | Component lifecycle hooks and SPA client rendering. |
| **Node.js** | `20+` | Server execution runtime environment. |
| **TypeScript** | `5+` | Compile-time static type safety checking. |

---

## 2. API & Storage Services

| Technology | Purpose | Integration Details |
|---|---|---|
| **Google Gemini API** | Multimodal LLM Engine | `gemini-2.5-flash` model for diagnostics parsing, triage chat, and coach tips. |
| **Supabase SSR** | Backend-as-a-Service | Session tracking, profiles tables management, and blood panel metadata synchronization. |
| **Browser LocalStorage** | Sandbox Client Cache | Keeps configurations, alarms, local consultations, and metrics for offline capabilities. |

---

## 3. Styling, Assets & UI Components

| Technology | Purpose | Integration Details |
|---|---|---|
| **Vanilla CSS / CSS Variables** | Design Token Foundation | Configures color variables, responsive breakpoints, matte gradients, and light/dark theme variables. |
| **Lucide React** | Brand System Icons | Access vectors (Search, Pill, Calendar, Heart, Bot, Shield, etc.). |
| **TailwindCSS** | Optional Helper | Integrated with postcss configurations for rapid page layouts. |

---

## 4. Testing, DevOps & Tooling

| Technology | Purpose | Integration Details |
|---|---|---|
| **Vitest** | Unit Test Runner | Verifies utility helpers, rate-limiters, and timezone conversions without complex config. |
| **GitHub Actions** | CI/CD Pipeline | Executes code checkout, dependencies installations, Vitest unit testing, and Next.js builds on code updates. |
| **ESLint** | Code Linting Quality | Validates code standards, code cleanliness, and unused imports check. |
