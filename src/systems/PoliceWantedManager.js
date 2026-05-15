export class PoliceWantedManager {
  constructor(THREE, scene, world, getPlayerState, onDamage) {
    this.THREE = THREE;
    this.scene = scene;
    this.world = world;
    this.getPlayerState = getPlayerState;
    this.onDamage = onDamage;
    this.wantedLevel = 0;
    this.escapeTimer = 0;
    this.officers = [];
    this.cars = [];
    this.helicopters = [];
    this.debugState = 'Idle';
  }

  setWantedLevel(level) {
    const clamped = Math.max(0, Math.min(5, Math.floor(level)));
    if (clamped === this.wantedLevel) return;
    this.wantedLevel = clamped;
    console.log(`Wanted level set to ${this.wantedLevel}`);
    this.updateWantedResponse(true);
  }
  addWantedLevel(amount) { this.setWantedLevel(this.wantedLevel + amount); }
  clearWantedLevel() { this.setWantedLevel(0); }

  update(dt) {
    this.updateWantedResponse(false);
    const player = this.getPlayerState();
    this.updateOfficers(dt, player);
    this.updateCars(dt, player);
    this.updateHelicopters(dt, player);
    this.updateEscape(dt, player);
  }

  updateWantedResponse(force) {
    if (this.wantedLevel <= 0) {
      if (this.officers.length || this.cars.length || this.helicopters.length) {
        console.log('Despawn police units (wanted 0)');
        this.despawnPoliceUnits();
      }
      this.debugState = 'Idle';
      return;
    }

    const targets = [
      { o: 2, c: 0, h: 0 },
      { o: 3, c: 1, h: 0 },
      { o: 5, c: 3, h: 0 },
      { o: 8, c: 5, h: 1 },
      { o: 12, c: 7, h: 2 },
    ][this.wantedLevel - 1];

    const missing = this.officers.length < targets.o || this.cars.length < targets.c || this.helicopters.length < targets.h;
    if (force || missing) {
      console.log(`Spawning level ${this.wantedLevel} police response`);
      while (this.officers.length < targets.o) this.spawnPoliceOfficer();
      while (this.cars.length < targets.c) this.spawnPoliceCar();
      while (this.helicopters.length < targets.h) this.spawnPoliceHelicopter();
      console.log(`Active police count => officers:${this.officers.length}, cars:${this.cars.length}, helicopters:${this.helicopters.length}`);
    }
    this.debugState = 'Chasing';
  }

  safeSpawn(minD, maxD, y = 0) {
    const p = this.getPlayerState().position;
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = minD + Math.random() * (maxD - minD);
      const x = p.x + Math.cos(a) * d;
      const z = p.z + Math.sin(a) * d;
      if (Math.abs(x) > this.world.bounds || Math.abs(z) > this.world.bounds) continue;
      if (!this.isBlocked(x, z)) return new this.THREE.Vector3(x, y, z);
    }
    return new this.THREE.Vector3(p.x + minD, y, p.z + minD);
  }

  isBlocked(x, z) {
    return (this.world.colliders || []).some((c) => x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ);
  }

  spawnPoliceOfficer() {
    const pos = this.safeSpawn(30, 80, 0);
    const g = new this.THREE.Group();
    const uni = new this.THREE.MeshStandardMaterial({ color: 0x243a68, roughness: 0.72 });
    const skin = new this.THREE.MeshStandardMaterial({ color: 0xe4bc99, roughness: 0.8 });
    const torso = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.56, 0.95, 0.3), uni); torso.position.y = 1.52;
    const legL = new this.THREE.Mesh(new this.THREE.CapsuleGeometry(0.1, 0.62, 4, 8), uni); legL.position.set(-0.14, 0.34, 0);
    const legR = legL.clone(); legR.position.x = 0.14;
    const head = new this.THREE.Mesh(new this.THREE.SphereGeometry(0.18, 12, 12), skin); head.position.y = 2.2;
    const cap = new this.THREE.Mesh(new this.THREE.CylinderGeometry(0.18,0.18,0.08,10), new this.THREE.MeshStandardMaterial({color:0x121826})); cap.position.y = 2.36;
    g.add(torso, legL, legR, head, cap);
    g.position.copy(pos);
    g.userData = { type: 'officer', hp: 100, attackCd: 0, legL, legR, phase: Math.random() * 6 };
    this.scene.add(g);
    this.officers.push(g);
    console.log('Spawned police officer');
  }

  spawnPoliceCar() {
    const pos = this.safeSpawn(60, 140, 0);
    const car = new this.THREE.Group();
    const bodyMat = new this.THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.32 });
    const body = new this.THREE.Mesh(new this.THREE.BoxGeometry(2.0, 0.6, 4.6), bodyMat); body.position.y = 1.1;
    const roof = new this.THREE.Mesh(new this.THREE.BoxGeometry(1.6, 0.45, 2), bodyMat); roof.position.set(0, 1.55, -0.2);
    const bar = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.9, 0.12, 0.28), new this.THREE.MeshStandardMaterial({ color: 0x334055 })); bar.position.set(0, 1.85, -0.15);
    const red = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.35, 0.08, 0.25), new this.THREE.MeshStandardMaterial({ color: 0xff3344, emissive: 0x770011, emissiveIntensity: 1 })); red.position.set(-0.2, 1.86, -0.15);
    const blue = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.35, 0.08, 0.25), new this.THREE.MeshStandardMaterial({ color: 0x3377ff, emissive: 0x002277, emissiveIntensity: 1 })); blue.position.set(0.2, 1.86, -0.15);
    car.add(body, roof, bar, red, blue);
    car.position.copy(pos);
    car.userData = { type: 'car', hp: 220, speed: 0, red, blue };
    this.scene.add(car);
    this.cars.push(car);
    console.log('Spawned police car');
  }

  spawnPoliceHelicopter() {
    const pos = this.safeSpawn(120, 200, 50);
    const h = new this.THREE.Group();
    const body = new this.THREE.Mesh(new this.THREE.CapsuleGeometry(1.2, 2.8, 8, 16), new this.THREE.MeshStandardMaterial({ color: 0x1f2e4c }));
    body.rotation.z = Math.PI / 2;
    const cockpit = new this.THREE.Mesh(new this.THREE.SphereGeometry(0.85, 12, 12), new this.THREE.MeshStandardMaterial({ color: 0x6a8fb1, transparent: true, opacity: 0.6 })); cockpit.position.set(1.6, 0.2, 0);
    const tail = new this.THREE.Mesh(new this.THREE.BoxGeometry(2.8, 0.2, 0.2), new this.THREE.MeshStandardMaterial({ color: 0x1f2e4c })); tail.position.set(-2.5, 0.2, 0);
    const rotor = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.12, 0.05, 6), new this.THREE.MeshStandardMaterial({ color: 0x1d1d1d })); rotor.position.y = 1.1;
    const tailRotor = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.8, 0.05, 0.12), new this.THREE.MeshStandardMaterial({ color: 0x1d1d1d })); tailRotor.position.set(-3.8, 0.2, 0);
    h.add(body, cockpit, tail, rotor, tailRotor);
    h.position.copy(pos);
    h.userData = { type: 'heli', rotor, tailRotor, attackCd: 0 };
    this.scene.add(h);
    this.helicopters.push(h);
    console.log('Spawned police helicopter');
  }

  updateOfficers(dt, player) {
    for (const o of this.officers) {
      const to = player.position.clone().sub(o.position);
      const d = to.length();
      const speed = this.wantedLevel >= 3 ? 8 : 5.5;
      if (d > 1.8) o.position.addScaledVector(to.normalize(), speed * dt);
      o.lookAt(player.position.x, o.position.y, player.position.z);
      o.userData.phase += dt * 7;
      const s = Math.sin(o.userData.phase) * 0.4;
      o.userData.legL.rotation.x = s;
      o.userData.legR.rotation.x = -s;
      o.userData.attackCd -= dt;
      if (d < 2.4 && o.userData.attackCd <= 0) {
        o.userData.attackCd = this.wantedLevel >= 4 ? 0.5 : 0.8;
        const dmg = this.wantedLevel >= 4 ? 8 : this.wantedLevel >= 3 ? 10 : 5;
        this.onDamage(dmg, 'officer');
      }
    }
  }

  updateCars(dt, player) {
    const sirenPhase = Date.now() * 0.01;
    for (const c of this.cars) {
      const to = player.position.clone().sub(c.position);
      const d = to.length();
      const chaseSpeed = 20 + this.wantedLevel * 5;
      c.userData.speed += (chaseSpeed - c.userData.speed) * Math.min(1, dt * 1.8);
      const move = to.normalize().multiplyScalar(c.userData.speed * dt);
      c.position.add(move);
      c.lookAt(player.position.x, c.position.y, player.position.z);
      c.userData.red.material.emissiveIntensity = (Math.sin(sirenPhase) * 0.5 + 0.5) * 1.5;
      c.userData.blue.material.emissiveIntensity = (Math.sin(sirenPhase + Math.PI) * 0.5 + 0.5) * 1.5;
      if (d < 4.5) this.onDamage(6 + this.wantedLevel, 'policeCarRam');
    }
  }

  updateHelicopters(dt, player) {
    for (const h of this.helicopters) {
      const target = player.position.clone().add(new this.THREE.Vector3(0, 42, 0));
      const to = target.sub(h.position);
      h.position.addScaledVector(to, Math.min(1, dt * 0.9));
      h.lookAt(player.position.x, h.position.y, player.position.z);
      h.userData.rotor.rotation.y += dt * 40;
      h.userData.tailRotor.rotation.x += dt * 50;
      h.userData.attackCd -= dt;
      const dist = h.position.distanceTo(player.position);
      if (this.wantedLevel >= 5 && dist < 65 && h.userData.attackCd <= 0) {
        h.userData.attackCd = 0.5;
        this.onDamage(5, 'helicopter');
      }
    }
  }

  updateEscape(dt, player) {
    if (this.wantedLevel <= 0) return;
    const nearPolice = [...this.officers, ...this.cars, ...this.helicopters].some((u) => u.position.distanceTo(player.position) < (u.userData.type === 'heli' ? 95 : 45));
    if (nearPolice) {
      this.escapeTimer = [0, 10, 15, 20, 30, 45][this.wantedLevel];
      return;
    }
    this.escapeTimer -= dt;
    if (this.escapeTimer <= 0) {
      this.setWantedLevel(this.wantedLevel - 1);
    }
  }

  despawnPoliceUnits() {
    for (const arr of [this.officers, this.cars, this.helicopters]) {
      for (const u of arr) this.scene.remove(u);
      arr.length = 0;
    }
  }

  getDebug() {
    return {
      wanted: this.wantedLevel,
      officers: this.officers.length,
      cars: this.cars.length,
      helicopters: this.helicopters.length,
      state: this.debugState,
      escapeTimer: Math.max(0, this.escapeTimer),
    };
  }
}
