import { useGame } from '../store/GameContext';
import type { BattleTheme } from '../game/types';
import AccessibilityPanel from './AccessibilityPanel';

const THEME_ICONS: Record<BattleTheme, string> = {
  european: '🏰',
  pacific: '🌴',
  north_africa: '🏜️',
  urban: '🏙️',
};

const THEME_NAMES: Record<BattleTheme, string> = {
  european: '欧洲战场',
  pacific: '太平洋战场',
  north_africa: '北非战场',
  urban: '城市巷战',
};

export default function HUD() {
  const { hud } = useGame();
  const pct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const themeIcon = THEME_ICONS[hud.theme ?? 'european'];
  const themeName = THEME_NAMES[hud.theme ?? 'european'];

  // 计算血条颜色（基于百分比，同时使用条纹图案增强无障碍性）
  const hpColor = pct > 60 ? '#3fb950' : pct > 30 ? '#d29922' : '#f85149';
  const hpPatternId = `hp-stripes-${pct}`;

  return (
    <>
      <div className={`hud ${hud.accessibilityOptions?.largeText ? 'large-text' : ''} ${hud.accessibilityOptions?.highContrast ? 'high-contrast' : ''}`}>
        <div className="hud-left">
          <div className="hud-vehicle">{hud.vehicleName}</div>

          {/* 生命值条 - 添加条纹图案增强无障碍性 */}
          <div className="hp-bar">
            <svg width="100%" height="100%" className="hp-bar-svg" viewBox="0 0 240 18" preserveAspectRatio="none">
              <defs>
                <pattern id={hpPatternId} patternUnits="userSpaceOnUse" width="8" height="18">
                  <rect width="8" height="18" fill={hpColor} />
                  <rect x="4" width="4" height="18" fill="rgba(255,255,255,0.2)" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="240" height="18" fill="#2a1414" />
              <rect x="0" y="0" width={240 * pct / 100} height="18" fill={`url(#${hpPatternId})`} />
            </svg>
            <span className="hp-text">
              {hud.hp} / {hud.maxHp}
            </span>
          </div>

          {/* 当前战场主题指示器 */}
          <div className="hud-theme">
            <span className="theme-icon">{themeIcon}</span>
            <span className="theme-name">{themeName}</span>
          </div>
        </div>

        <div className="hud-right">
          <div className="hud-score">
            <span className="score-icon">★</span>
            <span>{hud.score}</span>
          </div>
          <div className="hud-wave">
            <span className="wave-icon">⚔</span>
            <span>波次 {hud.wave} / 4</span>
          </div>
          <div className="hud-enemies">
            <span className="enemy-icon">☠</span>
            <span>剩余 {hud.enemiesLeft} 敌</span>
          </div>
        </div>
      </div>
      <AccessibilityPanel />
    </>
  );
}
