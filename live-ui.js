// 2026/27 live season UI

let liveGw = null;
let liveTimer = null;
let liveApiTimer = null;
let liveShowSeason = true;
let predBoardMode = 'mine'; // 'mine' | 'league'
let matchdayMailBusy = false;

function currentLivePlayers() {
  return LiveStore.state.players;
}

function liveMatches() {
  return applyManualResults(cloneMatches(), LiveStore.state.results);
}

function canEditMatch(match, now = Date.now()) {
  if (LiveStore.state.settings.allowLate) return true;
  return now < new Date(match.kickoff).getTime();
}

function toast(msg) {
  let el = document.getElementById('liveToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'liveToast';
    el.className = 'live-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

function fidsHtml(iso, prefix = 'LOCKS IN', size = '') {
  const c = countdownParts(iso);
  const sizeCls = size ? ` ${size}` : '';
  if (c.locked) {
    return `<div class="fids locked${sizeCls}" data-countdown="${iso}" data-prefix="${prefix}"><span class="fids-label">LOCKED</span></div>`;
  }
  const board = c.cells.map(x => {
    const digits = [...String(x.v)].map(ch => `<span class="fids-cell">${ch}</span>`).join('');
    return `<span class="fids-pair">${digits}<span class="fids-unit">${x.u}</span></span>`;
  }).join('');
  return `<div class="fids${sizeCls}" data-countdown="${iso}" data-prefix="${prefix}"><span class="fids-label">${prefix}</span><span class="fids-board">${board}</span></div>`;
}

function tickFids(root = document) {
  root.querySelectorAll('[data-countdown]').forEach(el => {
    const iso = el.dataset.countdown;
    const prefix = el.dataset.prefix || 'LOCKS IN';
    const size = el.classList.contains('lg') ? 'lg' : '';
    const tmp = document.createElement('div');
    tmp.innerHTML = fidsHtml(iso, prefix, size);
    const neu = tmp.firstElementChild;
    if (!neu) return;
    if (el.className === neu.className && el.innerHTML === neu.innerHTML) return;
    const wasLocked = el.classList.contains('locked');
    el.className = neu.className;
    el.innerHTML = neu.innerHTML;
    if (!wasLocked && neu.classList.contains('locked')) el.dataset.justLocked = '1';
  });
}

function gwWindowLabel(gw, matches) {
  const rows = matchesForGw(gw, matches);
  if (!rows.length) return '';
  const fmt = (iso) => new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London',
  });
  const a = fmt(rows[0].kickoff);
  const b = fmt(rows[rows.length - 1].kickoff);
  return a === b ? a : `${a} – ${b}`;
}

function fxWhen(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  });
}

