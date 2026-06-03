# MediScan AI — UI/UX Design Document

**Version:** 1.0  
**Date:** June 2026  
**Design Inspiration:** Reference medical dashboard (patient overview)  
**Design Style:** Clinical Minimalism + Dark Depth

---

## 1. 🎨 Design Language

### Aesthetic Direction
```
Style:        Clinical Minimalism with Dark Depth
Mood:         Trustworthy, Modern, Premium Medical
Inspiration:  Reference image — clean white cards, dark bg, 
              human body map, node-graph connections
Key Feel:     "Doctor ki diary meets Apple design"
```

### Core Design Principles
```
1. WHITE CARDS ON DARK       → Premium feel, depth hierarchy
2. NODE CONNECTIONS          → Show relationships (disease → test → medicine)
3. HUMAN BODY MAP            → Centerpiece, visual storytelling
4. DATA VISUALIZATION        → Mini charts for health metrics
5. CLEAR SEVERITY CODING     → Color-coded urgency (Green/Yellow/Red)
```

---

## 2. 🎨 Color System

```css
:root {
  /* Background */
  --bg-dark:        #0D0A1E;   /* Main page background — deep purple-black */
  --bg-surface:     #F8F7FF;   /* Main content area — near white */
  --bg-card:        #FFFFFF;   /* Cards — pure white */
  --bg-card-dark:   #1C1A2E;   /* Dark cards (like detail popup) */

  /* Brand Colors */
  --purple-primary: #7C3AED;   /* Main brand — deep violet */
  --purple-light:   #A78BFA;   /* Lighter purple accents */
  --purple-glow:    #8B5CF620; /* Purple with opacity — glow effect */

  /* Accent Colors (from reference image) */
  --accent-yellow:  #F59E0B;   /* Highlights, active states */
  --accent-pink:    #EC4899;   /* CTA buttons, appointment */
  --accent-blue:    #3B82F6;   /* Charts, cardiogram lines */
  --accent-gold:    #F5D567;   /* Body map highlights */

  /* Status Colors */
  --severity-low:   #10B981;   /* Green — safe */
  --severity-med:   #F59E0B;   /* Yellow — caution */
  --severity-high:  #EF4444;   /* Red — urgent */

  /* Text */
  --text-primary:   #111827;   /* Dark text on light bg */
  --text-secondary: #6B7280;   /* Muted/label text */
  --text-white:     #FFFFFF;   /* Text on dark cards */
  --text-muted:     #9CA3AF;   /* Placeholder, hints */

  /* Borders & Shadows */
  --border:         #E5E7EB;
  --shadow-card:    0 4px 24px rgba(0,0,0,0.08);
  --shadow-dark:    0 8px 32px rgba(0,0,0,0.4);
  --shadow-purple:  0 8px 32px rgba(124,58,237,0.2);
}
```

---

## 3. 📝 Typography

```css
/* Fonts — Import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

/* Display / Headings */
font-family: 'Syne', sans-serif;
  H1: 48px / 700 / letter-spacing: -0.02em
  H2: 32px / 700 / letter-spacing: -0.01em
  H3: 22px / 600

/* Body / UI Text */
font-family: 'DM Sans', sans-serif;
  Body:    16px / 400
  Small:   13px / 400
  Label:   11px / 500 / uppercase / letter-spacing: 0.05em
  Caption: 12px / 300 / color: var(--text-muted)
```

---

## 4. 🖥️ Screen by Screen Design

---

### Screen 1 — Landing Page

```
Layout: Full width, dark background (--bg-dark)

┌─────────────────────────────────────────────┐
│  NAVBAR                                     │
│  [Logo: MediScan🔬] ──── Features Pricing   │
│                               [Login] [CTA]  │
├─────────────────────────────────────────────┤
│                                             │
│         HERO SECTION                        │
│                                             │
│   Apna Doctor,        [Floating Dashboard   │
│   Apni Zeb Mein.       Preview Card —       │
│                         white card with     │
│   AI se samjho         mini chart inside]   │
│   Doctor se milo                            │
│                                             │
│   [Scan Karo →]  [Report Upload]            │
│                                             │
│   ✓ 10,000+ scans  ✓ Verified Doctors      │
│   ✓ AI Powered     ✓ Privacy First          │
├─────────────────────────────────────────────┤
│  3 FEATURE CARDS (white, floating)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │📸 Scan   │ │📄 Report │ │📍 Doctor │   │
│  │ Analyzer │ │Explainer │ │  Finder  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘

Key Design Choices:
- Dark purple-black bg (#0D0A1E)
- Hero text: white, Syne 700
- Floating dashboard card as social proof
- Gradient CTA button: purple → pink
- Subtle purple glow behind hero card
```

