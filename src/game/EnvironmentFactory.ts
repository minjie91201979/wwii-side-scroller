import * as THREE from 'three';
import type { BattleTheme } from './types';
import { BATTLE_THEMES } from './constants';

/**
 * 环境元素工厂 — 为游戏世界添加丰富的视觉层次
 */
export class EnvironmentFactory {
  /**
   * 创建星空粒子系统
   */
  static createStars(theme: BattleTheme): THREE.Points {
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const themeColors: Record<BattleTheme, number> = {
      european: 0xffffff,
      pacific: 0xaaddff,
      north_africa: 0xffffcc,
      urban: 0xccccff,
    };

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = Math.random() * 400 - 200;
      positions[i * 3 + 1] = Math.random() * 80 + 10;
      positions[i * 3 + 2] = -80 - Math.random() * 30;

      const color = new THREE.Color(themeColors[theme]);
      colors[i * 3] = color.r * (0.7 + Math.random() * 0.3);
      colors[i * 3 + 1] = color.g * (0.7 + Math.random() * 0.3);
      colors[i * 3 + 2] = color.b * (0.7 + Math.random() * 0.3);

      sizes[i] = 0.2 + Math.random() * 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    return new THREE.Points(geo, mat);
  }

  /**
   * 创建单层云朵
   */
  static createCloud(scale: number = 1): THREE.Group {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });

    const puffCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < puffCount; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 * scale, 8, 6),
        cloudMat,
      );
      puff.position.set(
        (Math.random() - 0.5) * 3 * scale,
        (Math.random() - 0.5) * 0.8 * scale,
        (Math.random() - 0.5) * 0.5 * scale,
      );
      puff.scale.y = 0.6;
      group.add(puff);
    }

    return group;
  }

  /**
   * 创建带细节的建筑（窗户、门、烟囱等）
   */
  static createDetailedBuilding(
    height: number,
    theme: BattleTheme,
    damageLevel: number = 0,
  ): THREE.Group {
    const group = new THREE.Group();
    const t = BATTLE_THEMES[theme];

    // 建筑主体
    const bodyColor = this.getBuildingColor(theme);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(6, height, 1.5),
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.9,
      }),
    );
    body.position.y = height / 2;
    body.castShadow = true;
    group.add(body);

    // 窗户（发光的）
    const windowRows = Math.floor(height / 4);
    const windowCols = 2;
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        // 有些窗户是亮的，有些是暗的
        const isLit = Math.random() > 0.3;
        if (isLit || damageLevel > 0) {
          const window = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1.2),
            new THREE.MeshBasicMaterial({
              color: damageLevel > 0 && Math.random() > 0.5 ? 0x1a1a1a : 0xffeeaa,
              transparent: true,
              opacity: damageLevel > 0 ? 0.3 : 0.7 + Math.random() * 0.3,
            }),
          );
          window.position.set(
            -1.5 + col * 3,
            2 + row * 3.5,
            0.76,
          );
          group.add(window);
        }
      }
    }

    // 门
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 2),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a }),
    );
    door.position.set(0, 1, 0.76);
    group.add(door);

    // 烟囱（30% 概率）
    if (Math.random() > 0.7) {
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a }),
      );
      chimney.position.set(2, height + 0.75, 0);
      chimney.castShadow = true;
      group.add(chimney);
    }

    // 损坏效果（弹孔、裂痕）
    if (damageLevel > 0) {
      const crackCount = Math.floor(damageLevel * 2);
      for (let i = 0; i < crackCount; i++) {
        const crack = new THREE.Mesh(
          new THREE.PlaneGeometry(0.3 + Math.random() * 0.5, 0.1),
          new THREE.MeshBasicMaterial({ color: 0x1a1a1a }),
        );
        crack.position.set(
          (Math.random() - 0.5) * 5,
          1 + Math.random() * (height - 2),
          0.77,
        );
        crack.rotation.z = Math.random() * Math.PI;
        group.add(crack);
      }
    }

    return group;
  }

  /**
   * 根据主题获取建筑颜色
   */
  private static getBuildingColor(theme: BattleTheme): number {
    const colors: Record<BattleTheme, number> = {
      european: 0x8a7a6a,  // 灰棕色
      pacific: 0x6a8a5a,   // 热带绿
      north_africa: 0xc4a37d, // 沙色
      urban: 0x5a5a5a,     // 水泥灰
    };
    return colors[theme];
  }

  /**
   * 创建岩石
   */
  static createRock(size: number = 0.5): THREE.Mesh {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: 0x6b6b6b,
        roughness: 1,
        flatShading: true,
      }),
    );
    rock.position.y = size * 0.5;
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    rock.castShadow = true;
    return rock;
  }

  /**
   * 创建草丛
   */
  static createGrassPatch(): THREE.Group {
    const group = new THREE.Group();
    const bladeCount = 5 + Math.floor(Math.random() * 3);

    for (let i = 0; i < bladeCount; i++) {
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.4 + Math.random() * 0.3, 4),
        new THREE.MeshStandardMaterial({
          color: 0x4a6b3a,
          roughness: 1,
        }),
      );
      blade.position.set(
        (Math.random() - 0.5) * 0.5,
        0.2,
        (Math.random() - 0.5) * 0.3,
      );
      blade.rotation.z = (Math.random() - 0.5) * 0.3;
      group.add(blade);
    }

    return group;
  }

  /**
   * 创建树（简单风格）
   */
  static createTree(theme: BattleTheme): THREE.Group {
    const group = new THREE.Group();

    // 树干
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a }),
    );
    trunk.position.y = 1;
    trunk.castShadow = true;
    group.add(trunk);

    // 树冠（多个球体）
    const leafColor = this.getLeafColor(theme);
    const leafMat = new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.8,
    });

    const canopyCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < canopyCount; i++) {
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 8, 6),
        leafMat,
      );
      canopy.position.set(
        (Math.random() - 0.5) * 1.2,
        2.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5,
      );
      canopy.castShadow = true;
      group.add(canopy);
    }

    return group;
  }

  /**
   * 根据主题获取树叶颜色
   */
  private static getLeafColor(theme: BattleTheme): number {
    const colors: Record<BattleTheme, number> = {
      european: 0x3a6b2a,
      pacific: 0x2a5a1a,
      north_africa: 0x6b7a3a,
      urban: 0x4a5a3a,
    };
    return colors[theme];
  }

  /**
   * 创建爆炸烟雾粒子
   */
  static createSmokeParticle(position: THREE.Vector3): THREE.Mesh {
    const smoke = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 4),
      new THREE.MeshBasicMaterial({
        color: 0x5a5a5a,
        transparent: true,
        opacity: 0.6,
      }),
    );
    smoke.position.copy(position);
    smoke.userData = {
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 2,
      ),
      life: 1.5 + Math.random() * 0.5,
      maxLife: 2,
    };
    return smoke;
  }

  /**
   * 创建枪口火焰
   */
  static createMuzzleFlash(origin: THREE.Vector3, facing: number): THREE.Group {
    const group = new THREE.Group();

    // 火焰核心
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1,
      }),
    );
    core.position.copy(origin).add(new THREE.Vector3(facing * 0.3, 0, 0));
    group.add(core);

    // 火焰外围
    const outer = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.7,
      }),
    );
    outer.position.copy(core.position);
    group.add(outer);

    // 点光源
    const light = new THREE.PointLight(0xffaa33, 3, 8);
    light.position.copy(core.position);
    group.add(light);

    group.userData = {
      life: 0.1,
    };

    return group;
  }
}
