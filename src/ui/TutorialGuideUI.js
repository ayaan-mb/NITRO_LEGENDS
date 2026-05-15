export class TutorialGuideUI {
  constructor(root, { onComplete } = {}) {
    this.root = root;
    this.onComplete = onComplete;
    this.index = 0;
    this.pages = Array.from(root.querySelectorAll('[data-tutorial-page]'));
    this.backButton = root.querySelector('[data-action="tutorial-back"]');
    this.nextButton = root.querySelector('[data-action="tutorial-next"]');
    this.startButton = root.querySelector('[data-action="tutorial-start"]');
    root.querySelector('[data-action="tutorial-skip"]')?.addEventListener('click', () => this.complete());
    this.backButton?.addEventListener('click', () => this.go(-1));
    this.nextButton?.addEventListener('click', () => this.go(1));
    this.startButton?.addEventListener('click', () => this.complete());
    this.render();
  }

  reset() { this.index = 0; this.render(); }
  show() { this.root.classList.remove('is-hidden'); this.root.setAttribute('aria-hidden', 'false'); }
  hide() { this.root.classList.add('is-hidden'); this.root.setAttribute('aria-hidden', 'true'); }

  go(direction) {
    this.index = Math.max(0, Math.min(this.pages.length - 1, this.index + direction));
    this.render();
  }

  complete() {
    this.hide();
    this.onComplete?.();
  }

  render() {
    this.pages.forEach((page, i) => page.classList.toggle('is-active', i === this.index));
    if (this.backButton) this.backButton.disabled = this.index === 0;
    this.nextButton?.classList.toggle('is-hidden', this.index === this.pages.length - 1);
    this.startButton?.classList.toggle('is-hidden', this.index !== this.pages.length - 1);
  }
}
