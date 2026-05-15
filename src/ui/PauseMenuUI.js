export class PauseMenuUI {
  constructor(root, actions = {}) {
    this.root = root;
    this.bind('resume', actions.resume);
    this.bind('controls', actions.controls);
    this.bind('settings', actions.settings);
    this.bind('main-menu', actions.mainMenu);
    this.bind('exit', actions.exit);
  }

  bind(action, handler) {
    const button = this.root.querySelector(`[data-action="${action}"]`);
    if (button && handler) button.addEventListener('click', handler);
  }

  show() { this.root.classList.remove('is-hidden'); this.root.setAttribute('aria-hidden', 'false'); }
  hide() { this.root.classList.add('is-hidden'); this.root.setAttribute('aria-hidden', 'true'); }
}
