export class InputManager {
  constructor({ gameStateManager } = {}) {
    this.gameStateManager = gameStateManager;
  }

  allowGameplayInput() {
    return this.gameStateManager?.isGameplayInputEnabled() ?? true;
  }
}
