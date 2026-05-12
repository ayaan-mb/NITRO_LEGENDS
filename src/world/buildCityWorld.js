const CITY_SIZE = 1800;
const ROAD_W_MAJOR = 34;
const ROAD_W_MINOR = 20;
const SIDEWALK_W = 4;

function mat(THREE, cfg) {
  return new THREE.MeshStandardMaterial(cfg);
}

function box(THREE, w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function createGround(THREE, scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2),
    mat(THREE, { color: 0x708760, roughness: 0.95, metalness: 0.02 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function createAtmosphere(THREE, scene) {
  scene.background = new THREE.Color(0x89b9ff);
  scene.fog = new THREE.FogExp2(0xa6c7ff, 0.0005);

  const hemi = new THREE.HemisphereLight(0xd8ecff, 0x58704a, 0.65);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.25);
  sun.position.set(360, 500, 240);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left = -1200;
  sun.shadow.camera.right = 1200;
  sun.shadow.camera.top = 1200;
  sun.shadow.camera.bottom = -1200;
  scene.add(sun);
}

function addRoad(scene, THREE, road, roadGroup, sidewalks) {
  const roadMesh = new THREE.Mesh(
    new THREE.BoxGeometry(road.w, 0.25, road.d),
    mat(THREE, { color: 0x2b2f35, roughness: 0.88, metalness: 0.05 })
  );
  roadMesh.position.set(road.x, 0.12, road.z);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(road.w * 0.86, road.d * 0.03),
    mat(THREE, { color: 0xffe487, emissive: 0x7c6a2f, emissiveIntensity: 0.08 })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(road.x, 0.26, road.z);
  roadGroup.add(mark);

  const cross = road.w > road.d;
  const swMat = mat(THREE, { color: 0x9fa5ad, roughness: 0.9 });
  if (cross) {
    const top = box(THREE, road.w, 0.45, SIDEWALK_W, swMat);
    top.position.set(road.x, 0.22, road.z - road.d / 2 - SIDEWALK_W / 2);
    sidewalks.push(top);

    const bottom = box(THREE, road.w, 0.45, SIDEWALK_W, swMat);
    bottom.position.set(road.x, 0.22, road.z + road.d / 2 + SIDEWALK_W / 2);
    sidewalks.push(bottom);
  } else {
    const left = box(THREE, SIDEWALK_W, 0.45, road.d, swMat);
    left.position.set(road.x - road.w / 2 - SIDEWALK_W / 2, 0.22, road.z);
    sidewalks.push(left);

    const right = box(THREE, SIDEWALK_W, 0.45, road.d, swMat);
    right.position.set(road.x + road.w / 2 + SIDEWALK_W / 2, 0.22, road.z);
    sidewalks.push(right);
  }
}

function inAnyRect(x, z, rects) {
  return rects.some((r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ);
}

function addCollider(colliders, x, z, w, d, padding = 0) {
  colliders.push({
    minX: x - w / 2 - padding,
    maxX: x + w / 2 + padding,
    minZ: z - d / 2 - padding,
    maxZ: z + d / 2 + padding,
  });
}

function createCityNetwork(THREE, scene) {
  const roadGroup = new THREE.Group();
  const roads = [];
  const sidewalks = [];
  const blocked = [];

  [-520, -250, 0, 250, 520].forEach((x) => roads.push({ x, z: 0, w: ROAD_W_MAJOR, d: 1280 }));
  [-520, -260, 0, 260, 520].forEach((z) => roads.push({ x: 0, z, w: 1280, d: ROAD_W_MAJOR }));
  [-390, -130, 130, 390].forEach((x) => roads.push({ x, z: 0, w: ROAD_W_MINOR, d: 900 }));
  [-390, -130, 130, 390].forEach((z) => roads.push({ x: 0, z, w: 900, d: ROAD_W_MINOR }));

  roads.forEach((road) => {
    addRoad(scene, THREE, road, roadGroup, sidewalks);
    blocked.push({
      minX: road.x - road.w / 2 - SIDEWALK_W,
      maxX: road.x + road.w / 2 + SIDEWALK_W,
      minZ: road.z - road.d / 2 - SIDEWALK_W,
      maxZ: road.z + road.d / 2 + SIDEWALK_W,
    });
  });

  sidewalks.forEach((sw) => scene.add(sw));
  scene.add(roadGroup);

  return { blocked, roads };
}

function addGreenMedians(THREE, scene) {
  const green = mat(THREE, { color: 0x5d8c4f });
  const medians = [
    box(THREE, 14, 0.35, 1260, green),
    box(THREE, 1260, 0.35, 14, green),
  ];
  medians[0].position.set(0, 0.18, 0);
  medians[1].position.set(0, 0.18, 0);
  medians.forEach((m) => scene.add(m));
}

function addIntersectionsDetails(THREE, scene) {
  const crossMat = mat(THREE, { color: 0xe8ecef });
  for (const x of [-520, -250, 0, 250, 520]) {
    for (const z of [-520, -260, 0, 260, 520]) {
      const cross = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), crossMat);
      cross.rotation.x = -Math.PI / 2;
      cross.position.set(x, 0.27, z + 12);
      scene.add(cross);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 10, 8), mat(THREE, { color: 0x2b2b2b }));
      pole.position.set(x + 14, 5, z + 14);
      const head = box(THREE, 1.8, 1.1, 1.1, mat(THREE, { color: 0x181818, emissive: 0x203000, emissiveIntensity: 0.8 }));
      head.position.set(x + 14, 9.5, z + 14);
      scene.add(pole, head);
    }
  }
}

