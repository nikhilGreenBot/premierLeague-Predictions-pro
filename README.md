# 🏆 PL Predictions Pro — by Parth

A web app for tracking Premier League score predictions between friends. Built to replace a manual Google Sheets workflow with a proper, live, beautiful interface.

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

- **Leaderboard** — season standings with points, exact score count, and GW38 breakdown
- **Results** — all GW38 scorelines with real Premier League team badges
- **Predictions** — per-player prediction table with result vs predicted score
- **History** — SVG points progression chart across the full season
- **Scoring** — visual explanation of the points system
- **Charts** — bar charts and breakdown donut for season stats
- **2026/27 tab** — placeholder for next season (coming August 2026)

---

## Tech stack

- Vanilla HTML / CSS / JavaScript — zero dependencies, no framework
- Hosted on **GitHub Pages** (static, free)
- Data layer structured to mirror **Firebase Firestore** — drop-in ready when Firebase is configured
- Team badges via public CDN with emoji fallback
- Background: Arsenal GW38 trophy celebration photo (May 24, 2026)
- Fonts: Bebas Neue + Barlow Condensed (Google Fonts)

---

## Roadmap for 2026/27

- [ ] Connect to [football-data.org API](https://www.football-data.org/) for live fixtures and results
- [ ] Firebase Firestore for real-time predictions and live scoring
- [ ] Google Form submission so players predict without touching the sheet
- [ ] Automatic prediction lock at kickoff time (via Cloud Functions)
- [ ] Weekly GW recap email to all players
- [ ] Streak tracking and nearest-miss stat

---

## Credits

Original prediction game concept and data by **Parth** — this app was built to give his Google Sheet the UI it deserved.

Built with [Claude](https://claude.ai) · Deployed on [GitHub Pages](https://pages.github.com)
