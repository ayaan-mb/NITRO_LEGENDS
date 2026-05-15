import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { Game } from './core/Game.js';
import { MainMenuUI } from './ui/MainMenuUI.js';

let game = null;

function startGameplay() {
  if (game) return;
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = 'Loading scene...';
  game = new Game(THREE);
  game.start();
}

new MainMenuUI({
  root: document.getElementById('main-menu'),
  onNewGame: startGameplay,
  onExit: () => window.close(),
});
