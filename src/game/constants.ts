import * as THREE from 'three';
import type { PlayerClass, EnemyKind, VehicleSpec, EnemySpec, SkinTone, UniformStyle, BattleTheme } from './types';

// ---------- 世界与物理 ----------
export const GRAVITY = -30; // units / s^2
export const GROUND_Y = 0; // 地面顶部高度
export const LEVEL_LENGTH = 260; // 关卡长度（世界单位）
export const CAMERA_Z = 24; // 相机距游戏平面的距离
export const FLY_MIN_Y = 2;
export const FLY_MAX_Y = 16;

// ---------- 载具规格（差异化核心机制 + 多样性配置） ----------
export const VEHICLE_SPECS: Record<PlayerClass, VehicleSpec> = {
  tank: {
    id: 'tank',
    name: '坦克 Tank',
    description: '重甲高耐久，主炮高伤慢射、具区域震慑感；移动缓慢，无法大幅跳跃。',
    maxHp: 220,
    moveSpeed: 4.2,
    jumpForce: 6,
    canJump: true,
    canFly: false,
    fireCooldown: 0.9,
    projectileDamage: 45,
    projectileSpeed: 26,
    armor: 0.45,
    color: 0x6b7a3a,
    defaultSkinTone: 'medium',
    uniformStyle: 'american',
  },
  car: {
    id: 'car',
    name: '野战车 Armored Car',
    description: '均衡机动，机枪快速扫射 + 中程反装甲弹，默认推荐选择。',
    maxHp: 130,
    moveSpeed: 7.8,
    jumpForce: 12,
    canJump: true,
    canFly: false,
    fireCooldown: 0.26,
    projectileDamage: 14,
    projectileSpeed: 34,
    armor: 0.2,
    color: 0x4a6fa5,
    defaultSkinTone: 'dark',
    uniformStyle: 'british',
  },
  fighter: {
    id: 'fighter',
    name: '战斗机 Fighter',
    description: '高速空战，俯冲扫射；无法地面跳跃，受地形限制最小，但防御最弱。',
    maxHp: 90,
    moveSpeed: 11,
    jumpForce: 0,
    canJump: false,
    canFly: true,
    fireCooldown: 0.16,
    projectileDamage: 10,
    projectileSpeed: 42,
    armor: 0.05,
    color: 0xb5651d,
    defaultSkinTone: 'light',
    uniformStyle: 'free_french',
  },
};

// ---------- 敌人规格（增加多样性配置） ----------
export const ENEMY_SPECS: Record<EnemyKind, EnemySpec> = {
  infantry: {
    kind: 'infantry',
    maxHp: 30,
    speed: 3.0,
    fireCooldown: 1.3,
    projectileDamage: 8,
    armor: 0.0,
    score: 100,
    color: 0x8b3a3a,
    skinTones: ['light', 'medium', 'dark', 'olive'],
    uniformStyle: 'soviet',
  },
  lightVehicle: {
    kind: 'lightVehicle',
    maxHp: 80,
    speed: 4.5,
    fireCooldown: 0.9,
    projectileDamage: 14,
    armor: 0.25,
    score: 250,
    color: 0x7a5c2e,
    skinTones: ['medium', 'dark'],
    uniformStyle: 'soviet',
  },
  boss: {
    kind: 'boss',
    maxHp: 1200,
    speed: 2.0,
    fireCooldown: 0.5,
    projectileDamage: 22,
    armor: 0.4,
    score: 3000,
    color: 0x3a2a4a,
    skinTones: ['dark'],
    uniformStyle: 'soviet',
  },
};

// ---------- 关卡波次（MVP 范围） ----------
export interface WaveDef {
  kind: EnemyKind;
  count: number;
}
export const WAVES: WaveDef[] = [
  { kind: 'infantry', count: 4 },
  { kind: 'infantry', count: 6 },
  { kind: 'lightVehicle', count: 2 },
  { kind: 'infantry', count: 8 },
];

// ---------- 多样性配置 ----------

// 肤色映射（多样化角色表现）
export const SKIN_TONES: Record<SkinTone, number> = {
  light: 0xe8c39e,
  medium: 0xa67c52,
  dark: 0x6b4423,
  olive: 0xc4a37d,
};

// 军服配色（体现多国联军历史真实感）
export const UNIFORM_COLORS: Record<UniformStyle, number> = {
  american: 0x8b9dc3, // 灰蓝
  british: 0x6b8e23, // 橄榄绿
  soviet: 0x556b2f, // 深绿
  free_french: 0x4a5d6b, // 深蓝灰
};

// 战场主题（环境多样性）
export const BATTLE_THEMES: Record<BattleTheme, { sky: number; ground: number; fog: number; name: string }> = {
  european: { sky: 0x9bb0c1, ground: 0x5a6b3a, fog: 0x9bb0c1, name: '欧洲战场' },
  pacific: { sky: 0x4a7c8f, ground: 0x8b7355, fog: 0x4a7c8f, name: '太平洋战场' },
  north_africa: { sky: 0xd4c4a0, ground: 0xc2b280, fog: 0xd4c4a0, name: '北非战场' },
  urban: { sky: 0x6b7b8d, ground: 0x4a4a4a, fog: 0x6b7b8d, name: '城市巷战' },
};

// 敌人子弹固定参数
export const ENEMY_PROJECTILE_SPEED = 22;
export const PROJECTILE_LIFE = 2.5;
export const PROJECTILE_RADIUS = 0.25;

// 背景色（尘土蓝，二战氛围）
export const SKY_COLOR = new THREE.Color(0x9bb0c1);
