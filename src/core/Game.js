import { buildCityWorld } from '../world/buildCityWorld.js';
import { CarController } from '../entities/CarController.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { ApiClient } from './ApiClient.js';
import { EffectComposer } from 'https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.165.0/examples/jsm/postprocessing/UnrealBloomPass.js';

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

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.24, 0.8, 0.9));

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
    this.composer.render();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
