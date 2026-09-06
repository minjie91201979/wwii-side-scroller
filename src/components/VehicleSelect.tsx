import { useGame } from '../store/GameContext';
import { VEHICLE_SPECS } from '../game/constants';
import type { PlayerClass } from '../game/types';

const ORDER: PlayerClass[] = ['tank', 'car', 'fighter'];

export default function VehicleSelect() {
  const { setSelectedClass, setScreen, selectedClass } = useGame();

  const choose = (c: PlayerClass) => {
    setSelectedClass(c);
    setScreen('playing');
  };

  return (
    <div className="screen select-screen">
      <h2 className="screen-title">选择你的载具</h2>
      <div className="vehicle-grid">
        {ORDER.map((c) => {
          const s = VEHICLE_SPECS[c];
          return (
            <button
              key={c}
              className={`vehicle-card ${selectedClass === c ? 'active' : ''}`}
              onClick={() => choose(c)}
            >
              <div className="vehicle-name">{s.name}</div>
              <div className="vehicle-desc">{s.description}</div>
              <ul className="vehicle-stats">
                <li>HP：{s.maxHp}</li>
                <li>移动：{s.moveSpeed}</li>
                <li>射速：{(1 / s.fireCooldown).toFixed(1)}/s</li>
                <li>伤害：{s.projectileDamage}</li>
                <li>装甲：{Math.round(s.armor * 100)}%</li>
                <li>{s.canFly ? '空中单位' : s.canJump ? '可跳跃' : '重装'}</li>
              </ul>
            </button>
          );
        })}
      </div>
      <button className="btn ghost" onClick={() => setScreen('title')}>
        返回
      </button>
    </div>
  );
}
