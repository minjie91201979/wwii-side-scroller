import * as THREE from 'three';
import type { VehicleSpec, InputState } from './types';
import { GRAVITY, GROUND_Y, LEVEL_LENGTH, FLY_MIN_Y, FLY_MAX_Y } from './constants';

export type FireCallback = (origin: THREE.Vector3, dir: THREE.Vector3, damage: number) => void;

/**
 * 玩家载具实体。
 * 持有自身 position / velocity（游戏逻辑状态），并通过 onFire 回调把"开火意图"
 * 抛给 GameEngine（而不是自己管理子弹）。
 */
export class Player {
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity = new THREE.Vector3();
  hp: number;
  maxHp: number;
  spec: VehicleSpec;
  facing = 1; // 1 = 右, -1 = 左
  fireTimer = 0;
  alive = true;

  constructor(spec: VehicleSpec, mesh: THREE.Group) {
    this.spec = spec;
    this.mesh = mesh;
    this.hp = spec.maxHp;
    this.maxHp = spec.maxHp;
    this.position = mesh.position;
  }

  update(dt: number, input: InputState, onFire: FireCallback) {
    if (!this.alive) return;

    // 水平移动
    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    if (move !== 0) this.facing = move;
    this.velocity.x = move * this.spec.moveSpeed;

    // 垂直：飞行 or 跳跃/重力
    if (this.spec.canFly) {
      let vy = 0;
      if (input.up) vy += 1;
      if (input.down) vy -= 1;
      this.velocity.y = vy * this.spec.moveSpeed;
      this.position.y = THREE.MathUtils.clamp(this.position.y, FLY_MIN_Y, FLY_MAX_Y);
    } else {
      if (input.jump && this.position.y <= GROUND_Y + 0.01 && this.spec.canJump) {
        this.velocity.y = this.spec.jumpForce;
      }
      this.velocity.y += GRAVITY * dt;
    }

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    if (!this.spec.canFly && this.position.y <= GROUND_Y) {
      this.position.y = GROUND_Y;
      this.velocity.y = 0;
    }
    this.position.x = THREE.MathUtils.clamp(this.position.x, -4, LEVEL_LENGTH);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.facing === 1 ? 0 : Math.PI;

    // 开火
    this.fireTimer -= dt;
    if (input.fire && this.fireTimer <= 0) {
      this.fireTimer = this.spec.fireCooldown;
      // 子弹起始位置跟随玩家当前位置（而非固定在地面高度）
      const muzzle = this.spec.id === 'tank' ? 2.4 : 1.7;
      const origin = this.position.clone().add(new THREE.Vector3(this.facing * muzzle, 0.6, 0));
      // 战斗机可以瞄准上下方向
      let aimY = 0;
      if (this.spec.canFly) {
        if (input.up) aimY = 0.5;
        if (input.down) aimY = -0.5;
      }
      const dir = new THREE.Vector3(this.facing, aimY, 0).normalize();
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
