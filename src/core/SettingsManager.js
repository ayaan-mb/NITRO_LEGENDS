export class SettingsManager {
  constructor() {
    this.values = {
      masterVolume: 80,
      graphicsQuality: 'High',
      mouseSensitivity: 50,
      showFps: false,
    };
  }

  get(key) {
    return this.values[key];
  }

  set(key, value) {
    if (key in this.values) this.values[key] = value;
  }
}
