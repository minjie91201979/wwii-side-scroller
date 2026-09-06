import * as THREE from 'three';
import type { VehicleSpec, EnemySpec, SkinTone } from './types';
import { SKIN_TONES, UNIFORM_COLORS, BATTLE_THEMES } from './constants';

/** 随机选取肤色（多样性） */
function randomSkinTone(tones?: SkinTone[]): SkinTone {
  if (!tones || tones.length === 0) return 'medium';
  return tones[Math.floor(Math.random() * tones.length)];
}

/** 构建玩家载具的 Three.js 网格（2.5D 风格：用基础几何体拼装） */
export function buildVehicleMesh(spec: VehicleSpec): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: spec.color, metalness: 0.3, roughness: 0.6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 });

  // 驾驶员可视化（多样性体现）
  const skinColor = spec.defaultSkinTone ? SKIN_TONES[spec.defaultSkinTone] : 0xa67c52;
  const uniformColor = spec.uniformStyle ? UNIFORM_COLORS[spec.uniformStyle] : 0x6b8e23;

  if (spec.id === 'tank') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.4, 2.4), mat);
    body.position.y = 1.0;
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.0, 16), mat);
    turret.position.set(-0.2, 2.0, 0);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.6, 12), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(1.5, 2.0, 0);
    const trackGeo = new THREE.BoxGeometry(4.2, 0.6, 0.5);
    const trackL = new THREE.Mesh(trackGeo, dark);
    trackL.position.set(0, 0.3, 1.0);
    const trackR = trackL.clone();
    trackR.position.z = -1.0;

    // 驾驶员舱口（展示人员多样性）
    const hatchMat = new THREE.MeshStandardMaterial({ color: uniformColor, roughness: 0.8 });
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), hatchMat);
    hatch.position.set(-0.2, 2.55, 0);
    const pilotHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 10, 10),
      new THREE.MeshStandardMaterial({ color: skinColor }),
    );
    pilotHead.position.set(-0.2, 2.9, 0);
    g.add(body, turret, barrel, trackL, trackR, hatch, pilotHead);
  } else if (spec.id === 'car') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 1.8), mat);
    body.position.y = 0.9;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.4), mat);
    cabin.position.set(-0.3, 1.6, 0);
    const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 10), dark);
    gun.rotation.z = Math.PI / 2;
    gun.position.set(1.2, 1.2, 0);
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12);
    const w1 = new THREE.Mesh(wheelGeo, dark); w1.rotation.x = Math.PI / 2; w1.position.set(-1.0, 0.5, 0.9);
    const w2 = w1.clone(); w2.position.z = -0.9;
    const w3 = w1.clone(); w3.position.set(1.0, 0.5, 0.9);
    const w4 = w3.clone(); w4.position.z = -0.9;

    // 驾驶员（开放座舱）
    const seatMat = new THREE.MeshStandardMaterial({ color: uniformColor });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.8), seatMat);
    seat.position.set(-0.3, 1.15, 0);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 10),
      new THREE.MeshStandardMaterial({ color: skinColor }),
    );
    head.position.set(-0.3, 1.45, 0);
    g.add(body, cabin, gun, w1, w2, w3, w4, seat, head);
  } else {
    // fighter
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.2, 12), mat);
    body.rotation.z = -Math.PI / 2; // 机头朝右
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 3.2), mat);
    wing.position.set(-0.2, 0, 0);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.2), mat);
    tail.position.set(-1.4, 0.3, 0);

    // 飞行员（座舱玻璃可见）
    const cockpitGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 }),
    );
    cockpitGlass.position.set(0.3, 0.1, 0);
    cockpitGlass.rotation.x = -Math.PI / 2;
    const pilotHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 10),
      new THREE.MeshStandardMaterial({ color: skinColor }),
    );
    pilotHead.position.set(0.3, 0.15, 0);
    g.add(body, wing, tail, cockpitGlass, pilotHead);
    g.position.y = 8;
  }

  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return g;
}

/** 构建敌人网格（多样化士兵表现） */
export function buildEnemyMesh(spec: EnemySpec): THREE.Group {
  const g = new THREE.Group();
  const uniformColor = spec.uniformStyle ? UNIFORM_COLORS[spec.uniformStyle] : 0x556b2f;
  const mat = new THREE.MeshStandardMaterial({ color: spec.color, metalness: 0.2, roughness: 0.7 });

  if (spec.kind === 'infantry') {
    const skinColor = randomSkinTone(spec.skinTones);
    const uniformMat = new THREE.MeshStandardMaterial({ color: uniformColor, roughness: 0.8 });

    // 多样化的体型（通过 scale 实现）
    const bodyScale = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2 体型差异
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35 * bodyScale, 0.8 * bodyScale, 4, 8), uniformMat);
    body.position.y = 0.9;

    // 多样化的肤色
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 * bodyScale, 10, 10),
      new THREE.MeshStandardMaterial({ color: skinColor }),
    );
    head.position.y = 1.7;

    // 钢盔（增加军事真实感）
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.32 * bodyScale, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a }),
    );
    helmet.position.y = 1.75;

    // 武器
    const gun = new THREE.Mesh(new THREE.BoxGeometry(1.0 * bodyScale, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0x3a3a3a }));
    gun.position.set(0.4, 1.1, 0.2);
    g.add(body, head, helmet, gun);
  } else if (spec.kind === 'lightVehicle') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 1.6), mat);
    body.position.y = 0.9;
    const turret = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.0), mat);
    turret.position.set(-0.2, 1.6, 0);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(1.0, 1.6, 0);

    // 车组成员（多样性）
    const skinColor = randomSkinTone(spec.skinTones);
    const crewHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: skinColor }),
    );
    crewHead.position.set(-0.2, 2.0, 0.5);
    g.add(body, turret, barrel, crewHead);
  } else {
    // boss
    const body = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 4), mat);
    body.position.y = 2.5;
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2, 16), mat);
    turret.position.set(0, 5, 0);
    g.add(body, turret);
  }

  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return g;
}

/** 构建子弹网格 */
export function buildProjectileMesh(color: number, radius: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 8, 8);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 });
  return new THREE.Mesh(geo, mat);
}
