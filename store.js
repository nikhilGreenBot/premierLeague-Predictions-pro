// Persistence: localStorage always. Optional Firebase realtime sync. Share-code merge for WhatsApp.

const STORE_KEY = 'plpp_live_v1';

function defaultLiveState() {
  return {
    version: 1,
    leagueId: 'PARTH',
    currentPlayerId: 'parth',
    players: PLAYERS.map(p => ({ ...p })),
    pins: {},
    emails: {},
    predictions: {},
    results: {},
    settings: {
      footballDataToken: '',
      firebaseConfig: null,
      googleFormUrl: '',
      allowLate: false,
      recapEmails: '',
    },
  };
}

const LiveStore = {
  state: defaultLiveState(),
  firebase: null,
  unsub: null,
  listeners: [],

  load() {
    const cfg = (typeof window !== 'undefined' && window.PLPP_CONFIG) ? window.PLPP_CONFIG : {};
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { saved = null; }
    this.state = { ...defaultLiveState(), ...(saved || {}) };
    this.state.settings = { ...defaultLiveState().settings, ...(this.state.settings || {}) };
    if (cfg.footballDataToken && !this.state.settings.footballDataToken) {
      this.state.settings.footballDataToken = cfg.footballDataToken;
    }
    if (cfg.firebase && !this.state.settings.firebaseConfig) {
      this.state.settings.firebaseConfig = cfg.firebase;
    }
    if (cfg.leagueId) this.state.leagueId = cfg.leagueId;
    if (cfg.googleFormUrl && !this.state.settings.googleFormUrl) {
      this.state.settings.googleFormUrl = cfg.googleFormUrl;
    }
    this._ensureCorePlayers();
    this.saveLocal();
    return this.state;
  },

  _ensureCorePlayers() {
    const have = new Set(this.state.players.map(p => p.id));
    PLAYERS.forEach(p => {
      if (!have.has(p.id)) this.state.players.push({ ...p });
    });
  },

  saveLocal() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
    this.listeners.forEach(fn => { try { fn(this.state); } catch (e) {} });
  },

  onChange(fn) { this.listeners.push(fn); },

  setCurrentPlayer(id) {
    this.state.currentPlayerId = id;
    this.saveLocal();
  },

  addPlayer(name, handle) {
    const id = slugifyName(name);
    if (!id) return null;
    if (this.state.players.some(p => p.id === id)) return id;
    this.state.players.push({ id, name: name.trim(), handle: (handle || 'NEW SIGNING').toUpperCase() });
    this.saveLocal();
    this.pushPlayer(id);
    return id;
  },

  setPin(playerId, pin) {
    if (!pin) delete this.state.pins[playerId];
    else this.state.pins[playerId] = String(pin);
    this.saveLocal();
  },

  checkPin(playerId, pin) {
    const stored = this.state.pins[playerId];
    if (!stored) return true;
    return String(pin) === String(stored);
  },

  savePrediction(playerId, matchId, home, away) {
    if (!this.state.predictions[playerId]) this.state.predictions[playerId] = {};
    this.state.predictions[playerId][matchId] = {
      home: Number(home),
      away: Number(away),
      at: Date.now(),
    };
    this.saveLocal();
    this.pushPlayer(playerId);
  },

  saveResult(matchId, home, away, status) {
    this.state.results[matchId] = {
      home: Number(home),
      away: Number(away),
      status: status || 'FINISHED',
      at: Date.now(),
    };
    this.saveLocal();
    this.pushResults();
  },

  mergeResults(map) {
    let changed = false;
    Object.keys(map || {}).forEach(id => {
      const incoming = map[id];
      const cur = this.state.results[id];
      if (!cur || cur.home !== incoming.home || cur.away !== incoming.away || cur.status !== incoming.status) {
        this.state.results[id] = { ...incoming, at: Date.now() };
        changed = true;
      }
    });
    if (changed) {
      this.saveLocal();
      this.pushResults();
    }
    return changed;
  },

  updateSettings(partial) {
    this.state.settings = { ...this.state.settings, ...partial };
    this.saveLocal();
  },

  exportCode() {
    const payload = {
      v: 1,
      leagueId: this.state.leagueId,
      players: this.state.players,
      predictions: this.state.predictions,
      results: this.state.results,
    };
    return 'PLPP1.' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  },

  importCode(code) {
    const raw = String(code || '').trim();
    const body = raw.startsWith('PLPP1.') ? raw.slice(6) : raw;
    let payload;
    try {
      payload = JSON.parse(decodeURIComponent(escape(atob(body))));
    } catch (e) {
      throw new Error('That share code could not be read. Copy the full PLPP1. code.');
    }
    if (!payload || payload.v !== 1) throw new Error('Unknown share code version.');
    (payload.players || []).forEach(p => {
      if (!this.state.players.some(x => x.id === p.id)) this.state.players.push(p);
    });
    Object.keys(payload.predictions || {}).forEach(pid => {
      this.state.predictions[pid] = { ...(this.state.predictions[pid] || {}), ...payload.predictions[pid] };
    });
    Object.keys(payload.results || {}).forEach(id => {
      this.state.results[id] = payload.results[id];
    });
    if (payload.leagueId) this.state.leagueId = payload.leagueId;
    this.saveLocal();
    this.pushAll();
    return payload;
  },

  async connectFirebase() {
    const cfg = this.state.settings.firebaseConfig;
    if (!cfg || !cfg.apiKey) return false;
    try {
      if (!window.firebase) {
        await loadExternalScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
        await loadExternalScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      this.firebase = firebase.firestore();
      this._listenFirebase();
      await this.pushAll();
      return true;
    } catch (e) {
      console.warn('Firebase unavailable', e);
      return false;
    }
  },

  _col() {
    return this.firebase.collection('plpp').doc(this.state.leagueId || 'PARTH');
  },

  _listenFirebase() {
    if (this.unsub) this.unsub();
    const col = this._col();
    const unsubs = [];
    unsubs.push(col.collection('preds').onSnapshot(snap => {
      snap.forEach(doc => {
        this.state.predictions[doc.id] = { ...(this.state.predictions[doc.id] || {}), ...(doc.data().preds || doc.data()) };
      });
      this.saveLocal();
    }));
    unsubs.push(col.collection('meta').doc('results').onSnapshot(doc => {
      if (doc.exists) {
        this.state.results = { ...this.state.results, ...(doc.data().results || {}) };
        this.saveLocal();
      }
    }));
    unsubs.push(col.collection('meta').doc('players').onSnapshot(doc => {
      if (doc.exists && Array.isArray(doc.data().players)) {
        doc.data().players.forEach(p => {
          if (!this.state.players.some(x => x.id === p.id)) this.state.players.push(p);
        });
        this.saveLocal();
      }
    }));
    this.unsub = () => unsubs.forEach(u => u());
  },

  async pushPlayer(playerId) {
    if (!this.firebase) return;
    const preds = this.state.predictions[playerId] || {};
    await this._col().collection('preds').doc(playerId).set({ preds, updatedAt: Date.now() }, { merge: true });
  },

  async pushResults() {
    if (!this.firebase) return;
    await this._col().collection('meta').doc('results').set({ results: this.state.results, updatedAt: Date.now() }, { merge: true });
  },

  async pushAll() {
    if (!this.firebase) return;
    await this._col().collection('meta').doc('players').set({ players: this.state.players }, { merge: true });
    await this.pushResults();
    for (const p of this.state.players) await this.pushPlayer(p.id);
  },
};

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}
