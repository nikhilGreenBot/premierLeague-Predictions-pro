# 🏆 PL Predictions Pro — by Parth

A web app for tracking Premier League score predictions between friends. Built to replace a manual Google Sheets workflow with a live interface friends can actually use.

**[▶ Open the App](https://nikhilgreenbot.github.io/premierLeague-Predictions-pro-by-Parth/)**

---

## What it does

Each player predicts the scoreline for every Premier League match before kickoff. Points are awarded based on accuracy:

| Result | Points |
|--------|--------|
| ⭐ Exact scoreline | 3 pts |
| ✓ Correct outcome (W/D/L) | 1 pt |
| ✗ Wrong result | 0 pts |

---

## 2025/26 Final Standings

| Rank | Player | Points |
|------|--------|--------|
| 🥇 1st | Akash | 247 |
| 🥈 2nd | Parth | 236 |
| 🥉 3rd | Dadhichi | 202 |

**Season highlights:** Arsenal won the title · Haaland top scorer · 931 goals across 380 matches

---

## Features

- **Leaderboard** — 2025/26 standings with points, exact score count, and GW38 breakdown
- **Results** — GW38 scorelines with team badges
- **Predictions** — per-player GW38 table, result vs predicted score
- **History** — SVG points progression across the season
- **Scoring** — visual explanation of the points system
- **Charts** — bar charts, GW38 donut, **streaks and nearest-miss**
- **2026/27 Live** — predict GW1–GW5, kickoff locks, share codes, recaps, optional live scores

---

## Play 2026/27 tonight

The season opens **Friday 21 August 2026, 20:00 UK** (Arsenal vs Coventry). Friends do not need a spreadsheet.

1. Open the **2026/27** tab
2. Tap your name (or **Add friend**)
3. Enter GW1 scorelines — they **lock automatically at kickoff**
4. Tap **Copy league code** and paste it in the group chat
5. Everyone else taps **Import code** so the board is shared

Optional: set a PIN in Settings so nobody edits your picks. Paste a [football-data.org](https://www.football-data.org/) token in Settings to pull live scores. Paste Firebase config if you want realtime sync instead of share codes.

---

## Roadmap for 2026/27

- [x] Connect to [football-data.org API](https://www.football-data.org/) for live fixtures and results — paste a free token in **2026/27 → Settings**. Bundled GW1–GW5 fixtures work with no token.
- [x] Firebase Firestore for real-time predictions and live scoring — optional. Paste your Firebase web config in Settings (see below). Share codes work without it.
- [x] In-app prediction form so players never touch the sheet — optional Google Form embed in Settings if you still want one.
- [x] Automatic prediction lock at kickoff — client-side lock on every device. Optional PIN. Testing override lives in Settings.
- [x] Weekly GW recap — copy or email (`mailto`) a generated recap. Cloud email sending needs a later mail provider.
- [x] Streak tracking and nearest-miss stat — Charts tab (2025/26 GW38) and the 2026/27 live board.

---

## Tech stack

- Vanilla HTML / CSS / JavaScript — zero build step, no framework
- Hosted on **GitHub Pages** (static, free)
- Data layer mirrors **Firebase Firestore** — drop in a config when you want realtime
- Team badges via public CDN with emoji fallback
- Background: Arsenal GW38 trophy celebration photo (May 24, 2026)
- Fonts: Bebas Neue + Barlow Condensed (Google Fonts)

---

## Local / GitHub Pages

Open `index.html` or the Pages URL. No install.

```bash
python3 -m http.server 8080
# then http://localhost:8080
```

Scoring tests:

```bash
node tests/scoring.test.js
```

Optional private config: copy `config.example.js` to `config.js` and add `<script src="config.js"></script>` before `bg.js` in `index.html`. `config.js` is gitignored so tokens stay off GitHub.

### Firebase (optional, ~5 minutes)

1. Create a Firebase project → Firestore in test mode for the friend group
2. Add a web app and copy the config object into **2026/27 → Settings**
3. Use one **League ID** for everyone (default `PARTH`)
4. Suggested rules for a private friend league (lock down later):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plpp/{leagueId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Credits

Original prediction game concept and data by **Parth** — this app was built to give his Google Sheet the UI it deserved.

Deployed on [GitHub Pages](https://pages.github.com)
