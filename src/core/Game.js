import { buildCityWorld } from '../world/buildCityWorld.js';
import { CarController } from '../entities/CarController.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { ApiClient } from './ApiClient.js';

export class Game {
  constructor(THREE) {
    this.THREE = THREE;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7fb2ff);
    this.scene.fog = new THREE.Fog(0x8cb6ff, 180, 1500);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();

    this.api = new ApiClient(window.NITRO_CONFIG.apiBase);
    this.playerId = window.NITRO_CONFIG.defaultPlayer;

    this.world = buildCityWorld(THREE, this.scene);
    this.car = new CarController(THREE, this.scene, this.world.spawnPoint);
    this.followCam = new ThirdPersonCamera(THREE, this.camera, this.car.mesh);

    this.statusEl = document.getElementById('status');
    window.addEventListener('resize', this.onResize.bind(this));
  }

  async start() {
    document.body.appendChild(this.renderer.domElement);
    await this.initializePersistence();
    this.animate();
  }

  async initializePersistence() {
    try {
      await this.api.health();
      const data = await this.api.loadPlayerState(this.playerId);
      if (data?.state) {
        this.car.applyState({
          pos_x: Number(data.state.pos_x),
          pos_y: Number(data.state.pos_y),
          pos_z: Number(data.state.pos_z),
          rot_y: Number(data.state.rot_y),
        });
        this.setStatus('Loaded saved spawn from MariaDB. Press P to save.');
      } else {
        this.setStatus('No saved spawn. Driving from default spawn.');
      }

      window.addEventListener('keydown', async (event) => {
        if (event.code !== 'KeyP') return;
        const state = this.car.getState();
        await this.api.savePlayerState(this.playerId, state);
        this.setStatus('Spawn saved to MariaDB.');
      });
    } catch {
      this.setStatus('API/DB not reachable. Running in local-only mode.');
    }
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
