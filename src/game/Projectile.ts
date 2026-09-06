import * as THREE from 'three';
import type { Faction } from './types';

/** 子弹/弹体实体，带生命周期。 */
export class Projectile {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  faction: Faction;
  life: number;
  alive = true;

  constructor(
    mesh: THREE.Mesh,
    damage: number,
    faction: Faction,
    speed: number,
    dir: THREE.Vector3,
    life: number,
  ) {
    this.mesh = mesh;
    this.position = mesh.position;
    this.velocity = dir.clone().normalize().multiplyScalar(speed);
    this.damage = damage;
    this.faction = faction;
    this.life = life;
  }

  update(dt: number) {
    this.position.addScaledVector(this.velocity, dt);
    this.mesh.position.copy(this.position);
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
}
