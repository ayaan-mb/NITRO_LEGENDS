import { buildCityWorld } from '../world/buildCityWorld.js';
import { CarController } from '../entities/CarController.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { PlayerCharacterController } from '../entities/PlayerCharacterController.js';
import { TrafficSystem } from '../systems/TrafficSystem.js';
import { PedestrianSystem } from '../systems/PedestrianSystem.js';
import { PoliceWantedManager } from '../systems/PoliceWantedManager.js';

export class Game {
  constructor(THREE, { inputManager = null, uiManager = null, gameStateManager = null } = {}) {
    this.THREE = THREE;
    this.inputManager = inputManager;
    this.uiManager = uiManager;
    this.gameStateManager = gameStateManager;
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
    this.car = new CarController(THREE, this.scene, this.world.spawnPoint, this.inputManager);
    this.car.setWorldColliders(this.world.colliders);
    this.followCam = new ThirdPersonCamera(THREE, this.camera, this.car.mesh);
    this.character = new PlayerCharacterController(THREE, this.scene, this.world.spawnPoint, this.inputManager);
    this.traffic = new TrafficSystem(THREE, this.scene);
    this.pedestrians = new PedestrianSystem(THREE, this.scene);
    this.isInCar = true;
    this.wantedLevel = 0;
    this.escapeTimer = 0;
    this.playerHp = 100;
    this.vehicleHp = 100;
    this.mapCanvas = document.getElementById('minimap');
    this.mapCtx = this.mapCanvas ? this.mapCanvas.getContext('2d') : null;

    this.police = new PoliceWantedManager(
      THREE,
      this.scene,
      this.world,
      () => ({ position: this.isInCar ? this.car.mesh.position : this.character.mesh.position, inCar: this.isInCar }),
      (amount) => this.applyDamage(amount)
    );

    this.bindControls();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  bindControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && !e.repeat && this.inputManager?.allowGameplayInput?.()) this.toggleEnterExit();
      if (!this.uiManager?.debug?.visible) return;
      if (e.code === 'F2') { e.preventDefault(); this.traffic.spawnRandomModifiedCar(); }
      if (e.code === 'F3') { e.preventDefault(); this.car.customization.randomize(); }
      if (e.code === 'F4' && !e.shiftKey) { e.preventDefault(); this.car.customization.resetStock(); }
      if (e.code === 'F5') { e.preventDefault(); this.car.customization.nextPaint(); }
      if (e.code === 'F6') { e.preventDefault(); this.car.customization.nextWheel(); }
      if (e.code === 'F7') { e.preventDefault(); this.car.customization.nextSpoiler(); }
      if (e.code === 'F8') { e.preventDefault(); for (let i = 0; i < 10; i++) this.traffic.spawnCar(200 + i); }
      if (e.code === 'F9') { e.preventDefault(); this.police.spawnPoliceHelicopter(); }
      if (e.code === 'F10') { e.preventDefault(); this.police.spawnPoliceOfficer(); }
      if (e.code === 'F11') { e.preventDefault(); this.police.spawnPoliceCar(); }
      if (e.code === 'F12' && !e.shiftKey) { e.preventDefault(); this.police.updateWantedResponse(true); }
      if (e.code === 'F4' && e.shiftKey) { e.preventDefault(); this.police.addWantedLevel(1); }
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
    try {
      document.body.appendChild(this.renderer.domElement);
      this.initializeSession();
      this.animate();
    } catch (error) {
      console.error('Game start failed', error);
      this.uiManager?.mainMenu?.showNotice?.('Start failed. Check browser console (F12).');
    }
  }

  initializeSession() {
    this.uiManager?.interactionPrompt?.show('Press E to Exit Vehicle');
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const rawDt = Math.min(this.clock.getDelta(), 0.05);
    const gameplayActive = this.inputManager?.allowGameplayInput?.() ?? true;
    const dt = gameplayActive ? rawDt : 0;
    if (gameplayActive) {
      this.car.update(dt, this.world.bounds);
      this.character.update(dt, this.world.bounds, this.world.colliders);
      this.traffic.update(dt);
      this.pedestrians.update(dt, this.isInCar ? this.car.mesh.position : this.character.mesh.position);
      this.police.update(dt);
    }

    if (this.isInCar) {
      const telemetry = this.car.getTelemetry();
      this.followCam.target = this.car.mesh;
      this.followCam.update(dt);
      const speedFovBoost = telemetry.speedKmh > 250 ? Math.min(12, (telemetry.speedKmh - 250) * 0.06) : 0;
      const nitroBoost = telemetry.nitroActive ? 6 : 0;
      this.camera.fov += ((65 + speedFovBoost + nitroBoost) - this.camera.fov) * Math.min(1, dt * 7);

      if (telemetry.speedKmh > 300) {
        const shakeAmp = Math.min(0.12, (telemetry.speedKmh - 300) * 0.0012);
        this.camera.position.x += (Math.random() - 0.5) * shakeAmp;
        this.camera.position.y += (Math.random() - 0.5) * shakeAmp;
      }
    } else {
      this.followCam.target = this.character.mesh;
      this.followCam.update(dt);
      this.camera.fov += (65 - this.camera.fov) * Math.min(1, dt * 7);
    }
    this.camera.updateProjectionMatrix();

    this.wantedLevel = this.police.wantedLevel;
    this.escapeTimer = this.police.escapeTimer;
    this.renderer.render(this.scene, this.camera);
    this.renderMiniMap();
    this.renderHUD();
  }

  applyDamage(amount) {
    if (this.isInCar) {
      this.vehicleHp = Math.max(0, this.vehicleHp - amount * 0.8);
      if (this.vehicleHp < 20) this.car.steerPower = 1.3;
    }
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.character.health = this.playerHp;
    if (this.playerHp <= 0) this.respawnPlayer();
  }

  respawnPlayer() {
    this.playerHp = 100;
    this.vehicleHp = 100;
    this.character.health = 100;
    this.car.reset();
    this.character.mesh.position.copy(this.world.spawnPoint);
    this.police.clearWantedLevel();
    this.uiManager?.interactionPrompt?.show('Respawned. Press E to Exit Vehicle');
  }

  renderHUD() {
    const telemetry = this.car.getTelemetry();
    this.uiManager?.hud?.update({ telemetry, playerHp: this.playerHp, vehicleHp: this.vehicleHp });
    this.uiManager?.interactionPrompt?.show(this.isInCar ? 'Press E to Exit Vehicle' : 'Press E to Enter Vehicle');
    this.uiManager?.debug?.update({ game: this, gameState: this.gameStateManager?.state ?? 'Gameplay' });
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
