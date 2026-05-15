export class LoadingScreenUI {
  constructor(root = document) {
    this.fill = root.querySelector('[data-loading-fill]');
    this.text = root.querySelector('[data-loading-text]');
    this.tip = root.querySelector('[data-loading-tip]');
    this.tips = [
      'Explore the city to discover shops and missions in future branches.',
      'Garages, showrooms, police, and missions arrive in later branches.',
      'Use E to enter or exit vehicles during gameplay.',
      'Press Esc during gameplay to open the pause menu.',
      'Press F1 to inspect the debug overlay when needed.',
    ];
  }

  showRandomTip() {
    if (this.tip) this.tip.textContent = this.tips[Math.floor(Math.random() * this.tips.length)];
  }

  setProgress(value, label) {
    const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
    if (this.fill) this.fill.style.width = `${percent}%`;
    if (this.text) this.text.textContent = `${label} ${percent}%`;
  }
}
