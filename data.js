// PL PREDICTIONS PRO — DATA (fully synchronous)

const PLAYERS = [
  { id: 'parth',    name: 'Parth',    handle: 'THE GAFFER' },
  { id: 'akash',    name: 'Akash',    handle: 'TACTICAL GENIUS' },
  { id: 'dadhichi', name: 'Dadhichi', handle: 'DARK HORSE' },
];

const TEAM_CRESTS = {
  'Brighton':       'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_FC.svg/150px-Brighton_%26_Hove_Albion_FC.svg.png',
  'Man Utd':        'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/150px-Manchester_United_FC_crest.svg.png',
  'Burnley':        'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/BurnleyFC.svg/150px-BurnleyFC.svg.png',
  'Wolves':         'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/150px-Wolverhampton_Wanderers.svg.png',
  'Crystal Palace': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/150px-Crystal_Palace_FC_logo_%282022%29.svg.png',
  'Arsenal':        'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/150px-Arsenal_FC.svg.png',
  'Fulham':         'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/150px-Fulham_FC_%28shield%29.svg.png',
  'Newcastle':      'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/150px-Newcastle_United_Logo.svg.png',
  'Liverpool':      'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/150px-Liverpool_FC.svg.png',
  'Brentford':      'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/150px-Brentford_FC_crest.svg.png',
  'Man City':       'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/150px-Manchester_City_FC_badge.svg.png',
  'Aston Villa':    'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Aston_Villa_FC_crest_%282016%29.svg/150px-Aston_Villa_FC_crest_%282016%29.svg.png',
  "Nott'm Forest":  'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/150px-Nottingham_Forest_F.C._logo.svg.png',
  'Bournemouth':    'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/150px-AFC_Bournemouth_%282013%29.svg.png',
  'Sunderland':     'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Logo_Sunderland.svg/150px-Logo_Sunderland.svg.png',
  'Chelsea':        'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/150px-Chelsea_FC.svg.png',
  'Spurs':          'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/150px-Tottenham_Hotspur.svg.png',
  'Everton':        'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/150px-Everton_FC_logo.svg.png',
  'West Ham':       'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/150px-West_Ham_United_FC_logo.svg.png',
  'Leeds':          'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Leeds_United_F.C._logo.svg/150px-Leeds_United_F.C._logo.svg.png',
};

const TEAM_COLORS = {
  'Brighton':'#0057B8','Man Utd':'#DA291C','Burnley':'#6C1D45',
  'Wolves':'#FDB913','Crystal Palace':'#1B458F','Arsenal':'#EF0107',
  'Fulham':'#999','Newcastle':'#241F20','Liverpool':'#C8102E',
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

const SEASON_BASE = {
  parth:    { pts:52, exact:8 },
  akash:    { pts:47, exact:6 },
  dadhichi: { pts:39, exact:4 },
};

function getResult(h,a){ return h>a?'H':a>h?'A':'D'; }

function scorePredict(pred, actual) {
  if (!pred) return { pts:0, status:'pending' };
  if (pred.home===actual.home && pred.away===actual.away) return { pts:3, status:'exact' };
  if (getResult(pred.home,pred.away)===getResult(actual.home,actual.away)) return { pts:1, status:'correct' };
  return { pts:0, status:'wrong' };
}

// Fully SYNCHRONOUS — no async/await needed
function getLeaderboard() {
  const gw38 = {};
  for (const p of PLAYERS) {
    let pts=0, exact=0;
    for (const m of GW38_MATCHES) {
      const r = scorePredict(PREDICTIONS[p.id]?.[m.id], {home:m.actualHome,away:m.actualAway});
      pts += r.pts;
      if (r.status==='exact') exact++;
    }
    gw38[p.id] = { pts, exact };
  }
  return PLAYERS.map(p => ({
    ...p,
    totalPts:   SEASON_BASE[p.id].pts + gw38[p.id].pts,
    totalExact: SEASON_BASE[p.id].exact + gw38[p.id].exact,
    gw38Pts:    gw38[p.id].pts,
  })).sort((a,b) => b.totalPts - a.totalPts);
}
