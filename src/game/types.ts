// 所有游戏对象的严格类型定义 —— 满足 PRD "总结性注意事项 #3：类型定义"

export type PlayerClass = 'tank' | 'car' | 'fighter';
export type EnemyKind = 'infantry' | 'lightVehicle' | 'boss';
export type Faction = 'player' | 'enemy';
export type Screen = 'title' | 'select' | 'playing' | 'gameover';
export type GameState = 'playing' | 'won' | 'lost';

/** 玩家输入快照（由 InputSystem 产生，供 Game Loop 消费） */
export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  fire: boolean;
}

/** 肤色选项（多样性） */
export type SkinTone = 'light' | 'medium' | 'dark' | 'olive';

/** 军服风格（体现多国联军） */
export type UniformStyle = 'american' | 'british' | 'soviet' | 'free_french';

/** 身体体型 */
export type BodyType = 'slim' | 'athletic' | 'heavy';

/** 载具（玩家可选单位）规格 */
export interface VehicleSpec {
  id: PlayerClass;
  name: string;
  description: string;
  maxHp: number;
  moveSpeed: number;
  jumpForce: number;
  canJump: boolean;
  canFly: boolean;
  fireCooldown: number; // 秒
  projectileDamage: number;
  projectileSpeed: number;
  armor: number; // 0~1 伤害减免
  color: number;
  /** 驾驶员默认肤色 */
  defaultSkinTone?: SkinTone;
  /** 军服风格 */
  uniformStyle?: UniformStyle;
}

/** 敌人规格 */
export interface EnemySpec {
  kind: EnemyKind;
  maxHp: number;
  speed: number;
  fireCooldown: number; // 秒
  projectileDamage: number;
  armor: number;
  score: number;
  color: number;
  /** 肤色多样性 */
  skinTones?: SkinTone[];
  /** 军服风格 */
  uniformStyle?: UniformStyle;
}

/** 战场环境主题 */
export type BattleTheme = 'european' | 'pacific' | 'north_africa' | 'urban';

/** 辅助功能选项 */
export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
}

/** 实时推送给 React 的 HUD 快照（UI 只读取，不反向驱动逻辑） */
export interface HudSnapshot {
  hp: number;
  maxHp: number;
  score: number;
  vehicleName: string;
  vehicleClass: PlayerClass;
  wave: number;
  enemiesLeft: number;
  gameState: GameState;
  /** 当前战场主题 */
  theme?: BattleTheme;
  /** 辅助功能选项 */
  accessibilityOptions?: AccessibilityOptions;
}
