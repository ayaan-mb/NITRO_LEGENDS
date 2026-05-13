export class PlayerCharacterController {
  constructor(THREE, scene, spawnPoint) {
    this.THREE = THREE;
    this.scene = scene;
    this.speedWalk = 6;
    this.speedRun = 11;
    this.health = 100;
    this.active = false;
    this.keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, ShiftLeft: false };
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));

    this.mesh = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe7bf9f, roughness: 0.75 });
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x2d3342, roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf4f5f7, roughness: 0.82 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1f1f21, roughness: 0.58 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.32), suitMat);
    torso.position.y = 1.55;
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.46, 0.3), suitMat);
    waist.position.y = 0.84;
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.76, 0.24), shirtMat);
    shirt.position.y = 1.52;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), skinMat);
    head.position.y = 2.25;
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.56, 4, 8), suitMat);
    const armR = armL.clone();
    armL.position.set(-0.38, 1.48, 0);
    armR.position.set(0.38, 1.48, 0);
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.66, 4, 8), suitMat);
    const legR = legL.clone();
    legL.position.set(-0.15, 0.35, 0);
    legR.position.set(0.15, 0.35, 0);
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.28), shoeMat);
    const shoeR = shoeL.clone();
    shoeL.position.set(-0.15, -0.02, 0.08);
    shoeR.position.set(0.15, -0.02, 0.08);

    this.mesh.add(torso, waist, shirt, head, armL, armR, legL, legR, shoeL, shoeR);
    this.walkAnim = { armL, armR, legL, legR, phase: 0 };
    this.mesh.position.copy(spawnPoint);
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  onKey(e, isDown) { if (e.code in this.keys) this.keys[e.code] = isDown; }
  setActive(active) { this.active = active; this.mesh.visible = active; }

  update(dt, bounds, colliders = []) {
    if (!this.active) return;
    const prev = this.mesh.position.clone();
    const side = Number(this.keys.KeyD) - Number(this.keys.KeyA);
    const fwd = Number(this.keys.KeyW) - Number(this.keys.KeyS);
    const mag = Math.hypot(side, fwd) || 1;
    const speed = this.keys.ShiftLeft ? this.speedRun : this.speedWalk;
    this.mesh.position.x += (side / mag) * speed * dt;
    this.mesh.position.z += (fwd / mag) * speed * dt;
    if (Math.abs(side) + Math.abs(fwd) > 0.01) {
      this.mesh.rotation.y = Math.atan2(side, fwd);
      this.walkAnim.phase += dt * (this.keys.ShiftLeft ? 10 : 6);
    }
    this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
    this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));
    if (this.intersectsAnyCollider(this.mesh.position, colliders)) this.mesh.position.copy(prev);
    this.mesh.position.y = 0;

    const swing = Math.sin(this.walkAnim.phase) * (this.keys.ShiftLeft ? 0.6 : 0.42) * (Math.abs(side) + Math.abs(fwd) > 0.01 ? 1 : 0.15);
    this.walkAnim.armL.rotation.x = swing;
    this.walkAnim.armR.rotation.x = -swing;
    this.walkAnim.legL.rotation.x = -swing;
    this.walkAnim.legR.rotation.x = swing;
  }

  intersectsAnyCollider(position, colliders = []) {
    const radius = 0.6;
    return colliders.some((c) => {
      const nx = Math.max(c.minX, Math.min(position.x, c.maxX));
      const nz = Math.max(c.minZ, Math.min(position.z, c.maxZ));
      const dx = position.x - nx;
      const dz = position.z - nz;
      return dx * dx + dz * dz < radius * radius;
    });
  }
}
