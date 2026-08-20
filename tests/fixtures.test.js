#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const code = fs.readFileSync(path.join(__dirname, '..', 'fixtures.js'), 'utf8');
const {
  SEASON_MATCHES,
  canonicalTeam,
  getActiveGameweek,
  applyManualResults,
  cloneMatches,
} = vm.runInNewContext(code + '\n({ SEASON_MATCHES, canonicalTeam, getActiveGameweek, applyManualResults, cloneMatches })');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(SEASON_MATCHES.length === 50, 'GW1–GW5 should be 50 matches');
assert(SEASON_MATCHES.filter(m => m.gw === 1).length === 10, 'GW1 has 10 matches');
assert(canonicalTeam('Manchester United') === 'Man Utd', 'alias Man Utd');
assert(canonicalTeam('AFC Bournemouth') === 'Bournemouth', 'alias Bournemouth');
assert(canonicalTeam("Nott'm Forest") === "Nott'm Forest", 'forest short name');

const before = new Date('2026-08-20T12:00:00.000Z').getTime();
assert(getActiveGameweek(before) === 1, 'before kickoff is GW1');

const duringGw2 = new Date('2026-08-29T15:00:00.000Z').getTime();
assert(getActiveGameweek(duringGw2) === 2, '29 Aug is GW2');

const merged = applyManualResults(cloneMatches(), { 'gw1-01': { home: 3, away: 0, status: 'FINISHED' } });
assert(merged[0].actualHome === 3 && merged[0].home === 'Arsenal', 'manual result overlay');

console.log('All fixture tests passed.');
