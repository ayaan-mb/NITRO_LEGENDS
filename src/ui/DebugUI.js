export class DebugUI {
  constructor(root = document) {
    this.root = root.querySelector('[data-debug-ui]');
    this.visible = false;
    this.fps = root.querySelector('[data-debug-fps]');
    this.position = root.querySelector('[data-debug-position]');
    this.speed = root.querySelector('[data-debug-speed]');
    this.state = root.querySelector('[data-debug-state]');
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
  }

  toggle() {
    this.visible = !this.visible;
    this.root?.classList.toggle('is-hidden', !this.visible);
  }

  update({ game, gameState }) {
    if (!this.visible || !game) return;
    this.frameCount += 1;
    const now = performance.now();
    if (now - this.lastFpsTime > 500) {
      if (this.fps) this.fps.textContent = `FPS ${Math.round((this.frameCount * 1000) / (now - this.lastFpsTime))}`;
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
    const target = game.isInCar ? game.car.mesh.position : game.character.mesh.position;
    const telemetry = game.car.getTelemetry();
    if (this.position) this.position.textContent = `Position X ${target.x.toFixed(1)} Z ${target.z.toFixed(1)}`;
    if (this.speed) this.speed.textContent = `Speed ${Math.round(telemetry.speedKmh)} km/h`;
    if (this.state) this.state.textContent = `State ${gameState}`;
  }
}
