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

    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, Space: false, KeyN: false };
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));

    this.mesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.9, 4.4),
      new THREE.MeshStandardMaterial({ color: 0xd1252f, metalness: 0.4, roughness: 0.4 })
    );
    body.position.y = 1.2;
    this.mesh.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 2),
      new THREE.MeshStandardMaterial({ color: 0x2b2f33 })
    );
    cabin.position.set(0, 1.85, -0.1);
    this.mesh.add(cabin);

    this.spawnPoint = spawnPoint.clone();
    this.worldColliders = [];
    this.throttle = 0;
    this.mesh.position.copy(this.spawnPoint);
    scene.add(this.mesh);
  }

  onKey(e, isDown) {
    if (e.code in this.keys) this.keys[e.code] = isDown;
    if (e.code === 'KeyR' && isDown) this.reset();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  reset() {
    this.mesh.position.copy(this.spawnPoint);
    this.mesh.rotation.set(0, 0, 0);
    this.speed = 0;
  }

  applyState(state) {
    this.mesh.position.set(state.pos_x, state.pos_y, state.pos_z);
    this.mesh.rotation.y = state.rot_y;
    this.speed = 0;
  }

  getState() {
    return {
      pos_x: this.mesh.position.x,
      pos_y: this.mesh.position.y,
      pos_z: this.mesh.position.z,
      rot_y: this.mesh.rotation.y,
    };
  }

  update(dt, bounds) {
    if (!this.enabled) return;
    const previousPosition = this.mesh.position.clone();
    const targetThrottle = Number(this.keys.KeyW) - Number(this.keys.KeyS);
    this.throttle += (targetThrottle - this.throttle) * Math.min(1, dt * 4.5);
    const forwardInput = this.throttle;
    const isBraking = this.keys.Space && Math.abs(this.speed) > 8;
    this.isDrifting = isBraking && Math.abs(Number(this.keys.KeyA) - Number(this.keys.KeyD)) > 0;

    this.isNitroActive = this.keys.KeyN && this.nitro > 0 && forwardInput > 0.2;
    if (this.isNitroActive) {
      this.nitro = Math.max(0, this.nitro - 26 * dt);
      this.maxSpeed = this.nitroMaxSpeed;
    } else {
      this.nitro = Math.min(100, this.nitro + 12 * dt);
      this.maxSpeed = this.baseMaxSpeed;
    }

    if (forwardInput >= 0) {
      this.speed += forwardInput * this.accel * dt;
    } else {
      this.speed += forwardInput * this.brakeForce * dt;
    }

    const highSpeedGrip = Math.max(0.986, 0.996 - Math.abs(this.speed) * 0.00003);
    this.speed *= this.isDrifting ? 0.975 : highSpeedGrip;
    if (isBraking) this.speed *= 0.94;
    this.speed = Math.max(-this.baseMaxSpeed * 0.35, Math.min(this.maxSpeed, this.speed));

    const steerInput = Number(this.keys.KeyA) - Number(this.keys.KeyD);
    const speedRatio = Math.min(Math.abs(this.speed) / this.baseMaxSpeed, 1);
    const steerStability = 1 - speedRatio * 0.55;
    const steerAmount = steerInput * this.steerPower * dt * Math.min(Math.abs(this.speed) / 16, 1) * steerStability * (this.isDrifting ? 1.15 : 1);
    this.mesh.rotation.y += steerAmount;

    const forward = new this.THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    this.mesh.position.addScaledVector(forward, this.speed * dt);

    this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
    this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));

    if (this.intersectsAnyCollider(this.mesh.position, this.worldColliders)) {
      this.mesh.position.copy(previousPosition);
      this.speed *= -0.2;
    }

    if (this.isDrifting) this.driftScore += Math.abs(steerInput) * dt * Math.abs(this.speed) * 0.1;

    this.mesh.position.y = 1.2;
  }

  getTelemetry() {
    return {
      speedKmh: Math.max(0, this.speed * 2.6),
      nitro: this.nitro,
      drifting: this.isDrifting,
      driftScore: Math.floor(this.driftScore),
      nitroActive: this.isNitroActive,
    };
  }

  setWorldColliders(colliders = []) {
    this.worldColliders = colliders;
  }

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
