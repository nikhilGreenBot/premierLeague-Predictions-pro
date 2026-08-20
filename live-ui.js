// 2026/27 live season UI

let liveGw = null;
let liveTimer = null;
let liveApiTimer = null;
let liveShowSeason = true;

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
  renderLiveSeason();
  requestAnimationFrame(() => {
    document.getElementById('livePredict')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const sc = document.querySelector('.season-scroll');
    const cur = document.querySelector('.fx-gw.is-current');
    if (sc && cur) sc.scrollTop = Math.max(0, cur.offsetTop - 8);
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

function renderLiveSeason() {
  const wrap = document.getElementById('liveApp');
  if (!wrap) return;
  const matches = liveMatches();
  if (liveGw == null) liveGw = getActiveGameweek(Date.now(), matches);
  const gw = liveGw;
  const gwMatches = matchesForGw(gw, matches);
  const me = LiveStore.state.currentPlayerId;
  const players = currentLivePlayers();
  const preds = LiveStore.state.predictions;
  const board = liveLeaderboard(players, matches, preds);
  const meRow = board.find(p => p.id === me) || board[0];
  const scoresOn = !!FootballAPI.lastSync && !FootballAPI.lastError;
  const gws = [...new Set(matches.map(m => m.gw))].sort((a, b) => a - b);

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

    <div class="live-who">
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

    <div class="live-lb">
      ${board.map((p,i) => `<div class="live-lb-card ${p.id===me?'me':''}">
        <span class="live-rank">${['🥇','🥈','🥉'][i] || (i+1)}</span>
        <span class="live-lb-name">${p.name}</span>
        <span class="live-lb-pts" style="color:${COLORS[p.id]||'var(--g)'}">${p.totalPts} pts</span>
        <span class="live-lb-ex">${p.totalExact} exact</span>
      </div>`).join('') || '<div class="muted">No scored matches yet — predict GW1 before Friday.</div>'}
    </div>

    <div class="live-stats">
      <div class="stat-chip"><span>🔥 Streak</span><strong>${meRow ? meRow.bestRun : 0}</strong><em>scoring run</em></div>
      <div class="stat-chip"><span>🎯 Nearest miss</span><strong>${meRow && meRow.bestMiss ? meRow.bestMiss.goalDiff : '—'}</strong><em>${meRow && meRow.bestMiss ? meRow.bestMiss.match.home + ' vs ' + meRow.bestMiss.match.away : 'waiting on results'}</em></div>
      <div class="stat-chip"><span>⭐ Exact</span><strong>${meRow ? meRow.totalExact : 0}</strong><em>this season</em></div>
    </div>

    <div class="live-predict-head" id="livePredict">
      <div>
        <div class="chart-card-title">Predict GW${gw}</div>
        <p class="muted">${gwWindowLabel(gw, matches)} · 10 matches this gameweek</p>
      </div>
    </div>
    <div class="live-fixtures">
      ${gwMatches.map((m, i) => {
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
      }).join('')}
    </div>

    <div class="season-board">
      <div class="season-board-top">
        <div>
          <div class="chart-card-title">All ${matches.length} fixtures</div>
          <p class="muted">Every gameweek in 2026/27. Tap a match to open that GW’s prediction card.</p>
        </div>
        <button type="button" class="btn-ghost" data-toggle-season>${liveShowSeason ? 'Hide list' : 'Show full season'}</button>
      </div>
      ${liveShowSeason ? `<div class="season-scroll">
        ${gws.map(g => {
          const rows = matchesForGw(g, matches);
          return `<section class="fx-gw ${g===gw?'is-current':''}">
            <button type="button" class="fx-gw-head" data-jump-gw="${g}">
              <strong>Gameweek ${g}</strong>
              <span>${gwWindowLabel(g, matches)}</span>
              <em>${picksByGw[g] || 0}/${rows.length} predicted</em>
            </button>
            ${rows.map(m => {
              const hasResult = m.actualHome != null && m.actualAway != null;
              return `<button type="button" class="fx-row" data-jump-gw="${m.gw}">
                <span class="fx-when">${fxWhen(m.kickoff)}</span>
                <span class="fx-match"><span class="fx-home">${m.home}</span><span class="fx-vs">v</span><span class="fx-away">${m.away}</span></span>
                ${hasResult
                  ? `<span class="fx-score">${m.actualHome}–${m.actualAway}</span>`
                  : fidsHtml(m.kickoff, 'LOCKS IN')}
              </button>`;
            }).join('')}
          </section>`;
        }).join('')}
      </div>` : ''}
    </div>

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
      <summary>Settings · Firebase, lock override, optional APIs</summary>
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
      <label>Recap emails (comma separated)
        <input id="setEmails" type="text" placeholder="akash@..., parth@..." value="${LiveStore.state.settings.recapEmails || ''}"/>
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

  wrap.querySelectorAll('[data-live-player]').forEach(btn => {
    btn.addEventListener('click', () => switchLivePlayer(btn.dataset.livePlayer));
  });
  wrap.querySelector('[data-add-player]').addEventListener('click', addLivePlayer);
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
  wrap.querySelectorAll('[data-jump-gw]').forEach(btn => {
    btn.addEventListener('click', () => jumpToGw(btn.dataset.jumpGw));
  });
  wrap.querySelector('[data-toggle-season]')?.addEventListener('click', () => {
    liveShowSeason = !liveShowSeason;
    renderLiveSeason();
  });
  const sc = wrap.querySelector('.season-scroll');
  const cur = wrap.querySelector('.fx-gw.is-current');
  if (sc && cur) sc.scrollTop = Math.max(0, cur.offsetTop - 8);
  wrap.querySelectorAll('.step-row').forEach(row => bindStepper(row, me, gwMatches));
  wrap.querySelectorAll('[data-enter-result]').forEach(btn => {
    btn.addEventListener('click', () => enterResult(btn.dataset.enterResult));
  });
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
    const section = document.getElementById('s-newseason');
    if (!section?.classList.contains('active')) return;
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
  const pin = document.getElementById('setPin').value.trim();
  const allowLate = document.getElementById('setLate').checked;
  let firebaseConfig = null;
  const rawFb = document.getElementById('setFb').value.trim();
  if (rawFb) {
    try { firebaseConfig = parseFirebaseConfig(rawFb); }
    catch (e) { toast(e.message || 'Firebase JSON is invalid'); return; }
  }
  LiveStore.state.leagueId = leagueId;
  LiveStore.updateSettings({ footballDataToken: token, googleFormUrl: form, recapEmails: emails, allowLate, firebaseConfig });
  if (pin) LiveStore.setPin(LiveStore.state.currentPlayerId, pin);
  LiveStore.connectFirebase().then(ok => {
    if (firebaseConfig) toast(ok ? 'Firebase connected' : 'Firebase failed — local + share codes still work');
    else toast('Settings saved');
    renderLiveSeason();
    syncLiveApi(true);
  });
}

function fillRecap(gw, matches, players, preds) {
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
  lines.push('', 'Scoring: exact 3 · correct result 1 · miss 0');
  const text = lines.join('\n');
  const body = document.getElementById('recapBody');
  if (body) body.textContent = text;
  const mail = document.getElementById('recapMail');
  if (mail) {
    const to = (LiveStore.state.settings.recapEmails || '').trim();
    mail.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent('PL Predictions Pro GW'+gw+' recap')}&body=${encodeURIComponent(text)}`;
  }
}

async function syncLiveApi(manual) {
  const gw = liveGw || getActiveGameweek();
  const res = await FootballAPI.syncGameweek(gw);
  if (manual) toast(res.ok ? (res.count ? `Updated ${res.count} score${res.count===1?'':'s'}` : 'API ok — no new scores yet') : (res.error || 'Sync failed'));
  if (document.getElementById('s-newseason')?.classList.contains('active')) renderLiveSeason();
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
  }, 60000);
}
