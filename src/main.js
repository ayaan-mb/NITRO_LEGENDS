import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { Game } from './core/Game.js';
import { GameManager } from './core/GameManager.js';
import { GameState, GameStateManager } from './core/GameStateManager.js';
import { InputManager } from './core/InputManager.js';
import { SceneLoader } from './core/SceneLoader.js';
import { SettingsManager } from './core/SettingsManager.js';
import { UIManager } from './ui/UIManager.js';

const gameStateManager = new GameStateManager();
const inputManager = new InputManager({ gameStateManager });
const settingsManager = new SettingsManager();
let gameManager;

const uiManager = new UIManager({
  newGame: () => gameManager.startNewGame(),
  continueGame: () => gameManager.continueGame(),
  controls: () => uiManager.controls.show(),
  settings: () => uiManager.settings.show(),
  exit: () => gameManager.quit(),
  resume: () => gameManager.resume(),
  mainMenu: () => gameManager.returnToMainMenu(),
  completeTutorial: () => gameManager.enterGameplay(),
});

const sceneLoader = new SceneLoader({ loadingUI: uiManager.loadingScreen });

gameManager = new GameManager({
  gameStateManager,
  sceneLoader,
  uiManager,
  createGame: async () => {
    const game = new Game(THREE, { inputManager, uiManager, gameStateManager, settingsManager });
    await game.start();
    return game;
  },
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'F1') {
    event.preventDefault();
    uiManager.debug.toggle();
    return;
  }

  if (event.code === 'Escape') {
    event.preventDefault();
    if (gameStateManager.state === GameState.Gameplay) gameManager.pause();
    else if (gameStateManager.state === GameState.Paused) gameManager.resume();
  }
});

window.nitroLegends = { gameManager, gameStateManager, uiManager, settingsManager };
