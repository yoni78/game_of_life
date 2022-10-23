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
    handleStartStopClicked,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useGame();

  return (
    <div className="App h-screen bg-slate-100">
      <div className='flex justify-center'>
        <h1 className='p-5 text-5xl font-bold font-mono'>
          Game of Life
        </h1>
      </div>

      <div className='flex justify-center'>
        <GameGrid
          canvasRef={canvas}
          height={height}
          width={width}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
      </div>

      <div className='flex justify-center'>
        <div className="flex justify-center items-center py-4 px-8 bg-slate-200 rounded-md">
          <Button text={isRunning ? 'Stop' : 'Start'} onClick={handleStartStopClicked} />
          <Button text={'Clear'} onClick={handleClearClicked} className={'mx-5'} />

          <div>
            Colors:
            <Checkbox isChecked={color} onChange={handleColorChanged} className={'ml-2'} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
