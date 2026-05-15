import { CarCustomizationManager } from './CarCustomizationManager.js';

export class CarController {
  constructor(THREE, scene, spawnPoint) {
    this.THREE = THREE;
    this.speed = 0;
    this.maxSpeed = 400 / 2.6;
    this.baseMaxSpeed = 400 / 2.6;
    this.nitroMaxSpeed = 430 / 2.6;
    this.accel = 58;
    this.brakeForce = 85;
    this.steerPower = 1.6;
    this.enabled = true;
    this.nitro = 100;
    this.driftScore = 0;
    this.isDrifting = false;
    this.isNitroActive = false;
    this.currentSteer = 0;

    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, Space: false, KeyN: false };
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));

    this.mesh = new THREE.Group();
    this.bodyMats = [];
    this.buildSedanModel();

    this.spawnPoint = spawnPoint.clone();
    this.worldColliders = [];
    this.throttle = 0;
    this.mesh.position.copy(this.spawnPoint);
    scene.add(this.mesh);

    this.customization = new CarCustomizationManager(this);
    this.customization.apply();
  }

  buildSedanModel() {
    const THREE = this.THREE;
    const paintMat = new THREE.MeshStandardMaterial({ color: 0xc61d2b, metalness: 0.55, roughness: 0.25 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x15191f, metalness: 0.25, roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xbfc8d2, metalness: 0.9, roughness: 0.15 });
    this.windowMat = new THREE.MeshStandardMaterial({ color: 0x101820, metalness: 0.25, roughness: 0.1, transparent: true, opacity: 0.55 });
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xfdf4d6, emissive: 0x665b2a, emissiveIntensity: 0.3 });
    const rearLightMat = new THREE.MeshStandardMaterial({ color: 0x8c0f16, emissive: 0x550008, emissiveIntensity: 0.3 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.92 });
    this.rimMat = new THREE.MeshStandardMaterial({ color: 0x9aa4b2, metalness: 0.95, roughness: 0.16 });
    this.bodyMats.push(paintMat);

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 4.8), paintMat); body.position.y = 1.15;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.18, 1.25), paintMat); hood.position.set(0, 1.45, 1.45);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.5, 2.1), paintMat); roof.position.set(0, 1.7, -0.1);
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 1.0), paintMat); trunk.position.set(0, 1.45, -1.8);

    const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.55), darkMat); bumperFront.position.set(0, 0.95, 2.38);
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.45), darkMat); splitter.position.set(0, 0.72, 2.35);
    const bumperRear = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.6), darkMat); bumperRear.position.set(0, 0.98, -2.35);
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.35), darkMat); diffuser.position.set(0, 0.75, -2.42);

    const sideSkirtL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 3.4), darkMat); sideSkirtL.position.set(-1.02, 0.85, -0.1);
    const sideSkirtR = sideSkirtL.clone(); sideSkirtR.position.x = 1.02;

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.35, 0.08), darkMat); grille.position.set(0, 1.08, 2.42);
    const grilleTrim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 0.04), chromeMat); grilleTrim.position.set(0, 1.1, 2.45);
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.12), lightMat); headL.position.set(-0.67, 1.25, 2.42);
    const headR = headL.clone(); headR.position.x = 0.67;
    this.headLights = [headL, headR];
    this.brakeLightL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.12), rearLightMat); this.brakeLightL.position.set(-0.68, 1.23, -2.42);
    this.brakeLightR = this.brakeLightL.clone(); this.brakeLightR.position.x = 0.68;

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 0.08), this.windowMat); windshield.rotation.x = -0.45; windshield.position.set(0, 1.78, 0.88);
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.38, 0.08), this.windowMat); rearGlass.rotation.x = 0.4; rearGlass.position.set(0, 1.72, -1.15);
    const sideWindowL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 1.5), this.windowMat); sideWindowL.position.set(-0.83, 1.72, -0.1);
    const sideWindowR = sideWindowL.clone(); sideWindowR.position.x = 0.83;
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.2), darkMat); mirrorL.position.set(-0.95, 1.58, 0.75);
    const mirrorR = mirrorL.clone(); mirrorR.position.x = 0.95;

    this.exhausts = [];
    for (const x of [-0.35, 0.35]) { const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), chromeMat); ex.rotation.x = Math.PI / 2; ex.position.set(x, 0.86, -2.52); this.exhausts.push(ex); }

    this.spoilerGroup = new THREE.Group();
    this.spoilerGroup.position.set(0, 1.65, -2.05);
    this.mesh.add(this.spoilerGroup);

    this.wheels = [];
    const wheelPositions = [[-0.9, 0.56, 1.55, true], [0.9, 0.56, 1.55, true], [-0.9, 0.56, -1.45, false], [0.9, 0.56, -1.45, false]];
    for (const [x, y, z, steerable] of wheelPositions) {
      const pivot = new THREE.Group(); pivot.position.set(x, y, z);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.28, 18), tireMat); tire.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12), this.rimMat); rim.rotation.z = Math.PI / 2;
      pivot.add(tire, rim);
      this.mesh.add(pivot);
      this.wheels.push({ pivot, tire, steerable });
    }

    this.mesh.add(body, hood, roof, trunk, bumperFront, splitter, bumperRear, diffuser, sideSkirtL, sideSkirtR, grille, grilleTrim, headL, headR, this.brakeLightL, this.brakeLightR, windshield, rearGlass, sideWindowL, sideWindowR, mirrorL, mirrorR, ...this.exhausts);
  }

  updateSpoiler(level) {
    this.spoilerGroup.clear();
    const THREE = this.THREE;
    const dark = new THREE.MeshStandardMaterial({ color: 0x1f2227, metalness: 0.25, roughness: 0.6 });
    if (level === 0) return;
    if (level === 1) { const lip = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.18), dark); this.spoilerGroup.add(lip); return; }
    if (level === 2) { const duck = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.07, 0.2), dark); duck.position.y = 0.08; this.spoilerGroup.add(duck); return; }
    const wing = new THREE.Mesh(new THREE.BoxGeometry(level >= 4 ? 1.6 : 1.45, 0.08, 0.22), dark);
    const standL = new THREE.Mesh(new THREE.BoxGeometry(0.07, level >= 4 ? 0.3 : 0.22, 0.07), dark); standL.position.set(-0.45, -0.1, 0);
    const standR = standL.clone(); standR.position.x = 0.45;
    wing.position.y = level >= 4 ? 0.2 : 0.12;
    this.spoilerGroup.add(wing, standL, standR);
  }

  updateWheelStyle(style) {
    const colors = [0x9aa4b2, 0x717b89, 0x1d1f22, 0xcfd6df, 0x4b5666, 0xaea8a0, 0x9099a8, 0x2c2f35];
    this.rimMat.color.setHex(colors[style % colors.length]);
    this.wheels.forEach((w) => {
      const s = style === 3 ? 1.12 : 1;
      w.tire.scale.set(s, s, 1);
    });
  }

  onKey(e, isDown) {
    if (e.code in this.keys) this.keys[e.code] = isDown;
    if (e.code === 'KeyR' && isDown) this.reset();
    if (!isDown) return;
    if (e.code === 'KeyC') this.customization.enabled = !this.customization.enabled;
    if (!this.customization.enabled) return;
    if (e.code === 'Digit1') this.customization.nextPaint();
    if (e.code === 'Digit2') this.customization.nextSpoiler();
    if (e.code === 'Digit3') this.customization.nextWheel();
    if (e.code === 'Digit4') this.customization.nextTint();
    if (e.code === 'KeyL') {
      const on = this.headlightsOn = !this.headlightsOn;
      this.headLights.forEach((h)=>{h.material.emissiveIntensity = on ? 0.9 : 0.3;});
    }
  }

  setEnabled(enabled) { this.enabled = enabled; }
  reset() { this.mesh.position.copy(this.spawnPoint); this.mesh.rotation.set(0, 0, 0); this.speed = 0; }
  applyState(state) { this.mesh.position.set(state.pos_x, state.pos_y, state.pos_z); this.mesh.rotation.y = state.rot_y; this.speed = 0; }
  getState() { return { pos_x: this.mesh.position.x, pos_y: this.mesh.position.y, pos_z: this.mesh.position.z, rot_y: this.mesh.rotation.y }; }

  update(dt, bounds) {
    if (!this.enabled) return;
    const previousPosition = this.mesh.position.clone();
    const targetThrottle = Number(this.keys.KeyW) - Number(this.keys.KeyS);
    this.throttle += (targetThrottle - this.throttle) * Math.min(1, dt * 4.5);
    const forwardInput = this.throttle;
    const isBraking = this.keys.Space && Math.abs(this.speed) > 8;
    this.isDrifting = isBraking && Math.abs(Number(this.keys.KeyA) - Number(this.keys.KeyD)) > 0;

    this.isNitroActive = this.keys.KeyN && this.nitro > 0 && forwardInput > 0.2;
    if (this.isNitroActive) { this.nitro = Math.max(0, this.nitro - 26 * dt); this.maxSpeed = this.nitroMaxSpeed; }
    else { this.nitro = Math.min(100, this.nitro + 12 * dt); this.maxSpeed = this.baseMaxSpeed; }

    if (forwardInput >= 0) this.speed += forwardInput * this.accel * dt;
    else this.speed += forwardInput * this.brakeForce * dt;

    const highSpeedGrip = Math.max(0.986, 0.996 - Math.abs(this.speed) * 0.00003);
    this.speed *= this.isDrifting ? 0.975 : highSpeedGrip;
    if (isBraking) this.speed *= 0.94;
    this.speed = Math.max(-this.baseMaxSpeed * 0.35, Math.min(this.maxSpeed, this.speed));

    const steerInput = Number(this.keys.KeyA) - Number(this.keys.KeyD);
    const speedRatio = Math.min(Math.abs(this.speed) / this.baseMaxSpeed, 1);
    const steerStability = 1 - speedRatio * 0.55;
    const steerAmount = steerInput * this.steerPower * dt * Math.min(Math.abs(this.speed) / 16, 1) * steerStability * (this.isDrifting ? 1.15 : 1);
    this.mesh.rotation.y += steerAmount;
    this.currentSteer += (steerInput * 0.45 - this.currentSteer) * Math.min(1, dt * 8);

    const forward = new this.THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    this.mesh.position.addScaledVector(forward, this.speed * dt);
    this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
    this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));

    if (this.intersectsAnyCollider(this.mesh.position, this.worldColliders)) { this.mesh.position.copy(previousPosition); this.speed *= -0.2; }
    if (this.isDrifting) this.driftScore += Math.abs(steerInput) * dt * Math.abs(this.speed) * 0.1;

    const spin = (this.speed * dt) / 0.34;
    this.wheels.forEach((w) => {
      w.tire.rotation.x += spin;
      if (w.steerable) w.pivot.rotation.y = this.currentSteer;
    });

    const brakingNow = this.keys.KeyS || isBraking;
    this.brakeLightL.material.emissiveIntensity = brakingNow ? 1.1 : 0.3;
    this.brakeLightR.material.emissiveIntensity = brakingNow ? 1.1 : 0.3;
    this.mesh.position.y = 1.2;
  }

  getTelemetry() {
    return {
      speedKmh: Math.max(0, this.speed * 2.6), nitro: this.nitro, drifting: this.isDrifting,
      driftScore: Math.floor(this.driftScore), nitroActive: this.isNitroActive, customizationOpen: this.customization.enabled,
    };
  }

  setWorldColliders(colliders = []) { this.worldColliders = colliders; }
  intersectsAnyCollider(position, colliders = []) {
    const radius = 1.7;
    return colliders.some((c) => {
      const nearestX = Math.max(c.minX, Math.min(position.x, c.maxX));
      const nearestZ = Math.max(c.minZ, Math.min(position.z, c.maxZ));
      const dx = position.x - nearestX;
      const dz = position.z - nearestZ;
      return dx * dx + dz * dz < radius * radius;
    });
  }
}
