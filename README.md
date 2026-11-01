# 📅 BIT Holiday Calendar (2026–2027)

A fast, modern, mobile-first Progressive Web App (PWA) built for students of **Bannari Amman Institute of Technology (BIT)**. It replaces PDF circulars with a phone-native calendar experience featuring GP leaves, public holidays, mess closures, half-day AN indicators, and 1-tap `.ics` calendar sync.

---

## ✨ Features

- **📱 Mobile-First Native Experience:** Designed specifically for 360–420px mobile screens (iPhone / Android) with iOS/Google Calendar aesthetics, smooth bottom sheets, and touch swipe gestures.
- **🗓️ 7-Column Month Grid:** Smooth swipe navigation between months (June 2026 – May 2027), quick month jumper dialog, and a 1-tap **"Today"** button.
- **🎨 Color-Coded Schedule & Legend:**
  - 🔴 **Red:** Public Holiday (single day)
  - 🔵 **Blue:** GP (General Permission) Leave period
  - 🟠 **Orange:** Festival day during a GP period (with festival badge)
  - ⚪ **Striped:** Hostel Mess Closure
  - ◪ **Diagonal Split + "AN" Badge:** Marks afternoon half-days (leave begins after 1:00 PM).
- **📋 Bottom Sheet Modal:** Tap any date to view the full date, leave duration, festival details, and mess closure timings, with quick "Add to Calendar" and "Share" buttons.
- **⏳ Hero & Upcoming View:**
  - **"Next Leave"** countdown card right on the home screen.
  - Switch to **Upcoming List** with "X days left" countdown badges.
- **🔍 Search & Filter Chips:** Real-time filtering by *All*, *Holidays*, *GP Leave*, and *Mess Closed*, plus instant keyword search.
- **🌓 Dark Mode:** Automatically syncs with your phone's dark/light mode preference, with a manual Sun/Moon toggle.
- **📥 Sync to Phone Calendar (.ics):** Export all events (or individual events) directly as an `.ics` file compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **🔔 Reminders:** Built-in Web Notification reminder to alert you before an upcoming GP leave or holiday.
- **⚡ 100% Offline PWA:** Installable to your phone's home screen via `manifest.json` and `sw.js`.

---

## 🚀 How to Run Locally

Because this project uses vanilla HTML, CSS, and JavaScript with **zero build step**, you can run it immediately with any local server:

### Option A: Using Python (Recommended)
Open a terminal in the project folder and run:
```bash
python -m http.server 8080
```
Then open your browser at **`http://localhost:8080`**.

### Option B: Using Node.js
If you have Node.js installed, run:
```bash
npx serve .
# or
npx http-server -p 8080
```

### Option C: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Right-click on `index.html` and click **"Open with Live Server"**.

---

## 🛠️ How to Update `data.js` for Next Academic Year

All calendar data is isolated inside `data.js`. You do not need to touch any code in `app.js` or `index.html`.

### 1. Update the configuration block at the top of `data.js`:
```javascript
const BIT_CALENDAR_CONFIG = {
  collegeName: "Bannari Amman Institute of Technology",
  collegeShort: "BIT",
  academicYear: "2027–2028", // Update year label
  startMonth: "2027-06",     // Academic year starts June
  endMonth: "2028-05",       // Academic year ends May
  defaultViewDate: "2027-06-01"
};
```

### 2. Add or update events in `BIT_CALENDAR_EVENTS`:

#### A. Single Public Holiday:
```javascript
{
  "type": "HOLIDAY",
  "name": "Independence Day",
  "date": "2027-08-15"
}
```

#### B. GP Leave (Regular):
```javascript
{
  "type": "GP",
  "start": "2027-07-23",
  "startAN": true,           // true if leave starts in afternoon
  "end": "2027-07-27"
}
```

#### C. GP Leave with Festival:
```javascript
{
  "type": "GP",
  "start": "2027-08-28",
  "startAN": true,
  "end": "2027-09-01",
  "festival": {
    "name": "Milad un Nabi",
    "date": "2027-08-31"     // specific festival day gets orange highlight
  }
}
```

#### D. GP Leave with Mess Closure:
```javascript
{
  "type": "GP",
  "start": "2027-11-12",
  "startAN": true,
  "end": "2027-11-16",
  "festival": {
    "name": "Diwali",
    "date": "2027-11-14"
  },
  "messClosure": {
    "from": "2027-11-12 Dinner",
    "to": "2027-11-16 Lunch"
  }
}
```

---

## 🌐 Free Deployment Guide

You can deploy this app online for free in under 2 minutes so your classmates can access and install it on their phones:

### Option 1: GitHub Pages (100% Free & Recommended)
1. Create a free repository on [GitHub](https://github.com) named `bit-calendar`.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial BIT Calendar release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bit-calendar.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select Branch: `main` / `/ (root)`, then click **Save**.
4. In about 1 minute, your site will be live at:
   `https://<your-username>.github.io/bit-calendar/`

### Option 2: Netlify (Drag and Drop in 30 Seconds)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Sign in or sign up with GitHub / Email.
3. Drag the entire project folder (`GP Callender`) and drop it into the Netlify browser window.
4. Netlify will instantly generate a live HTTPS URL (e.g., `https://bit-holiday-calendar.netlify.app`).
5. (Optional) In Netlify Site Settings, you can customize the domain name for free!

---

## 📱 How Students Install It on Their Phones

- **Android (Chrome):** Open the website, tap the `⋮` menu (or wait for the bottom prompt), and tap **"Install app"** or **"Add to Home screen"**.
- **iPhone (Safari):** Open the website in Safari, tap the **Share** button (`⎋`), and select **"Add to Home Screen"** (`⊕`).

The app will appear with its official BIT icon on the home screen and work fully offline!

