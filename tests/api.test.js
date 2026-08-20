#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const fixtures = fs.readFileSync(path.join(__dirname, '..', 'fixtures.js'), 'utf8');
const api = fs.readFileSync(path.join(__dirname, '..', 'api.js'), 'utf8');
const { FootballAPI, canonicalTeam, SEASON_MATCHES } = vm.runInNewContext(
  fixtures + '\n' + api + '\n({ FootballAPI, canonicalTeam, SEASON_MATCHES })',
  { LiveStore: { state: { settings: { footballDataToken: '' } }, mergeResults() {} } }
);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function event(home, away, homeScore, awayScore, state, extraType = {}) {
  return {
    id: `${home}-${away}-${state}`,
    date: '2026-08-21T19:00Z',
    competitions: [{
      status: {
        type: {
          state,
          completed: state === 'post',
          name: extraType.name || (state === 'post' ? 'STATUS_FULL_TIME' : state === 'in' ? 'STATUS_IN_PROGRESS' : 'STATUS_SCHEDULED'),
          ...extraType,
        },
      },
      competitors: [
        { homeAway: 'home', score: String(homeScore), team: { displayName: home } },
        { homeAway: 'away', score: String(awayScore), team: { displayName: away } },
      ],
    }],
  };
}

assert(FootballAPI.dateRangeForGw(1) === '20260821-20260824', 'GW1 ESPN date range');
assert(FootballAPI.yyyymmddUtc('2026-08-21T19:00:00.000Z') === '20260821', 'UTC yyyymmdd');

const espnNames = [
  ['Arsenal', 'Arsenal'],
  ['Coventry City', 'Coventry'],
  ['Hull City', 'Hull'],
  ['Manchester United', 'Man Utd'],
  ['Everton', 'Everton'],
  ['Crystal Palace', 'Crystal Palace'],
  ['Ipswich Town', 'Ipswich'],
  ['Sunderland', 'Sunderland'],
  ['Nottingham Forest', "Nott'm Forest"],
  ['Leeds United', 'Leeds'],
  ['Brentford', 'Brentford'],
  ['Tottenham Hotspur', 'Spurs'],
  ['Brighton & Hove Albion', 'Brighton'],
  ['Aston Villa', 'Aston Villa'],
  ['Manchester City', 'Man City'],
  ['AFC Bournemouth', 'Bournemouth'],
  ['Newcastle United', 'Newcastle'],
  ['Liverpool', 'Liverpool'],
  ['Fulham', 'Fulham'],
  ['Chelsea', 'Chelsea'],
];
espnNames.forEach(([from, to]) => {
  assert(canonicalTeam(from) === to, `alias ${from} -> ${to}`);
});

const scheduled = FootballAPI.parseEspnEvent(event('Arsenal', 'Coventry City', 0, 0, 'pre'));
assert(scheduled.status === 'SCHEDULED', 'pre is scheduled');
assert(scheduled.home === 'Arsenal' && scheduled.away === 'Coventry', 'map GW1 opener names');

const live = FootballAPI.parseEspnEvent(event('Arsenal', 'Coventry City', 1, 0, 'in'));
assert(live.status === 'IN_PLAY', 'in-play status');
assert(live.homeScore === 1 && live.awayScore === 0, 'in-play scores');

const ht = FootballAPI.parseEspnEvent(event('Arsenal', 'Coventry City', 1, 1, 'in', { name: 'STATUS_HALFTIME' }));
assert(ht.status === 'PAUSED', 'halftime is paused');

const ft = FootballAPI.parseEspnEvent(event('Brighton & Hove Albion', 'Manchester United', 0, 3, 'post'));
assert(ft.status === 'FINISHED' && ft.home === 'Brighton' && ft.away === 'Man Utd', 'finished names');
assert(ft.homeScore === 0 && ft.awayScore === 3, 'finished scores');

const results = FootballAPI.espnEventsToResults([
  event('Arsenal', 'Coventry City', 0, 0, 'pre'),
  event('Arsenal', 'Coventry City', 2, 1, 'in'),
  event('Brighton & Hove Albion', 'Manchester United', 0, 3, 'post'),
  event('Burnley', 'Wolverhampton Wanderers', 1, 1, 'post'),
]);
assert(results['gw1-01'].home === 2 && results['gw1-01'].away === 1, 'scheduled 0-0 is skipped; live score is stored');
assert(results['gw1-01'].status === 'IN_PLAY', 'live overlay for GW1 opener');
const brightonUtd = SEASON_MATCHES.find(m => m.home === 'Brighton' && m.away === 'Man Utd');
assert(brightonUtd && results[brightonUtd.id].home === 0 && results[brightonUtd.id].away === 3, 'name match writes FT onto the 2026/27 fixture');
assert(!Object.keys(results).some(id => {
  const m = SEASON_MATCHES.find(x => x.id === id);
  return m && m.home === 'Burnley';
}), 'relegated / non-PL teams are ignored');

console.log('All API tests passed.');
