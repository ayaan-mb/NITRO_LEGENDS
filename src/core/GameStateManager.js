export const GameState = Object.freeze({
  MainMenu: 'MainMenu',
  Loading: 'Loading',
  Tutorial: 'Tutorial',
  Gameplay: 'Gameplay',
  Paused: 'Paused',
});

export class GameStateManager extends EventTarget {
  constructor() {
    super();
    this.state = GameState.MainMenu;
    this.previousState = null;
    this.gameplayInputEnabled = false;
    this.applyState(this.state);
  }

  setState(nextState) {
    if (!Object.values(GameState).includes(nextState) || nextState === this.state) return;
    this.previousState = this.state;
    this.state = nextState;
    this.applyState(nextState);
    this.dispatchEvent(new CustomEvent('statechange', { detail: { state: nextState, previousState: this.previousState } }));
  }

  isGameplayInputEnabled() {
    return this.gameplayInputEnabled;
  }

  applyState(state) {
    this.gameplayInputEnabled = state === GameState.Gameplay;
    document.body.dataset.gameState = state;

    if (state === GameState.Gameplay) {
      document.body.classList.add('is-playing');
      document.body.classList.remove('is-menuing');
      document.body.style.cursor = 'none';
      return;
    }

    document.body.classList.remove('is-playing');
    document.body.classList.add('is-menuing');
    document.body.style.cursor = 'default';
    if (document.pointerLockElement) document.exitPointerLock?.();
  }
}