---

### Screen 2 — Skin Analyzer Page

```
Layout: Split — Left upload, Right result

BEFORE UPLOAD:
┌─────────────────────────────────────────────┐
│  ← Back    📸 Skin Analyzer                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────┐                   │
│  │                     │  TIP CARD         │
│  │   + Upload Photo    │  ┌─────────────┐  │
│  │                     │  │ 💡 Best     │  │
│  │  Drag & drop karo   │  │ results ke  │  │
│  │  ya click karo      │  │ liye:       │  │
│  │                     │  │ • Good light│  │
│  │  JPG, PNG, WEBP     │  │ • Close up  │  │
│  │  Max 10MB           │  │ • No filter │  │
│  │                     │  └─────────────┘  │
│  └─────────────────────┘                   │
│                                             │
│  ⚠️ Disclaimer: Ye AI analysis hai,        │
│  professional medical advice nahi.          │
└─────────────────────────────────────────────┘

AFTER UPLOAD — RESULT:
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ [User photo] │  │ 🔍 AI Analysis     │  │
│  │              │  │                    │  │
│  │              │  │ Fungal Infection   │  │
│  │              │  │ ●●●●○ 82% match   │  │
│  │              │  │                    │  │
│  │              │  │ SEVERITY           │  │
│  │              │  │ [🟡 MEDIUM]        │  │
│  │              │  │                    │  │
│  │              │  │ Kya hai ye:        │  │
│  │              │  │ Dermatophyte se    │  │
│  │              │  │ hone wala common   │  │
│  │              │  │ fungal infection   │  │
│  │              │  │                    │  │
│  │              │  │ Aage kya karo:     │  │
│  │              │  │ Antifungal cream + │  │
│  │              │  │ doctor consultation│  │
│  │              │  │                    │  │
│  │              │  │ [📍 Doctor Dhundho]│  │
│  └──────────────┘  └────────────────────┘  │
│                                             │
│  ⚠️ AI analysis — doctor se confirm karo   │
└─────────────────────────────────────────────┘

Key Design Choices:
- Upload zone: dashed border, hover purple glow
- Loading state: pulsing skeleton + "AI analyze kar rahi hai..."
- Confidence: Custom dot-bar visualization
- Severity badge: pill shape, color-coded
- Result card: white, heavy shadow, left border colored by severity
```

---

### Screen 3 — Report Explainer Page

```
Layout: Full width, scrollable result

RESULT VIEW:
┌─────────────────────────────────────────────┐
│  ← Back    📄 Report Explainer              │
├─────────────────────────────────────────────┤
│                                             │
│  SUMMARY CARD (dark bg, purple accent)      │
│  ┌─────────────────────────────────────┐    │
│  │ 📊 Report Summary                   │    │
│  │ Overall: ⚠️ Consult Required        │    │
│  │ 3 values normal, 2 need attention   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  PARAMETER TABLE                            │
│  ┌───────────────────────────────────────┐  │
│  │ Parameter  │ Value  │ Normal  │Status │  │
│  ├───────────────────────────────────────┤  │
│  │ Haemoglobin│ 9.2   │ 12-16   │ 🔴 Low│  │
│  │ WBC Count  │ 7200  │ 4k-11k  │ ✅    │  │
│  │ Platelets  │ 1.8L  │ 1.5-4L  │ ✅    │  │
│  │ Blood Sugar│ 210   │ 70-140  │ 🔴 Hi │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  EXPLANATION CARDS (one per abnormal)       │
│  ┌─────────────────────────────────────┐    │
│  │ 🩸 Haemoglobin — 9.2 g/dL          │    │
│  │ Status: [🔴 Low]                    │    │
│  │                                     │    │
│  │ Kya matlab: Aapka haemoglobin normal│    │
│  │ se kam hai. Iska matlab ho sakta hai│    │
│  │ anemia — iron ki kami.              │    │
│  │                                     │    │
│  │ Kya karo: Iron-rich food khao.      │    │
│  │ Doctor se iron supplement lao.      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [📤 Share with Doctor]  [📍 Doctor Dhundho]│
└─────────────────────────────────────────────┘

Key Design Choices:
- Summary card: dark bg, colored border-left by severity
- Table: alternating row bg, status color-coded chips
- Explanation cards: expandable accordion style
- Abnormal values highlighted in red/yellow
- Share button: copies formatted summary
```

