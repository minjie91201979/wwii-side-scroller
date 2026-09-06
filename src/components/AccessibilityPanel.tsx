import { useState } from 'react';
import { useGame } from '../store/GameContext';

interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
}

export default function AccessibilityPanel() {
  const { setHud } = useGame();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AccessibilityOptions>({
    highContrast: false,
    largeText: false,
    colorblindMode: 'none',
    reducedMotion: false,
  });

  const updateOption = <K extends keyof AccessibilityOptions>(key: K, value: AccessibilityOptions[K]) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    // 通知游戏引擎更新
    setHud((prev) => ({ ...prev, accessibilityOptions: newOptions }));
  };

  if (!open) {
    return (
      <button
        className="accessibility-toggle"
        onClick={() => setOpen(true)}
        aria-label="打开辅助功能设置"
        title="辅助功能设置"
      >
        ♿ 辅助功能
      </button>
    );
  }

  return (
    <div className="accessibility-panel">
      <div className="accessibility-header">
        <h3>辅助功能设置</h3>
        <button className="close-btn" onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className="accessibility-options">
        {/* 高对比度 */}
        <label className="option-row">
          <input
            type="checkbox"
            checked={options.highContrast}
            onChange={(e) => updateOption('highContrast', e.target.checked)}
          />
          <span>高对比度模式</span>
        </label>

        {/* 大字体 */}
        <label className="option-row">
          <input
            type="checkbox"
            checked={options.largeText}
            onChange={(e) => updateOption('largeText', e.target.checked)}
          />
          <span>大字体</span>
        </label>

        {/* 色盲模式 */}
        <div className="option-row">
          <span>色盲辅助模式</span>
          <select
            value={options.colorblindMode}
            onChange={(e) => updateOption('colorblindMode', e.target.value as any)}
          >
            <option value="none">关闭</option>
            <option value="protanopia">红色盲 (Protanopia)</option>
            <option value="deuteranopia">绿色盲 (Deuteranopia)</option>
            <option value="tritanopia">蓝色盲 (Tritanopia)</option>
          </select>
        </div>

        {/* 减少动画 */}
        <label className="option-row">
          <input
            type="checkbox"
            checked={options.reducedMotion}
            onChange={(e) => updateOption('reducedMotion', e.target.checked)}
          />
          <span>减少动画效果</span>
        </label>
      </div>

      <button className="btn primary apply-btn" onClick={() => setOpen(false)}>
        应用并关闭
      </button>
    </div>
  );
}
