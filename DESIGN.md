# BIT Holiday Calendar — Design System Documentation (DESIGN.md)

This document establishes the production design system, guidelines, component hierarchy, and design principles for the **BIT Holiday Calendar** app (Bannari Amman Institute of Technology).

---

## 1. Design Direction & Philosophy

- **Aesthetic**: Clean, calm, modern, and trustworthy. Combines the visual clarity of **Apple Calendar**, the crisp density and typography of **Linear**, and the spacious whitespace and neutrality of **Notion**.
- **Anti-Patterns Avoided**: No default Bootstrap or Material Design themes, no heavy aggressive gradients, no harsh neon accents, no visual clutter, and no emojis used as interface icons.
- **System-Driven**: Every component references CSS tokens defined in `src/styles/tokens.css`.

---

## 2. Colour System

### 2.1 Brand Primary (Deep Blue Scale)
| Token | Hex (Light Mode) | Hex / Value (Dark Mode) | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-primary-50` | `#eff6ff` | `rgba(59, 130, 246, 0.12)` | Subtle hover fills, tinted chips |
| `--color-primary-100` | `#dbeafe` | `rgba(59, 130, 246, 0.20)` | Active button backgrounds |
| `--color-primary-200` | `#bfdbfe` | `rgba(59, 130, 246, 0.30)` | Borders for primary elements |
| `--color-primary-500` | `#3b82f6` | `#60a5fa` | Interactive links and focus rings |
| `--color-primary-600` | `#2547b8` | `#3b82f6` | Core brand color, today pill, primary buttons |
| `--color-primary-700` | `#1d4ed8` | `#2563eb` | Hover states on primary buttons |
| `--color-primary-800` | `#1e3a8a` | `#1d4ed8` | College crest, header accents |
| `--color-primary-900` | `#172554` | `#172554` | Hero gradients, high-contrast dark surfaces |

### 2.2 Semantic Colors (Paired with Icons and Labels)
- **Public Holiday**: Rose / Red (`#e11d48`, subtle bg `#ffe4e6`, dark text `#9f1239`). Paired with a red dot marker and category chip.
- **GP Leave**: Deep Institutional Blue (`#2547b8`, light fill `#dbeafe`, dark text `#1e3a8a`). Rendered as continuous horizontal rounded pills spanning multi-day ranges.
- **GP + Festival**: Amber / Warm Gold (`#d97706`, subtle bg `#fef3c7`, dark text `#92400e`). Highlights festive leaves.
- **AN Half-Day Start**: Afternoon half-day marker. Rendered with a diagonal half-fill split (`linear-gradient(135deg, transparent 48%, var(--gp-bg) 50%)`) and an `"AN"` badge.
- **Mess Closure**: Slate Grey (`#64748b`) with subtle diagonal striping and a Lucide `Utensils` icon.
- **Tentative Schedule**: Emerald Green (`#059669`) with a dashed ring indicator.

### 2.3 Neutral Scale & Surfaces
- **Light Mode**:
  - Page Background: Soft off-white `#f8fafc` (Slate-50), avoiding harsh blinding pure white.
  - Cards & Modals: Pure white `#ffffff` with layered soft ambient shadows.
  - Text Primary: `#0f172a` (17.8:1 contrast, WCAG AAA).
  - Text Secondary: `#475569` (6.9:1 contrast, WCAG AA).
- **Dark Mode**:
  - Page Background: Deep navy-charcoal `#0c1220`, avoiding lifeless pure black.
  - Cards & Modals: Elevated surface `#151e32` with subtle 1px border (`#202d48`).
  - Text Primary: `#f1f5f9` (15.2:1 contrast, WCAG AAA).
  - Text Secondary: `#94a3b8` (6.4:1 contrast, WCAG AA).

---

## 3. Typography Scale & Hierarchy

- **Typeface**: `Plus Jakarta Sans` loaded via Google Fonts with system fallback:
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Display Setting**: `font-display: swap` to prevent FOIT (Flash of Invisible Text).
- **Tabular Numbers**: Enabled with `font-variant-numeric: tabular-nums` across all dates, counters, countdowns, and stats.

| Size Token | Pixel Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| `--font-size-xs` | 12px | Medium (500) / Semibold (600) | Badges, chips, secondary meta, weekday labels |
| `--font-size-sm` | 14px | Regular (400) / Semibold (600) | Body text, list dates, buttons, day cells |
| `--font-size-base` | 16px | Regular (400) / Bold (700) | Main section headings, primary button text |
| `--font-size-lg` | 20px | Bold (700) | Month titles, dialog headers |
| `--font-size-xl` | 24px | Bold (700) | Year header, login title |
| `--font-size-2xl` | 32px | Bold (700) | Login hero tagline, hero countdown numbers |

---

## 4. Spacing, Shapes, and Depth

### 4.1 4px Spacing Grid
Tokens: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px).

