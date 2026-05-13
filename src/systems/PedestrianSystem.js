export class PedestrianSystem {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.npcs = [];
    this.points = [[-500,-120],[-420,120],[-300,320],[-120,-360],[120,360],[300,-320],[500,140]];
    for (let i = 0; i < 16; i++) this.spawn(i);
  }

  spawn(i) {
    const group = new this.THREE.Group();
    const suitColors = [0x2f3d63, 0x444a56, 0x304b3f, 0x5e4b35];
    const shirtColors = [0xf0f2f5, 0xe2e8ef, 0xf7f0e2];
    const skin = new this.THREE.MeshStandardMaterial({ color: 0xe9c4a2, roughness: 0.75 });
    const suit = new this.THREE.MeshStandardMaterial({ color: suitColors[i % suitColors.length], roughness: 0.7 });
    const shirt = new this.THREE.MeshStandardMaterial({ color: shirtColors[i % shirtColors.length], roughness: 0.8 });

    const torso = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.55, 0.95, 0.3), suit);
    torso.position.y = 1.55;
    const waist = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.52, 0.45, 0.28), suit);
    waist.position.y = 0.85;
    const chest = new this.THREE.Mesh(new this.THREE.BoxGeometry(0.35, 0.65, 0.24), shirt);
    chest.position.y = 1.5;
    const head = new this.THREE.Mesh(new this.THREE.SphereGeometry(0.18, 12, 12), skin);
    head.position.y = 2.2;
    const armL = new this.THREE.Mesh(new this.THREE.CapsuleGeometry(0.08, 0.5, 4, 8), suit);
    const armR = armL.clone();
    armL.position.set(-0.35, 1.48, 0);
    armR.position.set(0.35, 1.48, 0);
    const legL = new this.THREE.Mesh(new this.THREE.CapsuleGeometry(0.09, 0.62, 4, 8), suit);
    const legR = legL.clone();
    legL.position.set(-0.14, 0.35, 0);
    legR.position.set(0.14, 0.35, 0);
    group.add(torso, waist, chest, head, armL, armR, legL, legR);

    group.userData = {
      from: i % this.points.length,
      to: (i + 3) % this.points.length,
      t: Math.random(),
      speed: 0.028 + Math.random() * 0.02,
      walkPhase: Math.random() * Math.PI * 2,
      armL,
      armR,
      legL,
      legR,
    };
    this.scene.add(group);
    this.npcs.push(group);
  }

  update(dt, playerPos) {
    for (const npc of this.npcs) {
      const u = npc.userData;
      const a = this.points[u.from]; const b = this.points[u.to];
      u.t += u.speed * dt;
      if (u.t >= 1) { u.t = 0; u.from = u.to; u.to = (u.to + 1 + Math.floor(Math.random()*2)) % this.points.length; }
      const x = a[0] + (b[0]-a[0]) * u.t;
      const z = a[1] + (b[1]-a[1]) * u.t;
      const dx = x - playerPos.x; const dz = z - playerPos.z;
      const d = Math.hypot(dx,dz);
      if (d < 10) { npc.position.x = x + (dx/(d||1))*4; npc.position.z = z + (dz/(d||1))*4; }
      else { npc.position.set(x,0,z); }

      const dirX = b[0] - a[0];
      const dirZ = b[1] - a[1];
      npc.rotation.y = Math.atan2(dirX, dirZ);
      u.walkPhase += dt * 6;
      const swing = Math.sin(u.walkPhase) * 0.45;
      u.armL.rotation.x = swing;
      u.armR.rotation.x = -swing;
      u.legL.rotation.x = -swing;
      u.legR.rotation.x = swing;
    }
  }
}