function jumpToGw(g) {
  liveGw = Number(g);
  if (typeof goTo === 'function') {
    goTo('predictions');
    return;
  }
  renderLiveSeason();
  requestAnimationFrame(() => {
    document.getElementById('livePredict')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function stepper(value, disabled, attr) {
  const v = value == null ? '' : value;
  return `<div class="stepper ${disabled ? 'disabled' : ''}">
    <button type="button" class="step-btn" data-delta="-1" ${attr} ${disabled?'disabled':''}>−</button>
    <input class="step-val" inputmode="numeric" maxlength="1" value="${v}" ${attr} ${disabled?'disabled':''}/>
    <button type="button" class="step-btn" data-delta="1" ${attr} ${disabled?'disabled':''}>+</button>
  </div>`;
}

function formatPredCell(pred, match) {
  if (!pred) return '<span class="gb-empty">—</span>';
  const score = `${pred.home}–${pred.away}`;
  if (match.actualHome == null || match.actualAway == null) {
    return `<span class="gb-pick">${score}</span>`;
  }
  const scored = scorePredict(pred, { home: match.actualHome, away: match.actualAway });
  const cls = scored.status === 'exact' ? 'exact' : scored.status === 'correct' ? 'correct' : 'wrong';
  const tag = scored.status === 'exact' ? '⭐3' : scored.status === 'correct' ? '✓1' : '✗0';
  return `<span class="gb-pick ${cls}">${score}<em>${tag}</em></span>`;
}

function everyonePicksTable(matches, players, preds, opts = {}) {
  const rows = matches || [];
  const people = players || [];
  if (!rows.length) return '<p class="muted">No fixtures in this window.</p>';
  const anyPicks = people.some(p => rows.some(m => (preds[p.id] || {})[m.id]));
  const note = opts.note || (!anyPicks
    ? '<p class="muted">No shared picks on this device yet — import a league code (or connect Firebase) so everyone’s scores appear here.</p>'
    : '');
  return `${note}
    <div class="gb-scroll">
      <table class="gb-table">
        <thead>
          <tr>
            <th>Match</th>
            <th>Result</th>
            ${people.map(p => `<th style="color:${typeof playerColor==='function'?playerColor(p.id):(COLORS[p.id]||'#00ff87')}">${p.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(m => {
            const has = m.actualHome != null && m.actualAway != null;
            const live = m.status === 'IN_PLAY' || m.status === 'PAUSED';
            return `<tr>
              <td class="gb-match"><span class="gb-home">${m.home}</span><span class="gb-vs">v</span><span class="gb-away">${m.away}</span>
                <div class="gb-when">${fxWhen(m.kickoff)}</div></td>
              <td class="gb-result">${has ? `<strong>${m.actualHome}–${m.actualAway}</strong><div class="gb-when">${live ? 'LIVE' : 'FT'}</div>` : '<span class="muted">TBD</span>'}</td>
              ${people.map(p => `<td>${formatPredCell((preds[p.id] || {})[m.id], m)}</td>`).join('')}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function buildGwRecapText(gw, matches, players, preds) {
  const gwMatches = matchesForGw(gw, matches);
  const board = liveLeaderboard(players, gwMatches, preds);
  const lines = [
    `🏆 PL Predictions Pro — GW${gw} recap`,
    `2026/27 · ${gwMatches.filter(m => m.actualHome != null).length}/${gwMatches.length} results in`,
    '',
  ];
  board.forEach((p, i) => {
    lines.push(`${['🥇','🥈','🥉'][i] || (i+1)+'.'} ${p.name}  ${p.totalPts} pts  (${p.totalExact} exact${p.bestMiss ? `, nearest miss ${p.bestMiss.goalDiff}` : ''})`);
  });
  lines.push('', 'EVERYONE’S PICKS');
  gwMatches.forEach(m => {
    const has = m.actualHome != null && m.actualAway != null;
    lines.push('');
    lines.push(has ? `${m.home} ${m.actualHome}–${m.actualAway} ${m.away}` : `${m.home} vs ${m.away}`);
    players.forEach(p => {
      const pred = (preds[p.id] || {})[m.id];
      if (!pred) { lines.push(`  ${p.name}: —`); return; }
      if (!has) { lines.push(`  ${p.name}: ${pred.home}–${pred.away}`); return; }
      const scored = scorePredict(pred, { home: m.actualHome, away: m.actualAway });
      const tag = scored.status === 'exact' ? '⭐3' : scored.status === 'correct' ? '✓1' : '✗0';
      lines.push(`  ${p.name}: ${pred.home}–${pred.away}  ${tag}`);
    });
  });
  lines.push('', 'Scoring: exact 3 · correct result 1 · miss 0');
  return lines.join('\n');
}

function mailtoHref(to, subject, body) {
  const list = String(to || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean).join(',');
  return `mailto:${list}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function sendMatchdayEmail(recap, { forceMailto = false } = {}) {
  const to = (LiveStore.state.settings.recapEmails || '').trim();
  const key = (LiveStore.state.settings.web3formsKey || '').trim();
  if (!to && !key) {
    throw new Error('Add recap emails (or a Web3Forms key) in Settings first.');
  }
  if (!forceMailto && key) {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: recap.subject,
        email: to.split(/[,;]+/).map(s => s.trim()).filter(Boolean)[0] || 'league@localhost',
        name: 'PL Predictions Pro',
        message: recap.text + (to ? `\n\nAlso send to: ${to}` : ''),
        from_name: 'PL Predictions Pro',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Email provider rejected the send.');
    }
    LiveStore.markMatchdayMailSent(recap.dateKey, { via: 'web3forms' });
    return { via: 'web3forms' };
  }
  const href = mailtoHref(to, recap.subject, recap.text);
  window.location.href = href;
  LiveStore.markMatchdayMailSent(recap.dateKey, { via: 'mailto' });
  return { via: 'mailto', href };
}

async function maybeAutoMatchdayEmail() {
  if (matchdayMailBusy) return;
  if (LiveStore.state.settings.autoMatchdayEmail === false) return;
  const matches = liveMatches();
  const done = completedMatchdayKeys(matches);
  const pending = done.filter(k => !LiveStore.wasMatchdayMailSent(k));
  if (!pending.length) return;
  const dateKey = pending[0];
  const recap = buildMatchdayRecap(dateKey, matches, currentLivePlayers(), LiveStore.state.predictions);
  const to = (LiveStore.state.settings.recapEmails || '').trim();
  const key = (LiveStore.state.settings.web3formsKey || '').trim();
  if (!to && !key) return;
  matchdayMailBusy = true;
  try {
    if (key) {
      await sendMatchdayEmail(recap);
      toast(`Matchday email sent · ${recap.label}`);
    } else {
      // Mailto needs a user gesture in most browsers — flag UI instead of auto-opening.
      toast(`Matchday ready · ${recap.label}`);
    }
  } catch (e) {
    console.warn('Matchday email failed', e);
  } finally {
    matchdayMailBusy = false;
    if (typeof renderCurrent === 'function' && pageId === 'leaderboard') renderCurrent();
  }
}

function renderMatchdayMailPanel(root, matches, players, preds) {
  if (!root) return;
  const done = completedMatchdayKeys(matches);
  const pending = done.filter(k => !LiveStore.wasMatchdayMailSent(k));
  const latest = pending[0] || done[done.length - 1] || null;
  const autoOn = LiveStore.state.settings.autoMatchdayEmail !== false;
  const hasKey = !!(LiveStore.state.settings.web3formsKey || '').trim();
  const hasTo = !!(LiveStore.state.settings.recapEmails || '').trim();

  if (!latest) {
    root.innerHTML = `
      <div class="live-recap matchday-mail">
        <div class="chart-card-title">Matchday email</div>
        <p class="muted">When every game on a UK matchday is finished, the app builds a points email with everyone’s picks. Add emails in Predictions → Settings${autoOn ? ' — auto-send is on' : ''}.</p>
        <p class="muted">True hands-free send needs a free <a href="https://web3forms.com" target="_blank" rel="noopener">Web3Forms</a> key pasted in Settings. Without it, you’ll get a one-tap mailto button.</p>
      </div>`;
    return;
  }

  const recap = buildMatchdayRecap(latest, matches, players, preds);
  const sent = LiveStore.wasMatchdayMailSent(latest);
  root.innerHTML = `
    <div class="live-recap matchday-mail">
      <div class="chart-card-title">Matchday email · ${recap.label}</div>
      <p class="muted">${sent
        ? 'Already sent for this matchday.'
        : (pending.length
          ? `${pending.length} finished matchday${pending.length > 1 ? 's' : ''} waiting to email.`
          : 'Preview of the latest finished matchday.')}
        ${hasKey ? ' Web3Forms will send automatically when the app is open.' : hasTo ? ' Tap send to open your mail app.' : ' Add recipient emails in Settings.'}</p>
      <pre class="recap-body" id="matchdayRecapBody">${recap.text.replace(/</g, '&lt;')}</pre>
      <div class="share-actions">
        <button class="btn-g" data-send-matchday ${(!hasTo && !hasKey) ? 'disabled' : ''}>${hasKey ? 'Send email now' : 'Email points'}</button>
        <button class="btn-ghost" data-copy-matchday>Copy</button>
        <a class="btn-ghost" id="matchdayMailto" href="${mailtoHref(LiveStore.state.settings.recapEmails || '', recap.subject, recap.text)}">Open mail app</a>
      </div>
    </div>`;
  root.querySelector('[data-copy-matchday]')?.addEventListener('click', () => {
    copyText(recap.text).then(() => toast('Matchday recap copied'));
  });
  root.querySelector('[data-send-matchday]')?.addEventListener('click', async () => {
    try {
      const res = await sendMatchdayEmail(recap, { forceMailto: !hasKey });
      toast(res.via === 'web3forms' ? 'Matchday email sent' : 'Mail app opened');
      renderMatchdayMailPanel(root, liveMatches(), currentLivePlayers(), LiveStore.state.predictions);
    } catch (e) {
      toast(e.message || 'Could not send');
    }
  });
}

function renderGlobalBoard(root, matches, players, preds) {
  if (!root) return;
  if (liveGw == null) liveGw = getActiveGameweek(Date.now(), matches);
  const gw = liveGw;
  const gws = [...new Set(matches.map(m => m.gw))].sort((a, b) => a - b);
  const gwMatches = matchesForGw(gw, matches);
  const dayPts = players.map(p => {
    const s = matchdayPlayerPoints(p.id, gwMatches.filter(isMatchFinished), preds);
    return { ...p, ...s };
  }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);

  root.innerHTML = `
    <div class="global-board">
      <div class="global-board-head">
        <div>
          <div class="chart-card-title">Everyone’s picks · GW${gw}</div>
          <p class="muted">Full league view — every friend’s prediction on one board.</p>
        </div>
      </div>
      ${liveGwChipBar(gws, gw)}
      <div class="gb-day-standings">
        ${dayPts.map((p, i) => `
          <div class="gb-day-chip">
            <span class="gb-day-rank">${['🥇','🥈','🥉'][i] || (i+1)}</span>
            <span class="gb-day-name" style="color:${typeof playerColor==='function'?playerColor(p.id):(COLORS[p.id]||'#00ff87')}">${p.name}</span>
            <span class="gb-day-pts">${p.pts} pts</span>
            <span class="gb-day-meta">${p.exact} exact</span>
          </div>`).join('')}
      </div>
      ${everyonePicksTable(gwMatches, players, preds)}
    </div>`;
  bindGwChips(root);
}

function renderLiveSeason() {
  const wrap = document.getElementById('liveApp');
  if (!wrap) return;
  if (typeof setSectionCopy === 'function') {
    setSectionCopy('predictions', 'Predictions', '2026/27 · all 38 gameweeks · locks at kickoff');
  }
  const matches = liveMatches();
  if (liveGw == null) liveGw = getActiveGameweek(Date.now(), matches);
  const gw = liveGw;
  const gwMatches = matchesForGw(gw, matches);
  const me = LiveStore.state.currentPlayerId;
  const players = currentLivePlayers();
  const preds = LiveStore.state.predictions;
  const scoresOn = !!FootballAPI.lastSync && !FootballAPI.lastError;
  const gws = [...new Set(matches.map(m => m.gw))].sort((a, b) => a - b);
  const leagueMode = predBoardMode === 'league';

  const predictedCount = gwMatches.filter(m => (preds[me] || {})[m.id]).length;
  const lockedCount = gwMatches.filter(m => !canEditMatch(m)).length;
  const nextOpen = matches
    .filter(m => canEditMatch(m))
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))[0];
  const picksByGw = {};
  gws.forEach(g => {
    const rows = matchesForGw(g, matches);
    picksByGw[g] = rows.filter(m => (preds[me] || {})[m.id]).length;
  });

  const mineFixtures = gwMatches.map((m, i) => {
    const pred = (preds[me] || {})[m.id];
    const locked = !canEditMatch(m);
    const ko = formatKickoff(m.kickoff);
    const hasResult = m.actualHome != null && m.actualAway != null;
    const scored = hasResult ? scorePredict(pred, { home: m.actualHome, away: m.actualAway }) : null;
    const badges = {
      exact:   '<span class="badge exact">⭐ 3 PTS</span>',
      correct: '<span class="badge correct">✓ 1 PT</span>',
      wrong:   '<span class="badge wrong">✗ 0 PTS</span>',
      pending: '<span class="badge pend">—</span>',
    };
    return `<div class="pred-row live-match ${locked?'is-locked':''}" style="animation-delay:${i*0.03}s">
      <div class="pred-teams">
        <div class="pred-team">${crest(m.home)}<span class="pred-tnm">${m.home}</span></div>
        <div class="pred-scores-block">
          ${hasResult
            ? `<div class="pred-actual-score">${m.actualHome}–${m.actualAway}</div><div class="pred-ft">${m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 'LIVE' : 'RESULT'}</div>`
            : `<div class="pred-ft">${ko.when}</div>${fidsHtml(m.kickoff, 'LOCKS IN')}`}
        </div>
        <div class="pred-team right">${crest(m.away)}<span class="pred-tnm">${m.away}</span></div>
      </div>
      <div class="pred-right live-predict">
        <div class="pred-guess-label">${locked ? 'LOCKED PICK' : 'YOUR PICK'}</div>
        <div class="step-row" data-match="${m.id}">
          ${stepper(pred ? pred.home : 0, locked, `data-side="home"`)}
          <span class="step-dash">–</span>
          ${stepper(pred ? pred.away : 0, locked, `data-side="away"`)}
        </div>
        ${scored ? badges[scored.status] : ''}
        ${locked && !hasResult ? `<button class="mini-btn" data-enter-result="${m.id}">Enter result</button>` : ''}
      </div>
    </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="live-banner">
      <div class="live-banner-copy">
        <div class="live-kicker">Season ${SEASON_26.label} · ${matches.length} matches · 38 gameweeks</div>
        <div class="live-headline">${nextOpen ? `${nextOpen.home} vs ${nextOpen.away}` : 'Season underway'}</div>
        ${nextOpen ? fidsHtml(nextOpen.kickoff, 'LOCKS IN', 'lg') : '<div class="fids locked lg"><span class="fids-label">KICKOFF PASSED</span></div>'}
        <div class="live-sub">GW${gw}: ${predictedCount}/${gwMatches.length} predicted · ${lockedCount} locked · ${gwWindowLabel(gw, matches)}</div>
      </div>
      <div class="live-pills">
        <span class="live-pill ${scoresOn ? 'on' : ''}">${FootballAPI.lastError ? 'Scores offline' : 'Live scores on'}</span>
        <span class="live-pill">${FootballAPI.lastSync ? 'Synced ' + new Date(FootballAPI.lastSync).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : (FootballAPI.lastError || 'ESPN auto-sync')}</span>
      </div>
    </div>

    <div class="board-mode" role="tablist" aria-label="Prediction view">
      <button type="button" class="board-mode-btn ${!leagueMode?'on':''}" data-board-mode="mine">My picks</button>
      <button type="button" class="board-mode-btn ${leagueMode?'on':''}" data-board-mode="league">League board</button>
    </div>

    <div class="live-who" ${leagueMode ? 'hidden' : ''}>
      ${players.map(p => `<button class="ptab ${p.id===me?'active':''}" data-live-player="${p.id}">${p.name}${players.length>1?`<span class="ptab-x" data-remove-player="${p.id}" title="Remove ${p.name}">×</span>`:''}</button>`).join('')}
      <button class="ptab add" data-add-player>+ Add friend</button>
    </div>

    <div class="gw-board-wrap">
      <div class="gw-board-label">Jump to gameweek</div>
      <div class="gw-board" role="list">
        ${gws.map(g => `<button type="button" class="gw-chip ${g===gw?'on':''} ${picksByGw[g] ? 'has-picks' : ''}" data-gw="${g}" title="GW${g} · ${picksByGw[g] || 0}/10 predicted">${g}</button>`).join('')}
      </div>
      <div class="gw-switch">
        <button type="button" class="gw-btn" data-gw-step="-1" ${gw<=gws[0]?'disabled':''}>‹ Prev</button>
        <select class="gw-select" id="gwSelect">
          ${gws.map(g => `<option value="${g}" ${g===gw?'selected':''}>Gameweek ${g} · ${gwWindowLabel(g, matches)}</option>`).join('')}
        </select>
        <button type="button" class="gw-btn" data-gw-step="1" ${gw>=gws[gws.length-1]?'disabled':''}>Next ›</button>
      </div>
    </div>

    <div class="live-predict-head" id="livePredict">
      <div>
        <div class="chart-card-title">${leagueMode ? `League board · GW${gw}` : `Predict GW${gw}`}</div>
        <p class="muted">${gwWindowLabel(gw, matches)} · ${leagueMode ? 'everyone’s scorelines side by side' : '10 matches this gameweek'}</p>
      </div>
    </div>
    ${leagueMode
      ? `<div class="live-league-board">${everyonePicksTable(gwMatches, players, preds)}</div>`
      : `<div class="live-fixtures">${mineFixtures}</div>`}

    <div class="live-share">
      <div>
        <div class="chart-card-title">Share with the group</div>
        <p class="muted">Copy your league pack into WhatsApp. Friends tap Import and everyone’s predictions land on one board — no spreadsheet.</p>
      </div>
      <div class="share-actions">
        <button class="btn-g" data-export>Copy league code</button>
        <button class="btn-ghost" data-import>Import code</button>
        <button class="btn-ghost" data-wa>WhatsApp</button>
      </div>
    </div>

    <div class="live-recap chart-card">
      <div class="chart-card-title">GW${gw} recap</div>
      <pre class="recap-body" id="recapBody"></pre>
      <div class="share-actions">
        <button class="btn-g" data-copy-recap>Copy recap</button>
        <a class="btn-ghost" id="recapMail" href="#">Email recap</a>
      </div>
    </div>

    <details class="live-settings">
      <summary>Settings · Firebase, matchday email, lock override</summary>
      <p class="muted">Live FT / in-play scores load automatically from ESPN — no token. football-data.org only works on localhost (their API blocks GitHub Pages).</p>
      <label>football-data.org token (optional, localhost only)
        <input id="setToken" type="password" autocomplete="off" placeholder="Not needed on the live site" value="${LiveStore.state.settings.footballDataToken || ''}"/>
      </label>
      <label>League ID (same ID for the whole group)
        <input id="setLeague" type="text" value="${LiveStore.state.leagueId || 'PARTH'}"/>
      </label>
      <label>Firebase config (paste the whole snippet from the console — JS or JSON)
        <textarea id="setFb" rows="7" placeholder='const firebaseConfig = { apiKey: "...", projectId: "..." };'>${LiveStore.state.settings.firebaseConfig ? JSON.stringify(LiveStore.state.settings.firebaseConfig, null, 2) : ''}</textarea>
      </label>
      <label>Google Form URL (optional — in-app form is already live)
        <input id="setForm" type="url" placeholder="https://docs.google.com/forms/..." value="${LiveStore.state.settings.googleFormUrl || ''}"/>
      </label>
      <label>Matchday / recap emails (comma separated)
        <input id="setEmails" type="text" placeholder="akash@..., parth@..." value="${LiveStore.state.settings.recapEmails || ''}"/>
      </label>
      <label>Web3Forms access key (optional — auto-emails when a matchday finishes and the app is open)
        <input id="setWeb3" type="password" autocomplete="off" placeholder="From web3forms.com" value="${LiveStore.state.settings.web3formsKey || ''}"/>
      </label>
      <label class="check">
        <input id="setAutoMail" type="checkbox" ${LiveStore.state.settings.autoMatchdayEmail !== false ? 'checked' : ''}/> Auto matchday email when all games that day are FT
      </label>
      <label>PIN for ${players.find(p=>p.id===me)?.name || 'you'} (stops mates editing your picks)
        <input id="setPin" type="password" inputmode="numeric" maxlength="6" placeholder="Optional 4-digit PIN"/>
      </label>
      <label class="check">
        <input id="setLate" type="checkbox" ${LiveStore.state.settings.allowLate ? 'checked' : ''}/> Allow late predictions (testing only)
      </label>
      <button class="btn-g" data-save-settings>Save settings</button>
      <button class="btn-ghost" data-sync-api>Sync live scores now</button>
    </details>
    ${LiveStore.state.settings.googleFormUrl ? `<div class="form-embed"><iframe title="Google Form" src="${LiveStore.state.settings.googleFormUrl}"></iframe></div>` : ''}
  `;

  fillRecap(gw, matches, players, preds);

  wrap.querySelectorAll('[data-board-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      predBoardMode = btn.dataset.boardMode;
      renderLiveSeason();
    });
  });
  wrap.querySelectorAll('[data-live-player]').forEach(btn => {
    btn.addEventListener('click', () => switchLivePlayer(btn.dataset.livePlayer));
  });
  wrap.querySelector('[data-add-player]')?.addEventListener('click', addLivePlayer);
  wrap.querySelectorAll('[data-remove-player]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeLivePlayer(btn.dataset.removePlayer);
    });
  });
  wrap.querySelector('#gwSelect').addEventListener('change', (e) => {
    liveGw = Number(e.target.value); renderLiveSeason();
  });
  wrap.querySelectorAll('[data-gw-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = gw + Number(btn.dataset.gwStep);
      if (gws.includes(next)) { liveGw = next; renderLiveSeason(); }
    });
  });
  wrap.querySelectorAll('.gw-chip[data-gw]').forEach(btn => {
    btn.addEventListener('click', () => { liveGw = Number(btn.dataset.gw); renderLiveSeason(); });
  });
  if (!leagueMode) {
    wrap.querySelectorAll('.step-row').forEach(row => bindStepper(row, me, gwMatches));
    wrap.querySelectorAll('[data-enter-result]').forEach(btn => {
      btn.addEventListener('click', () => enterResult(btn.dataset.enterResult));
    });
  }
  wrap.querySelector('[data-export]').addEventListener('click', () => {
    copyText(LiveStore.exportCode()).then(() => toast('League code copied'));
  });
  wrap.querySelector('[data-import]').addEventListener('click', importLiveCode);
  wrap.querySelector('[data-wa]').addEventListener('click', () => {
    const text = encodeURIComponent('PL Predictions Pro league pack — paste this in the 2026/27 tab → Import:\n\n' + LiveStore.exportCode());
    window.open('https://wa.me/?text=' + text, '_blank');
  });
  wrap.querySelector('[data-copy-recap]').addEventListener('click', () => {
    copyText(document.getElementById('recapBody').textContent).then(() => toast('Recap copied'));
  });
  wrap.querySelector('[data-save-settings]').addEventListener('click', saveLiveSettings);
  wrap.querySelector('[data-sync-api]').addEventListener('click', () => syncLiveApi(true));

  if (liveTimer) clearInterval(liveTimer);
  liveTimer = setInterval(() => {
    const section = document.getElementById('s-predictions');
    if (!document.body.classList.contains('season-live') || !section?.classList.contains('active')) return;
    tickFids(wrap);
    if (wrap.querySelector('[data-just-locked="1"]') && !wrap.contains(document.activeElement)) {
      renderLiveSeason();
    }
  }, 1000);
}

