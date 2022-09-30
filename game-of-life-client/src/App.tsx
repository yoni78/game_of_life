import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Button from './Button';
import { CELL_COLORS, CELL_SIZE, DEAD_CELL_COLOR, GRID_COLOR } from './consts';
import init, { Game } from "../public/pkg/game_of_life"


function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const memory = useRef<WebAssembly.Memory | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [running, setRunning] = useState<boolean>(false);

  const width = 100;
  const height = 60;

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

  function drawCells(ctx: CanvasRenderingContext2D, cells: Uint32Array): void {
    ctx.beginPath();

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);

        ctx.fillStyle = cells[idx] === 0
          ? DEAD_CELL_COLOR
          : CELL_COLORS[Math.floor(Math.log2(cells[idx]))];

        if (idx === 4) {
          console.log(cells[idx]);

          console.log(ctx.fillStyle);
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

    drawCells(ctx, cells);

    timeoutRef.current = setTimeout(renderLoop, 200);
  }

  function handleCellClicked(event: React.MouseEvent<HTMLCanvasElement>) {
    if (canvas.current === null) {
      return;
    }

    const ctx = canvas.current?.getContext('2d');

    if (ctx === null || memory.current === null || game.current === null) {
      return;
    }

    const boundingRect = canvas.current.getBoundingClientRect();

    const scaleX = canvas.current.width / boundingRect.width;
    const scaleY = canvas.current.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    console.log(row);
    console.log(col);

    console.log(getCells());

    game.current?.toggle_cell(row, col);

    const cells = getCells();

    console.log(cells);


    drawCells(ctx, cells);
  }

  function handleStartStopClicked() {
    const newRunning = !running;

    if (newRunning) {
      renderLoop();

    } else if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    setRunning(!running);
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

  return (
    <div className="App">
      <div className='game-container'>
        <canvas ref={canvas} className='game' height={(CELL_SIZE + 1) * (height + 1)} width={(CELL_SIZE + 1) * (width + 1)} onClick={handleCellClicked} />
      </div>

      <div className="controls">
        <Button text={running ? 'Stop' : 'Start'} onClick={handleStartStopClicked} />
      </div>
    </div>
  )
}

export default App
