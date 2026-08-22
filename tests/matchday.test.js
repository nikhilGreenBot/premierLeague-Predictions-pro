#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const code = [
  fs.readFileSync(path.join(root, 'data.js'), 'utf8'),
  fs.readFileSync(path.join(root, 'fixtures.js'), 'utf8'),
  `\n({
    SEASON_MATCHES, matchesForGw, matchesForMatchday, completedMatchdayKeys,
    applyManualResults, cloneMatches, ukDateKey, ukDateLabel,
    buildMatchdayRecap, matchdayPlayerPoints
  })`,
].join('\n');
const api = vm.runInNewContext(code);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const {
  SEASON_MATCHES,
  matchesForGw,
  matchesForMatchday,
  completedMatchdayKeys,
  applyManualResults,
  cloneMatches,
  ukDateKey,
  ukDateLabel,
  buildMatchdayRecap,
  matchdayPlayerPoints,
} = api;

assert(ukDateKey('2026-08-21T19:00:00.000Z') === '2026-08-21', 'UK date for Friday opener');
assert(ukDateLabel('2026-08-21').includes('August'), 'human label has month');

const gw1 = matchesForGw(1, SEASON_MATCHES);
assert(gw1.length === 10, 'GW1 size');
const fri = matchesForMatchday('2026-08-21', SEASON_MATCHES);
assert(fri.length === 1 && fri[0].home === 'Arsenal', 'Friday is Arsenal vs Coventry only');

assert(completedMatchdayKeys(SEASON_MATCHES).length === 0, 'no completed matchdays without results');

const withFt = applyManualResults(cloneMatches(), {
  'gw1-01': { home: 2, away: 0, status: 'FINISHED' },
});
assert(completedMatchdayKeys(withFt).includes('2026-08-21'), 'Friday completes when FT');
assert(!completedMatchdayKeys(withFt).includes('2026-08-22'), 'Saturday still open');

const liveStill = applyManualResults(cloneMatches(), {
  'gw1-01': { home: 1, away: 0, status: 'IN_PLAY' },
});
assert(!completedMatchdayKeys(liveStill).includes('2026-08-21'), 'in-play is not complete');

const preds = {
  parth: { 'gw1-01': { home: 2, away: 0 } },
  akash: { 'gw1-01': { home: 2, away: 1 } },
  dadhichi: { 'gw1-01': { home: 1, away: 0 } },
};
const players = [
  { id: 'parth', name: 'Parth' },
  { id: 'akash', name: 'Akash' },
  { id: 'dadhichi', name: 'Dadhichi' },
];
const recap = buildMatchdayRecap('2026-08-21', withFt, players, preds);
assert(recap.board[0].id === 'parth' && recap.board[0].pts === 3, 'Parth tops Friday with exact');
assert(recap.board.find(p => p.id === 'akash').pts === 1, 'Akash correct result');
assert(recap.text.includes('PICKS'), 'recap lists picks');
assert(recap.subject.includes('points'), 'subject mentions points');

const pts = matchdayPlayerPoints(
  'parth',
  fri.map(m => ({ ...m, actualHome: 2, actualAway: 0, status: 'FINISHED' })),
  preds,
);
assert(pts.pts === 3 && pts.exact === 1, 'matchday points helper');

console.log('All matchday tests passed.');
