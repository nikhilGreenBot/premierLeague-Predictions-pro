// PL PREDICTIONS PRO — APP

const MEDALS = ['🥇','🥈','🥉'];
const COLORS  = { parth:'#00ff87', akash:'#f5c518', dadhichi:'#00a8e1' };

// ── CREST: real logo → emoji fallback ──
function crest(name) {
  const url   = TEAM_LOGOS[name];
  const emoji = TEAM_EMOJI[name] || '⚽';
  const col   = TEAM_COLORS[name] || '#555';
  if (url) {
    return `<div class="crest"><img src="${url}" alt="${name}"
      onerror="this.parentNode.innerHTML='<span style=\\'font-size:20px\\'>${emoji}</span>';this.parentNode.style.background='${col}22';"></div>`;
  }
  return `<div class="crest" style="background:${col}22"><span style="font-size:20px">${emoji}</span></div>`;
}

// ── NAV ──
const tabs      = [...document.querySelectorAll('.nav-tab')];
const indicator = document.getElementById('navIndicator');
const order     = tabs.map(t => t.dataset.tab);
let   seasonId  = '2026-27';
let   pageId    = 'predictions';
let   curId     = 'predictions';
let   curIdx    = order.indexOf('predictions');

function isLiveSeason() {
  return seasonId === '2026-27';
}

function playerColor(id) {
  return COLORS[id] || '#7ae7c7';
}

function setSectionCopy(id, title, sub) {
  const sec = document.getElementById('s-' + id);
  if (!sec) return;
  const h = sec.querySelector('.section-title');
  const s = sec.querySelector('.section-sub');
  if (h) h.textContent = title;
  if (s) s.textContent = sub;
}

function updateSeasonChrome() {
  document.body.classList.toggle('season-live', isLiveSeason());
  document.body.classList.toggle('season-archive', !isLiveSeason());
  document.querySelectorAll('.season-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.season === seasonId);
  });
  const num = document.querySelector('.header-season-num');
  const champ = document.querySelector('.header-champion');
  if (isLiveSeason()) {
    if (num) num.textContent = '2026/27';
    if (champ) champ.textContent = '⚡ Live season';
  } else {
    if (num) num.textContent = '2025/26';
    if (champ) champ.textContent = '🔴 Arsenal Champions';
  }
}

function moveIndicator(tab) {
  if (!tab || !indicator) return;
  const ni = document.querySelector('.nav-inner');
  const tr = tab.getBoundingClientRect();
  const nr = ni.getBoundingClientRect();
  indicator.style.left  = (tr.left - nr.left + ni.scrollLeft) + 'px';
  indicator.style.width = tr.width + 'px';
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === 's-' + id);
    if (sec.id !== 's-' + id) sec.style.cssText = '';
  });
}

function goTo(id) {
  const idx = order.indexOf(id);
  if (idx < 0) return;
  const dir = idx > curIdx ? 1 : -1;
  const from = document.getElementById('s-' + curId);
  const to   = document.getElementById('s-' + id);
  if (!to) return;

  if (from && from !== to) {
    from.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    from.style.opacity    = '0';
    from.style.transform  = `translateX(${dir * -30}px)`;
    setTimeout(() => {
      from.classList.remove('active');
      from.style.cssText = '';
      to.classList.add('active');
      to.style.opacity   = '0';
      to.style.transform = `translateX(${dir * 30}px)`;
      to.style.transition = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        to.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        to.style.opacity    = '1';
        to.style.transform  = 'translateX(0)';
      }));
    }, 180);
  } else {
    showSection(id);
  }

  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  moveIndicator(tabs[idx]);
  curId  = id;
  curIdx = idx;
  pageId = id;
  renderCurrent();
}

function setSeason(id) {
  if (seasonId === id) return;
  seasonId = id;
  updateSeasonChrome();
  renderCurrent();
}

