export class TrafficSystem {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.cars = [];
    this.time = 0;
    this.trafficLightPhase = 0;
    this.paths = [
      { a: new THREE.Vector3(-600, 0, -250), b: new THREE.Vector3(600, 0, -250) },
      { a: new THREE.Vector3(600, 0, 250), b: new THREE.Vector3(-600, 0, 250) },
      { a: new THREE.Vector3(-250, 0, -600), b: new THREE.Vector3(-250, 0, 600) },
      { a: new THREE.Vector3(250, 0, 600), b: new THREE.Vector3(250, 0, -600) },
    ];
    for (let i = 0; i < 12; i++) this.spawnCar(i);
  }

  spawnCar(i) {
    const path = this.paths[i % this.paths.length];
    const t = (i % 6) / 6;
    const p = path.a.clone().lerp(path.b, t);
    const car = new this.THREE.Group();
    const color = [0x8bb0ff, 0xffcd60, 0xeb6f6f, 0x76d495][i % 4];
    const body = new this.THREE.Mesh(new this.THREE.BoxGeometry(2.2, 0.9, 4.6), new this.THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.45 }));
    body.position.y = 1.1;
    car.add(body);
    car.position.set(p.x, 0, p.z);
    car.userData = { path, t, speed: 16 + (i % 5) * 2 };
    this.scene.add(car);
    this.cars.push(car);
  }

  update(dt) {
    this.time += dt;
    this.trafficLightPhase = (this.time % 18);
    for (const car of this.cars) {
      const u = car.userData;
      const redOnCenter = this.trafficLightPhase > 8 && this.trafficLightPhase < 12;
      const nearCenter = Math.abs(car.position.x) < 70 && Math.abs(car.position.z) < 70;
      const speedMul = redOnCenter && nearCenter ? 0 : 1;
      u.t += (u.speed * speedMul * dt) / u.path.a.distanceTo(u.path.b);
      if (u.t > 1) u.t = 0;
      car.position.lerpVectors(u.path.a, u.path.b, u.t);
      car.lookAt(u.path.b.x, 0, u.path.b.z);
    }
  }
}
