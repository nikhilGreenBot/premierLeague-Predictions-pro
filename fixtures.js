// 2026/27 Premier League fixtures (GW1–GW5)
// Kickoffs stored as UTC ISO. Displayed in Europe/London.
// Source: premierleague.com fixture release. Live scores overlay from football-data.org when a token is set.

const SEASON_26 = {
  id: '2026-27',
  label: '2026/27',
  kickoff: '2026-08-21T19:00:00.000Z',
};

const TEAM_ALIASES = {
  'arsenal': 'Arsenal', 'arsenal fc': 'Arsenal',
  'coventry': 'Coventry', 'coventry city': 'Coventry', 'coventry city fc': 'Coventry',
  'hull': 'Hull', 'hull city': 'Hull', 'hull city afc': 'Hull',
  'man utd': 'Man Utd', 'manchester united': 'Man Utd', 'manchester united fc': 'Man Utd', 'man united': 'Man Utd',
  'everton': 'Everton', 'everton fc': 'Everton',
  'crystal palace': 'Crystal Palace', 'crystal palace fc': 'Crystal Palace', 'palace': 'Crystal Palace',
  'ipswich': 'Ipswich', 'ipswich town': 'Ipswich', 'ipswich town fc': 'Ipswich',
  'sunderland': 'Sunderland', 'sunderland afc': 'Sunderland',
  "nott'm forest": "Nott'm Forest", 'nottingham forest': "Nott'm Forest", 'nottingham forest fc': "Nott'm Forest", 'forest': "Nott'm Forest",
  'leeds': 'Leeds', 'leeds united': 'Leeds', 'leeds united fc': 'Leeds',
  'brentford': 'Brentford', 'brentford fc': 'Brentford',
  'spurs': 'Spurs', 'tottenham': 'Spurs', 'tottenham hotspur': 'Spurs', 'tottenham hotspur fc': 'Spurs',
  'brighton': 'Brighton', 'brighton & hove albion': 'Brighton', 'brighton and hove albion': 'Brighton', 'brighton & hove albion fc': 'Brighton',
  'aston villa': 'Aston Villa', 'aston villa fc': 'Aston Villa', 'villa': 'Aston Villa',
  'man city': 'Man City', 'manchester city': 'Man City', 'manchester city fc': 'Man City',
  'bournemouth': 'Bournemouth', 'afc bournemouth': 'Bournemouth',
  'newcastle': 'Newcastle', 'newcastle united': 'Newcastle', 'newcastle united fc': 'Newcastle',
  'liverpool': 'Liverpool', 'liverpool fc': 'Liverpool',
  'fulham': 'Fulham', 'fulham fc': 'Fulham',
  'chelsea': 'Chelsea', 'chelsea fc': 'Chelsea',
};

function canonicalTeam(name) {
  if (!name) return '';
  const key = String(name).trim().toLowerCase();
  return TEAM_ALIASES[key] || name;
}

function fx(id, gw, home, away, kickoff) {
  return {
    id, gw,
    home: canonicalTeam(home),
    away: canonicalTeam(away),
    kickoff,
    actualHome: null,
    actualAway: null,
    status: 'SCHEDULED',
  };
}

