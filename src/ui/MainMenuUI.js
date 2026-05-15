export class MainMenuUI {
  constructor({ root, onNewGame, onExit }) {
    this.root = root;
    this.onNewGame = onNewGame;
    this.onExit = onExit;
    this.notice = root.querySelector('[data-menu-notice]');
    this.panel = root.querySelector('[data-placeholder-panel]');
    this.panelTitle = root.querySelector('[data-placeholder-title]');
    this.panelText = root.querySelector('[data-placeholder-text]');

    this.bind('new-game', () => this.startNewGame());
    this.bind('continue', () => this.showNotice('No saved game found'));
    this.bind('controls', () => this.showPanel('Controls', 'Driving: W/S accelerate and brake, A/D steer, Space handbrake, E enter or exit, N nitro placeholder, H horn placeholder.'));
    this.bind('settings', () => this.showPanel('Settings', 'Settings placeholder: volume, graphics, mouse sensitivity, and FPS toggle will be configured in a later branch.'));
    this.bind('exit', () => this.exit());
    this.bind('close-panel', () => this.hidePanel());
  }

  bind(action, handler) {
    const button = this.root.querySelector(`[data-action="${action}"]`);
    if (button && handler) button.addEventListener('click', handler);
  }

  startNewGame() {
    this.hidePanel();
    this.root.classList.add('is-hidden');
    document.body.classList.remove('menu-active');
    document.body.classList.add('gameplay-active');
    document.body.style.cursor = 'none';
    this.onNewGame?.();
  }

  showNotice(message) {
    if (!this.notice) return;
    this.notice.textContent = message;
    this.notice.classList.add('is-visible');
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => this.notice.classList.remove('is-visible'), 3000);
  }

  showPanel(title, text) {
    if (this.panelTitle) this.panelTitle.textContent = title;
    if (this.panelText) this.panelText.textContent = text;
    this.panel?.classList.remove('is-hidden');
  }

  hidePanel() {
    this.panel?.classList.add('is-hidden');
  }

  exit() {
    console.log('Nitro Legends exit requested. Builds can close the game window.');
    this.onExit?.();
  }
}
