// PL PREDICTIONS PRO — APP v4 (no gate, loads instantly)

const MEDALS  = ['🥇','🥈','🥉'];
const MAX_PTS = 76;
const COLORS  = { parth:'#00ff87', akash:'#f5c518', dadhichi:'#00a8e1' };

// ── TEAM CREST ──
function crestHTML(name) {
  const url   = TEAM_CRESTS[name];
  const color = TEAM_COLORS[name] || '#555';
  const abbr  = name.replace("Nott'm Forest","NF").replace('Crystal Palace','CP')
    .replace('Aston Villa','AV').replace('Man City','MC').replace('Man Utd','MU')
    .replace('West Ham','WH').replace('Newcastle','NEW').replace('Bournemouth','BOU')
    .replace('Brentford','BRE').replace('Sunderland','SUN')
    .split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();

  if (url) return `<div class="crest">
    <img src="${url}" alt="${name}"
      onerror="this.parentElement.innerHTML='${abbr}';this.parentElement.className='crest fb';this.parentElement.style.background='${color}22';"/>
  </div>`;
  return `<div class="crest fb" style="background:${color}22">${abbr}</div>`;
}

// ── NAVIGATION ──
const tabs      = [...document.querySelectorAll('.nav-tab')];
const sections  = [...document.querySelectorAll('.section')];
const indicator = document.getElementById('navIndicator');
const order     = tabs.map(t => t.dataset.section);
let   curIdx    = 0;
let   curId     = 'leaderboard';
const rendered  = new Set();

function posIndicator(tab) {
  const ni  = document.getElementById('navInner');
  const tr  = tab.getBoundingClientRect();
  const nr  = ni.getBoundingClientRect();
  indicator.style.left  = (tr.left - nr.left + ni.scrollLeft) + 'px';
  indicator.style.width = tr.width + 'px';
}

function goTo(id) {
  const idx  = order.indexOf(id);
  const dir  = idx > curIdx ? 1 : -1;
  const from = document.getElementById('section-' + curId);
  const to   = document.getElementById('section-' + id);
  if (from === to) return;

  from.style.transition = 'none';
  from.style.transform  = 'translateX(0)';
  from.style.opacity    = '1';
  from.classList.remove('active');

  to.style.transition = 'none';
  to.style.transform  = `translateX(${dir * 40}px)`;
  to.style.opacity    = '0';
  to.classList.add('active');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    from.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    from.style.transform  = `translateX(${-dir * 40}px)`;
    from.style.opacity    = '0';

    to.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    to.style.transform  = 'translateX(0)';
    to.style.opacity    = '1';
  }));

  tabs.forEach(t => t.classList.toggle('active', t.dataset.section === id));
  posIndicator(tabs[idx]);
  curIdx = idx; curId = id;
  if (!rendered.has(id)) { rendered.add(id); renderSection(id); }
}

tabs.forEach(t => t.addEventListener('click', () => goTo(t.dataset.section)));

function renderSection(id) {
  ({ leaderboard:renderLB, results:renderResults, predictions:renderPreds,
     history:renderHistory, scoring:renderScoring, charts:renderCharts })[id]?.();
}

// ── LEADERBOARD ──
function renderLB() {
  const board = db.getLeaderboard();
  document.getElementById('lbGrid').innerHTML = board.map((p,i) => {
    const w = Math.round(p.totalPts / MAX_PTS * 100);
    return `<div class="lb-card rank-${i+1}">
      <div class="lb-bg-num">${i+1}</div>
      <span class="lb-medal">${MEDALS[i]}</span>
      <div class="lb-name">${p.name.toUpperCase()}</div>
      <div class="lb-handle">${p.handle}</div>
      <div class="lb-stats">
        <div class="lb-stat"><span class="lb-val pts">${p.totalPts}</span><span class="lb-lbl">Points</span></div>
        <div class="lb-divider"></div>
        <div class="lb-stat"><span class="lb-val ex">${p.totalExact}</span><span class="lb-lbl">Exact</span></div>
        <div class="lb-divider"></div>
        <div class="lb-stat"><span class="lb-val gw">${p.gw38Pts}</span><span class="lb-lbl">GW38</span></div>
      </div>
      <div class="lb-bar"><div class="lb-bar-fill" data-w="${w}"></div></div>
    </div>`;
  }).join('');
  setTimeout(() => document.querySelectorAll('.lb-bar-fill').forEach(el => el.style.width = el.dataset.w + '%'), 50);
}

// ── RESULTS ──
function renderResults() {
  document.getElementById('matchesList').innerHTML = GW38_MATCHES.map((m,i) => `
    <div class="match-row" style="animation-delay:${i*.04}s">
      <div class="team-side">
        ${crestHTML(m.home)}
        <span class="team-nm">${m.home}</span>
      </div>
      <div class="score-center">
        <div class="score-num">${m.actualHome}–${m.actualAway}</div>
        <div class="score-ft">FT</div>
      </div>
      <div class="team-side away">
        ${crestHTML(m.away)}
        <span class="team-nm">${m.away}</span>
      </div>
    </div>`).join('');
}