function bindStepper(row, playerId, gwMatches) {
  const matchId = row.dataset.match;
  const match = gwMatches.find(m => m.id === matchId);
  if (!match) return;
  const locked = !canEditMatch(match);
  const read = () => {
    const inputs = [...row.querySelectorAll('.step-val')];
    return { home: clampScore(inputs[0].value), away: clampScore(inputs[1].value) };
  };
  const write = (side, next) => {
    const input = row.querySelector(`.step-val[data-side="${side}"]`);
    input.value = clampScore(next);
    persist();
  };
  const persist = () => {
    if (locked) return;
    const { home, away } = read();
    LiveStore.savePrediction(playerId, matchId, home, away);
  };
  row.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (locked) return;
      const side = btn.dataset.side;
      const input = row.querySelector(`.step-val[data-side="${side}"]`);
      write(side, Number(input.value || 0) + Number(btn.dataset.delta));
    });
  });
  row.querySelectorAll('.step-val').forEach(input => {
    input.addEventListener('change', persist);
    input.addEventListener('blur', persist);
  });
}

function clampScore(v) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(9, n));
}

function switchLivePlayer(id) {
  const pin = LiveStore.state.pins[id];
  if (pin) {
    const guess = prompt('PIN for this player?');
    if (!LiveStore.checkPin(id, guess)) { toast('Wrong PIN'); return; }
  }
  LiveStore.setCurrentPlayer(id);
  renderLiveSeason();
}

