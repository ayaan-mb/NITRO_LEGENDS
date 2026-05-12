import { buildCityWorld } from '../world/buildCityWorld.js';
import { CarController } from '../entities/CarController.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';

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

    this.statusEl = document.getElementById('status');
    window.addEventListener('resize', this.onResize.bind(this));
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
    this.followCam.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