// ── PREDICTIONS ──
let activePid = 'parth';
function renderPreds() {
  document.getElementById('predWrap').innerHTML = `
    <div class="player-tabs" id="playerTabs">
      ${PLAYERS.map(p=>`<button class="ptab${p.id===activePid?' active':''}" data-pid="${p.id}">${p.name}</button>`).join('')}
    </div>
    <div id="predInner"></div>`;
  document.getElementById('playerTabs').addEventListener('click', e => {
    const b = e.target.closest('.ptab'); if(!b) return;
    activePid = b.dataset.pid;
    document.querySelectorAll('.ptab').forEach(x=>x.classList.toggle('active',x.dataset.pid===activePid));
    buildPredTable();
  });
  buildPredTable();
}

function buildPredTable() {
  const preds = PREDICTIONS[activePid] || {};
  const rows  = GW38_MATCHES.map(m => {
    const pred = preds[m.id];
    const res  = pred ? scorePredict(pred, {home:m.actualHome,away:m.actualAway}) : {status:'pending'};
    const badge = {exact:'<span class="badge exact">⭐ 3 PTS</span>',correct:'<span class="badge correct">✓ 1 PT</span>',wrong:'<span class="badge wrong">✗ 0</span>',pending:'<span class="badge pend">—</span>'}[res.status];
    return `<tr>
      <td class="pred-match">${m.home} vs ${m.away}</td>
      <td class="pred-actual">${m.actualHome}–${m.actualAway}</td>
      <td class="pred-guess">${pred?`${pred.home}–${pred.away}`:'?–?'}</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
  document.getElementById('predInner').innerHTML = `
    <div class="table-scroll">
      <table class="pred-table">
        <thead><tr><th>Match</th><th>Result</th><th>Predicted</th><th>Pts</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── HISTORY ──
function renderHistory() {
  const gws  = [1,5,10,15,20,25,30,35,38];
  const data  = { parth:[4,14,24,32,40,46,50,54,55], akash:[3,12,22,28,35,40,45,49,51], dadhichi:[2,10,18,24,28,33,37,40,39] };
  const W=1000,H=200,pL=40,pR=20,pT=16,pB=28,cW=W-pL-pR,cH=H-pT-pB,max=60;
  const tx=i=>pL+(i/(gws.length-1))*cW, ty=v=>pT+cH-(v/max)*cH;

  let paths='', dots='';
  PLAYERS.forEach(p=>{
    const c=COLORS[p.id], d=data[p.id].map((v,i)=>`${i?'L':'M'}${tx(i)},${ty(v)}`).join(' ');
    paths+=`<path fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="${d}" opacity="0.9"/>`;
    data[p.id].forEach((v,i)=>{ dots+=`<circle cx="${tx(i)}" cy="${ty(v)}" r="4" fill="${c}"/>`; });
  });
  const grid=[0,20,40,60].map(v=>`<line x1="${pL}" y1="${ty(v)}" x2="${pL+cW}" y2="${ty(v)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4"/><text x="${pL-6}" y="${ty(v)+4}" text-anchor="end" fill="#a08cb0" font-size="10" font-family="Barlow Condensed">${v}</text>`).join('');
  const xlbl=gws.map((gw,i)=>`<text x="${tx(i)}" y="${H-4}" text-anchor="middle" fill="#a08cb0" font-size="10" font-family="Barlow Condensed">GW${gw}</text>`).join('');

  document.getElementById('historyChart').innerHTML=`
    <div class="chart-label">Points Progression</div>
    <div class="chart-legend">${PLAYERS.map(p=>`<span style="color:${COLORS[p.id]};font-family:var(--fc);font-size:12px;font-weight:700;letter-spacing:2px">${p.name}</span>`).join('')}</div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;overflow:visible">
      ${grid}${paths}${dots}${xlbl}
      <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT+cH}" stroke="rgba(255,255,255,0.1)"/>
    </svg>`;

  const board=db.getLeaderboard(), byId=Object.fromEntries(board.map(p=>[p.id,p]));
  const gwRows=[34,35,36,37,38].map((gw,i)=>{
    const pts={parth:[3,4,2,4,3][i],akash:[2,3,4,2,2][i],dadhichi:[1,2,1,0,0][i]};
    return `<tr><td>GW ${gw}</td><td style="color:var(--g)">${pts.parth}</td><td style="color:var(--gold)">${pts.akash}</td><td style="color:var(--b)">${pts.dadhichi}</td></tr>`;
  }).join('');
  document.getElementById('historyTable').innerHTML=`
    <div class="table-scroll"><table class="pred-table">
      <thead><tr><th>Gameweek</th><th style="color:var(--g)">Parth</th><th style="color:var(--gold)">Akash</th><th style="color:var(--b)">Dadhichi</th></tr></thead>
      <tbody>${gwRows}<tr class="total-row"><td>SEASON TOTAL</td><td style="color:var(--g)">${byId.parth?.totalPts}</td><td style="color:var(--gold)">${byId.akash?.totalPts}</td><td style="color:var(--b)">${byId.dadhichi?.totalPts}</td></tr></tbody>
    </table></div>`;
}

// ── SCORING ──
function renderScoring() {
  document.getElementById('scoringContent').innerHTML=`
    <div class="score-rule gold">
      <div class="sr-pts">3</div>
      <div class="sr-body"><div class="sr-title">Exact Scoreline</div><div class="sr-desc">Predicted the exact home and away goals — maximum points.</div></div>
      <div class="sr-eg">e.g. 2–1 vs 2–1</div>
    </div>
    <div class="score-rule green">
      <div class="sr-pts">1</div>
      <div class="sr-body"><div class="sr-title">Correct Result</div><div class="sr-desc">Right outcome (W/D/L) but wrong score — one point.</div></div>
      <div class="sr-eg">e.g. 2–0 vs 3–1</div>
    </div>
    <div class="score-rule red">
      <div class="sr-pts">0</div>
      <div class="sr-body"><div class="sr-title">Wrong Result</div><div class="sr-desc">Predicted outcome doesn't match — back to the drawing board.</div></div>
      <div class="sr-eg">e.g. 2–1 vs 1–2</div>
    </div>`;
}

// ── CHARTS ──
function renderCharts() {
  const board=db.getLeaderboard(), maxPts=Math.max(...board.map(p=>p.totalPts));
  const barRows=(data,max,key)=>data.map(p=>`
    <div class="bar-row">
      <span class="bar-lbl" style="color:${COLORS[p.id]}">${p.name}</span>
      <div class="bar-track"><div class="bar-fill" style="background:${COLORS[p.id]}" data-w="${Math.round(p[key]/max*100)}"></div></div>
      <span class="bar-num" style="color:${COLORS[p.id]}">${p[key]}</span>
    </div>`).join('');

  document.getElementById('chartsGrid').innerHTML=`
    <div class="chart-card">
      <div class="chart-card-title">Season Points</div>
      <div class="bar-chart">${barRows(board,maxPts,'totalPts')}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">Exact Scores</div>
      <div class="bar-chart">${barRows(board,Math.max(...board.map(p=>p.totalExact)),'totalExact')}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">GW38 Points</div>
      <div class="bar-chart">${barRows(board,Math.max(...board.map(p=>p.gw38Pts)),'gw38Pts')}</div>
    </div>
    <div class="chart-card">
      <div class="chart-card-title">GW38 Accuracy · ${board[0].name}</div>
      ${donutHTML(board[0].id)}
    </div>`;

  setTimeout(()=>document.querySelectorAll('.bar-fill').forEach(el=>el.style.width=el.dataset.w+'%'),50);
}

function donutHTML(pid) {
  const preds=PREDICTIONS[pid]||{}, r=36,cx=50,cy=50,circ=2*Math.PI*r;
  const counts={exact:0,correct:0,wrong:0,pending:0};
  GW38_MATCHES.forEach(m=>{
    const pred=preds[m.id];
    if(!pred){counts.pending++;return;}
    counts[scorePredict(pred,{home:m.actualHome,away:m.actualAway}).status]++;
  });
  const total=GW38_MATCHES.length;
  const slices=[{k:'exact',c:'#f5c518'},{k:'correct',c:'#00ff87'},{k:'wrong',c:'rgba(255,59,48,0.6)'},{k:'pending',c:'rgba(255,255,255,0.08)'}].filter(s=>counts[s.k]>0);
  let off=0;
  const paths=slices.map(s=>{
    const dash=(counts[s.k]/total)*circ, gap=circ-dash;
    const p=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.c}" stroke-width="13" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off+=dash; return p;
  }).join('');
  const legend=slices.map(s=>`<div class="dl"><div class="dd" style="background:${s.c}"></div><span class="dt">${s.k}</span><span class="dv">${counts[s.k]}</span></div>`).join('');
  return `<div class="donut-wrap">
    <svg viewBox="0 0 100 100" style="width:90px;height:90px;flex-shrink:0">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="13"/>
      ${paths}
    </svg>
    <div class="donut-legend">${legend}</div>
  </div>`;
}

// ── INIT ──
window.addEventListener('load', () => {
  rendered.add('leaderboard');
  renderLB();
  requestAnimationFrame(() => posIndicator(tabs[0]));
});
