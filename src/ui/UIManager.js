import { MainMenuUI } from './MainMenuUI.js';
import { LoadingScreenUI } from './LoadingScreenUI.js';
import { TutorialGuideUI } from './TutorialGuideUI.js';
import { HUDManager } from './HUDManager.js';
import { ControlsUI } from './ControlsUI.js';
import { PauseMenuUI } from './PauseMenuUI.js';
import { InteractionPromptUI } from './InteractionPromptUI.js';
import { DebugUI } from './DebugUI.js';
import { SettingsUI } from './SettingsUI.js';

export class UIManager {
  constructor(actions = {}) {
    this.screens = Array.from(document.querySelectorAll('[data-screen]'));
    this.mainMenu = new MainMenuUI(document.querySelector('[data-screen="main-menu"]'), actions);
    this.loadingScreen = new LoadingScreenUI(document);
    this.hud = new HUDManager(document);
    this.interactionPrompt = new InteractionPromptUI(document);
    this.debug = new DebugUI(document);
    this.controls = new ControlsUI(document.querySelector('[data-modal="controls"]'));
    this.settings = new SettingsUI(document.querySelector('[data-modal="settings"]'));
    this.pauseMenu = new PauseMenuUI(document.querySelector('[data-modal="pause"]'), actions);
    this.tutorial = new TutorialGuideUI(document.querySelector('[data-modal="tutorial"]'), { onComplete: actions.completeTutorial });
  }

  showScreen(name) {
    this.screens.forEach((screen) => screen.classList.toggle('is-hidden', screen.dataset.screen !== name));
  }

  closeOverlays() {
    this.controls.hide();
    this.settings.hide();
    this.pauseMenu.hide();
    this.tutorial.hide();
  }
}
