// PL PREDICTIONS PRO — DATA (fully synchronous)

const PLAYERS = [
  { id: 'parth',    name: 'Parth',    handle: 'THE GAFFER' },
  { id: 'akash',    name: 'Akash',    handle: 'TACTICAL GENIUS' },
  { id: 'dadhichi', name: 'Dadhichi', handle: 'DARK HORSE' },
];

// Real team logos via API-Sports CDN (public, no auth needed in browser)
// Fallback chain: logo img → emoji → abbr letters
const TEAM_LOGOS = {
  'Brighton':       'https://media.api-sports.io/football/teams/51.png',
  'Man Utd':        'https://media.api-sports.io/football/teams/33.png',
  'Burnley':        'https://media.api-sports.io/football/teams/44.png',
  'Wolves':         'https://media.api-sports.io/football/teams/39.png',
  'Crystal Palace': 'https://media.api-sports.io/football/teams/52.png',
  'Arsenal':        'https://media.api-sports.io/football/teams/42.png',
  'Fulham':         'https://media.api-sports.io/football/teams/36.png',
  'Newcastle':      'https://media.api-sports.io/football/teams/34.png',
  'Liverpool':      'https://media.api-sports.io/football/teams/40.png',
  'Brentford':      'https://media.api-sports.io/football/teams/55.png',
  'Man City':       'https://media.api-sports.io/football/teams/50.png',
  'Aston Villa':    'https://media.api-sports.io/football/teams/66.png',
  "Nott'm Forest":  'https://media.api-sports.io/football/teams/65.png',
  'Bournemouth':    'https://media.api-sports.io/football/teams/35.png',
  'Sunderland':     'https://media.api-sports.io/football/teams/746.png',
  'Chelsea':        'https://media.api-sports.io/football/teams/49.png',
  'Spurs':          'https://media.api-sports.io/football/teams/47.png',
  'Everton':        'https://media.api-sports.io/football/teams/45.png',
  'West Ham':       'https://media.api-sports.io/football/teams/48.png',
  'Leeds':          'https://media.api-sports.io/football/teams/63.png',
  'Coventry':       'https://media.api-sports.io/football/teams/70.png',
  'Hull':           'https://media.api-sports.io/football/teams/64.png',
  'Ipswich':        'https://media.api-sports.io/football/teams/57.png',
};

// Emoji fallbacks (used if logo image fails)
const TEAM_EMOJI = {
  'Brighton':'🦚','Man Utd':'👹','Burnley':'🔥','Wolves':'🐺',
  'Crystal Palace':'🦅','Arsenal':'🔴','Fulham':'⚪','Newcastle':'⚫',
  'Liverpool':'🔴','Brentford':'🐝','Man City':'🔵','Aston Villa':'🦁',
  "Nott'm Forest":'🌳','Bournemouth':'🍒','Sunderland':'⚫','Chelsea':'💙',
  'Spurs':'🐓','Everton':'💙','West Ham':'⚒️','Leeds':'⚪',
  'Coventry':'🟡','Hull':'🐯','Ipswich':'🔵',
};

const TEAM_COLORS = {
  'Brighton':'#0057B8','Man Utd':'#DA291C','Burnley':'#6C1D45',
  'Wolves':'#FDB913','Crystal Palace':'#1B458F','Arsenal':'#EF0107',
  'Fulham':'#888','Newcastle':'#241F20','Liverpool':'#C8102E',
  'Brentford':'#E30613','Man City':'#6CABDD','Aston Villa':'#95BFE5',
  "Nott'm Forest":'#DD0000','Bournemouth':'#DA291C','Sunderland':'#EB172B',
  'Chelsea':'#034694','Spurs':'#132257','Everton':'#003399',
  'West Ham':'#7A263A','Leeds':'#FFCD00',
  'Coventry':'#77BBFF','Hull':'#F5A12D','Ipswich':'#003399',
};

const GW38_MATCHES = [
  { id:371, home:'Brighton',       away:'Man Utd',     actualHome:0, actualAway:3 },
  { id:372, home:'Burnley',        away:'Wolves',      actualHome:1, actualAway:1 },
  { id:373, home:'Crystal Palace', away:'Arsenal',     actualHome:1, actualAway:2 },
  { id:374, home:'Fulham',         away:'Newcastle',   actualHome:2, actualAway:0 },
  { id:375, home:'Liverpool',      away:'Brentford',   actualHome:1, actualAway:1 },
  { id:376, home:'Man City',       away:'Aston Villa', actualHome:1, actualAway:2 },
  { id:377, home:"Nott'm Forest",  away:'Bournemouth', actualHome:1, actualAway:1 },
  { id:378, home:'Sunderland',     away:'Chelsea',     actualHome:2, actualAway:1 },
  { id:379, home:'Spurs',          away:'Everton',     actualHome:2, actualAway:1 },
  { id:380, home:'West Ham',       away:'Leeds',       actualHome:2, actualAway:1 },
];

