export class CarCustomizationManager {
  constructor(car) {
    this.car = car;
    this.enabled = false;
    this.paintIndex = 2;
    this.spoilerIndex = 1;
    this.tintIndex = 1;
    this.wheelIndex = 1;
    this.paintPresets = [
      { name: 'Gloss White', color: 0xeceff3, metalness: 0.45, roughness: 0.24 },
      { name: 'Gloss Black', color: 0x121316, metalness: 0.42, roughness: 0.3 },
      { name: 'Silver', color: 0xa5adb8, metalness: 0.65, roughness: 0.2 },
      { name: 'Red', color: 0xc61d2b, metalness: 0.5, roughness: 0.26 },
      { name: 'Blue', color: 0x2146b3, metalness: 0.5, roughness: 0.26 },
      { name: 'Yellow', color: 0xd7b121, metalness: 0.46, roughness: 0.3 },
      { name: 'Orange', color: 0xc76f1d, metalness: 0.48, roughness: 0.29 },
      { name: 'Green', color: 0x2f8b58, metalness: 0.45, roughness: 0.31 },
      { name: 'Purple', color: 0x6e3da8, metalness: 0.5, roughness: 0.28 },
      { name: 'Matte Black', color: 0x101114, metalness: 0.1, roughness: 0.82 },
      { name: 'Metallic Gray', color: 0x555c66, metalness: 0.72, roughness: 0.2 },
      { name: 'Pearl White', color: 0xe7e7e4, metalness: 0.6, roughness: 0.18 },
      { name: 'Chrome Silver', color: 0xbdc7d1, metalness: 0.95, roughness: 0.08 },
      { name: 'Carbon Black', color: 0x0f1012, metalness: 0.15, roughness: 0.7 },
    ];
  }

  apply() {
    const p = this.paintPresets[this.paintIndex % this.paintPresets.length];
    this.car.bodyMats.forEach((m) => { m.color.setHex(p.color); m.metalness = p.metalness; m.roughness = p.roughness; });
    this.car.windowMat.opacity = [0.25, 0.4, 0.55, 0.72, 0.88][this.tintIndex % 5];
    this.car.updateSpoiler(this.spoilerIndex % 6);
    this.car.updateWheelStyle(this.wheelIndex % 8);
  }

  nextPaint() { this.paintIndex++; this.apply(); }
  nextSpoiler() { this.spoilerIndex++; this.apply(); }
  nextTint() { this.tintIndex++; this.apply(); }
  nextWheel() { this.wheelIndex++; this.apply(); }
  randomize() {
    this.paintIndex = Math.floor(Math.random() * this.paintPresets.length);
    this.spoilerIndex = Math.floor(Math.random() * 6);
    this.tintIndex = Math.floor(Math.random() * 5);
    this.wheelIndex = Math.floor(Math.random() * 8);
    this.apply();
  }
  resetStock() { this.paintIndex = 2; this.spoilerIndex = 1; this.tintIndex = 1; this.wheelIndex = 1; this.apply(); }
}
