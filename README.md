# 📅 BIT Holiday Calendar (2026–2030)
### Bannari Amman Institute of Technology, Sathyamangalam

A mobile-first Progressive Web App (PWA) built with **React + Vite** for students and faculty of **Bannari Amman Institute of Technology (BIT)**. It replaces static circulars and PDF lists with a phone-native calendar experience (Google Calendar / Apple Calendar / Notion style) covering **every month from January 2026 to December 2030**.

---

## 🚀 Quick Start (Local Run)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` or create `.env` in the root:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyB3myWIDgmS_Qk6wMR9qdFceytciZclASg
   VITE_FIREBASE_AUTH_DOMAIN=bit-holiday-calendar.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=bit-holiday-calendar
   VITE_FIREBASE_STORAGE_BUCKET=bit-holiday-calendar.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=993671101862
   VITE_FIREBASE_APP_ID=1:993671101862:web:ee0bb4bf5ee4e1e229a367
   VITE_ALLOWED_DOMAIN=bitsathy.ac.in
   VITE_ADMIN_EMAILS=admin@bitsathy.ac.in,principal@bitsathy.ac.in,studentcouncil@bitsathy.ac.in
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.

4. **Build and preview production build locally:**
   ```bash
   npm run build
   npm run preview
   ```
   The preview server runs under the base path: **`http://localhost:4173/GP-Callender/`**.

---

## 🌐 GitHub Pages Deployment Setup

The repository is configured for automated builds and deployment to GitHub Pages at:
**`https://surendransec24-cloud.github.io/GP-Callender/`**

### Step 1: Enable GitHub Pages with Actions
1. On GitHub, navigate to your repository **`GP-Callender`**.
2. Click **Settings** → **Pages** (under Code and automation).
3. Under **Build and deployment**:
   - **Source**: Select **`GitHub Actions`** (do not select Deploy from a branch).
4. The workflow at [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) will trigger on every push to `main` or `master`.

### Step 2: Add GitHub Actions Secrets
In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and click **New repository secret** for each variable:

| Secret Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `bit-holiday-calendar.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `bit-holiday-calendar` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `bit-holiday-calendar.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Sender ID (e.g. `993671101862`) |
| `VITE_FIREBASE_APP_ID` | Your App ID (`1:993671101862:web:...`) |
| `VITE_ALLOWED_DOMAIN` | `bitsathy.ac.in` |
| `VITE_ADMIN_EMAILS` | `admin@bitsathy.ac.in,principal@bitsathy.ac.in` |

### Step 3: Add Authorized Domain to Firebase Console
Google Sign-In requires your deployment domain to be whitelisted:
1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project (`bit-holiday-calendar`).
2. Go to **Authentication** → **Settings** tab → **Authorized domains**.
3. Click **Add domain** and enter:
   ```
   surendransec24-cloud.github.io
   ```
4. Click **Save**.

---

## 🔒 College Authentication & Security Rules

### Required Sign-In
- Access is strictly restricted to verified **`@bitsathy.ac.in`** Google Workspace accounts.
- The entry screen presents the college crest and a **"Sign in with your college Google account"** button. Nothing else is visible until authenticated.
- The Google Auth Provider is configured with `{ hd: "bitsathy.ac.in", prompt: "select_account" }` to guide Google to show college accounts.
- **Client-Side Enforcement:** After sign-in, the app verifies that `user.email` ends with `@bitsathy.ac.in` and `user.emailVerified === true`. If a non-college account is selected, it immediately signs the user out and displays:
  > *"Please sign in with your @bitsathy.ac.in email."*
- **Backend Enforcement (`firestore.rules`):**
  Reads are permitted **only** when authenticated with a verified `@bitsathy.ac.in` token. Writes are permitted **only** for addresses listed in `ADMIN_EMAILS`.

---

## 📅 Calendar Features (2026 to 2030)

- **Continuous 5-Year Coverage:** Every single month from **January 2026 to December 2030** (60 months) is accessible.
- **Swipe & Quick Jump:** Swipe left/right on mobile or use the Month Picker modal to jump directly to any month.
- **Sunday / Monday Start Setting:** Switch between Sunday-start or Monday-start in the profile menu.
- **Colour Coding & Indicators:**
  - 🔴 **Red:** Public holiday
  - 🔵 **Blue:** GP leave period
  - 🟠 **Orange:** GP combined with a festival (festival day marked with orange badge)
  - ⚪ **Striped Hatch:** Hostel mess closure
  - 🟢 **Green Dot:** Tentative (not yet confirmed by the college)
  - ◾ **Diagonal Split + "AN" Badge:** Afternoon half-day (leave begins after 1:00 PM)
- **Bottom Sheet Details:** Tap any day to inspect the full weekday, leave range, mess closure timings, and Confirmed vs Tentative status.
- **Top Summary:** *"This month: 1 GP, 2 holidays"* (or *"GP not announced yet"*).
- **Year View:** 12-month annual overview for any year (2026 to 2030).
- **Upcoming Timeline:** Countdown badge (*"In 5 days"*, *"Tomorrow"*, *"Active Now"*).
- **📋 1-Tap Leave Portal Integration:**
  - Configured globally via `LEAVE_PORTAL_URL` (`https://ps.bitsathy.ac.in/activity/my-leaves`) in `src/config.js`.
  - **Sticky "Apply for Leave" Button:** Docked at the bottom of the screen with a minimum 48px tap target.
  - **Under "Next leave: ...":** Direct "Apply now" button.
  - **7-Day Urgent Reminder Banner:** Appears when the next GP leave begins within 7 days.
  - **Date Bottom Sheet:** "Apply for this GP" button plus a 1-tap **"Copy dates"** button (copies range e.g. `25 Jun 2026 (AN) to 29 Jun 2026` to clipboard).
  - **Upcoming Cards:** Quick "Apply" pill on every GP card.
- **Add to Calendar (.ics):** Export all 5 years, any selected year, or a single event to Apple Calendar, Google Calendar, or Outlook.
- **Reminders:** Built-in Web Notification alert 1 day before leave.

---

## 📝 How to Add or Update GP Leaves Each Year

### Method 1: Using the Built-In Admin Screen (Zero Code)
1. Sign in with any email listed in `ADMIN_EMAILS` (e.g. `admin@bitsathy.ac.in`).
2. An **"Announce / Edit GP Leave"** option appears in your profile menu.
3. Fill in the form:
   - **Start Date** & **End Date**
   - **Starts Afternoon (AN Half-Day)** checkbox
   - Optional festival celebration & date
   - Optional hostel mess closure window
4. Click **Publish Confirmed GP Leave**. It saves directly to Firestore and immediately updates for all students!

### Method 2: Editing `data/leaves.json`
All baseline leave data is stored in [`data/leaves.json`](file:///c:/Users/loginn/OneDrive/Documents/GP%20Callender/data/leaves.json).