---

### Screen 4 — Doctor Finder Page

```
Layout: Split — Left list, Right map (like reference image)

┌─────────────────────────────────────────────┐
│  ← Back    📍 Apne Area ke Doctors          │
├───────────────────┬─────────────────────────┤
│  FILTER BAR       │                         │
│  [Specialization▼]│     GOOGLE MAP          │
│  [Fees: ₹0-₹500 ▼]│                        │
│  [Distance ▼]     │   (Interactive map      │
├───────────────────┤    with purple pins)    │
│  DOCTOR LIST      │                         │
│                   │                         │
│  ┌─────────────┐  │                         │
│  │ [Avatar]    │  │                         │
│  │ Dr. Sharma  │  │                         │
│  │ Dermatolog. │  │                         │
│  │ ⭐ 4.8      │  │                         │
│  │ 📍 2.3 km   │  │                         │
│  │ ₹ 300       │  │                         │
│  │ ✅ Verified │  │                         │
│  │ [Directions]│  │                         │
│  └─────────────┘  │                         │
│                   │                         │
│  ┌─────────────┐  │                         │
│  │ [Avatar]    │  │                         │
│  │ Dr. Gupta   │  │                         │
│  │ General     │  │                         │
│  │ ⭐ 4.5      │  │                         │
│  │ 📍 3.1 km   │  │                         │
│  │ ₹ 200       │  │                         │
│  │ [Directions]│  │                         │
│  └─────────────┘  │                         │
└───────────────────┴─────────────────────────┘

Key Design Choices:
- Map pins: custom purple SVG markers
- Active pin: enlarged + glow effect
- Doctor card: hover → subtle lift + shadow
- Verified badge: purple tick
- Distance: real-time from user location
- Fees: color coded (green=affordable, yellow=moderate)
```

---

## 5. 🧩 Component Design Specifications

### Navbar
```
Height:       64px
Background:   Transparent → blur on scroll (backdrop-filter: blur(12px))
Border:       1px solid rgba(255,255,255,0.1) on scroll
Logo:         Syne 700, white
Links:        DM Sans 500, muted white
CTA Button:   Purple gradient, pill shape, subtle glow
```

### Cards (White)
```
Background:   #FFFFFF
Border:       none
Border-radius: 16px
Shadow:       0 4px 24px rgba(0,0,0,0.08)
Padding:      24px
Hover:        transform: translateY(-4px), shadow intensifies
Transition:   all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Cards (Dark — like reference image popups)
```
Background:   #1C1A2E
Border:       1px solid rgba(255,255,255,0.08)
Border-radius: 16px
Shadow:       0 8px 32px rgba(0,0,0,0.4)
Padding:      24px
Text:         White
```

### Upload Zone
```
Border:       2px dashed #D1D5DB
Border-radius: 16px
Background:   #F9FAFB
Height:       280px
Hover:        border-color: var(--purple-primary)
              background: var(--purple-glow)
Active:       border-color: var(--purple-primary)
              background: #EDE9FE
Icon:         Upload cloud — purple, 48px
```

### Severity Badge
```
Shape:        Pill (border-radius: 999px)
Padding:      6px 14px
Font:         DM Sans 500, 13px

Low:    background: #D1FAE5, color: #065F46, icon: ✓
Medium: background: #FEF3C7, color: #92400E, icon: ⚠
High:   background: #FEE2E2, color: #991B1B, icon: ✕
```

### Confidence Bar (Custom)
```
Design: 5 dots instead of progress bar
Filled: solid purple circle
Empty:  hollow circle with purple border
Size:   10px each, gap: 4px

