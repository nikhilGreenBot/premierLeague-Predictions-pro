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

- **Two seasons** — top bar is only **2025–26** and **2026–27**. Leaderboard, Results, Predictions, History, Scoring, and Charts sit under each year.
- **Leaderboard** — 2025/26 final standings, plus a live 2026/27 table
- **Results** — GW38 archive, and the full 2026/27 fixture list
- **Predictions** — GW38 vs actual, and in-app 2026/27 score entry with kickoff locks
- **History** — SVG points progression for both seasons
- **Scoring** — visual explanation of the points system
- **Charts** — bar charts, streaks, and nearest-miss

---

## Play 2026/27 tonight

The season opens **Friday 21 August 2026, 20:00 UK** (Arsenal vs Coventry). Friends do not need a spreadsheet.

1. Open the app — the top bar is **2025–26** (archive) or **2026–27** (live)
2. On **2026–27**, tap **Predictions**, then your name (or **Add friend**)
3. Use the gameweek chips to browse all **38 weeks / 380 matches**
4. Enter scorelines — they **lock automatically at kickoff**
5. Tap **Copy league code** and paste it in the group chat
6. Everyone else taps **Import code** so the board is shared

**2025–26** keeps the finished-season Leaderboard, Results, Predictions, History, Scoring, and Charts. **2026–27** has the same pages for the live campaign.

Optional: set a PIN in Settings so nobody edits your picks. Live scores sync automatically from ESPN (no token). Paste Firebase config if you want realtime sync instead of share codes.

---

## Roadmap for 2026/27

- [x] Live FT / in-play scores from the ESPN Premier League scoreboard (works on GitHub Pages). All 38 gameweeks are bundled with no token. football-data.org is optional on localhost only.
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

Tests:

```bash
node tests/scoring.test.js
node tests/fixtures.test.js
node tests/firebase-config.test.js
node tests/api.test.js
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
