# My Attendance & Salary

A lightweight, modern, mobile-first personal web application (PWA) built for a single user to automatically track daily attendance, calculate overtime (OT), and generate itemized salary summaries.

---

## 🌟 Key Features

1. **Daily Zero-Friction Automation**:
   - Automatically detects device local date in real time.
   - Weekdays and Saturdays are automatically marked **Present (P)**.
   - Sundays are automatically marked **Weekly Off (WO)**.
   - Future dates are strictly **Upcoming** and never automatically marked or counted in statistics.
2. **1-Tap Manual Override**:
   - Open app -> 1-tap to mark **Absent (A)**, **Leave (L)**, or **Weekly Off (WO)**.
   - Includes instant Undo toast if changed by mistake.
   - Manual edits are never automatically overwritten.
3. **Overtime (OT) System**:
   - Manual OT hours input (supports decimals: 1, 1.5, 2, 2.5, 3, 4, 8h).
   - Rate: **₹130 / hour** (editable in settings).
   - Real-time earnings calculation: `OT Hours × ₹130`.
4. **Salary Cycle & Sunday Rules**:
   - **Salary Cycle**: 23rd of previous month → 22nd of next month (e.g. 23 Aug → 22 Sep).
   - Fully supports 28/29-day February, 30/31-day months, and leap years.
   - **Sunday Rule**: Sunday ₹500 is already included inside the ₹18,000 monthly basic salary. Working on Sunday adds **only OT earnings** (`Hours × ₹130`) without duplicate basic pay.
5. **Itemized Salary Summary & Slip**:
   - Clear breakdown: Present Days, Weekly Offs, Absent Days, Leave Days, Total OT Hours, OT Earnings, Basic Salary, Absent Deductions, and Net Estimated Salary.
   - Cycle switcher covering 2025 to 2030 dynamically.
   - **Export to CSV** for spreadsheet records.
6. **100% Private Offline Storage**:
   - Override-based data model in `localStorage` keeping storage size under a few kilobytes.
   - **JSON Backup Export & Import** for quick phone migration or data restoration.
7. **PWA Mobile-First Experience**:
   - Web App Manifest & Service Worker for offline support and "Add to Home Screen" on Android/iOS.

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser (or phone on the same Wi-Fi)
http://localhost:3000/
```

---

## 🌐 Free Static Hosting Deployment

The application is a 100% client-side static app requiring **no paid backend or database server**.

### Option A: GitHub Pages (Free)
1. Push this repository to GitHub.
2. Go to **Repository Settings** > **Pages**.
3. Under **Build and deployment**, select **GitHub Actions** with the Vite/Static template, or build `npm run build` and publish the `dist` folder to the `gh-pages` branch.

### Option B: Cloudflare Pages (Free)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Connect your GitHub repository.
3. Set build command: `npm run build` and output directory: `dist`.

### Option C: Vercel (Free)
1. Import the repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Output Directory: `dist`. Click **Deploy**.

---

## 📱 How to Install on Your Phone (PWA)

1. Open the deployed website link in Chrome / Safari on your mobile phone.
2. Tap the browser menu (three dots in Chrome or Share button in Safari).
3. Select **"Add to Home Screen"** or **"Install App"**.
4. The app will now appear on your phone home screen with full offline access.
