import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Screen, PlayerClass, HudSnapshot, AccessibilityOptions } from '../game/types';

interface GameContextValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  selectedClass: PlayerClass | null;
  setSelectedClass: (c: PlayerClass) => void;
  hud: HudSnapshot;
  setHud: Dispatch<SetStateAction<HudSnapshot>>;
  /** 每重试一次自增，作为 GameCanvas 的 key 强制重挂载新引擎 */
  runId: number;
  restart: () => void;
  exitToTitle: () => void;
}

const defaultHud: HudSnapshot = {
  hp: 100,
  maxHp: 100,
  score: 0,
  vehicleName: '',
  vehicleClass: 'car',
  wave: 0,
  enemiesLeft: 0,
  gameState: 'playing',
  theme: 'european',
  accessibilityOptions: {
    highContrast: false,
    largeText: false,
    colorblindMode: 'none',
    reducedMotion: false,
  },
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('title');
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(defaultHud);
  const [runId, setRunId] = useState(0);

  const restart = () => {
    setRunId((r) => r + 1);
    setScreen('playing');
  };
  const exitToTitle = () => {
    setSelectedClass(null);
    setScreen('title');
  };

  return (
    <GameContext.Provider
      value={{ screen, setScreen, selectedClass, setSelectedClass, hud, setHud, runId, restart, exitToTitle }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame 必须在 GameProvider 内使用');
  return ctx;
}