### 4.2 Corner Radii
- Cards & Containers: `16px` (`--radius-card`)
- Buttons & Inputs: `12px` (`--radius-button`)
- Bottom Sheets & Modals: `24px` top corners (`--radius-modal`)
- Pills & Badges: `9999px` (`--radius-pill`)

### 4.3 Depth & Shadows
- **Light Mode**: Multi-layer soft shadows using low-opacity dark slate:
  `0 4px 12px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)`.
- **Dark Mode**: Soft shadows replaced with crisp 1px borders (`#202d48` / `#263654`), avoiding muddy drop-shadow artifacts.
- **Glassmorphism**: 16px backdrop-blur (`backdrop-filter: blur(16px)`) on top header and floating bottom navigation dock.

---

## 5. Component System & UX Specifications

### 5.1 Login Screen
- Responsive full-screen split layout (two-column desktop, stacked mobile).
- Left Pane: Deep blue gradient with college crest, "Never miss a GP again" headline, value props, and an abstract interactive calendar preview.
- Right Pane: Clean auth card with official Google Sign-in button (with Google multi-color SVG "G" mark), domain validation notice (`@bitsathy.ac.in`), privacy assurance line, and one-click student/admin evaluation shortcuts.

### 5.2 Home Screen
- Personalized greeting ("Good morning, Kavitha") with student avatar and domain verification badge.
- Quick-Stats Row: Three metrics with tabular numbers (GPs this month, Holidays this month, Days to next leave).
- Hero "Next Leave" Card: Big countdown counter, leave title, date range, AN half-day indicator, and a direct "Apply on Portal" link.
- Compact Month Preview: Interactive mini month grid with instant navigation to full calendar.

### 5.3 Month Calendar
- Generous cell dimensions (min 56px height, min 44px width).
- **Connected GP Pills**: Continuous rounded bars across consecutive days in a week row (rounded left start, flat middle, rounded right end).
- **AN Departure Indicator**: Diagonal split with `"AN"` tag on afternoon start days.
- **Today Marker**: Filled blue circle with white text.
- **Selected Date**: Crisp 2px primary ring outline.
- **Smooth Navigation**: Month-switch slide and fade animation with touch swipe gesture support.
- **Segmented Filter Control**: Smooth sliding pill indicator across All, Holidays, GP Leave, and Mess Closed.

### 5.4 Date Bottom Sheet
- Ergonomic drag handle with touch swipe-to-dismiss gesture.
- Backdrop blur and spring-up animation.
- Category chip (Holiday / GP / Mess Closure), status badge (Confirmed / Tentative).
- Details rows with Lucide icons (Duration, AN departure notice, mess closure timeline, BIT campus location).
- Actions: "Apply for this GP" button, "Copy Dates" button with check and confetti micro-animation, and "Export .ics".

### 5.5 Upcoming Timeline
- Grouped by month with sticky month headers.
- Left color stripe matching leave type.
- Days-left pill ("Starts Today", "Tomorrow", "In 4 days", "Completed").
- Direct portal apply links.

### 5.6 Floating Bottom Dock Navigation
- Frosted glass bar with 4 items: **Home**, **Calendar**, **Upcoming**, **Profile**.
- Icons transition from line stroke to bold fill on active selection.
- Distinct elevated "Apply for Leave" primary button situated comfortably above the dock without obstructing calendar dates.

### 5.7 Profile & Settings Sheet
- Student details, verified `@bitsathy.ac.in` indicator, admin privileges badge.
- 3-Way Theme Switcher (Light / Dark / System).
- Week Start Day Switcher (Sunday / Monday).
- Notification permission request and status pill.
- One-click .ics full calendar download.
- Secure sign-out.

---

## 6. Iconography & Motion

- **Icon Set**: `Lucide React` with uniform `strokeWidth={1.75}` (and `2.2` on active navigation).
- **Strict Rule**: Zero emoji used as UI icons (all replaced with semantic SVG icons).
- **Micro-Interactions**:
  - 150ms – 250ms ease-out transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Spring easing on bottom sheets (`cubic-bezier(0.32, 1.25, 0.32, 1)`).
  - Button press scale effect (`transform: scale(0.97)` on `:active`).
  - Skeleton shimmer animations replacing spinners.
  - Confetti burst on "Copy Dates" success.
- **Accessibility**: Full `prefers-reduced-motion` compliance.

---

## 7. Do's and Don'ts

| Do | Don't |
| :--- | :--- |
| **Do** use `var(--font-tabular)` on dates, timers, and counters. | **Don't** use proportional numerals for dates or countdowns. |
| **Do** pair every semantic color with a text label, chip, or icon. | **Don't** rely solely on color to convey information. |
| **Do** keep touch targets at or above 48px height. | **Don't** create cramped, un-tappable buttons on mobile. |
| **Do** render multi-day GP leaves as continuous connected bars. | **Don't** color each cell as an isolated square. |
| **Do** show subtle 1px borders in dark mode. | **Don't** use dark mode drop shadows that look muddy. |
| **Do** keep the bundle lean with code-splitting and dynamic imports. | **Don't** load unused heavy libraries into the initial bundle. |
