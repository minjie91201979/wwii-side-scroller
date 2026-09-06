import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { useGame } from '../store/GameContext';

/**
 * 把 Three.js 引擎挂载进 React 的"受控边界"：
 * 引擎在 useEffect 中创建，通过回调把 HUD 快照 / 结束事件推给 React 状态。
 * React 不直接操作任何游戏对象（状态隔离）。
 */
export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedClass, setHud, setScreen } = useGame();
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current || !selectedClass) return;
    const engine = new GameEngine(containerRef.current, selectedClass);
    engineRef.current = engine;
    engine.onHud = (snap) => setHud(snap);
    engine.onGameOver = (won) => {
      setHud((prev) => ({ ...prev, gameState: won ? 'won' : 'lost' }));
      setScreen('gameover');
    };
    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [selectedClass, setHud, setScreen]);

  return <div className="game-canvas" ref={containerRef} />;
}
