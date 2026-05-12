import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { Game } from './core/Game.js';

const statusEl = document.getElementById('status');
if (statusEl) statusEl.textContent = 'Loading scene...';

const game = new Game(THREE);
game.start();
