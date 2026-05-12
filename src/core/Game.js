import { buildCityWorld } from '../world/buildCityWorld.js';
import { CarController } from '../entities/CarController.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { PlayerCharacterController } from '../entities/PlayerCharacterController.js';
import { TrafficSystem } from '../systems/TrafficSystem.js';
import { PedestrianSystem } from '../systems/PedestrianSystem.js';

export class Game {
  constructor(THREE) {
    this.THREE = THREE;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.clock = new THREE.Clock();

    this.world = buildCityWorld(THREE, this.scene);
    this.car = new CarController(THREE, this.scene, this.world.spawnPoint);
    this.car.setWorldColliders(this.world.colliders);
    this.followCam = new ThirdPersonCamera(THREE, this.camera, this.car.mesh);
    this.character = new PlayerCharacterController(THREE, this.scene, this.world.spawnPoint);
    this.traffic = new TrafficSystem(THREE, this.scene);
    this.pedestrians = new PedestrianSystem(THREE, this.scene);
    this.isInCar = true;
    this.wantedLevel = 0;
    this.escapeTimer = 0;
    this.mapCanvas = document.getElementById('minimap');
    this.mapCtx = this.mapCanvas ? this.mapCanvas.getContext('2d') : null;

    this.statusEl = document.getElementById('status');
    this.bindControls();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  bindControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && !e.repeat) this.toggleEnterExit();
    });
  }

  toggleEnterExit() {
    this.isInCar = !this.isInCar;
    this.car.setEnabled(this.isInCar);
    this.character.setActive(!this.isInCar);
    if (!this.isInCar) {
      this.character.mesh.position.copy(this.car.mesh.position).add(new this.THREE.Vector3(2.2, 0, 0));
    }
  }

  async start() {
    document.body.appendChild(this.renderer.domElement);
    this.initializeSession();
    this.animate();
  }

  initializeSession() {
    this.setStatus('Ready. Offline mode active.');
  }

  setStatus(message) {
    if (this.statusEl) this.statusEl.textContent = message;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.car.update(dt, this.world.bounds);
    this.character.update(dt, this.world.bounds, this.world.colliders);
    this.traffic.update(dt);
    this.pedestrians.update(dt, this.isInCar ? this.car.mesh.position : this.character.mesh.position);

    if (this.isInCar) {
      this.followCam.target = this.car.mesh;
      this.followCam.update(dt);
      this.camera.fov += ((this.car.getTelemetry().nitroActive ? 78 : 65) - this.camera.fov) * Math.min(1, dt * 7);
    } else {
      this.followCam.target = this.character.mesh;
      this.followCam.update(dt);
      this.camera.fov += (65 - this.camera.fov) * Math.min(1, dt * 7);
    }
    this.camera.updateProjectionMatrix();

    this.updateWanted(dt);
    this.renderer.render(this.scene, this.camera);
    this.renderMiniMap();
    this.renderHUD();
  }

  updateWanted(dt) {
    const speed = this.car.getTelemetry().speedKmh;
    if (this.isInCar && speed > 120) this.wantedLevel = Math.min(5, this.wantedLevel + dt * 0.25);
    else this.wantedLevel = Math.max(0, this.wantedLevel - dt * 0.06);
    this.escapeTimer = this.wantedLevel > 0 ? Math.max(0, 30 - this.wantedLevel * 4) : 0;
  }

  renderHUD() {
    const telemetry = this.car.getTelemetry();
    const stars = '★★★★★'.slice(0, Math.floor(this.wantedLevel)).padEnd(5, '☆');
    const health = Math.round(this.character.health);
    const mode = this.isInCar ? 'In Car (E: Exit • N: Nitro • Space: Drift)' : 'On Foot (E: Enter • Shift: Run)';
    this.setStatus(`${mode} | ${Math.round(telemetry.speedKmh)} km/h | Nitro ${Math.round(telemetry.nitro)}% | Drift ${telemetry.driftScore} | Wanted ${stars} | HP ${health}`);
  }

  renderMiniMap() {
    if (!this.mapCtx || !this.mapCanvas) return;
    const ctx = this.mapCtx;
    const size = this.mapCanvas.width;
    const worldSize = this.world.bounds * 2;
    const toMap = (v) => ((v + this.world.bounds) / worldSize) * size;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#0b1725';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#3f4b57';
    for (const road of this.world.roads || []) {
      const x = toMap(road.x - road.w / 2);
      const y = toMap(road.z - road.d / 2);
      const w = (road.w / worldSize) * size;
      const h = (road.d / worldSize) * size;
      ctx.fillRect(x, y, w, h);
    }

    ctx.fillStyle = '#ff4d5d';
    const px = toMap(this.car.mesh.position.x);
    const pz = toMap(this.car.mesh.position.z);
    ctx.beginPath();
    ctx.arc(px, pz, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
