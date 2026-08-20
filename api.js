// football-data.org client. Token stays in localStorage / optional config.js — never committed.

const FootballAPI = {
  lastError: '',
  lastSync: 0,

  token() {
    return (LiveStore.state.settings.footballDataToken || '').trim();
  },

  async fetchMatchday(matchday) {
    const token = this.token();
    if (!token) {
      this.lastError = 'No API token yet — using bundled fixtures.';
      return null;
    }
    const url = `https://api.football-data.org/v4/competitions/PL/matches?matchday=${matchday}`;
    try {
      const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
      if (!res.ok) {
        this.lastError = `football-data.org ${res.status}`;
        return null;
      }
      const data = await res.json();
      this.lastError = '';
      this.lastSync = Date.now();
      return data.matches || [];
    } catch (e) {
      this.lastError = 'Could not reach football-data.org (network/CORS).';
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
    const matches = await this.fetchMatchday(gw);
    if (!matches) return { ok: false, count: 0, error: this.lastError };
    const mapped = this.toResults(matches);
    LiveStore.mergeResults(mapped);
    return { ok: true, count: Object.keys(mapped).length, error: '' };
  },
};