const SEASON_MATCHES = [
  // GW1
  fx('gw1-01', 1, 'Arsenal', 'Coventry', '2026-08-21T19:00:00.000Z'),
  fx('gw1-02', 1, 'Hull', 'Man Utd', '2026-08-22T11:30:00.000Z'),
  fx('gw1-03', 1, 'Everton', 'Crystal Palace', '2026-08-22T14:00:00.000Z'),
  fx('gw1-04', 1, 'Ipswich', 'Sunderland', '2026-08-22T14:00:00.000Z'),
  fx('gw1-05', 1, "Nott'm Forest", 'Leeds', '2026-08-22T14:00:00.000Z'),
  fx('gw1-06', 1, 'Brentford', 'Spurs', '2026-08-22T16:30:00.000Z'),
  fx('gw1-07', 1, 'Brighton', 'Aston Villa', '2026-08-23T13:00:00.000Z'),
  fx('gw1-08', 1, 'Man City', 'Bournemouth', '2026-08-23T13:00:00.000Z'),
  fx('gw1-09', 1, 'Newcastle', 'Liverpool', '2026-08-23T15:30:00.000Z'),
  fx('gw1-10', 1, 'Fulham', 'Chelsea', '2026-08-24T19:00:00.000Z'),
  // GW2
  fx('gw2-01', 2, 'Crystal Palace', 'Man City', '2026-08-28T19:00:00.000Z'),
  fx('gw2-02', 2, 'Liverpool', "Nott'm Forest", '2026-08-29T11:30:00.000Z'),
  fx('gw2-03', 2, 'Bournemouth', 'Everton', '2026-08-29T14:00:00.000Z'),
  fx('gw2-04', 2, 'Coventry', 'Hull', '2026-08-29T14:00:00.000Z'),
  fx('gw2-05', 2, 'Spurs', 'Newcastle', '2026-08-29T16:30:00.000Z'),
  fx('gw2-06', 2, 'Chelsea', 'Brighton', '2026-08-30T13:00:00.000Z'),
  fx('gw2-07', 2, 'Leeds', 'Brentford', '2026-08-30T13:00:00.000Z'),
  fx('gw2-08', 2, 'Sunderland', 'Fulham', '2026-08-30T13:00:00.000Z'),
  fx('gw2-09', 2, 'Man Utd', 'Ipswich', '2026-08-30T15:30:00.000Z'),
  fx('gw2-10', 2, 'Aston Villa', 'Arsenal', '2026-08-31T19:00:00.000Z'),
  // GW3
  fx('gw3-01', 3, 'Ipswich', 'Liverpool', '2026-09-04T19:00:00.000Z'),
  fx('gw3-02', 3, 'Newcastle', 'Bournemouth', '2026-09-05T11:30:00.000Z'),
  fx('gw3-03', 3, 'Brentford', 'Sunderland', '2026-09-05T14:00:00.000Z'),
  fx('gw3-04', 3, 'Brighton', 'Leeds', '2026-09-05T14:00:00.000Z'),
  fx('gw3-05', 3, 'Fulham', 'Crystal Palace', '2026-09-05T14:00:00.000Z'),
  fx('gw3-06', 3, 'Man City', 'Coventry', '2026-09-05T14:00:00.000Z'),
  fx('gw3-07', 3, "Nott'm Forest", 'Spurs', '2026-09-05T14:00:00.000Z'),
  fx('gw3-08', 3, 'Hull', 'Aston Villa', '2026-09-05T16:30:00.000Z'),
  fx('gw3-09', 3, 'Everton', 'Man Utd', '2026-09-06T13:00:00.000Z'),
  fx('gw3-10', 3, 'Arsenal', 'Chelsea', '2026-09-06T15:30:00.000Z'),
  // GW4
  fx('gw4-01', 4, 'Bournemouth', 'Brentford', '2026-09-12T14:00:00.000Z'),
  fx('gw4-02', 4, 'Aston Villa', "Nott'm Forest", '2026-09-12T14:00:00.000Z'),
  fx('gw4-03', 4, 'Chelsea', 'Hull', '2026-09-12T14:00:00.000Z'),
  fx('gw4-04', 4, 'Crystal Palace', 'Ipswich', '2026-09-12T14:00:00.000Z'),
  fx('gw4-05', 4, 'Liverpool', 'Fulham', '2026-09-12T14:00:00.000Z'),
  fx('gw4-06', 4, 'Spurs', 'Everton', '2026-09-12T16:30:00.000Z'),
  fx('gw4-07', 4, 'Sunderland', 'Arsenal', '2026-09-12T19:00:00.000Z'),
  fx('gw4-08', 4, 'Coventry', 'Brighton', '2026-09-13T13:00:00.000Z'),
  fx('gw4-09', 4, 'Man Utd', 'Man City', '2026-09-13T15:30:00.000Z'),
  fx('gw4-10', 4, 'Leeds', 'Newcastle', '2026-09-14T19:00:00.000Z'),
  // GW5
  fx('gw5-01', 5, 'Brentford', 'Chelsea', '2026-09-18T19:00:00.000Z'),
  fx('gw5-02', 5, 'Spurs', 'Aston Villa', '2026-09-19T11:30:00.000Z'),
  fx('gw5-03', 5, 'Brighton', 'Arsenal', '2026-09-19T14:00:00.000Z'),
  fx('gw5-04', 5, 'Everton', 'Ipswich', '2026-09-19T14:00:00.000Z'),
  fx('gw5-05', 5, 'Leeds', 'Crystal Palace', '2026-09-19T14:00:00.000Z'),
  fx('gw5-06', 5, 'Man City', 'Sunderland', '2026-09-19T14:00:00.000Z'),
  fx('gw5-07', 5, 'Newcastle', 'Hull', '2026-09-19T14:00:00.000Z'),
  fx('gw5-08', 5, "Nott'm Forest", 'Coventry', '2026-09-19T16:30:00.000Z'),
  fx('gw5-09', 5, 'Bournemouth', 'Liverpool', '2026-09-20T13:00:00.000Z'),
  fx('gw5-10', 5, 'Fulham', 'Man Utd', '2026-09-20T15:30:00.000Z'),
];

function cloneMatches() {
  return SEASON_MATCHES.map(m => ({ ...m }));
}

function getActiveGameweek(now = Date.now(), matches = SEASON_MATCHES) {
  const gws = [...new Set(matches.map(m => m.gw))].sort((a,b) => a - b);
  for (const gw of gws) {
    const last = matches.filter(m => m.gw === gw).reduce((a, m) => Math.max(a, new Date(m.kickoff).getTime()), 0);
    if (now < last + 3 * 3600000) return gw;
  }
  return gws[gws.length - 1];
}

function matchesForGw(gw, matches) {
  return matches.filter(m => m.gw === gw);
}

function applyManualResults(matches, results) {
  return matches.map(m => {
    const r = results && results[m.id];
    if (!r) return m;
    return {
      ...m,
      actualHome: r.home,
      actualAway: r.away,
      status: r.status || 'FINISHED',
    };
  });
}