function addLivePlayer() {
  const name = prompt('Friend’s name?');
  if (!name) return;
  const id = LiveStore.addPlayer(name);
  if (id) {
    LiveStore.setCurrentPlayer(id);
    renderLiveSeason();
    toast(name.trim() + ' added');
  }
}

function removeLivePlayer(id) {
  const p = LiveStore.state.players.find(x => x.id === id);
  if (!p) return;
  if (LiveStore.state.players.length <= 1) { toast('Keep at least one player'); return; }
  if (!confirm('Remove ' + p.name + ' from the league? Their picks go with them.')) return;
  LiveStore.removePlayer(id).then(() => {
    renderLiveSeason();
    toast(p.name + ' removed');
  });
}

function enterResult(matchId) {
  const home = prompt('Full-time home goals?');
  if (home == null || home === '') return;
  const away = prompt('Full-time away goals?');
  if (away == null || away === '') return;
  LiveStore.saveResult(matchId, clampScore(home), clampScore(away), 'FINISHED');
  renderLiveSeason();
}

function importLiveCode() {
  const code = prompt('Paste a PLPP1. league code');
  if (!code) return;
  try {
    LiveStore.importCode(code);
    renderLiveSeason();
    toast('League pack imported');
  } catch (e) {
    toast(e.message);
  }
}

