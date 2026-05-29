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
  'Sunderland':     'https://media.api-sports.io/football/teams/45.png',
  'Chelsea':        'https://media.api-sports.io/football/teams/49.png',
  'Spurs':          'https://media.api-sports.io/football/teams/47.png',
  'Everton':        'https://media.api-sports.io/football/teams/45.png',
  'West Ham':       'https://media.api-sports.io/football/teams/48.png',
  'Leeds':          'https://media.api-sports.io/football/teams/63.png',
};

// Emoji fallbacks (used if logo image fails)
const TEAM_EMOJI = {
  'Brighton':'🦚','Man Utd':'👹','Burnley':'🔥','Wolves':'🐺',
  'Crystal Palace':'🦅','Arsenal':'🔴','Fulham':'⚪','Newcastle':'⚫',
  'Liverpool':'🔴','Brentford':'🐝','Man City':'🔵','Aston Villa':'🦁',
  "Nott'm Forest":'🌳','Bournemouth':'🍒','Sunderland':'⚫','Chelsea':'💙',
  'Spurs':'🐓','Everton':'💙','West Ham':'⚒️','Leeds':'⚪',
};

const TEAM_COLORS = {
  'Brighton':'#0057B8','Man Utd':'#DA291C','Burnley':'#6C1D45',
  'Wolves':'#FDB913','Crystal Palace':'#1B458F','Arsenal':'#EF0107',
  'Fulham':'#888','Newcastle':'#241F20','Liverpool':'#C8102E',
  'Brentford':'#E30613','Man City':'#6CABDD','Aston Villa':'#95BFE5',
  "Nott'm Forest":'#DD0000','Bournemouth':'#DA291C','Sunderland':'#EB172B',
  'Chelsea':'#034694','Spurs':'#132257','Everton':'#003399',
  'West Ham':'#7A263A','Leeds':'#FFCD00',
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
