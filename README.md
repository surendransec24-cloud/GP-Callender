# 📅 BIT Holiday Calendar (2026–2030)
### Bannari Amman Institute of Technology, Sathyamangalam

A mobile-first Progressive Web App (PWA) built with **React + Vite** for students and faculty of **Bannari Amman Institute of Technology (BIT)**. It replaces static circulars and PDF lists with a phone-native calendar experience (Google Calendar / iOS style) covering **every month from January 2026 to December 2030**.

---

## 🚀 Quick Start (Local Run)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.

3. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔐 College Authentication & Security Rules

### Required Sign-In
- Access is strictly restricted to verified **`@bitsathy.ac.in`** Google Workspace accounts.
- The entry screen presents the college crest and a **"Sign in with your college Google account"** button. Nothing else is visible until authenticated.
- The Google Auth Provider is configured with `{ hd: "bitsathy.ac.in", prompt: "select_account" }` to guide Google to show college accounts.
- **Client-Side Enforcement:** After sign-in, the app verifies that `user.email` ends with `@bitsathy.ac.in` and `user.emailVerified === true`. If a non-college account is selected, it immediately signs the user out and displays:
  > *"Please sign in with your @bitsathy.ac.in email."*
- **Backend Enforcement (`firestore.rules`):**
  Reads are permitted **only** when authenticated with a verified `@bitsathy.ac.in` token. Writes are permitted **only** for addresses listed in `ADMIN_EMAILS`.

---

## 🛠️ Step-by-Step Firebase Setup

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name your project (e.g., `bit-holiday-calendar`) and continue.
3. In your project dashboard, click the **Web icon (`</>`)** to register a web app.
4. Name the web app and copy your `firebaseConfig` object values.

### 2. Enable Google Sign-In
1. In the Firebase Console left menu, navigate to **Build → Authentication**.
2. Click **Get Started**, choose **Google** under Sign-in providers, and enable it.
3. Select your support email and click **Save**.

### 3. Add Authorized Domains
1. In **Authentication → Settings → Authorized domains**, ensure the following domains are listed:
   - `localhost`
   - `<your-project-id>.firebaseapp.com`
   - Your production domain (e.g. `<username>.github.io` or `<sitename>.netlify.app`).

### 4. Configure Environment Variables (`.env`)
Create a `.env` file in the project root (see `.env.example`):
```env
VITE_FIREBASE_API_KEY=your-api-key-from-console
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Allowed college domain (single configuration setting)
VITE_ALLOWED_DOMAIN=bitsathy.ac.in

# Comma-separated list of college emails authorized to publish GP leaves
VITE_ADMIN_EMAILS=admin@bitsathy.ac.in,principal@bitsathy.ac.in,studentcouncil@bitsathy.ac.in
```

### 5. Deploy Cloud Firestore Security Rules
1. In Firebase Console, go to **Build → Firestore Database** and click **Create Database**.
2. Deploy the rules from the project's [`firestore.rules`](file:///c:/Users/loginn/OneDrive/Documents/GP%20Callender/firestore.rules) file:
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or copy the rules directly into the **Rules** tab in the Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Authenticated @bitsathy.ac.in verified accounts can read
       match /{document=**} {
         allow read: if request.auth != null 
                     && request.auth.token.email.matches('.*@bitsathy\\.ac\\.in$') 
                     && request.auth.token.email_verified == true;
       }

       // Only college administrators can add or edit GP leaves
       match /gps/{gpId} {
         allow write: if request.auth != null 
                      && request.auth.token.email_verified == true
                      && request.auth.token.email in [
                        'admin@bitsathy.ac.in',
                        'studentcouncil@bitsathy.ac.in',
                        'principal@bitsathy.ac.in',
                        'convenor@bitsathy.ac.in'
                      ];
       }
     }
   }
   ```

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
  - ◪ **Diagonal Split + "AN" Badge:** Afternoon half-day (leave begins after 1:00 PM)
- **Bottom Sheet Details:** Tap any day to inspect the full weekday, leave range, mess closure timings, and Confirmed vs Tentative status.
- **Top Summary:** *"This month: 1 GP, 2 holidays"* (or *"GP not announced yet"*).
- **Year View:** 12-month annual overview for any year (2026 to 2030).
- **Upcoming Timeline:** Countdown badge (*"In 5 days"*, *"Tomorrow"*, *"Active Now"*).
- **📝 1-Tap Leave Portal Integration:**
  - Configured globally via `LEAVE_PORTAL_URL` (`https://ps.bitsathy.ac.in/activity/my-leaves`) in `src/config.js`.
  - **Sticky "Apply for Leave" Button:** Docked at the bottom of the home screen with a minimum 48px tap target and explanatory note.
  - **Under "Next leave: ...":** Direct "Apply now" button.
  - **7-Day Urgent Reminder Banner:** Appears when the next GP leave begins within 7 days.
  - **Date Bottom Sheet:** "Apply for this GP" button plus a 1-tap **"Copy dates"** button (copies range e.g. `25 Jun 2026 (AN) to 29 Jun 2026` to clipboard for the portal form).
  - **Upcoming Cards:** Quick "Apply" pill on every GP card.
  - **Navigation Dock & Profile Menu:** Dedicated "Leave Portal" link item.
  - Safe external links (`target="_blank" rel="noopener noreferrer"`) ensuring portal login functions natively outside iframes.
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
All baseline leave data is stored in [`data/leaves.json`](file:///c:/Users/loginn/OneDrive/Documents/GP%20Callender/data/leaves.json):
```json
{
  "type": "GP",
  "start": "2027-08-20",
  "startAN": true,
  "end": "2027-08-24",
  "status": "Confirmed",
  "festival": {
    "name": "Milad un Nabi",
    "date": "2027-08-23"
  },
  "messClosure": {
    "from": "2027-08-20 Dinner",
    "to": "2027-08-24 Lunch"
  }
}
```

---

## 🌐 Free Deployment Guide

### Option 1: Firebase Hosting (Recommended)
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project, set public directory to "dist", configure as single-page app
firebase deploy
```

### Option 2: Netlify (Free & Fastest)
1. Run `npm run build` locally.
2. Drag and drop the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).
3. In Netlify Site Settings, add your environment variables from `.env`.
4. Add your Netlify URL into **Firebase Console → Authentication → Settings → Authorized domains**.

### Option 3: GitHub Pages
1. Push your repository to GitHub.
2. Set up GitHub Actions or deploy the `dist/` folder to the `gh-pages` branch.
3. Add `<username>.github.io` to Firebase Authorized Domains.
#   G P - C a l l e n d e r  
 