function saveLiveSettings() {
  const token = document.getElementById('setToken').value.trim();
  const leagueId = document.getElementById('setLeague').value.trim() || 'PARTH';
  const form = document.getElementById('setForm').value.trim();
  const emails = document.getElementById('setEmails').value.trim();
  const web3formsKey = document.getElementById('setWeb3')?.value.trim() || '';
  const autoMatchdayEmail = document.getElementById('setAutoMail')?.checked !== false;
  const pin = document.getElementById('setPin').value.trim();
  const allowLate = document.getElementById('setLate').checked;
  let firebaseConfig = null;
  const rawFb = document.getElementById('setFb').value.trim();
  if (rawFb) {
    try { firebaseConfig = parseFirebaseConfig(rawFb); }
    catch (e) { toast(e.message || 'Firebase JSON is invalid'); return; }
  }
  LiveStore.state.leagueId = leagueId;
  LiveStore.updateSettings({
    footballDataToken: token,
    googleFormUrl: form,
    recapEmails: emails,
    allowLate,
    firebaseConfig,
    web3formsKey,
    autoMatchdayEmail,
  });
  if (pin) LiveStore.setPin(LiveStore.state.currentPlayerId, pin);
  LiveStore.connectFirebase().then(ok => {
    if (firebaseConfig) toast(ok ? 'Firebase connected' : 'Firebase failed — local + share codes still work');
    else toast('Settings saved');
    renderLiveSeason();
    syncLiveApi(true);
  });
}

