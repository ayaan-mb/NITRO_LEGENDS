export class SceneLoader {
  constructor({ loadingUI, minLoadMs = 1200 } = {}) {
    this.loadingUI = loadingUI;
    this.minLoadMs = minLoadMs;
  }

  async loadGameplay(createGame) {
    this.loadingUI?.showRandomTip();
    this.loadingUI?.setProgress(0, 'Preparing city stream...');
    const startedAt = performance.now();
    await this.step(0.18, 'Warming up renderer...');
    const game = await createGame();
    await this.step(0.55, 'Placing player and vehicle...');
    await this.step(0.82, 'Calibrating HUD...');
    const remaining = this.minLoadMs - (performance.now() - startedAt);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    this.loadingUI?.setProgress(1, 'Ready to drive');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return game;
  }

  async step(progress, label) {
    await new Promise((resolve) => setTimeout(resolve, 180 + Math.random() * 180));
    this.loadingUI?.setProgress(progress, label);
  }
}
