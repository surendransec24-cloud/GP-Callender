# BIT Holiday Calendar — Liquid Glassmorphism Design System (DESIGN.md)

This document establishes the production design system, guidelines, component hierarchy, and UX specifications for the **BIT Holiday Calendar** app (Bannari Amman Institute of Technology).

---

## 1. Design Direction & Philosophy

- **Aesthetic**: Premium "Liquid Glass" glassmorphism meets **Apple Calendar** and **Linear**. Clean, calm, modern, and trustworthy with frosted translucent surfaces floating over slow ambient mesh gradient orbs and subtle noise texture.
- **Anti-Patterns Avoided**: No default Bootstrap or Material styling, no neon colors, no clutter, no emojis used as icons, no muddy dark-mode drop shadows.
- **Strict Production Standard**: Zero demo accounts, zero mock authentication in production code. Real Google OAuth restricted to `@bitsathy.ac.in`.
- **System-Driven**: Every component references centralized CSS custom properties defined in `src/styles/tokens.css` and utility classes in `src/styles/glass.css`.

---

## 2. Colour System & Tokens

### 2.1 Brand Primary (Deep Blue & Liquid Glow)
| Token | Hex / Value (Light Mode) | Hex / Value (Dark Mode) | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-primary-50` | `#eff6ff` | `rgba(59, 130, 246, 0.12)` | Subtle hover fills, tinted chips |
| `--color-primary-100` | `#dbeafe` | `rgba(59, 130, 246, 0.20)` | Active button backgrounds |
| `--color-primary-500` | `#3b82f6` | `#60a5fa` | Interactive links and focus rings |
| `--color-primary-600` | `#2547b8` | `#3b82f6` | Core brand color, today pill, primary buttons |
| `--primary-gradient` | `linear-gradient(135deg, #2547b8, #3b82f6, #4f46e5)` | `linear-gradient(135deg, #3b82f6, #60a5fa, #818cf8)` | Primary action buttons and hero highlights |
| `--primary-glow` | `0 4px 20px rgba(37, 71, 184, 0.35)` | `0 4px 24px rgba(96, 165, 250, 0.35)` | Liquid glow behind primary interactive elements |

### 2.2 Semantic Colors (Paired with Icons, Shapes, and Labels)
Never rely on colour alone — each marker is paired with a distinct shape, icon, or label:
- **Public Holiday**: Rose / Red (`--holiday-base: #e11d48`, dark text `#9f1239` in light, `#fda4af` in dark). Paired with solid circular dot and category chip.
- **GP Leave**: Royal Blue (`--gp-base: #2547b8`, dark `#60a5fa`). Rendered as continuous horizontal rounded pills spanning multi-day ranges.
- **GP + Festival**: Amber / Warm Gold (`--gp-fest-base: #d97706`). Highlights festive leaves with a Sparkles badge.
- **AN Half-Day Start**: Afternoon half-day departure. Rendered with diagonal half-fill split (`linear-gradient(135deg, transparent 48%, var(--gp-bg) 50%)`) and an `"AN"` badge.
- **Mess Closure**: Slate Grey (`--mess-base: #64748b`) with subtle diagonal striping and a Lucide `Utensils` icon.
- **Tentative Schedule**: Emerald Green (`--tentative-base: #059669`) with a dashed ring indicator.

### 2.3 Neutral Scale, Surfaces & Ambient Orbs
- **Light Mode**:
  - Base: Soft sky/lavender background (`#f0f4fc` to `#f8f6fc`).
  - Ambient Orbs: Drifting orbs of Sky Blue (`rgba(96, 165, 250, 0.45)`), Soft Violet (`rgba(167, 139, 250, 0.38)`), Soft Teal (`rgba(45, 212, 191, 0.32)`), and Indigo.
  - Text Primary: `#0f172a` (WCAG AAA 17.8:1 contrast).
  - Text Secondary: `#334155` (WCAG AA 6.9:1 contrast).
- **Dark Mode**:
  - Base: Deep navy-charcoal background (`#070c18` to `#0d172e`).
  - Ambient Orbs: Deep Cobalt Blue (`rgba(37, 71, 184, 0.32)`), Indigo (`rgba(79, 70, 229, 0.28)`), Dark Teal (`rgba(13, 148, 136, 0.22)`), and Deep Violet.
  - Text Primary: `#f8fafc` (WCAG AAA 16.5:1 contrast).
  - Text Secondary: `#cbd5e1` (WCAG AA 8.2:1 contrast).

