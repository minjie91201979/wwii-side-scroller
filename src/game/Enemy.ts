import * as THREE from 'three';
import type { EnemySpec } from './types';
import { GRAVITY, GROUND_Y, LEVEL_LENGTH } from './constants';
import type { FireCallback } from './Player';

/**
 * 敌人实体。AI：接近玩家到偏好射程 -> 停火射击。
 */
export class Enemy {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity = new THREE.Vector3();
  hp: number;
  maxHp: number;
  spec: EnemySpec;
  fireTimer: number;
  alive = true;
  facing = -1; // 默认朝左（玩家在其左侧）

  constructor(spec: EnemySpec, mesh: THREE.Group) {
    this.spec = spec;
    this.mesh = mesh;
    this.hp = spec.maxHp;
    this.maxHp = spec.maxHp;
    this.position = mesh.position;
    this.fireTimer = Math.random() * spec.fireCooldown;
  }

  update(dt: number, playerPos: THREE.Vector3, onFire: FireCallback) {
    if (!this.alive) return;

    const dx = playerPos.x - this.position.x;
    const dist = Math.abs(dx);
    const preferred = this.spec.kind === 'infantry' ? 14 : 18;

    // 接近到偏好射程
    let move = 0;
    if (dist > preferred) move = Math.sign(dx);
    this.velocity.x = move * this.spec.speed;
    this.position.x += this.velocity.x * dt;

    // 重力（保持在地面）
    this.velocity.y += GRAVITY * dt;
    this.position.y += this.velocity.y * dt;
    if (this.position.y <= GROUND_Y) {
      this.position.y = GROUND_Y;
      this.velocity.y = 0;
    }
    this.position.x = THREE.MathUtils.clamp(this.position.x, 0, LEVEL_LENGTH + 40);

    // 面向玩家（玩家在左则朝左 = -1）
    this.facing = dx < 0 ? -1 : 1;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing === 1 ? 0 : Math.PI;

    // 射程内开火
    this.fireTimer -= dt;
    if (dist < preferred + 4 && this.fireTimer <= 0) {
      this.fireTimer = this.spec.fireCooldown;
      const origin = this.position.clone().add(new THREE.Vector3(this.facing * 1.2, 0.8, 0));
      const dir = new THREE.Vector3(this.facing, 0, 0);
      onFire(origin, dir, this.spec.projectileDamage);
    }
  }

  takeDamage(amount: number) {
    if (!this.alive) return;
    const dmg = amount * (1 - this.spec.armor);
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
}
