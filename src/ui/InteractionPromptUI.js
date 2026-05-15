export class InteractionPromptUI {
  constructor(root = document) {
    this.el = root.querySelector('[data-interaction-prompt]');
  }

  show(message) {
    if (!this.el) return;
    this.el.textContent = message;
    this.el.classList.add('is-visible');
  }

  hide() {
    this.el?.classList.remove('is-visible');
  }
}
