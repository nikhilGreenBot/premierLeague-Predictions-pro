// ═══════════════════════════════════════════
// PL PREDICTIONS PRO — APP v3
// Password gate · 6-tab nav · Apple animation
// ═══════════════════════════════════════════

const PASSWORD = 'nangaNaach';
const MEDALS   = ['🥇','🥈','🥉'];
const MAX_PTS  = 76;

// ──────────────────────────────
// HELPERS
// ──────────────────────────────
function teamCrestHTML(name, size = 36) {
  const url   = TEAM_CRESTS[name];
  const color = TEAM_COLORS[name] || '#555';
  const abbr  = name
    .replace("Nott'm Forest","NF").replace('Crystal Palace','CP')
    .replace('Aston Villa','AV').replace('Man City','MC')
    .replace('Man Utd','MU').replace('West Ham','WH')
    .replace('Newcastle','NEW').replace('Bournemouth','BOU')
    .replace('Brentford','BRE').replace('Sunderland','SUN')
    .split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();

  const id = `crest-${name.replace(/[^a-z]/gi,'_')}`;
  return url
    ? `<div class="match-crest" id="${id}">
         <img src="${url}" alt="${name}"
           onerror="this.parentElement.innerHTML='${abbr}';
                    this.parentElement.className='match-crest fallback';
                    this.parentElement.style.background='${color}33';" />
       </div>`
    : `<div class="match-crest fallback" style="background:${color}33">${abbr}</div>`;
}

// ──────────────────────────────
// PASSWORD GATE
// ──────────────────────────────
const gateOverlay = document.getElementById('gateOverlay');
const gateInput   = document.getElementById('gateInput');
const gateBalls   = document.getElementById('gateBalls');
const gateErrWrap = document.getElementById('gateErrorWrap');
const gateErr     = document.getElementById('gateError');
const gateSubmit  = document.getElementById('gateSubmit');

function syncBalls(val) {
  const curr = gateBalls.querySelectorAll('.gate-ball').length;
  const count = val.length;

  // Clear empty state
  const emptyEl = gateBalls.querySelector('.gate-balls-empty');
  if (count > 0 && emptyEl) emptyEl.remove();
  if (count === 0 && !emptyEl) {
    gateBalls.innerHTML = '<span class="gate-balls-empty">Enter your password below</span>';
    return;
  }

  if (count > curr) {
    for (let i = curr; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'gate-ball';
      b.textContent = '⚽';
      gateBalls.appendChild(b);
    }
  } else if (count < curr) {
    for (let i = curr; i > count; i--) {
      const last = gateBalls.querySelector('.gate-ball:last-child');
      if (last) last.remove();
    }
  }
}

function showError(msg) {
  gateErr.textContent = msg;
  gateErrWrap.classList.add('visible');
  gateInput.classList.add('error');
  setTimeout(() => {
    gateInput.classList.remove('error');
    gateErrWrap.classList.remove('visible');
  }, 2200);
}

function tryUnlock() {
  if (gateInput.value === PASSWORD) {
    doUnlock();
  } else {
    showError('Wrong password. Try again.');
    gateInput.value = '';
    syncBalls('');
    gateInput.focus();
  }
}

function doUnlock() {
  // Victory spin on all balls
  gateBalls.querySelectorAll('.gate-ball').forEach((b, i) => {
    setTimeout(() => {
      b.style.transform = 'scale(1.3) rotate(360deg)';
      b.style.transition = 'transform 0.3s ease';
    }, i * 50);
  });

  setTimeout(() => {
    gateOverlay.classList.add('unlocking');
    const app = document.getElementById('app');
    app.style.opacity = '0';
    app.style.pointerEvents = 'auto';
    app.style.display = 'flex';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        app.style.transition = 'opacity 0.5s ease';
        app.style.opacity = '1';
      });
    });

    setTimeout(() => {
      gateOverlay.style.display = 'none';
      initApp();
    }, 550);
  }, 450);
}

gateInput.addEventListener('input', () => {
  syncBalls(gateInput.value);
  gateInput.classList.remove('error');
  gateErrWrap.classList.remove('visible');
  // auto-unlock if correct length and matches
  if (gateInput.value === PASSWORD) doUnlock();
});

gateInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') tryUnlock();
});

gateSubmit.addEventListener('click', tryUnlock);

// Focus on load
setTimeout(() => gateInput.focus(), 300);

