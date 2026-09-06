import { GameProvider, useGame } from './store/GameContext';
import TitleScreen from './components/TitleScreen';
import VehicleSelect from './components/VehicleSelect';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import GameOver from './components/GameOver';

function GameRoot() {
  const { screen, runId } = useGame();
  return (
    <div className="app-root">
      {screen === 'title' && <TitleScreen />}
      {screen === 'select' && <VehicleSelect />}
      {screen === 'playing' && (
        <>
          <GameCanvas key={runId} />
          <HUD />
        </>
      )}
      {screen === 'gameover' && <GameOver />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameRoot />
    </GameProvider>
  );
}
