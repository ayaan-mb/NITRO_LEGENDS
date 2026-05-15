export class SettingsUI {
  constructor(root) {
    this.root = root;
    root.querySelector('[data-action="close-settings"]')?.addEventListener('click', () => this.hide());
  }

  show() { this.root.classList.remove('is-hidden'); this.root.setAttribute('aria-hidden', 'false'); }
  hide() { this.root.classList.add('is-hidden'); this.root.setAttribute('aria-hidden', 'true'); }
}
