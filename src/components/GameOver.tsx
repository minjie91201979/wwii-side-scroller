import { useGame } from '../store/GameContext';

export default function GameOver() {
  const { hud, restart, exitToTitle } = useGame();
  const won = hud.gameState === 'won';
  return (
    <div className="screen gameover-screen">
      <div className="gameover-content">
        <h2 className={`gameover-title ${won ? 'win' : 'lose'}`}>
          {won ? '战役胜利！' : '战斗失败'}
        </h2>
        <p className="gameover-score">最终得分：{hud.score}</p>
        <div className="title-buttons">
          <button className="btn primary" onClick={restart}>
            重试
          </button>
          <button className="btn ghost" onClick={exitToTitle}>
            退出到标题
          </button>
        </div>
      </div>
    </div>
  );
}
