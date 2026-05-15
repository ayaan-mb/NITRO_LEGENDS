import { createVehicle } from '../entities/VehicleFactory.js';

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

  randomCfg(i) {
    const carTypes = ['sedan','sportSedan','muscle','supercar','suv','jeep','pickup','taxi','luxury'];
    const tierRoll = Math.random();
    return {
      type: carTypes[i % carTypes.length],
      spoiler: tierRoll > 0.95 ? 3 : tierRoll > 0.8 ? 2 : tierRoll > 0.5 ? 1 : 0,
      lowered: tierRoll > 0.85 ? 0.12 : tierRoll > 0.55 ? 0.05 : 0,
      color: [0xf0f1f2,0x121316,0x9fa8b6,0xc4242d,0x2049bf,0xd9b429,0xc76f1d,0x2b8e58,0x703da8,0x1c1c1d,0x595f68,0xe7e7e4][Math.floor(Math.random()*12)],
      rimColor: [0x9aa4b2,0x737f8d,0x1d1f22,0xcfd6df,0x4d5664][Math.floor(Math.random()*5)],
      tint: [0.35,0.55,0.72,0.86][Math.floor(Math.random()*4)],
    };
  }

  spawnCar(i) {
    const path = this.paths[i % this.paths.length];
    const t = (i % 6) / 6;
    const p = path.a.clone().lerp(path.b, t);
    const car = createVehicle(this.THREE, this.randomCfg(i));
    car.position.set(p.x, 0, p.z);
    car.userData = { ...car.userData, path, t, speed: 16 + (i % 5) * 2 };
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
      const spin = (u.speed * dt) / 0.34;
      for (const w of (u.vehicle?.wheels || [])) {
        w.tire.rotation.x += spin;
        if (w.steer) w.pivot.rotation.y = Math.sin(u.t * Math.PI * 2) * 0.08;
      }
    }
  }

  spawnRandomModifiedCar() { this.spawnCar(Math.floor(Math.random() * 1000)); }
}