// ──────────────────────────────
// NAVIGATION
// ──────────────────────────────
const tabs      = Array.from(document.querySelectorAll('.nav-tab'));
const sections  = Array.from(document.querySelectorAll('.section'));
const indicator = document.getElementById('navIndicator');

let currentSection = 'leaderboard';
let currentIdx     = 0;
let sectionOrder   = tabs.map(t => t.dataset.section);

function moveIndicator(tab) {
  const navInner = document.querySelector('.nav-inner');
  const tabRect  = tab.getBoundingClientRect();
  const navRect  = navInner.getBoundingClientRect();
  indicator.style.left  = (tabRect.left - navRect.left + navInner.scrollLeft) + 'px';
  indicator.style.width = tabRect.width + 'px';
}

function switchSection(targetId, animate = true) {
  const targetIdx = sectionOrder.indexOf(targetId);
  const direction = targetIdx > currentIdx ? 'left' : 'right';

  const current = document.getElementById('section-' + currentSection);
  const target  = document.getElementById('section-' + targetId);

  if (current === target) return;

  if (animate) {
    // Exit current
    current.classList.add(direction === 'left' ? 'exit-left' : 'exit-right');
    current.classList.remove('active');

    // Enter target
    target.classList.add(direction === 'left' ? 'enter-left' : 'enter-right');
    target.style.display = 'block';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        target.classList.remove('enter-left', 'enter-right');
        target.classList.add('active');
        current.classList.remove('exit-left', 'exit-right');
      });
    });
  } else {
    current.classList.remove('active');
    target.classList.add('active');
  }

  // Update tabs
  tabs.forEach(t => t.classList.toggle('active', t.dataset.section === targetId));
  moveIndicator(tabs[targetIdx]);

  currentSection = targetId;
  currentIdx     = targetIdx;

  // Lazy render
  renderSection(targetId);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchSection(tab.dataset.section));
});

// ──────────────────────────────
// SECTION RENDERERS
// ──────────────────────────────
const rendered = new Set();

function renderSection(id) {
  if (rendered.has(id)) return;
  rendered.add(id);
  ({
    leaderboard:  renderLeaderboard,
    results:      renderResults,
    predictions:  renderPredictions,
    history:      renderHistory,
    scoring:      renderScoring,
    charts:       renderCharts,
  })[id]?.();
}

// LEADERBOARD
function renderLeaderboard() {
  const board = db.getLeaderboard();
  const grid  = document.getElementById('lbGrid');

  grid.innerHTML = board.map((p, i) => {
    const barW = Math.round((p.totalPts / MAX_PTS) * 100);
    return `
      <div class="lb-card rank-${i+1}">
        <div class="lb-rank-bg">${i+1}</div>
        <span class="lb-medal">${MEDALS[i]}</span>
        <div class="lb-name">${p.name.toUpperCase()}</div>
        <div class="lb-handle">${p.handle}</div>
        <div class="lb-stats">
          <div class="lb-stat">
            <span class="lb-stat-val pts">${p.totalPts}</span>
            <span class="lb-stat-lbl">Points</span>
          </div>
          <div class="lb-stat-div"></div>
          <div class="lb-stat">
            <span class="lb-stat-val ex">${p.totalExact}</span>
            <span class="lb-stat-lbl">Exact</span>
          </div>
          <div class="lb-stat-div"></div>
          <div class="lb-stat">
            <span class="lb-stat-val gw">${p.gw38Pts}</span>
            <span class="lb-stat-lbl">GW38</span>
          </div>
        </div>
        <div class="lb-bar">
          <div class="lb-bar-fill" data-w="${barW}"></div>
        </div>
      </div>`;
  }).join('');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.lb-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }));
}

// RESULTS
function renderResults() {
  const list = document.getElementById('matchesList');
  list.innerHTML = GW38_MATCHES.map((m, idx) => `
    <div class="match-row" style="animation-delay:${idx*0.04}s">
      <div class="match-team-side home">
        ${teamCrestHTML(m.home)}
        <span class="match-team-name">${m.home}</span>
      </div>
      <div class="match-score-center">
        <div class="match-score-num">${m.actualHome}–${m.actualAway}</div>
        <div class="match-ft">FT</div>
      </div>
      <div class="match-team-side away">
        ${teamCrestHTML(m.away)}
        <span class="match-team-name">${m.away}</span>
      </div>
    </div>`).join('');
}

// PREDICTIONS
let activePredPlayer = PLAYERS[0].id;