function addStreetLights(THREE, scene, blocked) {
  const poleMat = mat(THREE, { color: 0x3a3d42, metalness: 0.45, roughness: 0.55 });
  for (let i = -620; i <= 620; i += 80) {
    const spots = [
      [i, -560],
      [i, 560],
      [-560, i],
      [560, i],
    ];
    for (const [x, z] of spots) {
      if (inAnyRect(x, z, blocked)) continue;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 12, 8), poleMat);
      pole.position.set(x, 6, z);
      const light = box(THREE, 1.6, 0.5, 0.8, mat(THREE, { color: 0xf8f0c9, emissive: 0xffd56b, emissiveIntensity: 0.45 }));
      light.position.set(x + 0.8, 11.5, z);
      scene.add(pole, light);
    }
  }
}

function addZoneBuildings(THREE, scene, blocked, colliders) {
  const zones = [
    { name: 'downtown', minX: 120, maxX: 720, minZ: -300, maxZ: 360, h: [45, 130], color: 0x94a4ba },
    { name: 'residential', minX: -740, maxX: -140, minZ: -520, maxZ: 520, h: [8, 22], color: 0xc7c4c0 },
    { name: 'commercial', minX: -140, maxX: 240, minZ: 380, maxZ: 760, h: [12, 34], color: 0xc8bbb0 },
    { name: 'industrial', minX: 380, maxX: 820, minZ: 420, maxZ: 820, h: [16, 42], color: 0x8e8b84 },
  ];

  zones.forEach((z) => {
    for (let x = z.minX; x <= z.maxX; x += 56) {
      for (let zz = z.minZ; zz <= z.maxZ; zz += 56) {
        if (inAnyRect(x, zz, blocked)) continue;
        const h = z.h[0] + Math.random() * (z.h[1] - z.h[0]);
        const w = 34 + Math.random() * 18;
        const d = 34 + Math.random() * 18;
        const b = box(THREE, w, h, d, mat(THREE, {
          color: z.color,
          roughness: 0.7,
          metalness: z.name === 'downtown' ? 0.35 : 0.1,
          emissive: z.name === 'downtown' ? 0x101c2f : 0x000000,
          emissiveIntensity: z.name === 'downtown' ? 0.15 : 0,
        }));
        b.position.set(x, h / 2, zz);
        scene.add(b);
        addCollider(colliders, x, zz, w, d, 2);
      }
    }
  });
}

function addLandscapeAndTrees(THREE, scene, blocked, colliders) {
  const treeTrunk = mat(THREE, { color: 0x5d3b22 });
  const treeLeaf = mat(THREE, { color: 0x3e8a47 });

  const park = box(THREE, 180, 0.3, 210, mat(THREE, { color: 0x66a054 }));
  park.position.set(-40, 0.15, -120);
  scene.add(park);

  for (let i = 0; i < 650; i++) {
    const x = Math.random() * 1600 - 800;
    const z = Math.random() * 1600 - 800;
    const inRoad = inAnyRect(x, z, blocked);
    const inValidLandscape = (Math.abs(x) < 700 && Math.abs(z) < 700) || z < -650 || x > 650;
    if (inRoad || !inValidLandscape) continue;

    const trunk = box(THREE, 1.2, 6, 1.2, treeTrunk);
    trunk.position.set(x, 3, z);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(3.8, 8, 8), treeLeaf);
    crown.position.set(x, 8, z);
    crown.castShadow = true;
    scene.add(trunk, crown);
    addCollider(colliders, x, z, 6.8, 6.8, 0.8);
  }
}

