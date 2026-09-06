import { useGame } from '../store/GameContext';

export default function TitleScreen() {
  const { setScreen } = useGame();
  return (
    <div className="screen title-screen">
      <div className="title-content">
        <h1 className="title-main">WWII<br />SIDE-SCROLLER</h1>
        <p className="title-sub">横版二战射击 · React 18 + TypeScript + Three.js</p>
        <div className="title-buttons">
          <button className="btn primary" onClick={() => setScreen('select')}>
            开始游戏
          </button>
          <button className="btn" disabled>
            设置（开发中）
          </button>
        </div>
        <p className="title-hint">
          操作：← → / A D 移动 · 空格 跳跃 · J / K 射击 · 战斗机可上下飞行（W/S）
        </p>
      </div>
    </div>
  );
}
