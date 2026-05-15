export class MainMenuUI {
  constructor(root, actions = {}) {
    this.root = root;
    this.notice = root.querySelector('[data-menu-notice]');
    this.bind('new-game', actions.newGame);
    this.bind('continue', actions.continueGame);
    this.bind('controls', actions.controls);
    this.bind('settings', actions.settings);
    this.bind('exit', actions.exit);
  }

  bind(action, handler) {
    const button = this.root.querySelector(`[data-action="${action}"]`);
    if (button && handler) button.addEventListener('click', handler);
  }

  showNotice(message) {
    if (!this.notice) return;
    this.notice.textContent = message;
    this.notice.classList.add('is-visible');
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => this.notice.classList.remove('is-visible'), 3200);
  }
}
