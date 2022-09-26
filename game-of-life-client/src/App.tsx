import { useEffect, useRef } from 'react';
import './App.css';
import Button from './Button';
import { ALIVE_COLOR, CELL_SIZE, DEAD_COLOR, GRID_COLOR } from './consts';
import init, { Game, Cell } from "../public/pkg/game_of_life"


function App() {
  const width = 30;
  const height = 30;
  const canvas = useRef<HTMLCanvasElement>(null);


  function getIndex(row: number, col: number): number {
    return row * width + col;
  }

  useEffect(() => {
    (async () => {
      const instance = await init();

      if (canvas.current === null) {
        return;
      }

      const ctx = canvas.current.getContext("2d");

      if (ctx === null) {
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = GRID_COLOR;

      // Vertical lines.
      for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
      }

      // Horizontal lines.
      for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
      }

      ctx.stroke();

      const game = Game.new(width, height);
      const cellsPtr = game.cells();
      const cells = new Uint8Array(instance.memory.buffer, cellsPtr, width * height);

      ctx.beginPath();

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const idx = getIndex(row, col);

          ctx.fillStyle = cells[idx] === Cell.Dead
            ? DEAD_COLOR
            : ALIVE_COLOR;

          ctx.fillRect(
            col * (CELL_SIZE + 1) + 1,
            row * (CELL_SIZE + 1) + 1,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }

      ctx.stroke();

    })();


  }, [canvas.current]);


  return (
    <div className="App">
      <div className='game-container'>
        <canvas ref={canvas} className='game' height={(CELL_SIZE + 1) * (height + 1)} width={(CELL_SIZE + 1) * (width + 1)} />
      </div>

      <div className="controls">
        <Button text='Start' />
      </div>
    </div>
  )
}

export default App
