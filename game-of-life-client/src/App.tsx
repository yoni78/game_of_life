import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Button from './Button';
import { ALIVE_COLOR, CELL_SIZE, DEAD_COLOR, GRID_COLOR } from './consts';
import init, { Game, Cell } from "../public/pkg/game_of_life"


function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const memory = useRef<WebAssembly.Memory | null>(null);
  const animationRef = useRef<number | null>(null);

  const [running, setRunning] = useState<boolean>(false);

  const width = 5;
  const height = 5;

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

  function drawCells(ctx: CanvasRenderingContext2D, cells: Uint8Array): void {
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
  }

  function getCells(): Uint8Array {
    const cellsPtr = game.current!.cells();

    return new Uint8Array(memory.current!.buffer, cellsPtr, width * height);
  }

  function renderLoop(): void {
    if (game.current === null || canvas.current === null || memory.current == null) {
      return;
    }

    const ctx = canvas.current.getContext('2d');

    if (ctx === null) {
      return;
    }

    const cells = getCells();

    drawGrid(ctx);
    drawCells(ctx, cells);

    game.current.tick();

    setTimeout(() => animationRef.current = requestAnimationFrame(renderLoop), 1000);
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

    const ctx = canvas.current?.getContext('2d');

    if (ctx === null || memory.current === null || game.current === null) {
      return;
    }

    const cells = getCells();

    drawGrid(ctx);
    drawCells(ctx, cells);
  }

  function handleStartStopClicked() {
    const newRunning = !running;

    if (newRunning) {
      renderLoop();
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
      if (animationRef.current === null) {
        return;
      }

      cancelAnimationFrame(animationRef.current);
    }

  }, [canvas.current]);


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