function fillRecap(gw, matches, players, preds) {
  const text = buildGwRecapText(gw, matches, players, preds);
  const body = document.getElementById('recapBody');
  if (body) body.textContent = text;
  const mail = document.getElementById('recapMail');
  if (mail) {
    const to = (LiveStore.state.settings.recapEmails || '').trim();
    mail.href = mailtoHref(to, 'PL Predictions Pro GW' + gw + ' recap', text);
  }
}

function liveGwChipBar(gws, gw, extra = '') {
  return `<div class="gw-board-wrap">
    <div class="gw-board-label">Gameweek</div>
    <div class="gw-board" role="list">
      ${gws.map(g => `<button type="button" class="gw-chip ${g===gw?'on':''}" data-gw="${g}">${g}</button>`).join('')}
    </div>
    ${extra}
  </div>`;
}

function bindGwChips(root) {
  root.querySelectorAll('[data-gw]').forEach(btn => {
    if (btn.classList.contains('step-btn') || btn.classList.contains('step-val')) return;
    btn.addEventListener('click', () => {
      liveGw = Number(btn.dataset.gw);
      if (typeof renderCurrent === 'function') renderCurrent();
    });
  });
}

function liveGwPoints(playerId, matches, predictions) {
  const gws = [...new Set(matches.map(m => m.gw))].sort((a, b) => a - b);
  return gws.map(gw => {
    let pts = 0, exact = 0, played = 0;
    matchesForGw(gw, matches).forEach(m => {
      if (m.actualHome == null || m.actualAway == null) return;
      const pred = (predictions[playerId] || {})[m.id];
      const scored = scorePredict(pred, { home: m.actualHome, away: m.actualAway });
      if (!pred) return;
      played++;
      pts += scored.pts;
      if (scored.status === 'exact') exact++;
    });
    return { gw, pts, exact, played };
  });
}

function renderLiveLeaderboardPage() {
  if (typeof setSectionCopy === 'function') {
    setSectionCopy('leaderboard', 'Season Leaderboard', '2026/27 live table · everyone’s picks');
  }
  const matches = liveMatches();
  const players = currentLivePlayers();
  const preds = LiveStore.state.predictions;
  const board = liveLeaderboard(players, matches, preds);
  const gw = liveGw || getActiveGameweek(Date.now(), matches);
  const finished = matches.filter(m => m.actualHome != null).length;
  const maxPts = Math.max(1, ...board.map(p => p.totalPts));
  document.getElementById('lbGrid').innerHTML = board.map((p, i) => {
    const gwPts = matchesForGw(gw, matches).reduce((n, m) => {
      if (m.actualHome == null) return n;
      return n + scorePredict((preds[p.id] || {})[m.id], { home: m.actualHome, away: m.actualAway }).pts;
    }, 0);
    return `<div class="lb-card rank-${i+1}">
      <div class="lb-bg-num">${i+1}</div>
      <div class="lb-medal">${['🥇','🥈','🥉'][i] || ''}</div>
      <div class="lb-name">${(p.name || '').toUpperCase()}</div>
      <div class="lb-handle">${p.handle || 'FRIEND'}</div>
      <div class="lb-stats">
        <div class="lb-stat"><div class="lb-val pts">${p.totalPts}</div><div class="lb-lbl">Points</div></div>
        <div class="lb-divider"></div>
        <div class="lb-stat"><div class="lb-val ex">${p.totalExact}</div><div class="lb-lbl">Exact</div></div>
        <div class="lb-divider"></div>
        <div class="lb-stat"><div class="lb-val gw">${gwPts}</div><div class="lb-lbl">GW${gw}</div></div>
      </div>
      <div class="lb-bar"><div class="lb-bar-fill" style="width:0" data-w="${Math.round(p.totalPts/maxPts*100)}"></div></div>
    </div>`;
  }).join('') || '<div class="muted">Add friends in Predictions, then scores will land here.</div>';
  const strip = document.getElementById('seasonStrip');
  if (strip) strip.innerHTML = `
    <div class="strip-item"><span class="strip-val">380</span><span class="strip-lbl">Matches</span></div>
    <div class="strip-item"><span class="strip-val">${finished}</span><span class="strip-lbl">Results in</span></div>
    <div class="strip-item"><span class="strip-val">${players.length}</span><span class="strip-lbl">Players</span></div>
    <div class="strip-item"><span class="strip-val">GW${gw}</span><span class="strip-lbl">Current</span></div>`;
  setTimeout(() => {
    document.querySelectorAll('#s-leaderboard .lb-bar-fill').forEach(el => el.style.width = el.dataset.w + '%');
  }, 60);
  renderGlobalBoard(document.getElementById('globalBoard'), matches, players, preds);
  renderMatchdayMailPanel(document.getElementById('matchdayMail'), matches, players, preds);
}

