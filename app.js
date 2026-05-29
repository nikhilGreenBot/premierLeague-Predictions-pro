// ============================================================
// PL PREDICTIONS PRO — APP
// ============================================================

const MEDALS = ['🥇', '🥈', '🥉'];
const MAX_PTS = 76; // approx max pts possible this season (for bar width)

// ── LEADERBOARD RENDER ──
async function renderLeaderboard() {
  const board = await db.getLeaderboard();
  const container = document.getElementById('leaderboardCards');

  container.innerHTML = board.map((player, i) => {
    const barWidth = Math.round((player.totalPts / MAX_PTS) * 100);
    return `
      <div class="lb-card rank-${i + 1}" style="animation-delay:${i * 0.1}s">
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
      </div>
    `;
  }).join('');

  // Animate bars after render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.lb-gw-fill').forEach(el => {
        el.style.width = el.dataset.width;
      });
    });
  });
}

// ── MATCH CARDS RENDER ──
async function renderMatches(gw = 38) {
  const matches     = await db.getMatches(gw);
  const predictions = await db.getPredictions(gw);
  const container   = document.getElementById('matchesGrid');

  container.innerHTML = matches.map((match, idx) => {
    const actual = { home: match.actualHome, away: match.actualAway };
    const isFinished = actual.home !== null;

    const predsHTML = PLAYERS.map(player => {
      const pred = predictions[player.id]?.[match.id];
      const result = isFinished && pred
        ? scorePredict(pred, actual)
        : { pts: 0, status: pred ? 'pending' : 'pending' };

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
        </div>
      `;
    }).join('');

    const scoreStr = isFinished
      ? `${actual.home} – ${actual.away}`
      : 'vs';

    return `
      <div class="match-card" style="animation-delay:${idx * 0.05}s">
        <div class="match-top">
          <div class="match-team home">
            <div class="team-crest">${TEAM_CRESTS[match.home] || '⚽'}</div>
            <div>
              <div class="team-name">${match.home}</div>
              <div class="team-short">HOME</div>
            </div>
          </div>
          <div class="match-score-block">
            <div class="match-score">${scoreStr}</div>
            <div class="match-status">${isFinished ? 'FULL TIME' : 'UPCOMING'}</div>
          </div>
          <div class="match-team away">
            <div class="team-crest">${TEAM_CRESTS[match.away] || '⚽'}</div>
            <div>
              <div class="team-name">${match.away}</div>
              <div class="team-short">AWAY</div>
            </div>
          </div>
        </div>
        <div class="match-preds">${predsHTML}</div>
      </div>
    `;
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

// ── INIT ──
(async () => {
  await renderLeaderboard();
  await renderMatches(38);
})();
