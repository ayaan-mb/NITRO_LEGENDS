export class HUDManager {
  constructor(root = document) {
    this.speed = root.querySelector('[data-hud-speed]');
    this.health = root.querySelector('[data-hud-health]');
    this.money = root.querySelector('[data-hud-money]');
    this.objective = root.querySelector('[data-hud-objective]');
    this.nitro = root.querySelector('[data-hud-nitro]');
  }

  update({ telemetry, playerHp, vehicleHp }) {
    if (!telemetry) return;
    if (this.speed) this.speed.textContent = `${Math.round(telemetry.speedKmh)} km/h`;
    if (this.health) this.health.textContent = `HP ${Math.round(playerHp)} • Vehicle ${Math.round(vehicleHp)}`;
    if (this.money) this.money.textContent = '$0';
    if (this.objective) this.objective.textContent = 'Objective: Explore the city and learn the controls';
    if (this.nitro) this.nitro.textContent = `Nitro ${Math.round(telemetry.nitro)}%`;
  }
}