const PREDICTIONS = {
  parth:    { 371:{home:2,away:2},372:{home:3,away:1},373:{home:1,away:2},374:{home:2,away:1},375:{home:2,away:1},376:{home:3,away:2},377:{home:1,away:2},378:{home:2,away:2},379:{home:1,away:2},380:{home:2,away:1} },
  akash:    { 371:{home:2,away:2},372:{home:2,away:1},373:{home:1,away:2},374:{home:1,away:2},375:{home:3,away:1},376:{home:3,away:1},377:{home:1,away:1},378:{home:1,away:2},379:{home:2,away:1},380:{home:2,away:1} },
  dadhichi: {},
};

// ── REAL SEASON TOTALS from Google Sheet (Points_Total column) ──
// Akash: 247, Parth: 236, Dadhichi: 202
// GW38 points from sheet: Parth=5, Akash=8, Dadhichi=0
const SEASON_TOTALS = {
  akash:    { totalPts: 247, gw38Pts: 8,  totalExact: 14 },
  parth:    { totalPts: 236, gw38Pts: 5,  totalExact: 11 },
  dadhichi: { totalPts: 202, gw38Pts: 0,  totalExact: 8  },
};

function getResult(h, a) { return h>a?'H':a>h?'A':'D'; }

function scorePredict(pred, actual) {
  if (!pred) return { pts:0, status:'pending' };
  if (pred.home===actual.home && pred.away===actual.away) return { pts:3, status:'exact' };
  if (getResult(pred.home,pred.away)===getResult(actual.home,actual.away)) return { pts:1, status:'correct' };
  return { pts:0, status:'wrong' };
}

function getLeaderboard() {
  return PLAYERS
    .map(p => ({ ...p, ...SEASON_TOTALS[p.id] }))
    .sort((a,b) => b.totalPts - a.totalPts);
}

function nearestMiss(pred, actual) {
  if (!pred || actual == null || actual.home == null || actual.away == null) return null;
  const goalDiff = Math.abs(pred.home - actual.home) + Math.abs(pred.away - actual.away);
  const exact = goalDiff === 0;
  const resultOk = getResult(pred.home, pred.away) === getResult(actual.home, actual.away);
  return { goalDiff, exact, resultOk };
}

function gw38PlayerStats(playerId) {
  const preds = PREDICTIONS[playerId] || {};
  let pts = 0, exact = 0, correct = 0, wrong = 0, pending = 0;
  let bestMiss = null;
  let run = 0, bestRun = 0, exactRun = 0, bestExactRun = 0;
  const rows = GW38_MATCHES.map(m => {
    const pred = preds[m.id];
    const scored = scorePredict(pred, { home: m.actualHome, away: m.actualAway });
    pts += scored.pts;
    if (scored.status === 'exact') exact++;
    else if (scored.status === 'correct') correct++;
    else if (scored.status === 'wrong') wrong++;
    else pending++;
    if (scored.pts > 0) { run++; if (run > bestRun) bestRun = run; }
    else run = 0;
    if (scored.status === 'exact') { exactRun++; if (exactRun > bestExactRun) bestExactRun = exactRun; }
    else exactRun = 0;
    const miss = nearestMiss(pred, { home: m.actualHome, away: m.actualAway });
    if (miss && !miss.exact && (bestMiss == null || miss.goalDiff < bestMiss.goalDiff)) {
      bestMiss = { ...miss, match: m, pred };
    }
    return { match: m, pred, scored, miss };
  });
  return { pts, exact, correct, wrong, pending, bestRun, bestExactRun, bestMiss, rows };
}

function seasonFormStreak(playerId) {
  const recent = { parth:[4,8,6,12,5], akash:[5,9,7,13,8], dadhichi:[3,6,4,9,0] }[playerId] || [];
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i] > 0) streak++;
    else break;
  }
  return { recent, streak };
}

function liveLeaderboard(players, matches, predictions) {
  return players.map(p => {
    let totalPts = 0, totalExact = 0, played = 0;
    let run = 0, bestRun = 0, bestMiss = null;
    matches.forEach(m => {
      if (m.actualHome == null || m.actualAway == null) return;
      const pred = (predictions[p.id] || {})[m.id];
      const scored = scorePredict(pred, { home: m.actualHome, away: m.actualAway });
      if (!pred) return;
      played++;
      totalPts += scored.pts;
      if (scored.status === 'exact') totalExact++;
      if (scored.pts > 0) { run++; if (run > bestRun) bestRun = run; }
      else run = 0;
      const miss = nearestMiss(pred, { home: m.actualHome, away: m.actualAway });
      if (miss && !miss.exact && (bestMiss == null || miss.goalDiff < bestMiss.goalDiff)) {
        bestMiss = { ...miss, match: m, pred };
      }
    });
    return { ...p, totalPts, totalExact, played, bestRun, bestMiss };
  }).sort((a,b) => b.totalPts - a.totalPts || b.totalExact - a.totalExact);
}

function formatKickoff(iso, now = Date.now()) {
  const t = new Date(iso);
  const diff = t.getTime() - now;
  const when = t.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  }) + ' UK';
  if (diff <= 0) return { when, locked: true, label: 'LOCKED', ms: diff };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const label = d > 0 ? `Locks in ${d}d ${h}h` : h > 0 ? `Locks in ${h}h ${m}m` : `Locks in ${m}m`;
  return { when, locked: false, label, ms: diff };
}

function slugifyName(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'player';
}
