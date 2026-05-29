// ============================================================
// PL PREDICTIONS PRO — APP v2
// Password gate · Real crests · Arsenal trophy bg
// ============================================================

const CORRECT_PASSWORD = 'nangaNaach';
const MEDALS = ['🥇', '🥈', '🥉'];
const MAX_PTS = 76;

// ── PASSWORD GATE ──
const gateOverlay = document.getElementById('gateOverlay');
const gateInput   = document.getElementById('gateInput');
const gateBalls   = document.getElementById('gateBalls');
const gateError   = document.getElementById('gateError');

function renderBalls(count) {
  // Remove extra balls with animation
  const current = gateBalls.children.length;
  if (count < current) {
    const ball = gateBalls.lastElementChild;
    if (ball) {
      ball.classList.add('removing');
      setTimeout(() => ball.remove(), 150);
    }
    return;
  }
  // Add new ball
  for (let i = current; i < count; i++) {
    const ball = document.createElement('span');
    ball.className = 'gate-ball';
    ball.textContent = '⚽';
    gateBalls.appendChild(ball);
  }
}

gateInput.addEventListener('input', () => {
  const val = gateInput.value;
  renderBalls(val.length);
  gateError.textContent = '';
  gateInput.classList.remove('error');

  if (val === CORRECT_PASSWORD) {
    unlockApp();
  }
});

gateInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (gateInput.value !== CORRECT_PASSWORD) {
      gateError.textContent = 'WRONG PASSWORD. TRY AGAIN.';
      gateInput.classList.add('error');
      gateInput.value = '';
      // Remove all balls
      while (gateBalls.firstChild) gateBalls.removeChild(gateBalls.firstChild);
      setTimeout(() => {
        gateInput.classList.remove('error');
        gateError.textContent = '';
      }, 1500);
    }
  }
});

function unlockApp() {
  gateInput.disabled = true;
  gateError.textContent = '';

  // Victory animation on balls
  document.querySelectorAll('.gate-ball').forEach((b, i) => {
    setTimeout(() => {
      b.style.transform = 'scale(1.4) rotate(360deg)';
      b.style.transition = 'transform 0.3s ease';
    }, i * 40);
  });

  setTimeout(() => {
    gateOverlay.classList.add('unlocking');
    const appContent = document.getElementById('appContent');
    appContent.style.display = 'block';
    appContent.style.opacity = '0';

    setTimeout(() => {
      gateOverlay.style.display = 'none';
      appContent.style.transition = 'opacity 0.5s ease';
      appContent.style.opacity = '1';
      initApp();
    }, 600);
  }, 400);
}

// Auto-focus input
gateInput.focus();

// ── TEAM CREST RENDERER ──
function teamCrestHTML(teamName) {
  const url = TEAM_CRESTS[teamName];
  const color = TEAM_COLORS[teamName] || '#666';
  const abbr = teamName.replace("Nott'm", 'NF').replace('Crystal Palace', 'CP')
                       .replace('Aston Villa', 'AV').replace('Man City', 'MC')
                       .replace('Man Utd', 'MU').replace('West Ham', 'WH')
                       .replace('Newcastle', 'NEW').replace('Bournemouth', 'BOU')
                       .replace('Brentford', 'BRE').replace('Sunderland', 'SUN')
                       .split(' ').map(w => w[0]).join('').slice(0,3).toUpperCase();

  if (url) {
    return `
      <div class="team-crest" id="crest-${teamName.replace(/[^a-z]/gi,'_')}">
        <img
          src="${url}"
          alt="${teamName}"
          onerror="this.parentElement.innerHTML='<span style=\\'font-size:10px;font-weight:800;color:#fff;font-family:sans-serif\\'>${abbr}</span>';this.parentElement.style.background='${color}33';"
        />
      </div>`;
  }
  return `<div class="team-crest fallback" style="background:${color}33">${abbr}</div>`;
}

// ── LEADERBOARD ──
async function renderLeaderboard() {
  const board = await db.getLeaderboard();
  const container = document.getElementById('leaderboardCards');

  container.innerHTML = board.map((player, i) => {
    const barWidth = Math.round((player.totalPts / MAX_PTS) * 100);
    return `
      <div class="lb-card rank-${i + 1}">
        <div class="lb-rank-number">${i + 1}</div>
        <span class="lb-medal">${MEDALS[i]}</span>
        <div class="lb-name">${player.name.toUpperCase()}</div>
        <div class="lb-handle">${player.handle}</div>
        <div class="lb-stats">
          <div class="lb-stat">
            <span class="lb-stat-value pts">${player.totalPts}</span>
            <span class="lb-stat-label">Points</span>
          </div>
          <div class="lb-stat-divider"></div>
          <div class="lb-stat">
            <span class="lb-stat-value exact">${player.totalExact}</span>
            <span class="lb-stat-label">Exact</span>
          </div>
          <div class="lb-stat-divider"></div>
          <div class="lb-stat">
            <span class="lb-stat-value" style="font-size:32px;color:var(--accent-blue)">${player.gw38Pts}</span>
            <span class="lb-stat-label">GW38 Pts</span>
          </div>
        </div>
        <div class="lb-gw-bar">
          <div class="lb-gw-fill" style="width:0%" data-width="${barWidth}%"></div>
        </div>
      </div>`;
  }).join('');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.lb-gw-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }));
}

// ── MATCH CARDS ──
async function renderMatches(gw = 38) {
  const matches     = await db.getMatches(gw);
  const predictions = await db.getPredictions(gw);
  const container   = document.getElementById('matchesGrid');

  container.innerHTML = matches.map((match, idx) => {
    const actual = { home: match.actualHome, away: match.actualAway };

    const predsHTML = PLAYERS.map(player => {
      const pred = predictions[player.id]?.[match.id];
      const result = pred
        ? scorePredict(pred, actual)
        : { pts: 0, status: 'pending' };

      const predStr = pred ? `${pred.home} – ${pred.away}` : '? – ?';
      const badgeText = result.status === 'exact'   ? '3 PTS ★'
                      : result.status === 'correct' ? '1 PT ✓'
                      : result.status === 'wrong'   ? '0 PTS ✗'
                      : '—';
      return `
        <div class="pred-cell">
          <div>
            <div class="pred-player">${player.name}</div>
            <div class="pred-score">${predStr}</div>
          </div>
          <div class="pred-badge ${result.status}">${badgeText}</div>
        </div>`;
    }).join('');

    return `
      <div class="match-card" style="animation-delay:${idx * 0.05}s">
        <div class="match-top">
          <div class="match-team home">
            ${teamCrestHTML(match.home)}
            <div>
              <div class="team-name">${match.home}</div>
              <div class="team-short">HOME</div>
            </div>
          </div>
          <div class="match-score-block">
            <div class="match-score">${actual.home} – ${actual.away}</div>
            <div class="match-status">FULL TIME</div>
          </div>
          <div class="match-team away">
            ${teamCrestHTML(match.away)}
            <div>
              <div class="team-name">${match.away}</div>
              <div class="team-short">AWAY</div>
            </div>
          </div>
        </div>
        <div class="match-preds">${predsHTML}</div>
      </div>`;
  }).join('');
}

// ── GW SELECTOR ──
document.querySelectorAll('.gw-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gw-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMatches(parseInt(btn.dataset.gw));
  });
});

// ── INIT (called after unlock) ──
async function initApp() {
  await renderLeaderboard();
  await renderMatches(38);
}