---

## 3. Glassmorphism Recipes

The UI uses three tiers of frosted translucent glass panels with layered depth:

### 3.1 Tier 1: `.glass` (Standard Content Cards)
```css
.glass {
  background: var(--glass-bg); /* rgba(255,255,255,0.62) light / rgba(15,23,42,0.58) dark */
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)); /* blur: 20px, sat: 160% */
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border); /* rgba(255,255,255,0.55) light / rgba(255,255,255,0.12) dark */
  box-shadow: var(--glass-shadow); /* 0 8px 32px rgba(15,23,42,0.08) */
  box-shadow: var(--glass-highlight), var(--glass-shadow); /* inset 0 1px 0 rgba(255,255,255,0.65) */
  border-radius: var(--radius-card); /* 24px */
}
```

### 3.2 Tier 2: `.glass-strong` (Sheets, Modals, Header & Floating Dock)
- **Blur**: `28px` with `180%` saturation boost.
- **Opacity**: `rgba(255, 255, 255, 0.82)` in light mode, `rgba(11, 18, 38, 0.85)` in dark mode.
- **Highlight**: Top inset highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.35)`) and deep ambient shadow `0 16px 40px rgba(0, 0, 0, 0.25)`.

### 3.3 Tier 3: `.glass-subtle` (Chips, Badges, Filter Pills)
- **Blur**: `12px`.
- **Opacity**: `rgba(255, 255, 255, 0.48)` in light mode, `rgba(255, 255, 255, 0.06)` in dark mode.
- **Radius**: Fully rounded `9999px` (`--radius-pill`).

### 3.4 Interactive Utilities
- **`.glass-interactive`**: On desktop pointer devices, triggers a subtle 45-degree light-sweep reflection sheen and elevation lift on hover (`transform: translateY(-2px)`).
- **`.glass-pressable`**: Physical micro-press response (`transform: scale(0.97)`) on `:active`.

### 3.5 Fallbacks & Accessibility
- **Safari Support**: Full `-webkit-backdrop-filter` prefixing across all glass declarations.
- **No Backdrop Filter Fallback**: Uses `@supports not (backdrop-filter: blur(1px))` with opaque high-contrast fills (`#ffffff` light, `#131d33` dark).
- **Reduced Transparency / High Contrast**: When `prefers-reduced-transparency: reduce` or `prefers-contrast: more` is requested, backdrop blur is eliminated, background opacity is bumped to 96%+, and 1.5px solid high-contrast borders are applied.

---

## 4. Typography Scale & Hierarchy

- **Typeface**: `Plus Jakarta Sans` with fallback to system UI sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Display Setting**: `font-display: swap`.
- **Tabular Numbers**: Enabled with `font-variant-numeric: tabular-nums` across all dates, counters, countdowns, and quick stats.

| Size Token | Pixel Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| `--font-size-xs` | 12px | Medium (500) / Semibold (600) | Badges, chips, secondary meta, weekday labels |
| `--font-size-sm` | 14px | Regular (400) / Semibold (600) | Body text, list dates, buttons, day cells |
| `--font-size-base` | 16px | Regular (400) / Bold (700) | Main section headings, primary button text |
| `--font-size-lg` | 20px | Bold (700) | Month titles, dialog headers |
| `--font-size-xl` | 24px | Bold (700) | Year header, login title |
| `--font-size-2xl` | 32px | Bold (700) | Hero countdown numbers, primary greeting |

---

## 5. Spacing, Shapes & Depth

### 5.1 4px Spacing Grid
Tokens: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px).

### 5.2 Corner Radii
- **Cards & Primary Panels**: `24px` (`--radius-card`)
- **Buttons & Action Controls**: `16px` (`--radius-button`)
- **Bottom Sheets & Modals**: `28px` top radius (`--radius-modal`)
- **Chips, Pills, & Today Circles**: `9999px` (`--radius-pill`)

