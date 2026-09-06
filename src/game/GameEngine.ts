import * as THREE from 'three';
import type { PlayerClass, HudSnapshot, EnemyKind, BattleTheme } from './types';
import {
  VEHICLE_SPECS,
  ENEMY_SPECS,
  GROUND_Y,
  LEVEL_LENGTH,
  CAMERA_Z,
  WAVES,
  GRAVITY,
  ENEMY_PROJECTILE_SPEED,
  PROJECTILE_LIFE,
  PROJECTILE_RADIUS,
  SKY_COLOR,
  BATTLE_THEMES,
} from './constants';
import { InputSystem } from './InputSystem';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { buildVehicleMesh, buildEnemyMesh, buildProjectileMesh } from './factories';

interface Particle {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  vel: THREE.Vector3;
  type?: 'smoke' | 'fire' | 'spark';
}

/**
 * 环境元素管理器 — 处理视差层、天气、前景等视觉效果
 */
class EnvironmentManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private currentTheme: BattleTheme = 'european';

  // 视差层
  private starsMesh!: THREE.Points;
  private clouds: THREE.Group[] = [];
  private midLayer!: THREE.Group;
  private midTiles: THREE.Group[] = [];
  private midBaseX: number[] = [];
  private foregroundGroup!: THREE.Group;
  private craters: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
  }

  /** 初始化所有环境元素 */
  init(theme: BattleTheme) {
    this.currentTheme = theme;
    this.setupStars();
    this.setupClouds();
    this.setupMidground();
    this.setupForeground();
    this.applyTheme(theme);
  }

  /** 创建星空背景 */
  private setupStars() {
    const starCount = 400;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = Math.random() * 500 - 250;
      positions[i * 3 + 1] = Math.random() * 100 + 20;
      positions[i * 3 + 2] = -100 - Math.random() * 50;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * (0.9 + Math.random() * 0.1);
      colors[i * 3 + 2] = brightness * (0.8 + Math.random() * 0.2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    this.starsMesh = new THREE.Points(geo, mat);
    this.starsMesh.position.set(LEVEL_LENGTH / 2, 30, 0);
    this.scene.add(this.starsMesh);
  }

  /** 创建多层云朵 */
  private setupClouds() {
    const cloudCount = 20;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.createCloud();
      cloud.position.set(
        Math.random() * LEVEL_LENGTH * 2,
        20 + Math.random() * 25,
        -55 - Math.random() * 10,
      );
      cloud.userData = {
        baseX: cloud.position.x,
        speed: 0.1 + Math.random() * 0.2,
        scale: 0.6 + Math.random() * 0.8,
      };
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  private createCloud(): THREE.Group {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });

    const puffCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < puffCount; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + Math.random(), 8, 6),
        cloudMat,
      );
      puff.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1,
      );
      puff.scale.y = 0.5;
      group.add(puff);
    }

    return group;
  }

  /** 创建带细节的中层建筑 */
  private setupMidground() {
    this.midLayer = new THREE.Group();
    const N = 30;
    const spacing = 10;

    for (let i = 0; i < N; i++) {
      const building = this.createDetailedBuilding();
      const baseX = i * spacing;
      building.position.set(baseX, 0, -30);
      building.userData = { baseX, speed: 0.5 };
      this.midLayer.add(building);
      this.midTiles.push(building);
      this.midBaseX.push(baseX);
    }

    this.scene.add(this.midLayer);
  }

  private createDetailedBuilding(): THREE.Group {
    const group = new THREE.Group();
    const height = 8 + Math.random() * 12;
    const width = 5 + Math.random() * 4;

    // 主体
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.getBuildingColor(),
      roughness: 0.9,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, 2), bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    group.add(body);

    // 窗户
    const windowRows = Math.floor(height / 3);
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < 2; col++) {
        const isLit = Math.random() > 0.4;
        const window = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 1.2),
          new THREE.MeshBasicMaterial({
            color: isLit ? 0xffeeaa : 0x2a2a3a,
            transparent: true,
            opacity: isLit ? 0.8 : 0.6,
          }),
        );
        window.position.set(
          -width / 2 + 1.5 + col * 2.5,
          2 + row * 3,
          1.01,
        );
        group.add(window);
      }
    }

    // 门
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a }),
    );
    door.position.set(0, 0.9, 1.01);
    group.add(door);

    // 随机烟囱
    if (Math.random() > 0.6) {
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a }),
      );
      chimney.position.set(width / 2 - 1, height + 0.75, 0);
      chimney.castShadow = true;
      group.add(chimney);
    }

    return group;
  }

  private getBuildingColor(): number {
    const colors: Record<BattleTheme, number> = {
      european: 0x8a7a6a,
      pacific: 0x6a8a5a,
      north_africa: 0xc4a37d,
      urban: 0x5a5a5a,
    };
    return colors[this.currentTheme];
  }

  /** 创建前景层（岩石、草丛） */
  private setupForeground() {
    this.foregroundGroup = new THREE.Group();

    // 岩石
    for (let i = 0; i < 25; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0),
        new THREE.MeshStandardMaterial({
          color: 0x6b6b6b,
          roughness: 1,
          flatShading: true,
        }),
      );
      rock.position.set(
        Math.random() * LEVEL_LENGTH * 2,
        0.2,
        -3,
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      rock.castShadow = true;
      this.foregroundGroup.add(rock);
    }

    // 草丛
    for (let i = 0; i < 40; i++) {
      const grassGroup = new THREE.Group();
      const bladeCount = 3 + Math.floor(Math.random() * 4);

      for (let j = 0; j < bladeCount; j++) {
        const blade = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.3 + Math.random() * 0.2, 4),
          new THREE.MeshStandardMaterial({
            color: 0x4a6b3a,
            roughness: 1,
          }),
        );
        blade.position.set(
          (Math.random() - 0.5) * 0.4,
          0.15,
          (Math.random() - 0.5) * 0.2,
        );
        blade.rotation.z = (Math.random() - 0.5) * 0.3;
        grassGroup.add(blade);
      }

      grassGroup.position.set(
        Math.random() * LEVEL_LENGTH * 2,
        0,
        -2,
      );
      this.foregroundGroup.add(grassGroup);
    }

    this.scene.add(this.foregroundGroup);
  }

  /** 应用主题颜色 */
  applyTheme(theme: BattleTheme) {
    this.currentTheme = theme;
    const t = BATTLE_THEMES[theme];

    // 更新建筑颜色
    this.midTiles.forEach((building) => {
      building.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry?.type === 'BoxGeometry' && mesh.position.y > 0) {
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(t.ground);
          }
        }
      });
    });
  }

  /** 更新视差滚动 */
  update(cameraX: number) {
    // 星星（几乎不移动）
    if (this.starsMesh) {
      this.starsMesh.position.x = cameraX * 0.02;
    }

    // 云朵缓慢移动
    this.clouds.forEach((cloud) => {
      cloud.position.x -= cloud.userData.speed * 0.016;
      if (cloud.position.x < cameraX - 100) {
        cloud.position.x = cameraX + 100 + Math.random() * 50;
      }
    });

    // 中层建筑视差
    const f = 0.5;
    const N = this.midTiles.length;
    const span = N * 10;
    const half = span / 2;

    for (let i = 0; i < N; i++) {
      const building = this.midTiles[i];
      let screenX = this.midBaseX[i] + cameraX * (1 - f) - cameraX;

      while (screenX > half + 10) {
        this.midBaseX[i] -= span;
        screenX -= span;
      }
      while (screenX < -half - 10) {
        this.midBaseX[i] += span;
        screenX += span;
      }

      building.position.x = this.midBaseX[i] + cameraX * (1 - f);
    }

    // 前景视差（更快）
    if (this.foregroundGroup) {
      this.foregroundGroup.position.x = -cameraX * 0.9;
    }
  }

  /** 创建弹坑 */
  spawnCrater(position: THREE.Vector3, radius: number = 0.6) {
    const crater = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 0.7, 0.08, 12, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        side: THREE.DoubleSide,
      }),
    );
    crater.position.copy(position);
    crater.position.y = GROUND_Y - 0.02;
    crater.rotation.x = Math.PI / 2;
    this.scene.add(crater);
    this.craters.push(crater);
  }

  /** 清理 */
  dispose() {
    // 清理云朵
    this.clouds.forEach((cloud) => {
      this.scene.remove(cloud);
      cloud.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
    });

    // 清理中层建筑
    if (this.midLayer) {
      this.scene.remove(this.midLayer);
      this.midTiles.forEach((building) => {
        building.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            (mesh.material as THREE.Material).dispose();
          }
        });
      });
    }

    // 清理前景
    if (this.foregroundGroup) {
      this.scene.remove(this.foregroundGroup);
    }

    // 清理星星
    if (this.starsMesh) {
      this.scene.remove(this.starsMesh);
      this.starsMesh.geometry?.dispose();
      (this.starsMesh.material as THREE.PointsMaterial).dispose();
    }

    // 清理弹坑
    this.craters.forEach((crater) => {
      this.scene.remove(crater);
      crater.geometry?.dispose();
      (crater.material as THREE.Material).dispose();
    });
  }
}

