// 2026/27 live season UI

let liveGw = null;
let liveTimer = null;
let liveApiTimer = null;

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
  const firstKo = formatKickoff(SEASON_26.kickoff);
  const apiOn = !!FootballAPI.token();
  const gws = [...new Set(matches.map(m => m.gw))];

  const predictedCount = gwMatches.filter(m => (preds[me] || {})[m.id]).length;
  const lockedCount = gwMatches.filter(m => !canEditMatch(m)).length;

  wrap.innerHTML = `
    <div class="live-banner">
      <div>
        <div class="live-kicker">Season ${SEASON_26.label} · Gameweek ${gw}</div>
        <div class="live-headline">${firstKo.locked ? 'Season underway' : 'First whistle: ' + firstKo.when}</div>
        <div class="live-sub">${predictedCount}/${gwMatches.length} predicted · ${lockedCount} locked · ${apiOn ? 'Live scores on' : 'Bundled fixtures'}</div>
      </div>
      <div class="live-pills">
        <span class="live-pill ${apiOn ? 'on' : ''}">${apiOn ? 'API live' : 'Add API token for live scores'}</span>
        <span class="live-pill">${FootballAPI.lastSync ? 'Synced ' + new Date(FootballAPI.lastSync).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : (FootballAPI.lastError || 'Share codes work offline')}</span>
      </div>
    </div>

    <div class="live-who">
      ${players.map(p => `<button class="ptab ${p.id===me?'active':''}" data-live-player="${p.id}">${p.name}${players.length>1?`<span class="ptab-x" data-remove-player="${p.id}" title="Remove ${p.name}">×</span>`:''}</button>`).join('')}
      <button class="ptab add" data-add-player>+ Add friend</button>
    </div>

    <div class="gw-switch">
      ${gws.map(g => `<button class="gw-btn ${g===gw?'active':''}" data-gw="${g}">GW ${g}</button>`).join('')}
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
                : `<div class="pred-ft">${ko.when}</div><div class="lock-tag ${ko.locked?'hot':''}">${ko.label}</div>`}
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
      <summary>Settings · API, Firebase, Google Form, lock override</summary>
      <label>football-data.org token
        <input id="setToken" type="password" autocomplete="off" placeholder="Paste free API token" value="${LiveStore.state.settings.footballDataToken || ''}"/>
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
  wrap.querySelectorAll('[data-gw]').forEach(btn => {
    btn.addEventListener('click', () => { liveGw = Number(btn.dataset.gw); renderLiveSeason(); });
  });
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
    if (wrap.contains(document.activeElement)) return;
    renderLiveSeason();
  }, 60000);
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
    if (live && FootballAPI.token()) syncLiveApi(false);
  }, 60000);
}