function addSpecialAreas(THREE, scene, colliders) {
  const beachSand = box(THREE, 360, 0.2, 300, mat(THREE, { color: 0xe9d39b }));
  beachSand.position.set(-860, 0.1, -500);
  scene.add(beachSand);

  const water = new THREE.Mesh(new THREE.PlaneGeometry(420, 360), mat(THREE, { color: 0x4ba8d4, transparent: true, opacity: 0.86 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(-940, 0.08, -500);
  scene.add(water);

  const airportRunway = box(THREE, 500, 0.3, 64, mat(THREE, { color: 0x373b45 }));
  airportRunway.position.set(760, 0.15, -680);
  scene.add(airportRunway);

  const terminal = box(THREE, 130, 26, 70, mat(THREE, { color: 0x7f90a8, metalness: 0.4 }));
  terminal.position.set(620, 13, -590);
  scene.add(terminal);
  addCollider(colliders, 620, -590, 130, 70, 4);

  const stunt = box(THREE, 340, 0.2, 340, mat(THREE, { color: 0x33363b }));
  stunt.position.set(920, 0.1, 520);
  scene.add(stunt);

  const offRoad = box(THREE, 340, 0.2, 340, mat(THREE, { color: 0x7a5b3e }));
  offRoad.position.set(860, 0.1, 860);
  scene.add(offRoad);
}

function addMountains(THREE, scene, colliders) {
  for (let i = 0; i < 55; i++) {
    const angle = (i / 55) * Math.PI * 2;
    const radius = 980 + Math.random() * 350;
    const h = 80 + Math.random() * 180;
    const baseRadius = 55 + Math.random() * 70;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(baseRadius, h, 9),
      mat(THREE, { color: 0x738062, roughness: 0.98 })
    );
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    mountain.position.set(x, h / 2, z);
    mountain.castShadow = true;
    scene.add(mountain);
    addCollider(colliders, x, z, baseRadius * 1.8, baseRadius * 1.8, 6);
  }
}

function addStreetPropsAndLife(THREE, scene, blocked, colliders) {
  const trashMat = mat(THREE, { color: 0x2b6e5c, roughness: 0.7, metalness: 0.25 });
  const humanMat = mat(THREE, { color: 0x4a72d9, roughness: 0.65 });
  const npcCarMat = mat(THREE, { color: 0xf2b13f, metalness: 0.35, roughness: 0.45 });
  const propPoints = [
    [-480, -180], [-430, 220], [-320, -320], [-170, 300], [150, -280], [210, 260], [360, -220], [460, 220],
  ];

  for (const [x, z] of propPoints) {
    if (inAnyRect(x, z, blocked)) continue;
    const trash = box(THREE, 1.2, 1.8, 1.2, trashMat);
    trash.position.set(x, 0.9, z);
    scene.add(trash);
    addCollider(colliders, x, z, 1.2, 1.2, 1);
  }

  const peoplePoints = [[-280, -160], [-210, 180], [80, 210], [330, -170], [560, 280], [-580, 260]];
  for (const [x, z] of peoplePoints) {
    if (inAnyRect(x, z, blocked)) continue;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 4, 8), humanMat);
    body.position.set(x, 1.25, z);
    body.castShadow = true;
    scene.add(body);
    addCollider(colliders, x, z, 1.2, 1.2, 0.7);
  }

  const parkedCars = [[-340, 120, 0], [260, -120, Math.PI / 2], [420, 120, Math.PI / 2], [-520, -120, 0], [540, -300, 0]];
  for (const [x, z, rotY] of parkedCars) {
    if (inAnyRect(x, z, blocked)) continue;
    const npc = new THREE.Group();
    const body = box(THREE, 2.3, 0.9, 4.7, npcCarMat);
    body.position.y = 1.2;
    const cabin = box(THREE, 1.7, 0.8, 2.2, mat(THREE, { color: 0x1e2330, metalness: 0.1, roughness: 0.3 }));
    cabin.position.set(0, 1.85, -0.1);
    npc.add(body, cabin);
    npc.position.set(x, 0, z);
    npc.rotation.y = rotY;
    scene.add(npc);
    addCollider(colliders, x, z, 2.6, 5.1, 0.8);
  }
}

export function buildCityWorld(THREE, scene) {
  createGround(THREE, scene);
  createAtmosphere(THREE, scene);
  const network = createCityNetwork(THREE, scene);
  const colliders = [];
  addGreenMedians(THREE, scene);
  addIntersectionsDetails(THREE, scene);
  addStreetLights(THREE, scene, network.blocked);
  addZoneBuildings(THREE, scene, network.blocked, colliders);
  addLandscapeAndTrees(THREE, scene, network.blocked, colliders);
  addSpecialAreas(THREE, scene, colliders);
  addMountains(THREE, scene, colliders);
  addStreetPropsAndLife(THREE, scene, network.blocked, colliders);

  return {
    spawnPoint: new THREE.Vector3(-220, 1.2, -40),
    bounds: CITY_SIZE - 120,
    colliders,
    roads: network.roads,
  };
}