function renderLiveResultsPage() {
  const matches = liveMatches();
  if (liveGw == null) liveGw = getActiveGameweek(Date.now(), matches);
  const gw = liveGw;
  const gws = [...new Set(matches.map(m => m.gw))].sort((a, b) => a - b);
  const gwMatches = matchesForGw(gw, matches);
  if (typeof setSectionCopy === 'function') {
    setSectionCopy('results', 'Results', `2026/27 · Gameweek ${gw} · ${gwWindowLabel(gw, matches)}`);
  }
  const list = document.getElementById('matchesList');
  list.innerHTML = `
    ${liveGwChipBar(gws, gw)}
    <div class="matches-list">
      ${gwMatches.map((m, i) => {
        const has = m.actualHome != null && m.actualAway != null;
        const live = m.status === 'IN_PLAY' || m.status === 'PAUSED';
        return `<div class="match-row" style="animation-delay:${i*0.03}s">
          <div class="team-side">${crest(m.home)}<span class="team-nm">${m.home}</span></div>
          <div class="score-center">
            <div class="score-num">${has ? `${m.actualHome}–${m.actualAway}` : 'vs'}</div>
            <div class="score-ft">${has ? (live ? 'LIVE' : 'FT') : fxWhen(m.kickoff)}</div>
          </div>
          <div class="team-side away">${crest(m.away)}<span class="team-nm">${m.away}</span></div>
        </div>`;
      }).join('')}
    </div>
    <div class="season-board" style="margin-top:18px">
      <div class="chart-card-title">All ${matches.length} fixtures</div>
      <p class="muted">Tap a row to jump to that gameweek’s predictions.</p>
      <div class="season-scroll">
        ${gws.map(g => {
          const rows = matchesForGw(g, matches);
          return `<section class="fx-gw ${g===gw?'is-current':''}">
            <button type="button" class="fx-gw-head" data-gw="${g}">
              <strong>Gameweek ${g}</strong>
              <span>${gwWindowLabel(g, matches)}</span>
              <em>${rows.filter(m => m.actualHome != null).length}/${rows.length} results</em>
            </button>
            ${rows.map(m => {
              const hasResult = m.actualHome != null && m.actualAway != null;
              return `<button type="button" class="fx-row" data-jump-gw="${m.gw}">
                <span class="fx-when">${fxWhen(m.kickoff)}</span>
                <span class="fx-match"><span class="fx-home">${m.home}</span><span class="fx-vs">v</span><span class="fx-away">${m.away}</span></span>
                ${hasResult ? `<span class="fx-score">${m.actualHome}–${m.actualAway}</span>` : '<span class="muted">TBD</span>'}
              </button>`;
            }).join('')}
          </section>`;
        }).join('')}
      </div>
    </div>`;
  bindGwChips(list);
  list.querySelectorAll('[data-jump-gw]').forEach(btn => {
    btn.addEventListener('click', () => jumpToGw(btn.dataset.jumpGw));
  });
  const sc = list.querySelector('.season-scroll');
  const cur = list.querySelector('.fx-gw.is-current');
  if (sc && cur) sc.scrollTop = Math.max(0, cur.offsetTop - 8);
}

