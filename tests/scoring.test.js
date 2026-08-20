#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
eval(src);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(scorePredict({ home: 2, away: 1 }, { home: 2, away: 1 }).pts === 3, 'exact should be 3');
assert(scorePredict({ home: 2, away: 0 }, { home: 3, away: 1 }).pts === 1, 'correct result should be 1');
assert(scorePredict({ home: 2, away: 1 }, { home: 1, away: 2 }).pts === 0, 'wrong result should be 0');
assert(scorePredict(null, { home: 1, away: 0 }).status === 'pending', 'missing pred is pending');

const miss = nearestMiss({ home: 2, away: 1 }, { home: 2, away: 0 });
assert(miss.goalDiff === 1, 'nearest miss off-by-one');
assert(miss.exact === false, 'not exact');

const akash = gw38PlayerStats('akash');
assert(akash.exact + akash.correct + akash.wrong + akash.pending === 10, 'GW38 has 10 matches');
assert(akash.pts >= 0 && Number.isFinite(akash.pts), 'Akash GW38 pts computed');

const parth = gw38PlayerStats('parth');
assert(parth.exact >= 1, 'Parth has at least one GW38 exact');

const dad = gw38PlayerStats('dadhichi');
assert(dad.pending === 10, 'Dadhichi submitted no GW38 picks');
assert(dad.pts === 0, 'Dadhichi GW38 is 0');

const form = seasonFormStreak('akash');
assert(form.streak === 5, 'Akash scored in last 5 GWs');
assert(seasonFormStreak('dadhichi').streak === 0, 'Dadhichi blanked GW38');

assert(slugifyName('New Friend') === 'new-friend', 'slugify names');
assert(getResult(2, 1) === 'H' && getResult(1, 1) === 'D' && getResult(0, 2) === 'A', 'result codes');

const twoDays = countdownParts('2026-08-21T19:00:00.000Z', Date.parse('2026-08-19T07:00:00.000Z'));
assert(twoDays.d === 2 && twoDays.h === 12, 'countdown 2d 12h');
assert(twoDays.label === 'Locks in 2d 12h', 'airport label days');
assert(twoDays.cells[0].u === 'd' && twoDays.cells[0].v === '02', 'day cells padded');
assert(countdownParts('2026-08-21T19:00:00.000Z', Date.parse('2026-08-22T00:00:00.000Z')).locked, 'past kickoff is locked');
const mins = countdownParts('2026-08-21T19:00:00.000Z', Date.parse('2026-08-21T18:58:05.000Z'));
assert(mins.m === 1 && mins.s === 55 && mins.cells[1].u === 's', 'final minutes show seconds');

console.log('All scoring tests passed.');
