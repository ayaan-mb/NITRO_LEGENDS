export class CarCustomizationManager {
  constructor(car) {
    this.car = car;
    this.enabled = false;
    this.paintIndex = 2;
    this.spoilerIndex = 1;
    this.tintIndex = 1;
    this.wheelIndex = 1;
    this.paintPresets = [
      { name: 'White', color: 0xeceff3, metalness: 0.45, roughness: 0.3 },
      { name: 'Black', color: 0x121316, metalness: 0.42, roughness: 0.34 },
      { name: 'Red', color: 0xc61d2b, metalness: 0.5, roughness: 0.28 },
      { name: 'Blue', color: 0x2146b3, metalness: 0.5, roughness: 0.28 },
      { name: 'Silver', color: 0xa5adb8, metalness: 0.65, roughness: 0.22 },
      { name: 'Yellow', color: 0xd7b121, metalness: 0.46, roughness: 0.3 },
      { name: 'Matte Black', color: 0x101114, metalness: 0.1, roughness: 0.82 },
      { name: 'Metallic Gray', color: 0x555c66, metalness: 0.72, roughness: 0.2 },
    ];
  }

  apply() {
    const p = this.paintPresets[this.paintIndex % this.paintPresets.length];
    this.car.bodyMats.forEach((m) => { m.color.setHex(p.color); m.metalness = p.metalness; m.roughness = p.roughness; });
    this.car.windowMat.opacity = [0.35, 0.55, 0.72, 0.85][this.tintIndex % 4];
    this.car.updateSpoiler(this.spoilerIndex % 4);
    this.car.updateWheelStyle(this.wheelIndex % 4);
  }

  nextPaint() { this.paintIndex++; this.apply(); }
  nextSpoiler() { this.spoilerIndex++; this.apply(); }
  nextTint() { this.tintIndex++; this.apply(); }
  nextWheel() { this.wheelIndex++; this.apply(); }
}
