// 2026/27 Premier League fixtures — all 38 gameweeks / 380 matches
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

function ukKickoff(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const ymd = m * 100 + d;
  const bst = (y === 2026 && ymd >= 329 && ymd < 1025) || (y === 2027 && ymd >= 328);
  return new Date(Date.UTC(y, m - 1, d, hh - (bst ? 1 : 0), mm)).toISOString();
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

const FIXTURE_ROWS = `1|2026-08-21|20:00|Arsenal|Coventry
1|2026-08-22|12:30|Hull|Man Utd
1|2026-08-22|15:00|Everton|Crystal Palace
1|2026-08-22|15:00|Ipswich|Sunderland
1|2026-08-22|15:00|Nott'm Forest|Leeds
1|2026-08-22|17:30|Brentford|Spurs
1|2026-08-23|14:00|Brighton|Aston Villa
1|2026-08-23|14:00|Man City|Bournemouth
1|2026-08-23|16:30|Newcastle|Liverpool
1|2026-08-24|20:00|Fulham|Chelsea
2|2026-08-28|20:00|Crystal Palace|Man City
2|2026-08-29|12:30|Liverpool|Nott'm Forest
2|2026-08-29|15:00|Bournemouth|Everton
2|2026-08-29|15:00|Coventry|Hull
2|2026-08-29|17:30|Spurs|Newcastle
2|2026-08-30|14:00|Chelsea|Brighton
2|2026-08-30|14:00|Leeds|Brentford
2|2026-08-30|14:00|Sunderland|Fulham
2|2026-08-30|16:30|Man Utd|Ipswich
2|2026-08-31|20:00|Aston Villa|Arsenal
3|2026-09-04|20:00|Ipswich|Liverpool
3|2026-09-05|12:30|Newcastle|Bournemouth
3|2026-09-05|15:00|Brentford|Sunderland
3|2026-09-05|15:00|Brighton|Leeds
3|2026-09-05|15:00|Fulham|Crystal Palace
3|2026-09-05|15:00|Man City|Coventry
3|2026-09-05|15:00|Nott'm Forest|Spurs
3|2026-09-05|17:30|Hull|Aston Villa
3|2026-09-06|14:00|Everton|Man Utd
3|2026-09-06|16:30|Arsenal|Chelsea
4|2026-09-12|15:00|Bournemouth|Brentford
4|2026-09-12|15:00|Aston Villa|Nott'm Forest
4|2026-09-12|15:00|Chelsea|Hull
4|2026-09-12|15:00|Crystal Palace|Ipswich
4|2026-09-12|15:00|Liverpool|Fulham
4|2026-09-12|17:30|Spurs|Everton
4|2026-09-12|20:00|Sunderland|Arsenal
4|2026-09-13|14:00|Coventry|Brighton
4|2026-09-13|16:30|Man Utd|Man City
4|2026-09-14|20:00|Leeds|Newcastle
5|2026-09-18|20:00|Brentford|Chelsea
5|2026-09-19|12:30|Spurs|Aston Villa
5|2026-09-19|15:00|Brighton|Arsenal
5|2026-09-19|15:00|Everton|Ipswich
5|2026-09-19|15:00|Leeds|Crystal Palace
5|2026-09-19|15:00|Man City|Sunderland
5|2026-09-19|15:00|Newcastle|Hull
5|2026-09-19|17:30|Nott'm Forest|Coventry
5|2026-09-20|14:00|Bournemouth|Liverpool
5|2026-09-20|16:30|Fulham|Man Utd
6|2026-10-10|12:30|Arsenal|Leeds
6|2026-10-10|15:00|Aston Villa|Brentford
6|2026-10-10|15:00|Chelsea|Bournemouth
6|2026-10-10|15:00|Ipswich|Fulham
6|2026-10-10|15:00|Sunderland|Brighton
6|2026-10-10|17:30|Man Utd|Spurs
6|2026-10-11|14:00|Crystal Palace|Nott'm Forest
6|2026-10-11|14:00|Hull|Everton
6|2026-10-11|16:30|Liverpool|Man City
6|2026-10-12|20:00|Coventry|Newcastle
7|2026-10-17|12:30|Everton|Chelsea
7|2026-10-17|15:00|Brentford|Liverpool
7|2026-10-17|15:00|Fulham|Hull
7|2026-10-17|15:00|Man City|Ipswich
7|2026-10-17|17:30|Newcastle|Aston Villa
7|2026-10-18|14:00|Bournemouth|Sunderland
7|2026-10-18|14:00|Brighton|Crystal Palace
7|2026-10-18|14:00|Leeds|Man Utd
7|2026-10-18|16:30|Nott'm Forest|Arsenal
7|2026-10-19|20:00|Spurs|Coventry
8|2026-10-23|20:00|Ipswich|Nott'm Forest
8|2026-10-24|12:30|Aston Villa|Man City
8|2026-10-24|15:00|Arsenal|Everton
8|2026-10-24|15:00|Coventry|Fulham
8|2026-10-24|15:00|Liverpool|Brighton
8|2026-10-24|17:30|Chelsea|Spurs
8|2026-10-25|14:00|Crystal Palace|Newcastle
8|2026-10-25|14:00|Hull|Brentford
8|2026-10-25|14:00|Man Utd|Bournemouth
8|2026-10-25|16:30|Sunderland|Leeds
9|2026-10-31|12:30|Chelsea|Man Utd
9|2026-10-31|15:00|Bournemouth|Leeds
9|2026-10-31|15:00|Brentford|Nott'm Forest
9|2026-10-31|15:00|Coventry|Sunderland
9|2026-10-31|15:00|Hull|Ipswich
9|2026-10-31|15:00|Man City|Brighton
9|2026-10-31|17:30|Spurs|Crystal Palace
9|2026-11-01|14:00|Aston Villa|Fulham
9|2026-11-01|16:30|Liverpool|Arsenal
9|2026-11-02|20:00|Newcastle|Everton
10|2026-11-07|15:00|Arsenal|Hull
10|2026-11-07|15:00|Brighton|Brentford
10|2026-11-07|15:00|Crystal Palace|Liverpool
10|2026-11-07|15:00|Everton|Coventry
10|2026-11-07|15:00|Fulham|Newcastle
10|2026-11-07|15:00|Ipswich|Bournemouth
10|2026-11-07|15:00|Leeds|Spurs
10|2026-11-07|15:00|Man Utd|Aston Villa
10|2026-11-07|15:00|Nott'm Forest|Man City
10|2026-11-07|15:00|Sunderland|Chelsea
11|2026-11-21|15:00|Bournemouth|Nott'm Forest
11|2026-11-21|15:00|Aston Villa|Sunderland
11|2026-11-21|15:00|Brentford|Everton
11|2026-11-21|15:00|Chelsea|Leeds
11|2026-11-21|15:00|Coventry|Crystal Palace
11|2026-11-21|15:00|Hull|Brighton
11|2026-11-21|15:00|Liverpool|Man Utd
11|2026-11-21|15:00|Man City|Fulham
11|2026-11-21|15:00|Newcastle|Arsenal
11|2026-11-21|15:00|Spurs|Ipswich
12|2026-11-28|15:00|Arsenal|Man City
12|2026-11-28|15:00|Brighton|Newcastle
12|2026-11-28|15:00|Crystal Palace|Hull
12|2026-11-28|15:00|Everton|Liverpool
12|2026-11-28|15:00|Fulham|Bournemouth
12|2026-11-28|15:00|Ipswich|Aston Villa
12|2026-11-28|15:00|Leeds|Coventry
12|2026-11-28|15:00|Man Utd|Brentford
12|2026-11-28|15:00|Nott'm Forest|Chelsea
12|2026-11-28|15:00|Sunderland|Spurs
13|2026-12-02|20:00|Bournemouth|Brighton
13|2026-12-02|20:00|Aston Villa|Everton
13|2026-12-02|20:00|Brentford|Arsenal
13|2026-12-02|20:00|Chelsea|Crystal Palace
13|2026-12-02|20:00|Coventry|Ipswich
13|2026-12-02|20:00|Hull|Nott'm Forest
13|2026-12-02|20:00|Liverpool|Sunderland
13|2026-12-02|20:00|Man City|Leeds
13|2026-12-02|20:00|Newcastle|Man Utd
13|2026-12-02|20:00|Spurs|Fulham
14|2026-12-05|15:00|Bournemouth|Hull
14|2026-12-05|15:00|Aston Villa|Crystal Palace
14|2026-12-05|15:00|Brentford|Man City
14|2026-12-05|15:00|Chelsea|Liverpool
14|2026-12-05|15:00|Everton|Fulham
14|2026-12-05|15:00|Leeds|Ipswich
14|2026-12-05|15:00|Man Utd|Coventry
14|2026-12-05|15:00|Newcastle|Sunderland
14|2026-12-05|15:00|Nott'm Forest|Brighton
14|2026-12-05|15:00|Spurs|Arsenal
15|2026-12-12|15:00|Arsenal|Bournemouth
15|2026-12-12|15:00|Brighton|Everton
15|2026-12-12|15:00|Coventry|Aston Villa
15|2026-12-12|15:00|Crystal Palace|Man Utd
15|2026-12-12|15:00|Fulham|Brentford
15|2026-12-12|15:00|Hull|Spurs
15|2026-12-12|15:00|Ipswich|Newcastle
15|2026-12-12|15:00|Liverpool|Leeds
15|2026-12-12|15:00|Man City|Chelsea
15|2026-12-12|15:00|Sunderland|Nott'm Forest
16|2026-12-19|15:00|Bournemouth|Coventry
16|2026-12-19|15:00|Arsenal|Man Utd
16|2026-12-19|15:00|Brentford|Newcastle
16|2026-12-19|15:00|Brighton|Ipswich
16|2026-12-19|15:00|Chelsea|Aston Villa
16|2026-12-19|15:00|Leeds|Fulham
16|2026-12-19|15:00|Liverpool|Spurs
16|2026-12-19|15:00|Man City|Hull
16|2026-12-19|15:00|Nott'm Forest|Everton
16|2026-12-19|15:00|Sunderland|Crystal Palace
17|2026-12-26|15:00|Aston Villa|Leeds
17|2026-12-26|15:00|Coventry|Chelsea
17|2026-12-26|15:00|Crystal Palace|Arsenal
17|2026-12-26|15:00|Everton|Sunderland
17|2026-12-26|15:00|Fulham|Brighton
17|2026-12-26|15:00|Hull|Liverpool
17|2026-12-26|15:00|Ipswich|Brentford
17|2026-12-26|15:00|Man Utd|Nott'm Forest
17|2026-12-26|15:00|Newcastle|Man City
17|2026-12-26|15:00|Spurs|Bournemouth
18|2026-12-30|20:00|Aston Villa|Liverpool
18|2026-12-30|20:00|Coventry|Brentford
18|2026-12-30|20:00|Crystal Palace|Bournemouth
18|2026-12-30|20:00|Everton|Man City
18|2026-12-30|20:00|Fulham|Arsenal
18|2026-12-30|20:00|Hull|Leeds
18|2026-12-30|20:00|Ipswich|Chelsea
18|2026-12-30|20:00|Man Utd|Sunderland
18|2026-12-30|20:00|Newcastle|Nott'm Forest
18|2026-12-30|20:00|Spurs|Brighton
19|2027-01-02|15:00|Bournemouth|Aston Villa
19|2027-01-02|15:00|Arsenal|Ipswich
19|2027-01-02|15:00|Brentford|Crystal Palace
19|2027-01-02|15:00|Brighton|Man Utd
19|2027-01-02|15:00|Chelsea|Newcastle
19|2027-01-02|15:00|Leeds|Everton
19|2027-01-02|15:00|Liverpool|Coventry
19|2027-01-02|15:00|Man City|Spurs
19|2027-01-02|15:00|Nott'm Forest|Fulham
19|2027-01-02|15:00|Sunderland|Hull
20|2027-01-06|20:00|Arsenal|Brentford
20|2027-01-06|20:00|Brighton|Bournemouth
20|2027-01-06|20:00|Crystal Palace|Chelsea
20|2027-01-06|20:00|Everton|Aston Villa
20|2027-01-06|20:00|Fulham|Spurs
20|2027-01-06|20:00|Ipswich|Coventry
20|2027-01-06|20:00|Leeds|Man City
20|2027-01-06|20:00|Man Utd|Newcastle
20|2027-01-06|20:00|Nott'm Forest|Hull
20|2027-01-06|20:00|Sunderland|Liverpool
21|2027-01-16|15:00|Bournemouth|Ipswich
21|2027-01-16|15:00|Aston Villa|Man Utd
21|2027-01-16|15:00|Brentford|Brighton
21|2027-01-16|15:00|Chelsea|Sunderland
21|2027-01-16|15:00|Coventry|Everton
21|2027-01-16|15:00|Hull|Arsenal
21|2027-01-16|15:00|Liverpool|Crystal Palace
21|2027-01-16|15:00|Man City|Nott'm Forest
21|2027-01-16|15:00|Newcastle|Fulham
21|2027-01-16|15:00|Spurs|Leeds
22|2027-01-23|15:00|Arsenal|Newcastle
22|2027-01-23|15:00|Brighton|Man City
22|2027-01-23|15:00|Crystal Palace|Spurs
22|2027-01-23|15:00|Everton|Brentford
22|2027-01-23|15:00|Fulham|Aston Villa
22|2027-01-23|15:00|Ipswich|Hull
22|2027-01-23|15:00|Leeds|Chelsea
22|2027-01-23|15:00|Man Utd|Liverpool
22|2027-01-23|15:00|Nott'm Forest|Bournemouth
22|2027-01-23|15:00|Sunderland|Coventry
23|2027-01-30|15:00|Bournemouth|Fulham
23|2027-01-30|15:00|Aston Villa|Ipswich
23|2027-01-30|15:00|Brentford|Man Utd
23|2027-01-30|15:00|Chelsea|Nott'm Forest
23|2027-01-30|15:00|Coventry|Leeds
23|2027-01-30|15:00|Hull|Crystal Palace
23|2027-01-30|15:00|Liverpool|Everton
23|2027-01-30|15:00|Man City|Arsenal
23|2027-01-30|15:00|Newcastle|Brighton
23|2027-01-30|15:00|Spurs|Sunderland
24|2027-02-06|15:00|Arsenal|Liverpool
24|2027-02-06|15:00|Brighton|Hull
24|2027-02-06|15:00|Crystal Palace|Coventry
24|2027-02-06|15:00|Everton|Newcastle
24|2027-02-06|15:00|Fulham|Man City
24|2027-02-06|15:00|Ipswich|Spurs
24|2027-02-06|15:00|Leeds|Bournemouth
24|2027-02-06|15:00|Man Utd|Chelsea
24|2027-02-06|15:00|Nott'm Forest|Brentford
24|2027-02-06|15:00|Sunderland|Aston Villa
25|2027-02-10|20:00|Aston Villa|Bournemouth
25|2027-02-10|20:00|Coventry|Liverpool
25|2027-02-10|20:00|Crystal Palace|Brentford
25|2027-02-10|20:00|Everton|Leeds
25|2027-02-10|20:00|Fulham|Nott'm Forest
25|2027-02-10|20:00|Hull|Sunderland
25|2027-02-10|20:00|Ipswich|Arsenal
25|2027-02-10|20:00|Man Utd|Brighton
25|2027-02-10|20:00|Newcastle|Chelsea
25|2027-02-10|20:00|Spurs|Man City
26|2027-02-20|15:00|Bournemouth|Crystal Palace
26|2027-02-20|15:00|Arsenal|Fulham
26|2027-02-20|15:00|Brentford|Coventry
26|2027-02-20|15:00|Brighton|Spurs
26|2027-02-20|15:00|Chelsea|Ipswich
26|2027-02-20|15:00|Leeds|Aston Villa
26|2027-02-20|15:00|Liverpool|Hull
26|2027-02-20|15:00|Man City|Newcastle
26|2027-02-20|15:00|Nott'm Forest|Man Utd
26|2027-02-20|15:00|Sunderland|Everton
27|2027-02-27|15:00|Aston Villa|Chelsea
27|2027-02-27|15:00|Coventry|Bournemouth
27|2027-02-27|15:00|Crystal Palace|Sunderland
27|2027-02-27|15:00|Everton|Nott'm Forest
27|2027-02-27|15:00|Fulham|Leeds
27|2027-02-27|15:00|Hull|Man City
27|2027-02-27|15:00|Ipswich|Brighton
27|2027-02-27|15:00|Man Utd|Arsenal
27|2027-02-27|15:00|Newcastle|Brentford
27|2027-02-27|15:00|Spurs|Liverpool
28|2027-03-03|20:00|Bournemouth|Spurs
28|2027-03-03|20:00|Arsenal|Crystal Palace
28|2027-03-03|20:00|Brentford|Ipswich
28|2027-03-03|20:00|Brighton|Fulham
28|2027-03-03|20:00|Chelsea|Coventry
28|2027-03-03|20:00|Leeds|Hull
28|2027-03-03|20:00|Liverpool|Aston Villa
28|2027-03-03|20:00|Man City|Everton
28|2027-03-03|20:00|Nott'm Forest|Newcastle
28|2027-03-03|20:00|Sunderland|Man Utd
29|2027-03-13|15:00|Bournemouth|Newcastle
29|2027-03-13|15:00|Aston Villa|Hull
29|2027-03-13|15:00|Chelsea|Arsenal
29|2027-03-13|15:00|Coventry|Man City
29|2027-03-13|15:00|Crystal Palace|Fulham
29|2027-03-13|15:00|Leeds|Brighton
29|2027-03-13|15:00|Liverpool|Ipswich
29|2027-03-13|15:00|Man Utd|Everton
29|2027-03-13|15:00|Sunderland|Brentford
29|2027-03-13|15:00|Spurs|Nott'm Forest
30|2027-03-20|15:00|Arsenal|Sunderland
30|2027-03-20|15:00|Brentford|Bournemouth
30|2027-03-20|15:00|Brighton|Coventry
30|2027-03-20|15:00|Everton|Spurs
30|2027-03-20|15:00|Fulham|Liverpool
30|2027-03-20|15:00|Hull|Chelsea
30|2027-03-20|15:00|Ipswich|Crystal Palace
30|2027-03-20|15:00|Man City|Man Utd
30|2027-03-20|15:00|Newcastle|Leeds
30|2027-03-20|15:00|Nott'm Forest|Aston Villa
31|2027-04-10|15:00|Bournemouth|Man City
31|2027-04-10|15:00|Aston Villa|Brighton
31|2027-04-10|15:00|Chelsea|Fulham
31|2027-04-10|15:00|Coventry|Arsenal
31|2027-04-10|15:00|Crystal Palace|Everton
31|2027-04-10|15:00|Leeds|Nott'm Forest
31|2027-04-10|15:00|Liverpool|Newcastle
31|2027-04-10|15:00|Man Utd|Hull
31|2027-04-10|15:00|Sunderland|Ipswich
31|2027-04-10|15:00|Spurs|Brentford
32|2027-04-17|15:00|Arsenal|Aston Villa
32|2027-04-17|15:00|Brentford|Leeds
32|2027-04-17|15:00|Brighton|Chelsea
32|2027-04-17|15:00|Everton|Bournemouth
32|2027-04-17|15:00|Fulham|Sunderland
32|2027-04-17|15:00|Hull|Coventry
32|2027-04-17|15:00|Ipswich|Man Utd
32|2027-04-17|15:00|Man City|Crystal Palace
32|2027-04-17|15:00|Newcastle|Spurs
32|2027-04-17|15:00|Nott'm Forest|Liverpool
33|2027-04-24|15:00|Bournemouth|Arsenal
33|2027-04-24|15:00|Aston Villa|Coventry
33|2027-04-24|15:00|Brentford|Fulham
33|2027-04-24|15:00|Chelsea|Man City
33|2027-04-24|15:00|Everton|Brighton
33|2027-04-24|15:00|Leeds|Liverpool
33|2027-04-24|15:00|Man Utd|Crystal Palace
33|2027-04-24|15:00|Newcastle|Ipswich
33|2027-04-24|15:00|Nott'm Forest|Sunderland
33|2027-04-24|15:00|Spurs|Hull
34|2027-05-01|15:00|Arsenal|Spurs
34|2027-05-01|15:00|Brighton|Nott'm Forest
34|2027-05-01|15:00|Coventry|Man Utd
34|2027-05-01|15:00|Crystal Palace|Aston Villa
34|2027-05-01|15:00|Fulham|Everton
34|2027-05-01|15:00|Hull|Bournemouth
34|2027-05-01|15:00|Ipswich|Leeds
34|2027-05-01|15:00|Liverpool|Chelsea
34|2027-05-01|15:00|Man City|Brentford
34|2027-05-01|15:00|Sunderland|Newcastle
35|2027-05-08|15:00|Bournemouth|Man Utd
35|2027-05-08|15:00|Brentford|Aston Villa
35|2027-05-08|15:00|Brighton|Sunderland
35|2027-05-08|15:00|Everton|Hull
35|2027-05-08|15:00|Fulham|Ipswich
35|2027-05-08|15:00|Leeds|Arsenal
35|2027-05-08|15:00|Man City|Liverpool
35|2027-05-08|15:00|Newcastle|Coventry
35|2027-05-08|15:00|Nott'm Forest|Crystal Palace
35|2027-05-08|15:00|Spurs|Chelsea
36|2027-05-15|15:00|Arsenal|Nott'm Forest
36|2027-05-15|15:00|Aston Villa|Newcastle
36|2027-05-15|15:00|Chelsea|Everton
36|2027-05-15|15:00|Coventry|Spurs
36|2027-05-15|15:00|Crystal Palace|Brighton
36|2027-05-15|15:00|Hull|Fulham
36|2027-05-15|15:00|Ipswich|Man City
36|2027-05-15|15:00|Liverpool|Brentford
36|2027-05-15|15:00|Man Utd|Leeds
36|2027-05-15|15:00|Sunderland|Bournemouth
37|2027-05-23|15:00|Bournemouth|Chelsea
37|2027-05-23|15:00|Brentford|Hull
37|2027-05-23|15:00|Brighton|Liverpool
37|2027-05-23|15:00|Everton|Arsenal
37|2027-05-23|15:00|Fulham|Coventry
37|2027-05-23|15:00|Leeds|Sunderland
37|2027-05-23|15:00|Man City|Aston Villa
37|2027-05-23|15:00|Newcastle|Crystal Palace
37|2027-05-23|15:00|Nott'm Forest|Ipswich
37|2027-05-23|15:00|Spurs|Man Utd
38|2027-05-30|15:00|Arsenal|Brighton
38|2027-05-30|15:00|Aston Villa|Spurs
38|2027-05-30|15:00|Chelsea|Brentford
38|2027-05-30|15:00|Coventry|Nott'm Forest
38|2027-05-30|15:00|Crystal Palace|Leeds
38|2027-05-30|15:00|Hull|Newcastle
38|2027-05-30|15:00|Ipswich|Everton
38|2027-05-30|15:00|Liverpool|Bournemouth
38|2027-05-30|15:00|Man Utd|Fulham
38|2027-05-30|15:00|Sunderland|Man City`;

const SEASON_MATCHES = (function () {
  const index = {};
  return FIXTURE_ROWS.trim().split('\n').map(line => {
    const [gw, date, time, home, away] = line.split('|');
    const n = Number(gw);
    index[n] = (index[n] || 0) + 1;
    const seq = String(index[n]).padStart(2, '0');
    return fx('gw' + n + '-' + seq, n, home, away, ukKickoff(date, time));
  });
})();

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
