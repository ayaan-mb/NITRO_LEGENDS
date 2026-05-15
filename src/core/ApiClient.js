export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async health() {
    const r = await fetch(`${this.baseUrl}/health.php`);
    return r.json();
  }

  async loadPlayerState(playerId) {
    const r = await fetch(`${this.baseUrl}/player_state.php?player_id=${encodeURIComponent(playerId)}`);
    return r.json();
  }

  async savePlayerState(playerId, state) {
    const r = await fetch(`${this.baseUrl}/player_state.php?player_id=${encodeURIComponent(playerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    return r.json();
  }
}