### 5.3 Micro-Noise Texture
- A seamless fixed SVG noise texture overlay with ~3% opacity floats directly over the ambient gradient orbs, eliminating color banding and adding tactile frosted glass authenticity without blocking touch interactions (`pointer-events: none`).

---

## 6. Layout & Responsive Architecture

### 6.1 Shared Container (`.app-container`)
- **Mobile / Tablet (<1024px)**: `max-width: 480px`, centered with `margin-inline: auto` and `padding-inline: 16px`.
- **Desktop (>=1024px)**: `max-width: 1100px`, centered with `margin-inline: auto`.
  - **Two-Column Grid**: `grid-template-columns: minmax(0, 1fr) 380px; gap: 24px;`.
  - **Left Column**: Quick stats, Next Leave hero card, Month calendar view.
  - **Right Column**: Selected date details card and Upcoming timeline, eliminating empty desktop space.
- Header content spans the exact same container max-width to maintain clean alignment.

### 6.2 Fixed Floating Navigation & Apply Button
- Bottom floating glass dock and primary "Apply for Leave" action button share container alignment.
- Bottom safe area padding (`env(safe-area-inset-bottom)`) is applied to avoid clipping on notched phones.
- Page bottom padding (`padding-bottom: 112px`) guarantees calendar content is never obscured.

---

## 7. Component Specifications

### 7.1 Login Screen
- Centered liquid glass card (`max-width: 440px`) floating over animated ambient orbs.
- College crest badge ("BIT Bannari Amman Institute of Technology").
- Value tagline: *"Never miss a GP again"*.
- Official Google Sign-In button with high-contrast background, official Google "G" SVG icon, and hover shine.
- Notice: Sign in with your college Google account (`@bitsathy.ac.in`).
- Error Banner: Frosted red glass banner for non-college Google account attempts.
- **Zero demo accounts or mock login options.**

### 7.2 Home & Month Calendar
- **Quick-Stats Row**: 3 glass tiles (GPs this month, Holidays this month, Days to next leave) with tabular numerals.
- **Next Leave Hero**: Glass card with glowing gradient accent, countdown timer, leave title, date range, AN indicator, and instant "Apply on Portal" link.
- **Calendar Grid**: 7-column grid with generous cell dimensions (min 56px height).
- **Connected GP Pills**: Continuous rounded bars across multi-day leaves in a week row (rounded start, flat middle, rounded end).
- **AN Departure Indicator**: Diagonal split with `"AN"` badge on afternoon start days.
- **Today Marker**: Filled blue liquid glass circle with white text.

### 7.3 Date Bottom Sheet
- Ergonomic drag handle with touch swipe-to-dismiss gesture.
- Backdrop blur and spring-up animation.
- Category chip (Holiday / GP / Mess Closure), status badge (Confirmed / Tentative).
- Details rows with Lucide icons (Duration, AN departure notice, mess closure timeline, BIT campus location).
- Actions: "Apply for this GP" button, "Copy Dates" button with check and confetti micro-animation, and "Export .ics".

### 7.4 Floating Bottom Dock Navigation
- Frosted glass bar (`.glass-strong`) with 4 tabs: **Home**, **Calendar**, **Upcoming**, **Profile**.
- Lucide icons with uniform `1.75px` stroke (`2.2px` when active).

---

## 8. Do's and Don'ts

| Do | Don't |
| :--- | :--- |
| **Do** use `var(--font-tabular)` on dates, timers, and counters. | **Don't** use proportional numerals for dates or countdowns. |
| **Do** pair every semantic color with a text label, chip, or icon. | **Don't** rely solely on color to convey information. |
| **Do** cap blur to 28px and never nest more than 2 glass layers. | **Don't** stack multiple heavy blur layers causing GPU lag on mobile. |
| **Do** support `prefers-reduced-transparency` and `prefers-contrast`. | **Don't** leave text with insufficient contrast over glass. |
| **Do** keep touch targets at or above 48px height. | **Don't** create cramped, un-tappable buttons on mobile. |
| **Do** render multi-day GP leaves as continuous connected bars. | **Don't** color each cell as an isolated square. |
| **Do** keep production auth restricted strictly to `@bitsathy.ac.in`. | **Don't** add demo accounts, mock login buttons, or dev evaluation bypasses. |