function renderCurrent() {
  updateSeasonChrome();
  if (isLiveSeason()) {
    if (LIVE_PAGES[pageId]) LIVE_PAGES[pageId]();
  } else if (RENDERERS[pageId]) {
    RENDERERS[pageId]();
  }
  const activeTab = tabs.find(t => t.dataset.tab === pageId);
  moveIndicator(activeTab || tabs[curIdx]);
}

tabs.forEach(t => t.addEventListener('click', () => goTo(t.dataset.tab)));
document.querySelectorAll('.season-tab').forEach(btn => {
  btn.addEventListener('click', () => setSeason(btn.dataset.season));
});

// ── ALL RENDERERS ──
const RENDERERS = {

  leaderboard() {
    setSectionCopy('leaderboard', 'Season Leaderboard', '2025/26 final standings · 38 gameweeks');
    const board  = getLeaderboard();
    const maxPts = board[0].totalPts;
    document.getElementById('lbGrid').innerHTML = board.map((p, i) => `
      <div class="lb-card rank-${i+1}">
        <div class="lb-bg-num">${i+1}</div>
        <div class="lb-medal">${MEDALS[i]}</div>
        <div class="lb-name">${p.name.toUpperCase()}</div>
        <div class="lb-handle">${p.handle}</div>
        <div class="lb-stats">
          <div class="lb-stat"><div class="lb-val pts">${p.totalPts}</div><div class="lb-lbl">Points</div></div>
          <div class="lb-divider"></div>
          <div class="lb-stat"><div class="lb-val ex">${p.totalExact}</div><div class="lb-lbl">Exact</div></div>
          <div class="lb-divider"></div>
          <div class="lb-stat"><div class="lb-val gw">${p.gw38Pts}</div><div class="lb-lbl">GW38</div></div>
        </div>
        <div class="lb-bar"><div class="lb-bar-fill" style="width:0" data-w="${Math.round(p.totalPts/maxPts*100)}"></div></div>
      </div>`).join('');
    const strip = document.getElementById('seasonStrip');
    if (strip) strip.innerHTML = `
      <div class="strip-item"><span class="strip-val">380</span><span class="strip-lbl">Matches</span></div>
      <div class="strip-item"><span class="strip-val">931</span><span class="strip-lbl">Goals</span></div>
      <div class="strip-item"><span class="strip-val">Haaland</span><span class="strip-lbl">Top Scorer</span></div>
      <div class="strip-item"><span class="strip-val">Arsenal</span><span class="strip-lbl">Champions</span></div>`;
    const gb = document.getElementById('globalBoard');
    if (gb) gb.innerHTML = '';
    const mm = document.getElementById('matchdayMail');
    if (mm) mm.innerHTML = '';
    setTimeout(() => {
      document.querySelectorAll('#s-leaderboard .lb-bar-fill').forEach(el => el.style.width = el.dataset.w + '%');
    }, 60);
  },

  results() {
    setSectionCopy('results', 'GW38 Results', '24 May 2026 · Final day');
    document.getElementById('matchesList').innerHTML = GW38_MATCHES.map((m, i) => `
      <div class="match-row" style="animation-delay:${i*0.04}s">
        <div class="team-side">${crest(m.home)}<span class="team-nm">${m.home}</span></div>
        <div class="score-center">
          <div class="score-num">${m.actualHome}–${m.actualAway}</div>
          <div class="score-ft">FT</div>
        </div>
        <div class="team-side away">${crest(m.away)}<span class="team-nm">${m.away}</span></div>
      </div>`).join('');
  },

  predictions() {
    setSectionCopy('predictions', 'Predictions', 'GW38 — all predictions vs actual');
    let pid = 'parth';
    const wrap = document.getElementById('predWrap');
    function buildTable() {
      const preds = PREDICTIONS[pid] || {};
      const rows = GW38_MATCHES.map(m => {
        const pred = preds[m.id];
        const res  = scorePredict(pred, { home: m.actualHome, away: m.actualAway });
        const badges = {
          exact:   '<span class="badge exact">⭐ 3 PTS</span>',
          correct: '<span class="badge correct">✓ 1 PT</span>',
          wrong:   '<span class="badge wrong">✗ 0 PTS</span>',
          pending: '<span class="badge pend">—</span>',
        };
        return `
          <div class="pred-row">
            <div class="pred-teams">
              <div class="pred-team">${crest(m.home)}<span class="pred-tnm">${m.home}</span></div>
              <div class="pred-scores-block">
                <div class="pred-actual-score">${m.actualHome}–${m.actualAway}</div>
                <div class="pred-ft">RESULT</div>
              </div>
              <div class="pred-team right">${crest(m.away)}<span class="pred-tnm">${m.away}</span></div>
            </div>
            <div class="pred-right">
              <div class="pred-guess-label">PREDICTED</div>
              <div class="pred-guess-score">${pred ? pred.home+'–'+pred.away : '?–?'}</div>
              ${badges[res.status]}
            </div>
          </div>`;
      }).join('');
      wrap.innerHTML = `
        <div class="ptabs">
          ${PLAYERS.map(p => `<button class="ptab${p.id===pid?' active':''}" data-pid="${p.id}">${p.name}</button>`).join('')}
        </div>
        <div class="pred-rows">${rows}</div>`;
      wrap.querySelectorAll('.ptab').forEach(b => b.addEventListener('click', () => {
        pid = b.dataset.pid; buildTable();
      }));
    }
    buildTable();
  },

  history() {
    setSectionCopy('history', 'Season History', '2025/26 points progression · 38 gameweeks');
    const gws  = [1,5,10,15,20,25,30,35,38];
    const data = {
      parth:    [8,27,60,95,130,165,196,231,236],
      akash:    [9,30,65,100,138,175,210,239,247],
      dadhichi: [6,22,50,82,113,148,175,202,202],
    };
    const W=900, H=180, pL=32, pR=16, pT=12, pB=24;
    const cW=W-pL-pR, cH=H-pT-pB, max=260;
    const tx = i => pL+(i/(gws.length-1))*cW;
    const ty = v => pT+cH-Math.min(v/max,1)*cH;
    let paths='', dots='';
    PLAYERS.forEach(p => {
      const c = COLORS[p.id];
      const d = data[p.id].map((v,i) => `${i?'L':'M'}${tx(i).toFixed(1)},${ty(v).toFixed(1)}`).join(' ');
      paths += `<path fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
      data[p.id].forEach((v,i) => { dots += `<circle cx="${tx(i).toFixed(1)}" cy="${ty(v).toFixed(1)}" r="3.5" fill="${c}"/>`; });
    });
    const gridLines = [0,65,130,195,260].map(v =>
      `<line x1="${pL}" y1="${ty(v).toFixed(1)}" x2="${pL+cW}" y2="${ty(v).toFixed(1)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/>
       <text x="${pL-4}" y="${(ty(v)+4).toFixed(1)}" text-anchor="end" fill="#a08cb0" font-size="9" font-family="Barlow Condensed,sans-serif">${v}</text>`
    ).join('');
    const xLabels = gws.map((gw,i) =>
      `<text x="${tx(i).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#a08cb0" font-size="9" font-family="Barlow Condensed,sans-serif">GW${gw}</text>`
    ).join('');

    document.getElementById('historyChart').innerHTML = `
      <div class="chart-label">Points Progression — Full Season</div>
      <div class="chart-legend">
        ${PLAYERS.map(p=>`<span style="display:flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;color:${COLORS[p.id]}">
          <span style="width:18px;height:2.5px;background:${COLORS[p.id]};display:inline-block;border-radius:2px"></span>${p.name}</span>`).join('')}
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible">
        ${gridLines}
        <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT+cH}" stroke="rgba(255,255,255,0.1)"/>
        ${paths}${dots}${xLabels}
      </svg>`;

    const board = getLeaderboard();
    const byId  = Object.fromEntries(board.map(p=>[p.id,p]));
    const recent = [34,35,36,37,38].map((gw,i) => {
      const pts = { parth:[4,8,6,12,5][i], akash:[5,9,7,13,8][i], dadhichi:[3,6,4,9,0][i] };
      return `<tr>
        <td>GW ${gw}</td>
        <td style="color:var(--g)">${pts.parth}</td>
        <td style="color:var(--gold)">${pts.akash}</td>
        <td style="color:var(--b)">${pts.dadhichi}</td>
      </tr>`;
    }).join('');
    document.getElementById('historyTable').innerHTML = `
      <div class="tscroll">
        <table class="ptable">
          <thead><tr><th>Gameweek</th><th style="color:var(--g)">Parth</th><th style="color:var(--gold)">Akash</th><th style="color:var(--b)">Dadhichi</th></tr></thead>
          <tbody>
            ${recent}
            <tr style="border-top:1px solid rgba(255,255,255,0.1)">
              <td style="font-weight:800;color:var(--w)">SEASON TOTAL</td>
              <td style="color:var(--g);font-weight:800">${byId.parth.totalPts}</td>
              <td style="color:var(--gold);font-weight:800">${byId.akash.totalPts}</td>
              <td style="color:var(--b);font-weight:800">${byId.dadhichi.totalPts}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
  },

  scoring() {
    setSectionCopy('scoring', 'Scoring Rules', 'Exact 3 · correct result 1 · miss 0');
    document.getElementById('scoringContent').innerHTML = `
      <div class="score-rule gold">
        <div class="sr-pts">3</div>
        <div class="sr-body">
          <div class="sr-title">Exact Scoreline</div>
          <div class="sr-desc">Predicted the exact home and away goals. Maximum points.</div>
        </div>
        <div class="sr-eg">e.g. predicted 2–1 · result 2–1</div>
      </div>
      <div class="score-rule green">
        <div class="sr-pts">1</div>
        <div class="sr-body">
          <div class="sr-title">Correct Result</div>
          <div class="sr-desc">Right outcome (Win / Draw / Loss) but wrong score.</div>
        </div>
        <div class="sr-eg">e.g. predicted 2–0 · result 3–1</div>
      </div>
      <div class="score-rule red">
        <div class="sr-pts">0</div>
        <div class="sr-body">
          <div class="sr-title">Wrong Result</div>
          <div class="sr-desc">Predicted outcome doesn't match at all.</div>
        </div>
        <div class="sr-eg">e.g. predicted 2–1 · result 1–2</div>
      </div>`;
  },

  charts() {
    setSectionCopy('charts', 'Stats & Charts', '2025/26 season breakdown');
    const board  = getLeaderboard();
    const maxPts = board[0].totalPts;
    const maxEx  = Math.max(...board.map(p=>p.totalExact));
    const maxGW  = Math.max(...board.map(p=>p.gw38Pts)) || 1;
    function bars(key, max) {
      return board.map(p => `
        <div class="bar-row">
          <span class="bar-lbl" style="color:${COLORS[p.id]}">${p.name}</span>
          <div class="bar-track"><div class="bar-fill" style="background:${COLORS[p.id]}" data-w="${Math.round(p[key]/max*100)}"></div></div>
          <span class="bar-num" style="color:${COLORS[p.id]}">${p[key]}</span>
        </div>`).join('');
    }
    const top    = board[0];
    const preds  = PREDICTIONS[top.id] || {};
    const counts = { exact:0, correct:0, wrong:0, pending:0 };
    GW38_MATCHES.forEach(m => { counts[scorePredict(preds[m.id], {home:m.actualHome,away:m.actualAway}).status]++; });
    const total=GW38_MATCHES.length, r=36, cx=50, cy=50, circ=2*Math.PI*r;
    const slices=[{k:'exact',c:'#f5c518'},{k:'correct',c:'#00ff87'},{k:'wrong',c:'rgba(255,59,48,0.7)'},{k:'pending',c:'rgba(255,255,255,0.1)'}].filter(s=>counts[s.k]>0);
    let off=0;
    const paths=slices.map(s=>{
      const dash=(counts[s.k]/total)*circ;
      const p=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.c}" stroke-width="13" stroke-dasharray="${dash.toFixed(1)} ${(circ-dash).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off+=dash; return p;
    }).join('');
    const legend=slices.map(s=>`<div class="dl"><div class="dd" style="background:${s.c}"></div><span class="dt">${s.k}</span><span class="dv">${counts[s.k]}</span></div>`).join('');
    const extras = board.map(p => {
      const s = gw38PlayerStats(p.id);
      const form = seasonFormStreak(p.id);
      const miss = s.bestMiss
        ? `${s.bestMiss.pred.home}–${s.bestMiss.pred.away} vs ${s.bestMiss.match.actualHome}–${s.bestMiss.match.actualAway} (${s.bestMiss.match.home})`
        : (s.pending === GW38_MATCHES.length ? 'no GW38 picks' : 'exact week');
      return `<div class="extra-stat">
        <div class="extra-name" style="color:${COLORS[p.id]}">${p.name}</div>
        <div class="extra-grid">
          <div><b>${s.bestRun}</b><span>GW38 scoring run</span></div>
          <div><b>${form.streak}</b><span>GW pts streak</span></div>
          <div><b>${s.bestMiss ? s.bestMiss.goalDiff : '—'}</b><span>nearest miss</span></div>
        </div>
        <div class="extra-miss">${miss}</div>
      </div>`;
    }).join('');
    document.getElementById('chartsGrid').innerHTML = `
      <div class="chart-card">
        <div class="chart-card-title">Season Points</div>
        <div class="bar-chart">${bars('totalPts', maxPts)}</div>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Exact Scores (Season)</div>
        <div class="bar-chart">${bars('totalExact', maxEx)}</div>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">GW38 Points</div>
        <div class="bar-chart">${bars('gw38Pts', maxGW)}</div>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">GW38 Breakdown · ${top.name}</div>
        <div class="donut-wrap">
          <svg viewBox="0 0 100 100" style="width:90px;height:90px;flex-shrink:0">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="13"/>
            ${paths}
          </svg>
          <div class="donut-legend">${legend}</div>
        </div>
      </div>
      <div class="chart-card extra-card">
        <div class="chart-card-title">Streaks &amp; nearest miss · GW38</div>
        ${extras}
      </div>`;
    setTimeout(() => document.querySelectorAll('#s-charts .bar-fill').forEach(el => el.style.width = el.dataset.w + '%'), 60);
  },

};

const LIVE_PAGES = {
  leaderboard() { renderLiveLeaderboardPage(); },
  results() { renderLiveResultsPage(); },
  predictions() { renderLiveSeason(); },
  history() { renderLiveHistoryPage(); },
  scoring() {
    RENDERERS.scoring();
    setSectionCopy('scoring', 'Scoring Rules', '2026/27 · exact 3 · correct result 1 · miss 0');
  },
  charts() { renderLiveChartsPage(); },
};

// ── BOOT ──
function ensureEplBg() {
  if (document.getElementById('eplBg') || typeof ARSENAL_BG === 'undefined') return;
  const div = document.createElement('div');
  div.id = 'eplBg';
  div.className = 'epl-photo-bg';
  div.style.backgroundImage = `url(${ARSENAL_BG})`;
  document.body.prepend(div);
}

window.addEventListener('DOMContentLoaded', () => {
  ensureEplBg();
  bootLiveSeason();
  updateSeasonChrome();
  showSection(pageId);
  renderCurrent();
  requestAnimationFrame(() => moveIndicator(tabs.find(t => t.dataset.tab === pageId)));
});
