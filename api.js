// Live scores: ESPN scoreboard is the GitHub Pages path (CORS *).
// football-data.org is optional localhost-only — their API allows Origin: http://localhost,
// not github.io, so a token cannot work on the hosted site.

const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard';

const FootballAPI = {
  lastError: '',
  lastSync: 0,
  lastSource: '',

  token() {
    return (LiveStore.state.settings.footballDataToken || '').trim();
  },

  yyyymmddUtc(iso) {
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  },

  dateRangeForGw(gw) {
    const days = [...new Set(matchesForGw(gw, SEASON_MATCHES).map(m => this.yyyymmddUtc(m.kickoff)))].sort();
    if (!days.length) return '';
    return days[0] === days[days.length - 1] ? days[0] : `${days[0]}-${days[days.length - 1]}`;
  },

  parseScore(value) {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  },

  espnStatus(ev) {
    const comp = ev && ev.competitions && ev.competitions[0];
    const type = (comp && comp.status && comp.status.type) || {};
    const state = String(type.state || '').toLowerCase();
    const name = String(type.name || '').toUpperCase();
    if (type.completed || state === 'post' || name.includes('FULL_TIME')) return 'FINISHED';
    if (name.includes('HALFTIME') || name.includes('PAUSE')) return 'PAUSED';
    if (state === 'in' || name.includes('IN_PROGRESS') || name.includes('LIVE')) return 'IN_PLAY';
    return 'SCHEDULED';
  },

  parseEspnEvent(ev) {
    const comp = ev && ev.competitions && ev.competitions[0];
    if (!comp) return null;
    const competitors = comp.competitors || [];
    const home = competitors.find(c => c.homeAway === 'home');
    const away = competitors.find(c => c.homeAway === 'away');
    if (!home || !away) return null;
    const homeName = canonicalTeam((home.team && (home.team.displayName || home.team.shortDisplayName)) || '');
    const awayName = canonicalTeam((away.team && (away.team.displayName || away.team.shortDisplayName)) || '');
    return {
      home: homeName,
      away: awayName,
      homeScore: this.parseScore(home.score),
      awayScore: this.parseScore(away.score),
      status: this.espnStatus(ev),
      utcDate: ev.date || '',
    };
  },

  espnEventsToResults(events) {
    const out = {};
    (events || []).forEach(ev => {
      const parsed = this.parseEspnEvent(ev);
      if (!parsed) return;
      if (parsed.status === 'SCHEDULED') return;
      if (parsed.homeScore == null || parsed.awayScore == null) return;
      const local = SEASON_MATCHES.find(x => x.home === parsed.home && x.away === parsed.away);
      if (!local) return;
      out[local.id] = {
        home: parsed.homeScore,
        away: parsed.awayScore,
        status: parsed.status,
      };
    });
    return out;
  },

  async fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  collectEvents(payloads) {
    const seen = new Set();
    const events = [];
    (payloads || []).forEach(data => {
      (data && data.events || []).forEach(ev => {
        const key = ev.id || `${ev.date}-${(ev.name || '')}`;
        if (seen.has(key)) return;
        seen.add(key);
        events.push(ev);
      });
    });
    return events;
  },

  async fetchEspnForGw(gw) {
    const payloads = [];
    const range = this.dateRangeForGw(gw);
    const tryUrl = async (url) => {
      try {
        payloads.push(await this.fetchJson(url));
        return true;
      } catch (e) {
        return false;
      }
    };

    let ranged = false;
    if (range) ranged = await tryUrl(`${ESPN_SCOREBOARD}?dates=${range}`);
    if (range && !ranged) {
      const days = [...new Set(matchesForGw(gw, SEASON_MATCHES).map(m => this.yyyymmddUtc(m.kickoff)))];
      for (const day of days) await tryUrl(`${ESPN_SCOREBOARD}?dates=${day}`);
    }
    await tryUrl(ESPN_SCOREBOARD);
    if (!payloads.length) throw new Error('espn-empty');
    return this.collectEvents(payloads);
  },

  async fetchSeason() {
    const token = this.token();
    if (!token) return null;
    const url = 'https://api.football-data.org/v4/competitions/PL/matches';
    try {
      const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
      if (!res.ok) return null;
      const data = await res.json();
      return data.matches || [];
    } catch (e) {
      return null;
    }
  },

  toResults(apiMatches) {
    const out = {};
    (apiMatches || []).forEach(m => {
      const home = canonicalTeam(m.homeTeam && (m.homeTeam.shortName || m.homeTeam.name));
      const away = canonicalTeam(m.awayTeam && (m.awayTeam.shortName || m.awayTeam.name));
      const local = SEASON_MATCHES.find(x => x.home === home && x.away === away);
      if (!local) return;
      const score = m.score && m.score.fullTime;
      const finished = m.status === 'FINISHED' && score && score.home != null && score.away != null;
      const live = (m.status === 'IN_PLAY' || m.status === 'PAUSED') && score;
      if (finished || (live && score.home != null && score.away != null)) {
        out[local.id] = {
          home: score.home,
          away: score.away,
          status: m.status,
        };
      }
    });
    return out;
  },

  async syncGameweek(gw) {
    this.lastError = '';
    const mapped = {};
    let espnOk = false;

    try {
      const events = await this.fetchEspnForGw(gw);
      Object.assign(mapped, this.espnEventsToResults(events));
      espnOk = true;
      this.lastSource = 'ESPN';
      this.lastSync = Date.now();
    } catch (e) {
      this.lastError = 'Could not reach live scores (network).';
    }

    if (this.token()) {
      const fdMatches = await this.fetchSeason();
      if (fdMatches) {
        Object.assign(mapped, this.toResults(fdMatches));
        this.lastSync = Date.now();
        if (!espnOk) {
          this.lastSource = 'football-data.org';
          this.lastError = '';
        }
      }
    }

    if (!espnOk && !Object.keys(mapped).length) {
      return { ok: false, count: 0, error: this.lastError || 'Sync failed' };
    }

    LiveStore.mergeResults(mapped);
    return { ok: true, count: Object.keys(mapped).length, error: '' };
  },
};