/**
 * 游戏引擎：唯一持有"游戏世界真实状态"的对象。
 */
export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private input: InputSystem;

  private player!: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];

  private rafId = 0;
  private running = false;
  private gameEnded = false;
  private hudAccum = 0;

  private score = 0;
  private waveIndex = 0;
  private currentTheme: BattleTheme = 'european';

  // 环境元素
  private groundMesh!: THREE.Mesh;
  private skyPlane!: THREE.Mesh;
  private envManager!: EnvironmentManager;

  onHud?: (h: HudSnapshot) => void;
  onGameOver?: (won: boolean) => void;

  constructor(container: HTMLElement, playerClass: PlayerClass) {
    this.container = container;
    const w = container.clientWidth || 960;
    const h = container.clientHeight || 540;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = SKY_COLOR;
    this.scene.fog = new THREE.Fog(SKY_COLOR.getHex(), 70, 200);

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 400);
    this.camera.position.set(0, 6, CAMERA_Z);
    this.camera.lookAt(0, 4, 0);

    this.clock = new THREE.Clock();
    this.input = new InputSystem();

    this.setupLights();
    this.setupEnvironment();
    this.spawnPlayer(playerClass);
    this.startWave(0);
  }

  // ---------------- 场景搭建 ----------------
  private setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xfff2d6, 1.0);
    dir.position.set(-12, 30, 22);
    dir.castShadow = true;
    dir.shadow.camera.left = -50;
    dir.shadow.camera.right = 50;
    dir.shadow.camera.top = 25;
    dir.shadow.camera.bottom = -25;
    dir.shadow.mapSize.set(1024, 1024);
    this.scene.add(dir);
  }

  private setupEnvironment() {
    // 天空背景
    this.skyPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 100),
      new THREE.MeshBasicMaterial({ color: BATTLE_THEMES.european.sky }),
    );
    this.skyPlane.position.set(LEVEL_LENGTH / 2, 30, -70);
    this.scene.add(this.skyPlane);

    // 地面
    const groundMat = new THREE.MeshStandardMaterial({
      color: BATTLE_THEMES.european.ground,
      roughness: 1,
    });
    this.groundMesh = new THREE.Mesh(new THREE.BoxGeometry(LEVEL_LENGTH + 200, 2, 20), groundMat);
    this.groundMesh.position.set(LEVEL_LENGTH / 2, GROUND_Y - 1, 0);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // 初始化环境管理器
    this.envManager = new EnvironmentManager(this.scene, this.camera);
    this.envManager.init('european');
  }

  // ---------------- 生成实体 ----------------
  private spawnPlayer(cls: PlayerClass) {
    const spec = VEHICLE_SPECS[cls];
    const mesh = buildVehicleMesh(spec);
    mesh.position.set(2, spec.canFly ? 8 : GROUND_Y, 0);
    this.scene.add(mesh);
    this.player = new Player(spec, mesh);
  }

  private spawnEnemy(kind: EnemyKind, x: number) {
    const spec = ENEMY_SPECS[kind];
    const mesh = buildEnemyMesh(spec);
    mesh.position.set(x, GROUND_Y, 0);
    this.scene.add(mesh);
    this.enemies.push(new Enemy(spec, mesh));
  }

  private startWave(i: number) {
    this.waveIndex = i;
    const wave = WAVES[i];
    const baseX = this.player.position.x;
    for (let k = 0; k < wave.count; k++) {
      this.spawnEnemy(wave.kind, baseX + 40 + k * 6 + Math.random() * 4);
    }
    const themeMap: Record<number, BattleTheme> = {
      0: 'european',
      1: 'pacific',
      2: 'north_africa',
      3: 'urban',
    };
    this.switchTheme(themeMap[i] ?? 'european');
  }

  private fireProjectile(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    faction: 'player' | 'enemy',
    damage: number,
  ) {
    const color = faction === 'player' ? 0xffe066 : 0xff5555;
    const speed = faction === 'player' ? this.player.spec.projectileSpeed : ENEMY_PROJECTILE_SPEED;
    const mesh = buildProjectileMesh(color, PROJECTILE_RADIUS);
    mesh.position.copy(origin);
    this.scene.add(mesh);

    // 枪口火焰效果
    if (faction === 'player') {
      this.spawnMuzzleFlash(origin, dir.x);
    }

    this.projectiles.push(new Projectile(mesh, damage, faction, speed, dir, PROJECTILE_LIFE));
  }

  /** 创建枪口火焰 */
  private spawnMuzzleFlash(origin: THREE.Vector3, facing: number) {
    const flash = new THREE.PointLight(0xffaa33, 2, 6);
    flash.position.copy(origin).add(new THREE.Vector3(facing * 0.5, 0, 0));
    this.scene.add(flash);

    // 火焰粒子
    for (let i = 0; i < 6; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 4, 4),
        new THREE.MeshBasicMaterial({
          color: i < 3 ? 0xffcc00 : 0xff6600,
          transparent: true,
          opacity: 1,
        }),
      );
      particle.position.copy(origin);
      particle.userData = {
        vel: new THREE.Vector3(
          facing * (6 + Math.random() * 4),
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        life: 0.12,
      };
      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        life: 0.12,
        maxLife: 0.12,
        vel: particle.userData.vel,
        type: 'fire',
      });
    }

    setTimeout(() => this.scene.remove(flash), 60);
  }

  // ---------------- 生命周期 ----------------
  start() {
    if (this.running) return;
    this.running = true;
    this.input.attach();
    window.addEventListener('resize', this.onResize);
    this.clock.start();
    this.loop();
    this.emitHud();
  }

  private onResize = () => {
    const w = this.container.clientWidth || 960;
    const h = this.container.clientHeight || 540;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private loop = () => {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const input = this.input.snapshot();

    if (this.player.alive) {
      this.player.update(dt, input, (o, d, dmg) => this.fireProjectile(o, d, 'player', dmg));
    }
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.update(dt, this.player.position, (o, d, dmg) => this.fireProjectile(o, d, 'enemy', dmg));
    }
    for (const p of this.projectiles) p.update(dt);

    this.handleCollisions();
    this.updateParticles(dt);
    this.envManager.update(this.player.position.x);
    this.cleanupDead();
    this.updateCamera();

    this.checkProgress();

    this.hudAccum += dt;
    if (this.hudAccum >= 0.1) {
      this.hudAccum = 0;
      this.emitHud();
    }
  }

  private updateCamera() {
    const camX = this.player.position.x;
    this.camera.position.x += (camX - this.camera.position.x) * 0.12;
    this.camera.lookAt(this.camera.position.x, 4, 0);
  }

  // ---------------- 碰撞 ----------------
  private handleCollisions() {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      if (p.faction === 'player') {
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (this.boxHit(p.mesh, e.mesh)) {
            e.takeDamage(p.damage);
            p.alive = false;
            this.spawnExplosion(p.position.clone());
            if (!e.alive) this.score += e.spec.score;
            break;
          }
        }
      } else {
        if (this.player.alive && this.boxHit(p.mesh, this.player.mesh)) {
          this.player.takeDamage(p.damage);
          p.alive = false;
          this.spawnExplosion(p.position.clone());
        }
      }
    }
  }

  private boxHit(a: THREE.Object3D, b: THREE.Object3D): boolean {
    const ba = new THREE.Box3().setFromObject(a);
    const bb = new THREE.Box3().setFromObject(b);
    return ba.intersectsBox(bb);
  }

  // ---------------- 粒子系统 ----------------
  private spawnExplosion(pos: THREE.Vector3) {
    // 火花
    for (let i = 0; i < 12; i++) {
      const spark = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xffaa33 : 0xff6600,
        }),
      );
      spark.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        Math.random() * 10,
        (Math.random() - 0.5) * 6,
      );
      this.scene.add(spark);
      this.particles.push({ mesh: spark, life: 0.4, maxLife: 0.4, vel, type: 'spark' });
    }

    // 烟雾
    for (let i = 0; i < 6; i++) {
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 6, 4),
        new THREE.MeshBasicMaterial({
          color: 0x5a5a5a,
          transparent: true,
          opacity: 0.6,
        }),
      );
      smoke.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 1,
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        2 + Math.random() * 2,
        (Math.random() - 0.5) * 3,
      );
      this.scene.add(smoke);
      this.particles.push({ mesh: smoke, life: 1.2, maxLife: 1.2, vel, type: 'smoke' });
    }

    // 在地面留下弹坑
    if (pos.y <= GROUND_Y + 0.5) {
      this.envManager.spawnCrater(pos, 0.4 + Math.random() * 0.3);
    }
  }

  private updateParticles(dt: number) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        disposeObject(p.mesh);
        return false;
      }

      // 烟雾缓慢上升并扩散
      if (p.type === 'smoke') {
        p.vel.y *= 0.98;
        p.mesh.scale.setScalar(1 + (1 - p.life / p.maxLife) * 0.5);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.6 * (p.life / p.maxLife);
      }

      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y += GRAVITY * dt * 0.3;
      p.mesh.scale.setScalar(Math.max(0.01, p.life / p.maxLife));
      return true;
    });
  }

  // ---------------- 清理与进度 ----------------
  private cleanupDead() {
    this.enemies = this.enemies.filter((e) => {
      if (!e.alive) {
        this.spawnExplosion(e.position.clone().setY(e.position.y + 1));
        this.scene.remove(e.mesh);
        disposeObject(e.mesh);
        return false;
      }
      return true;
    });
    this.projectiles = this.projectiles.filter((p) => {
      if (!p.alive) {
        this.scene.remove(p.mesh);
        disposeObject(p.mesh);
        return false;
      }
      return true;
    });
  }

  private checkProgress() {
    if (!this.player.alive) {
      this.endGame(false);
      return;
    }
    if (this.enemies.length === 0) {
      if (this.waveIndex < WAVES.length - 1) {
        this.startWave(this.waveIndex + 1);
      } else {
        this.endGame(true);
      }
    }
  }

  private endGame(won: boolean) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.input.detach();
    window.removeEventListener('resize', this.onResize);
    this.emitHud();
    this.onGameOver?.(won);
  }

  private switchTheme(theme: BattleTheme) {
    this.currentTheme = theme;
    const t = BATTLE_THEMES[theme];

    // 平滑过渡
    const duration = 1.5;
    const skyMat = this.skyPlane.material as THREE.MeshBasicMaterial;
    const groundMat = this.groundMesh.material as THREE.MeshStandardMaterial;
    const startSky = skyMat.color.clone();
    const startGround = groundMat.color.clone();
    const startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      skyMat.color.lerpColors(startSky, new THREE.Color(t.sky), ease);
      groundMat.color.lerpColors(startGround, new THREE.Color(t.ground), ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();

    // 更新环境管理器
    this.envManager.applyTheme(theme);
  }

  private emitHud() {
    const spec = this.player.spec;
    const snap: HudSnapshot = {
      hp: Math.ceil(this.player.hp),
      maxHp: this.player.maxHp,
      score: this.score,
      vehicleName: spec.name,
      vehicleClass: spec.id,
      wave: this.waveIndex + 1,
      enemiesLeft: this.enemies.length,
      gameState: this.gameEnded ? (this.player.alive ? 'won' : 'lost') : 'playing',
      theme: this.currentTheme,
    };
    this.onHud?.(snap);
  }

  // ---------------- 销毁 ----------------
  dispose() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.input.detach();
    window.removeEventListener('resize', this.onResize);

    // 清理环境管理器
    this.envManager.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

/** 释放网格及其材质/几何体，避免内存泄漏。 */
function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material) {
      const mat = m.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat.dispose();
    }
  });
}
