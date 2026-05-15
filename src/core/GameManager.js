import { GameState } from './GameStateManager.js';

export class GameManager {
  constructor({ gameStateManager, sceneLoader, uiManager, createGame }) {
    this.gameStateManager = gameStateManager;
    this.sceneLoader = sceneLoader;
    this.uiManager = uiManager;
    this.createGame = createGame;
    this.game = null;
  }

  async startNewGame() {
    this.gameStateManager.setState(GameState.Loading);
    this.uiManager.showScreen('loading');
    this.game = await this.sceneLoader.loadGameplay(async () => {
      if (!this.game) this.game = await this.createGame();
      return this.game;
    });
    this.uiManager.showScreen('gameplay');
    this.uiManager.tutorial.reset();
    this.gameStateManager.setState(GameState.Tutorial);
    this.uiManager.tutorial.show();
  }

  continueGame() {
    this.uiManager.mainMenu.showNotice('No saved game found');
  }

  enterGameplay() {
    this.uiManager.showScreen('gameplay');
    this.uiManager.tutorial.hide();
    this.uiManager.pauseMenu.hide();
    this.gameStateManager.setState(GameState.Gameplay);
  }

  pause() {
    if (this.gameStateManager.state !== GameState.Gameplay) return;
    this.gameStateManager.setState(GameState.Paused);
    this.uiManager.pauseMenu.show();
  }

  resume() {
    if (this.gameStateManager.state !== GameState.Paused) return;
    this.enterGameplay();
  }

  returnToMainMenu() {
    this.uiManager.closeOverlays();
    this.uiManager.showScreen('main-menu');
    this.gameStateManager.setState(GameState.MainMenu);
  }

  quit() {
    console.log('Nitro Legends exit requested. Builds can close the game window.');
    window.close();
  }
}
