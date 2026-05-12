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
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0x2a3244 }));
    legs.position.y = 0.8;
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.9, 4, 8), new THREE.MeshStandardMaterial({ color: 0x4f7fdc }));
    torso.position.y = 1.8;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf2cfb5 }));
    head.position.y = 2.8;
    this.mesh.add(legs, torso, head);
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
    this.mesh.position.x = Math.max(-bounds, Math.min(bounds, this.mesh.position.x));
    this.mesh.position.z = Math.max(-bounds, Math.min(bounds, this.mesh.position.z));
    if (this.intersectsAnyCollider(this.mesh.position, colliders)) this.mesh.position.copy(prev);
    this.mesh.position.y = 0;
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
