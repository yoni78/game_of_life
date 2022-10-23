import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Button from './Button';
import { CELL_COLORS, CELL_SIZE, DEAD_CELL_COLOR, GRID_COLOR, LIVE_CELL_COLOR } from './consts';
import init, { Game } from "../public/pkg/game_of_life"
import Checkbox from './Checkbox';


function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const memory = useRef<WebAssembly.Memory | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [color, setColor] = useState<boolean>(true);

  const width = 100;
  const height = 60;

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

      game.current = Game.new(width, height);
      memory.current = instance.memory;

      drawGrid(ctx);
    })();

    return () => {
      if (timeoutRef.current === null) {
        return;
      }

      clearTimeout(timeoutRef.current);
    }

  }, []);

  function getIndex(row: number, col: number): number {
    return row * width + col;
  }

  function drawGrid(ctx: CanvasRenderingContext2D): void {
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
  }

  function drawCells(ctx: CanvasRenderingContext2D, cells: Uint32Array, color: boolean): void {
    ctx.beginPath();

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        if (cells[idx] === 0) {
          ctx.fillStyle = DEAD_CELL_COLOR;

        } else {
          ctx.fillStyle = color ? CELL_COLORS[Math.floor(Math.log2(cells[idx]))] : LIVE_CELL_COLOR;
        }

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }

    ctx.stroke();
  }

  function redrawCells() {
    if (canvas.current === null) {
      return;
    }

    const ctx = canvas.current?.getContext('2d');

    if (ctx === null || memory.current === null || game.current === null) {
      return;
    }

    const cells = getCells();

    drawCells(ctx, cells, color);
  }

  function getCells(): Uint32Array {
    const cellsPtr = game.current!.cells();

    return new Uint32Array(memory.current!.buffer, cellsPtr, width * height);
  }

  function renderLoop(): void {
    if (game.current === null || canvas.current === null || memory.current == null) {
      return;
    }

    const ctx = canvas.current.getContext('2d');

    if (ctx === null) {
      return;
    }

    game.current.tick();

    const cells = getCells();

    drawCells(ctx, cells, color);

    timeoutRef.current = setTimeout(renderLoop, 200);
  }

  function handleCellClicked(event: React.MouseEvent<HTMLCanvasElement>) {
    if (canvas.current === null) {
      return;
    }

    const boundingRect = canvas.current.getBoundingClientRect();

    const scaleX = canvas.current.width / boundingRect.width;
    const scaleY = canvas.current.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    game.current?.toggle_cell(row, col);

    redrawCells();
  }

  function handleStartStopClicked() {
    const newRunning = !isRunning;

    if (newRunning) {
      renderLoop();

    } else if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    setIsRunning(!isRunning);
  }

  function handleClearClicked() {
    game.current?.clear_grid();

    redrawCells();
  }

  function handleColorChanged() {
    setColor(!color);
  }

  return (
    <div className="App">
      <div className='game-container'>
        <canvas ref={canvas} className='game' height={(CELL_SIZE + 1) * (height + 1)} width={(CELL_SIZE + 1) * (width + 1)} onClick={handleCellClicked} />
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
