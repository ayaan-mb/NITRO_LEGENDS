export class ThirdPersonCamera {
  constructor(THREE, camera, target) {
    this.THREE = THREE;
    this.camera = camera;
    this.target = target;

    this.offset = new THREE.Vector3(0, 5, -10);
    this.lookAtOffset = new THREE.Vector3(0, 2, 8);
  }

  update(dt) {
    const idealOffset = this.offset.clone().applyQuaternion(this.target.quaternion).add(this.target.position);
    const idealLookAt = this.lookAtOffset.clone().applyQuaternion(this.target.quaternion).add(this.target.position);

    this.camera.position.lerp(idealOffset, 1 - Math.exp(-6 * dt));
    const currentLook = new this.THREE.Vector3();
    this.camera.getWorldDirection(currentLook);
    this.camera.lookAt(idealLookAt);
  }
}