function renderPredictions() {
  const wrap = document.getElementById('predTableWrap');

  const tabsHTML = PLAYERS.map(p => `
    <button class="pred-player-tab ${p.id === activePredPlayer ? 'active' : ''}"
            data-pid="${p.id}">${p.name}</button>`).join('');

  wrap.innerHTML = `
    <div class="pred-player-tabs" id="predPlayerTabs">${tabsHTML}</div>
    <div id="predTableInner"></div>`;

  document.getElementById('predPlayerTabs').addEventListener('click', e => {
    const btn = e.target.closest('.pred-player-tab');
    if (!btn) return;
    activePredPlayer = btn.dataset.pid;
    document.querySelectorAll('.pred-player-tab').forEach(b => b.classList.toggle('active', b.dataset.pid === activePredPlayer));
    renderPredTable(activePredPlayer);
  });

  renderPredTable(activePredPlayer);
}

function renderPredTable(playerId) {
  const preds = PREDICTIONS[playerId] || {};
  const rows  = GW38_MATCHES.map(m => {
    const pred   = preds[m.id];
    const actual = { home: m.actualHome, away: m.actualAway };
    const result = pred ? scorePredict(pred, actual) : { pts:0, status:'pending' };
    const predStr = pred ? `${pred.home}–${pred.away}` : '?–?';
    const badge = result.status === 'exact'   ? '<span class="pred-badge exact">⭐ 3 PTS</span>'
                : result.status === 'correct' ? '<span class="pred-badge correct">✓ 1 PT</span>'
                : result.status === 'wrong'   ? '<span class="pred-badge wrong">✗ 0 PTS</span>'
                : '<span class="pred-badge pending">—</span>';
    return `
      <tr>
        <td class="pred-match-name">${m.home} vs ${m.away}</td>
        <td class="pred-actual">${m.actualHome}–${m.actualAway}</td>
        <td class="pred-score-cell">${predStr}</td>
        <td>${badge}</td>
      </tr>`;
  }).join('');

  document.getElementById('predTableInner').innerHTML = `
    <div class="pred-table-wrap">
      <table class="pred-table">
        <thead>
          <tr>
            <th>Match</th>
            <th>Result</th>
            <th>Predicted</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// HISTORY — synthetic GW points (cumulative mock data showing season arc)
function renderHistory() {
  const gws = [1,5,10,15,20,25,30,35,38];
  // Cumulative points at each checkpoint (seeded to end at final season totals)
  const data = {
    parth:    [4, 14, 24, 32, 40, 46, 50, 54, 55],
    akash:    [3, 12, 22, 28, 35, 40, 45, 49, 51],
    dadhichi: [2, 10, 18, 24, 28, 33, 37, 40, 39],
  };
  const colors = { parth: '#00ff87', akash: '#f5c518', dadhichi: '#00a8e1' };

  // SVG line chart
  const W = 1000, H = 200;
  const padL = 30, padR = 20, padT = 20, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxPts = 60;

  function toX(i) { return padL + (i / (gws.length-1)) * chartW; }
  function toY(v) { return padT + chartH - (v / maxPts) * chartH; }

  let svgPaths = '';
  let svgDots  = '';

  PLAYERS.forEach(p => {
    const pts = data[p.id];
    const col = colors[p.id];
    const d   = pts.map((v, i) => `${i===0?'M':'L'}${toX(i)},${toY(v)}`).join(' ');
    svgPaths += `<path class="chart-line" d="${d}" stroke="${col}" opacity="0.85"/>`;
    pts.forEach((v, i) => {
      svgDots += `<circle cx="${toX(i)}" cy="${toY(v)}" r="4" fill="${col}" opacity="0.9"/>`;
    });
  });

  // X axis labels
  let xLabels = gws.map((gw, i) =>
    `<text x="${toX(i)}" y="${H-6}" text-anchor="middle" fill="#a08cb0" font-size="10" font-family="Barlow Condensed, sans-serif">GW${gw}</text>`
  ).join('');

  document.getElementById('historyChart').innerHTML = `
    <div style="font-family:var(--font-c);font-size:11px;font-weight:700;letter-spacing:3px;color:var(--dim);margin-bottom:12px;text-transform:uppercase;">Points Progression</div>
    <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap;">
      ${PLAYERS.map(p=>`<div style="display:flex;align-items:center;gap:6px;font-family:var(--font-c);font-size:12px;font-weight:700;letter-spacing:2px;color:${colors[p.id]}">${p.name}</div>`).join('')}
    </div>
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT+chartH}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <line x1="${padL}" y1="${padT+chartH}" x2="${padL+chartW}" y2="${padT+chartH}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      ${[0,20,40,60].map(v=>`<line x1="${padL}" y1="${toY(v)}" x2="${padL+chartW}" y2="${toY(v)}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4"/><text x="${padL-4}" y="${toY(v)+4}" text-anchor="end" fill="#a08cb0" font-size="9" font-family="Barlow Condensed,sans-serif">${v}</text>`).join('')}
      ${svgPaths}${svgDots}${xLabels}
    </svg>`;

  // GW breakdown table (last 5 GWs simulated)
  const gwRows = [34,35,36,37,38].map(gw => {
    const pts = {
      parth:    [3,4,2,4,3][gw-34],
      akash:    [2,3,4,2,2][gw-34],
      dadhichi: [1,2,1,0,0][gw-34],
    };
    return `<tr>
      <td>GW ${gw}</td>
      <td style="color:var(--green)">${pts.parth}</td>
      <td style="color:var(--gold)">${pts.akash}</td>
      <td style="color:var(--blue)">${pts.dadhichi}</td>
    </tr>`;
  }).join('');

  // Totals row
  const board = db.getLeaderboard();
  const byId  = Object.fromEntries(board.map(p=>[p.id,p]));

  document.getElementById('historyTable').innerHTML = `
    <table>
      <thead><tr>
        <th>Gameweek</th>
        <th style="color:var(--green)">Parth</th>
        <th style="color:var(--gold)">Akash</th>
        <th style="color:var(--blue)">Dadhichi</th>
      </tr></thead>
      <tbody>
        ${gwRows}
        <tr>
          <td style="color:var(--white);font-weight:800">SEASON TOTAL</td>
          <td style="color:var(--green)">${byId['parth']?.totalPts ?? '—'}</td>
          <td style="color:var(--gold)">${byId['akash']?.totalPts ?? '—'}</td>
          <td style="color:var(--blue)">${byId['dadhichi']?.totalPts ?? '—'}</td>
        </tr>
      </tbody>
    </table>`;
}

// SCORING
function renderScoring() {
  document.getElementById('scoringContent').innerHTML = `
    <div class="scoring-rule exact">
      <div class="scoring-pts">3</div>
      <div class="scoring-info">
        <div class="scoring-rule-title">Exact Scoreline</div>
        <div class="scoring-rule-desc">You predicted the exact home and away goals. Perfect prediction — maximum points awarded.</div>
      </div>
      <div class="scoring-example">e.g. Predicted 2–1, Result 2–1</div>
    </div>
    <div class="scoring-rule correct">
      <div class="scoring-pts">1</div>
      <div class="scoring-info">
        <div class="scoring-rule-title">Correct Result</div>
        <div class="scoring-rule-desc">You got the outcome right (Win / Draw / Loss) but not the exact score. One point for reading the game correctly.</div>
      </div>
      <div class="scoring-example">e.g. Predicted 2–0, Result 3–1</div>
    </div>
    <div class="scoring-rule wrong">
      <div class="scoring-pts">0</div>
      <div class="scoring-info">
        <div class="scoring-rule-title">Wrong Result</div>
        <div class="scoring-rule-desc">Your predicted outcome doesn't match. No points — back to the tactics board.</div>
      </div>
      <div class="scoring-example">e.g. Predicted 2–1, Result 1–2</div>
    </div>
    <div class="scoring-rule" style="border-left:4px solid var(--dim);margin-top:8px;">
      <div class="scoring-pts" style="color:var(--dim);font-size:28px">⚡</div>
      <div class="scoring-info">
        <div class="scoring-rule-title">How It's Calculated</div>
        <div class="scoring-rule-desc">Predictions are locked before each gameweek's first kickoff. Scores are automatically computed after all matches finish. Exact score beats correct result — so pick boldly.</div>
      </div>
    </div>`;
}

// CHARTS
function renderCharts() {
  const board  = db.getLeaderboard();
  const colors = { parth:'#00ff87', akash:'#f5c518', dadhichi:'#00a8e1' };
  const maxPts = Math.max(...board.map(p=>p.totalPts));

  // Bar chart — total points
  const barsHTML = board.map(p => `
    <div class="bar-row">
      <span class="bar-label" style="color:${colors[p.id]}">${p.name}</span>
      <div class="bar-track">
        <div class="bar-fill" data-w="${Math.round(p.totalPts/maxPts*100)}"
          style="background:${colors[p.id]}"></div>
      </div>
      <span class="bar-val" style="color:${colors[p.id]}">${p.totalPts}</span>
    </div>`).join('');

  // Exact vs Correct breakdown for Parth (rank 1)
  const top  = board[0];
  const gwPts = top.gw38Pts;
  const basePts = top.totalPts - gwPts;

  // Donut for Parth - exact vs correct vs 0
  // We know his GW38: 3 exact, 4 correct, 3 wrong (from scoring calc)
  const gw38 = calcGW38Details('parth');
  const total = GW38_MATCHES.length;
  const exCount  = gw38.filter(r=>r.status==='exact').length;
  const coCount  = gw38.filter(r=>r.status==='correct').length;
  const wrCount  = gw38.filter(r=>r.status==='wrong').length;
  const peCount  = gw38.filter(r=>r.status==='pending').length;

  const donutR  = 36, cx = 50, cy = 50, circumf = 2 * Math.PI * donutR;
  const slices  = [
    { val: exCount, color: '#f5c518', label: 'Exact' },
    { val: coCount, color: '#00ff87', label: 'Correct' },
    { val: wrCount, color: 'rgba(255,59,48,0.5)', label: 'Wrong' },
    { val: peCount, color: 'rgba(255,255,255,0.08)', label: 'No Pred' },
  ].filter(s=>s.val>0);

  let offset = 0;
  const donutPaths = slices.map(s => {
    const frac  = s.val / total;
    const dash  = frac * circumf;
    const gap   = circumf - dash;
    const path  = `<circle cx="${cx}" cy="${cy}" r="${donutR}" fill="none"
      stroke="${s.color}" stroke-width="12"
      stroke-dasharray="${dash} ${gap}"
      stroke-dashoffset="${-offset}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
    return path;
  }).join('');

  const legendHTML = slices.map(s => `
    <div class="donut-legend-item">
      <div class="donut-legend-dot" style="background:${s.color}"></div>
      <span class="donut-legend-txt">${s.label}</span>
      <span class="donut-legend-val">${s.val}</span>
    </div>`).join('');

  // Exact scores bar
  const exactBars = board.map(p => `
    <div class="bar-row">
      <span class="bar-label" style="color:${colors[p.id]}">${p.name}</span>
      <div class="bar-track">
        <div class="bar-fill" data-w="${Math.round(p.totalExact/12*100)}"
          style="background:${colors[p.id]}"></div>
      </div>
      <span class="bar-val" style="color:${colors[p.id]}">${p.totalExact}</span>
    </div>`).join('');

  document.getElementById('chartsGrid').innerHTML = `
    <div class="chart-card">
      <div class="chart-card-title">Season Points</div>
      <div class="bar-chart">${barsHTML}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">GW38 Breakdown · ${top.name}</div>
      <div class="donut-wrap">
        <svg class="donut-svg" viewBox="0 0 100 100">
          <circle cx="${cx}" cy="${cy}" r="${donutR}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
          ${donutPaths}
        </svg>
        <div class="donut-legend">${legendHTML}</div>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">Exact Scores (Season)</div>
      <div class="bar-chart">${exactBars}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">GW38 Points</div>
      <div class="bar-chart">
        ${board.map(p=>`
          <div class="bar-row">
            <span class="bar-label" style="color:${colors[p.id]}">${p.name}</span>
            <div class="bar-track">
              <div class="bar-fill" data-w="${Math.round(p.gw38Pts/10*100)}"
                style="background:${colors[p.id]}"></div>
            </div>
            <span class="bar-val" style="color:${colors[p.id]}">${p.gw38Pts}</span>
          </div>`).join('')}
      </div>
    </div>`;

  // Animate bars
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }));
}

function calcGW38Details(playerId) {
  const preds = PREDICTIONS[playerId] || {};
  return GW38_MATCHES.map(m => {
    const pred = preds[m.id];
    if (!pred) return { status:'pending' };
    return scorePredict(pred, { home: m.actualHome, away: m.actualAway });
  });
}

// ──────────────────────────────
// INIT
// ──────────────────────────────
function initApp() {
  // Position indicator on first tab
  requestAnimationFrame(() => {
    moveIndicator(tabs[0]);
    renderSection('leaderboard');
  });
}