Example — 82%: ●●●●○ (4/5 filled)
```

### CTA Button (Primary)
```
Background: linear-gradient(135deg, #7C3AED, #EC4899)
Text:       White, DM Sans 600, 15px
Padding:    14px 28px
Radius:     12px
Shadow:     0 8px 24px rgba(124,58,237,0.35)
Hover:      brightness(1.1), translateY(-2px)
Active:     translateY(0)
```

### Loading State
```
Type: Skeleton shimmer
Animation: shimmer left to right (1.5s loop)
Color: #F3F4F6 → #E5E7EB

Overlay text: "AI analyze kar rahi hai..." (pulsing)
Duration: 5-10 seconds typical
```

---

## 6. 📱 Responsive Breakpoints

```
Mobile:  < 640px   → Single column, stacked layout
Tablet:  640-1024px → 2 column where needed
Desktop: > 1024px  → Full split layouts, map + list

Mobile-specific:
- Doctor finder: List only, map collapses to small preview
- Upload zone: smaller (200px height)
- Cards: full width, no hover effects (touch)
```

---

## 7. ✨ Animations & Micro-interactions

```
Page Load:
  - Navbar: fade in from top (0.3s)
  - Hero text: slide up + fade (0.5s, 0.1s delay each word)
  - Feature cards: staggered slide up (0.1s delay each)

Upload Zone:
  - Drag over: border animates, background pulses purple
  - File accepted: green flash + checkmark icon
  - Loading: skeleton with shimmer

Result Card:
  - Slide up from bottom (0.4s, ease-out)
  - Severity badge: pop scale animation
  - Confidence dots: fill one by one (0.1s delay each)

Doctor Cards:
  - Hover: translateY(-4px), shadow deepen
  - Map pin click: card highlights with purple left border

General:
  - All transitions: 0.2-0.3s, ease-in-out
  - No janky animations — smooth 60fps only
```

---

## 8. 🗂️ Icon System

```
Library:    Lucide React
Size:       20px (inline), 24px (standalone), 48px (feature)
Color:      Match context (purple for brand, gray for secondary)

Key Icons:
  Upload:        Upload, Image, FileText
  Medical:       Activity, Heart, Stethoscope, Pill
  Location:      MapPin, Navigation, Map
  Status:        CheckCircle, AlertTriangle, XCircle
  UI:            ChevronRight, X, ArrowLeft, Search, Filter
  Doctor:        User, Phone, Star, BadgeCheck
```

---

## 9. 🌗 Theme Support

```
Default:  Light (white cards, dark text) — like reference image main area
Dark bg:  Used for landing page, navbar background
Optional: Full dark mode toggle (post-hackathon)

Note: Reference image uses both —
  - Dark outer background (like desktop wallpaper)
  - White/light inner content (the actual dashboard)
  → Ye approach MediScan mein bhi follow karo
```

---

## 10. 📐 Spacing System (8px Grid)

```
4px   → xs (tight gaps, badge padding)
8px   → sm (between related items)
16px  → md (card internal spacing)
24px  → lg (card padding, section gaps)
32px  → xl (between major sections)
48px  → 2xl (section to section)
64px  → 3xl (hero padding)
96px  → 4xl (page top padding)
```

---

## 11. ♿ Accessibility

```
Contrast:   Minimum 4.5:1 for all text
Focus:      Visible purple ring on all interactive elements
Alt text:   All images including uploaded photos
ARIA:       Labels on icon-only buttons
Keyboard:   Full keyboard navigation
Screen:     Semantic HTML — h1, h2, section, main, nav
Loading:    aria-live="polite" for AI results
Error:      aria-role="alert" for upload errors
```

---

## 12. 🔑 Key Design Reference (From Image)

```
✅ COPY from reference:
  - White card style with subtle shadows
  - Dark popup/detail cards (like disease node popups)
  - Mini sparkline/wave charts inside cards
  - Doctor avatar + specialization layout
  - Tab bar (Appointments | Receipts | Tests | Pills)
  - Node-graph connection style (disease → test → medicine)
  - Clean left sidebar with patient info

🔄 ADAPT for MediScan:
  - Replace patient overview → AI scan result
  - Replace body diagram → Upload zone / Result visual
  - Replace appointment history → Scan history
  - Replace test cards → Report parameter cards
  - Add nearby doctor map (not in reference)

❌ SKIP for hackathon:
  - Interactive body diagram (too complex)
  - Full EHR/patient record system
  - Appointment scheduling flow
```

---

## 13. 🎯 Hackathon UI Priorities

```
Must Look Good (judges notice):
  P1 → Landing page hero
  P1 → Skin analyzer result card
  P1 → Report explanation layout
  P2 → Doctor finder cards
  P3 → Loading states

Skip beautifying:
  - Login/signup page (default shadcn is fine)
  - Error states (minimal is ok)
  - Mobile optimization (desktop demo pe focus karo)
```

---

*UIUX v1.0 — MediScan AI*  
*Design: Clinical Minimalism + Dark Depth*  
*"Medical software doesn't have to look boring."*