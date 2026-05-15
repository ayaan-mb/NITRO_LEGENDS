export function createVehicle(THREE, cfg = {}) {
  const type = cfg.type ?? 'sedan';
  const color = cfg.color ?? 0x8aa0b8;
  const lowered = cfg.lowered ?? 0;
  const spoiler = cfg.spoiler ?? 0;
  const rimColor = cfg.rimColor ?? 0x9aa4b2;
  const tint = cfg.tint ?? 0.55;

  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.65 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x101722, transparent: true, opacity: tint, metalness: 0.2, roughness: 0.08 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.93 });
  const rimMat = new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.95, roughness: 0.17 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf5f0d8, emissive: 0x665c30, emissiveIntensity: 0.25 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x8f1118, emissive: 0x520006, emissiveIntensity: 0.35 });

  const profiles = {
    sedan: { w: 1.95, h: 0.62, l: 4.6, roof: 1.55, wheelR: 0.33, hood: 1.2 },
    sportSedan: { w: 2.0, h: 0.58, l: 4.7, roof: 1.58, wheelR: 0.35, hood: 1.25 },
    muscle: { w: 2.06, h: 0.6, l: 4.9, roof: 1.5, wheelR: 0.36, hood: 1.55 },
    supercar: { w: 2.05, h: 0.48, l: 4.45, roof: 1.35, wheelR: 0.34, hood: 1.05 },
    suv: { w: 2.08, h: 0.78, l: 4.85, roof: 1.9, wheelR: 0.39, hood: 1.25 },
    jeep: { w: 2.0, h: 0.82, l: 4.4, roof: 1.95, wheelR: 0.42, hood: 1.1 },
    pickup: { w: 2.05, h: 0.72, l: 5.2, roof: 1.78, wheelR: 0.38, hood: 1.2 },
    taxi: { w: 1.95, h: 0.62, l: 4.6, roof: 1.57, wheelR: 0.33, hood: 1.2 },
    luxury: { w: 2.0, h: 0.6, l: 4.95, roof: 1.62, wheelR: 0.36, hood: 1.35 },
    police: { w: 2.0, h: 0.62, l: 4.75, roof: 1.58, wheelR: 0.35, hood: 1.25 },
  };
  const p = profiles[type] || profiles.sedan;

  const body = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, p.l), bodyMat); body.position.y = 1.1 - lowered;
  const hood = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.96, 0.18, p.hood), bodyMat); hood.position.set(0, 1.4 - lowered, p.l * 0.28);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.82, 0.42, p.l * 0.42), bodyMat); roof.position.set(0, p.roof - lowered, -0.05);
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.92, 0.22, p.l * 0.22), bodyMat); trunk.position.set(0, 1.38 - lowered, -p.l * 0.38);
  const frontB = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.36, 0.52), dark); frontB.position.set(0, 0.92 - lowered, p.l * 0.51);
  const rearB = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.4, 0.56), dark); rearB.position.set(0, 0.95 - lowered, -p.l * 0.51);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.74, 0.37, 0.08), glass); windshield.rotation.x = -0.42; windshield.position.set(0, p.roof + 0.03 - lowered, p.l * 0.18);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(p.w * 0.68, 0.34, 0.08), glass); rearGlass.rotation.x = 0.38; rearGlass.position.set(0, p.roof - 0.04 - lowered, -p.l * 0.24);
  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, p.l * 0.36), glass); winL.position.set(-p.w * 0.43, p.roof - 0.01 - lowered, -0.03);
  const winR = winL.clone(); winR.position.x = p.w * 0.43;
  const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), dark); mirrorL.position.set(-p.w * 0.5, p.roof - 0.2 - lowered, p.l * 0.2);
  const mirrorR = mirrorL.clone(); mirrorR.position.x = p.w * 0.5;
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.1), headMat); headL.position.set(-p.w*0.32, 1.2-lowered, p.l*0.53);
  const headR = headL.clone(); headR.position.x = p.w*0.32;
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.46,0.13,0.1), tailMat); tailL.position.set(-p.w*0.32,1.18-lowered,-p.l*0.53);
  const tailR = tailL.clone(); tailR.position.x = p.w*0.32;

  g.add(body, hood, roof, trunk, frontB, rearB, windshield, rearGlass, winL, winR, mirrorL, mirrorR, headL, headR, tailL, tailR);

  if (type === 'taxi') {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.15,0.28), new THREE.MeshStandardMaterial({color:0xf4ca32, emissive:0x745c0f, emissiveIntensity:0.4}));
    sign.position.set(0, p.roof + 0.28 - lowered, -0.05); g.add(sign);
  }
  if (type === 'police') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.12,0.26), dark); bar.position.set(0, p.roof + 0.2 - lowered, -0.05);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.08,0.22), new THREE.MeshStandardMaterial({color:0xff2a3f, emissive:0x88000f, emissiveIntensity:0.9})); red.position.set(-0.2, p.roof + 0.21 - lowered, -0.05);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.08,0.22), new THREE.MeshStandardMaterial({color:0x3074ff, emissive:0x001f88, emissiveIntensity:0.9})); blue.position.set(0.2, p.roof + 0.21 - lowered, -0.05);
    g.userData.siren = { red, blue }; g.add(bar, red, blue);
  }

  const wheels = [];
  for (const [x,z,steer] of [[-p.w*0.46,p.l*0.32,true],[p.w*0.46,p.l*0.32,true],[-p.w*0.46,-p.l*0.3,false],[p.w*0.46,-p.l*0.3,false]]) {
    const pivot = new THREE.Group(); pivot.position.set(x, p.wheelR + 0.2 - lowered, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(p.wheelR,p.wheelR,0.28,16), tireMat); tire.rotation.z = Math.PI/2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(p.wheelR*0.62,p.wheelR*0.62,0.3,12), rimMat); rim.rotation.z = Math.PI/2;
    pivot.add(tire,rim); g.add(pivot); wheels.push({pivot,tire,steer});
  }

  if (spoiler > 0) {
    const sw = spoiler > 2 ? 1.55 : 1.3;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(sw,0.08,0.22), dark); wing.position.set(0,1.72-lowered,-p.l*0.42);
    g.add(wing);
  }

  g.userData.vehicle = { wheels, p };
  return g;
}
