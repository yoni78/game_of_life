import './App.css';
import Button from './components/Button';
import Checkbox from './components/Checkbox';
import GameGrid from './components/GameGrid';
import { useGame } from './hooks/useGame';

function App() {
  const {
    isRunning,
    color,
    canvas,
    height,
    width,
    handleCellClicked,
    handleClearClicked,
    handleColorChanged,
    handleStartStopClicked
  } = useGame();

  return (
    <div className="App">
      <div className='game-container'>
        <GameGrid canvasRef={canvas} height={height} width={width} handleCellClicked={handleCellClicked} />
      </div>

      <div className="controls">
        <Button text={isRunning ? 'Stop' : 'Start'} onClick={handleStartStopClicked} />
        <Button text={'Clear'} onClick={handleClearClicked} />

        <Checkbox isChecked={color} onChange={handleColorChanged} />
      </div>
    </div>
  )
}

export default App
