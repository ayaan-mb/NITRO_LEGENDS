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
    const c1 = [0x5579d8,0xd85f5f,0x60b67f,0xd2a34e][i%4];
    const body = new this.THREE.Mesh(new this.THREE.CapsuleGeometry(0.34, 1.0, 4, 8), new this.THREE.MeshStandardMaterial({ color:c1 }));
    body.position.y = 1.2;
    const head = new this.THREE.Mesh(new this.THREE.SphereGeometry(0.3, 10, 10), new this.THREE.MeshStandardMaterial({ color:0xf0c8a9 }));
    head.position.y = 2.2;
    group.add(body, head);
    group.userData = { from: i % this.points.length, to: (i+3) % this.points.length, t: Math.random(), speed: 0.08 + Math.random()*0.05 };
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
      if (d < 10) { npc.position.x = x + (dx/(d||1))*5; npc.position.z = z + (dz/(d||1))*5; }
      else { npc.position.set(x,0,z); }
    }
  }
}