function renderLiveHistoryPage() {
  if (typeof setSectionCopy === 'function') {
    setSectionCopy('history', 'Season History', '2026/27 points as each gameweek finishes');
  }
  const matches = liveMatches();
  const players = currentLivePlayers();
  const preds = LiveStore.state.predictions;
  const active = getActiveGameweek(Date.now(), matches);
  const gws = [...new Set(matches.map(m => m.gw))].filter(g => g <= Math.max(active, 1)).sort((a, b) => a - b);
  const series = {};
  players.forEach(p => {
    let sum = 0;
    series[p.id] = liveGwPoints(p.id, matches, preds).filter(r => gws.includes(r.gw)).map(r => {
      sum += r.pts;
      return { ...r, total: sum };
    });
  });
  const W=900, H=180, pL=32, pR=16, pT=12, pB=24;
  const cW=W-pL-pR, cH=H-pT-pB;
  const max = Math.max(20, ...players.flatMap(p => series[p.id].map(r => r.total)));
  const tx = i => pL+(gws.length < 2 ? cW/2 : (i/(gws.length-1))*cW);
  const ty = v => pT+cH-Math.min(v/max,1)*cH;
  let paths='', dots='';
  players.forEach(p => {
    const c = (typeof playerColor === 'function' ? playerColor(p.id) : (COLORS[p.id] || '#00ff87'));
    const d = series[p.id].map((row,i) => `${i?'L':'M'}${tx(i).toFixed(1)},${ty(row.total).toFixed(1)}`).join(' ');
    paths += `<path fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
    series[p.id].forEach((row,i) => { dots += `<circle cx="${tx(i).toFixed(1)}" cy="${ty(row.total).toFixed(1)}" r="3.5" fill="${c}"/>`; });
  });
  const ticks = [0, Math.round(max/2), max];
  const gridLines = ticks.map(v =>
    `<line x1="${pL}" y1="${ty(v).toFixed(1)}" x2="${pL+cW}" y2="${ty(v).toFixed(1)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
     <text x="${pL-4}" y="${(ty(v)+4).toFixed(1)}" text-anchor="end" fill="#d4c6e0" font-size="11" font-family="Barlow,sans-serif">${v}</text>`
  ).join('');
  const labelEvery = gws.length > 12 ? 5 : 1;
  const xLabels = gws.map((gw,i) => (i % labelEvery === 0 || i === gws.length-1)
    ? `<text x="${tx(i).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#d4c6e0" font-size="11" font-family="Barlow,sans-serif">GW${gw}</text>`
    : '').join('');

  document.getElementById('historyChart').innerHTML = `
    <div class="chart-label">Points progression — 2026/27</div>
    <div class="chart-legend">
      ${players.map(p=>`<span style="display:flex;align-items:center;gap:5px;font-family:Barlow,sans-serif;font-size:14px;font-weight:600;color:${typeof playerColor==='function'?playerColor(p.id):(COLORS[p.id]||'#00ff87')}">
        <span style="width:18px;height:2.5px;background:${typeof playerColor==='function'?playerColor(p.id):(COLORS[p.id]||'#00ff87')};display:inline-block;border-radius:2px"></span>${p.name}</span>`).join('')}
    </div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible">
      ${gridLines}
      <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT+cH}" stroke="rgba(255,255,255,0.1)"/>
      ${paths}${dots}${xLabels}
    </svg>`;

  const board = liveLeaderboard(players, matches, preds);
  const byId = Object.fromEntries(board.map(p => [p.id, p]));
  const recentGws = gws.slice(-5);
  const recent = recentGws.map(gw => {
    const cells = players.map(p => {
      const row = series[p.id].find(r => r.gw === gw);
      const col = typeof playerColor === 'function' ? playerColor(p.id) : (COLORS[p.id] || '#00ff87');
      return `<td style="color:${col}">${row ? row.pts : 0}</td>`;
    }).join('');
    return `<tr><td>GW ${gw}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('historyTable').innerHTML = `
    <div class="tscroll">
      <table class="ptable">
        <thead><tr><th>Gameweek</th>${players.map(p => `<th>${p.name}</th>`).join('')}</tr></thead>
        <tbody>
          ${recent || '<tr><td colspan="8">No finished gameweeks yet.</td></tr>'}
          <tr style="border-top:1px solid rgba(255,255,255,0.1)">
            <td style="font-weight:800;color:var(--w)">SEASON TOTAL</td>
            ${players.map(p => `<td style="font-weight:800">${(byId[p.id] && byId[p.id].totalPts) || 0}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>`;
}

function renderLiveChartsPage() {
  if (typeof setSectionCopy === 'function') {
    setSectionCopy('charts', 'Stats & Charts', '2026/27 live breakdown');
  }
  const matches = liveMatches();
  const players = currentLivePlayers();
  const preds = LiveStore.state.predictions;
  const board = liveLeaderboard(players, matches, preds);
  const maxPts = Math.max(1, ...board.map(p => p.totalPts));
  const maxEx = Math.max(1, ...board.map(p => p.totalExact));
  const color = (id) => typeof playerColor === 'function' ? playerColor(id) : (COLORS[id] || '#00ff87');
  function bars(key, max) {
    return board.map(p => `
      <div class="bar-row">
        <span class="bar-lbl" style="color:${color(p.id)}">${p.name}</span>
        <div class="bar-track"><div class="bar-fill" style="background:${color(p.id)}" data-w="${Math.round((p[key]||0)/max*100)}"></div></div>
        <span class="bar-num" style="color:${color(p.id)}">${p[key]||0}</span>
      </div>`).join('');
  }
  const extras = board.map(p => {
    const miss = p.bestMiss
      ? `${p.bestMiss.pred.home}–${p.bestMiss.pred.away} vs ${p.bestMiss.match.actualHome}–${p.bestMiss.match.actualAway} (${p.bestMiss.match.home})`
      : 'waiting on results';
    return `<div class="extra-stat">
      <div class="extra-name" style="color:${color(p.id)}">${p.name}</div>
      <div class="extra-grid">
        <div><b>${p.bestRun || 0}</b><span>scoring run</span></div>
        <div><b>${p.totalExact}</b><span>exact</span></div>
        <div><b>${p.bestMiss ? p.bestMiss.goalDiff : '—'}</b><span>nearest miss</span></div>
      </div>
      <div class="extra-miss">${miss}</div>
    </div>`;
  }).join('');
  document.getElementById('chartsGrid').innerHTML = `
    <div class="chart-card">
      <div class="chart-card-title">Season points</div>
      <div class="bar-chart">${bars('totalPts', maxPts)}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">Exact scores</div>
      <div class="bar-chart">${bars('totalExact', maxEx)}</div>
    </div>
    <div class="chart-card extra-card">
      <div class="chart-card-title">Streaks &amp; nearest miss</div>
      ${extras || '<p class="muted">Charts fill in once results are scored.</p>'}
    </div>`;
  setTimeout(() => document.querySelectorAll('#s-charts .bar-fill').forEach(el => el.style.width = el.dataset.w + '%'), 60);
}

async function syncLiveApi(manual) {
  const gw = liveGw || getActiveGameweek();
  const res = await FootballAPI.syncGameweek(gw);
  if (manual) toast(res.ok ? (res.count ? `Updated ${res.count} score${res.count===1?'':'s'}` : 'API ok — no new scores yet') : (res.error || 'Sync failed'));
  if (typeof renderCurrent === 'function') renderCurrent();
  maybeAutoMatchdayEmail();
}

function bootLiveSeason() {
  LiveStore.load();
  LiveStore.connectFirebase();
  syncLiveApi(false);
  if (liveApiTimer) clearInterval(liveApiTimer);
  liveApiTimer = setInterval(() => {
    const matches = liveMatches();
    const live = matches.some(m => {
      const t = new Date(m.kickoff).getTime();
      return Date.now() >= t && (m.actualHome == null || m.status === 'IN_PLAY' || m.status === 'PAUSED');
    });
    if (live) syncLiveApi(false);
    else maybeAutoMatchdayEmail();
  }, 60000);
}
