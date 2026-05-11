const CITY_SIZE = 1200;

function makeBox(THREE, w, h, d, color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
}

function addLight(THREE, scene) {
  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x4f6245, 0.8);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(250, 350, 100);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
}

function addRoadGrid(THREE, scene) {
  const roads = new THREE.Group();
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2f343d });
  for (let i = -500; i <= 500; i += 100) {
    const vertical = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 1100), roadMat);
    vertical.position.set(i, 0.2, 0);
    roads.add(vertical);

    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(1100, 0.4, 24), roadMat);
    horizontal.position.set(0, 0.2, i);
    roads.add(horizontal);
  }
  scene.add(roads);
}

function addCityBlocks(THREE, scene) {
  const zones = [
    { type: 'residential', color: 0xbec3cd, height: [8, 20], minX: -550, maxX: -100, minZ: -550, maxZ: 550 },
    { type: 'commercial', color: 0x97a3bf, height: [35, 95], minX: 100, maxX: 550, minZ: -350, maxZ: 350 },
  ];

  zones.forEach((zone) => {
    for (let x = zone.minX; x <= zone.maxX; x += 80) {
      for (let z = zone.minZ; z <= zone.maxZ; z += 80) {
        if (Math.random() < 0.35) continue;
        const h = zone.height[0] + Math.random() * (zone.height[1] - zone.height[0]);
        const building = makeBox(THREE, 55, h, 55, zone.color);
        building.position.set(x + (Math.random() - 0.5) * 15, h / 2, z + (Math.random() - 0.5) * 15);
        scene.add(building);
      }
    }
  });
}

function addLandmarks(THREE, scene) {
  const markers = [
    ['Police Station', -220, -80, 0x304c89],
    ['Hospital', -180, 180, 0xffffff],
    ['Gas Station', -40, 260, 0xe8d278],
    ['Car Repair', 180, -220, 0xd17f6f],
    ['Paint Shop', 120, -280, 0xca65b8],
    ['Garage', -260, 260, 0x777777],
    ['Showroom', 260, -40, 0xd9e8ff],
    ['Airport', 420, 420, 0x6f768c],
    ['Vehicle Mod Area', 300, -260, 0x8b6fd1],
  ];

  markers.forEach(([_, x, z, color]) => {
    const block = makeBox(THREE, 90, 16, 90, color);
    block.position.set(x, 8, z);
    scene.add(block);
  });

  const beach = new THREE.Mesh(new THREE.BoxGeometry(260, 0.6, 220), new THREE.MeshStandardMaterial({ color: 0xe8d49b }));
  beach.position.set(-520, 0.3, -420);
  scene.add(beach);

  const offRoad = new THREE.Mesh(new THREE.BoxGeometry(240, 0.6, 240), new THREE.MeshStandardMaterial({ color: 0x8f6c42 }));
  offRoad.position.set(520, 0.3, -450);
  scene.add(offRoad);

  const stunt = new THREE.Mesh(new THREE.BoxGeometry(180, 0.6, 180), new THREE.MeshStandardMaterial({ color: 0x373737 }));
  stunt.position.set(470, 0.3, -170);
  scene.add(stunt);
}

function addGreenery(THREE, scene) {
  const park = new THREE.Mesh(new THREE.BoxGeometry(190, 0.6, 190), new THREE.MeshStandardMaterial({ color: 0x5b9b53 }));
  park.position.set(-80, 0.3, -120);
  scene.add(park);

  for (let i = 0; i < 380; i++) {
    const tx = Math.random() * CITY_SIZE - CITY_SIZE / 2;
    const tz = Math.random() * CITY_SIZE - CITY_SIZE / 2;
    if (Math.abs(tx % 100) < 17 || Math.abs(tz % 100) < 17) continue;

    const trunk = makeBox(THREE, 1.4, 7, 1.4, 0x5a3b21);
    trunk.position.set(tx, 3.5, tz);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3f8d46 }));
    leaves.position.set(tx, 9, tz);

    scene.add(trunk);
    scene.add(leaves);
  }
}

function addTrafficLights(THREE, scene) {
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x262626 });
  for (let x = -500; x <= 500; x += 100) {
    for (let z = -500; z <= 500; z += 100) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 8), lightMat);
      pole.position.set(x + 14, 5, z + 14);
      scene.add(pole);
    }
  }
}

function addMountains(THREE, scene) {
  for (let i = 0; i < 40; i++) {
    const r = 680 + Math.random() * 250;
    const a = Math.random() * Math.PI * 2;
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(30 + Math.random() * 60, 60 + Math.random() * 120, 8),
      new THREE.MeshStandardMaterial({ color: 0x6d7a53 })
    );
    hill.position.set(Math.cos(a) * r, hill.geometry.parameters.height / 2, Math.sin(a) * r);
    scene.add(hill);
  }
}

export function buildCityWorld(THREE, scene) {
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(CITY_SIZE, 2, CITY_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x496047 })
  );
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  addLight(THREE, scene);
  addRoadGrid(THREE, scene);
  addCityBlocks(THREE, scene);
  addLandmarks(THREE, scene);
  addGreenery(THREE, scene);
  addTrafficLights(THREE, scene);
  addMountains(THREE, scene);

  return {
    spawnPoint: new THREE.Vector3(0, 1.2, 0),
    bounds: CITY_SIZE / 2 - 20,
  };
}
