export class CarController {
  constructor(THREE, scene, spawnPoint) {
    this.THREE = THREE;
    this.speed = 0;
    this.maxSpeed = 80;
    this.accel = 35;
    this.steerPower = 1.6;

    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false };
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
    this.mesh.position.copy(this.spawnPoint);
    scene.add(this.mesh);
  }

  onKey(e, isDown) {
    if (e.code in this.keys) this.keys[e.code] = isDown;
    if (e.code === 'KeyR' && isDown) this.reset();
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
    const forwardInput = Number(this.keys.KeyW) - Number(this.keys.KeyS);
    this.speed += forwardInput * this.accel * dt;
    this.speed *= 0.98;
    this.speed = Math.max(-this.maxSpeed * 0.4, Math.min(this.maxSpeed, this.speed));

    const steerInput = Number(this.keys.KeyA) - Number(this.keys.KeyD);
    const steerAmount = steerInput * this.steerPower * dt * Math.min(Math.abs(this.speed) / 10, 1);
    this.mesh.rotation.y += steerAmount;

    const forward = new this.THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    this.mesh.position.addScaledVector(forward, this.speed * dt);

    this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
    this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));
    this.mesh.position.y = 1.2;
  }
}
