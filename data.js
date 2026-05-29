// ============================================================
// PL PREDICTIONS PRO — DATA LAYER
// Structured to mirror Firestore schema.
// Swap mockDB for firebase.firestore() when Firebase is ready.
// ============================================================

const PLAYERS = [
  { id: 'parth',    name: 'Parth',    handle: 'THE GAFFER' },
  { id: 'akash',    name: 'Akash',    handle: 'TACTICAL GENIUS' },
  { id: 'dadhichi', name: 'Dadhichi', handle: 'DARK HORSE' },
];

const TEAM_CRESTS = {
  'Brighton':        '🦚',
  'Man Utd':         '👹',
  'Burnley':         '🔥',
  'Wolves':          '🐺',
  'Crystal Palace':  '🦅',
  'Arsenal':         '🔴',
  'Fulham':          '⚪',
  'Newcastle':       '⚫',
  'Liverpool':       '🔴',
  'Brentford':       '🐝',
  'Man City':        '🔵',
  'Aston Villa':     '🦁',
  "Nott'm Forest":   '🌳',
  'Bournemouth':     '🍒',
  'Sunderland':      '⚫',
  'Chelsea':         '💙',
  'Spurs':           '🐓',
  'Everton':         '💙',
  'West Ham':        '⚒️',
  'Leeds':           '⚪',
};

// Real GW38 results — 2025/26 Premier League (May 24 2026)
const GW38_MATCHES = [
  { id: 371, home: 'Brighton',       away: 'Man Utd',      actualHome: 0, actualAway: 3 },
  { id: 372, home: 'Burnley',        away: 'Wolves',       actualHome: 1, actualAway: 1 },
  { id: 373, home: 'Crystal Palace', away: 'Arsenal',      actualHome: 1, actualAway: 2 },
  { id: 374, home: 'Fulham',         away: 'Newcastle',    actualHome: 2, actualAway: 0 },
  { id: 375, home: 'Liverpool',      away: 'Brentford',    actualHome: 1, actualAway: 1 },
  { id: 376, home: 'Man City',       away: 'Aston Villa',  actualHome: 1, actualAway: 2 },
  { id: 377, home: "Nott'm Forest",  away: 'Bournemouth',  actualHome: 1, actualAway: 1 },
  { id: 378, home: 'Sunderland',     away: 'Chelsea',      actualHome: 2, actualAway: 1 },
  { id: 379, home: 'Spurs',          away: 'Everton',      actualHome: 2, actualAway: 1 },
  { id: 380, home: 'West Ham',       away: 'Leeds',        actualHome: 2, actualAway: 1 },
];

// Predictions seeded from Google Sheet
// Dadhichi had no GW38 entries — shown as pending
const PREDICTIONS = {
  parth: {
    371: { home: 2, away: 2 },
    372: { home: 3, away: 1 },
    373: { home: 1, away: 2 },
    374: { home: 2, away: 1 },
    375: { home: 2, away: 1 },
    376: { home: 3, away: 2 },
    377: { home: 1, away: 2 },
    378: { home: 2, away: 2 },
    379: { home: 1, away: 2 },
    380: { home: 2, away: 1 },
  },
  akash: {
    371: { home: 2, away: 2 },
    372: { home: 2, away: 1 },
    373: { home: 1, away: 2 },
    374: { home: 1, away: 2 },
    375: { home: 3, away: 1 },
    376: { home: 3, away: 1 },
    377: { home: 1, away: 1 },
    378: { home: 1, away: 2 },
    379: { home: 2, away: 1 },
    380: { home: 2, away: 1 },
  },
  dadhichi: {
    // GW38 not submitted — shown as pending
  },
};

// Season totals (from the full season in the sheet — mock data for other GWs)
// These represent realistic cumulative totals for the 37 completed GWs
// GW38 scores will be calculated and added on top
const SEASON_BASE_SCORES = {
  parth:    { pts: 52, exact: 8 },
  akash:    { pts: 47, exact: 6 },
  dadhichi: { pts: 39, exact: 4 },
};

// ── SCORING ENGINE ──
function getResult(home, away) {
  if (home > away) return 'H';
  if (away > home) return 'A';
  return 'D';
}

function scorePredict(pred, actual) {
  if (!pred) return { pts: 0, status: 'pending' };
  if (pred.home === actual.home && pred.away === actual.away) {
    return { pts: 3, status: 'exact' };
  }
  if (getResult(pred.home, pred.away) === getResult(actual.home, actual.away)) {
    return { pts: 1, status: 'correct' };
  }
  return { pts: 0, status: 'wrong' };
}

function calcGW38Scores() {
  const scores = {};
  for (const player of PLAYERS) {
    let pts = 0, exact = 0;
    for (const match of GW38_MATCHES) {
      const pred = PREDICTIONS[player.id]?.[match.id];
      const actual = { home: match.actualHome, away: match.actualAway };
      const result = scorePredict(pred, actual);
      pts += result.pts;
      if (result.status === 'exact') exact++;
    }
    scores[player.id] = { pts, exact };
  }
  return scores;
}

function getFinalLeaderboard() {
  const gw38 = calcGW38Scores();
  return PLAYERS.map(p => ({
    ...p,
    totalPts:   SEASON_BASE_SCORES[p.id].pts + gw38[p.id].pts,
    totalExact: SEASON_BASE_SCORES[p.id].exact + gw38[p.id].exact,
    gw38Pts:    gw38[p.id].pts,
    gw38Exact:  gw38[p.id].exact,
  })).sort((a, b) => b.totalPts - a.totalPts);
}

// ── FIREBASE STUB ──
// Replace this entire block with real Firestore calls when Firebase is ready.
// The shape of data returned is identical.
const mockDB = {
  async getLeaderboard()  { return getFinalLeaderboard(); },
  async getMatches(gw)    { return gw === 38 ? GW38_MATCHES : []; },
  async getPredictions(gw){ return PREDICTIONS; },
};

// TODO: swap mockDB → firebaseDB when config is ready
// const firebaseDB = { ... };
const db = mockDB;
