import init, { Game } from "game_of_life";
import { useRef, useState, useEffect } from "react";
import { GRID_COLOR, CELL_SIZE, DEAD_CELL_COLOR, CELL_COLORS, LIVE_CELL_COLOR } from "../consts";
import { useDimensions } from "./useDimensions";

export function useGame() {
    const canvas = useRef<HTMLCanvasElement>(null);
    const game = useRef<Game | null>(null);
    const memory = useRef<WebAssembly.Memory | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [color, setColor] = useState<boolean>(true);
    const [mouseDown, setMouseDown] = useState(false);
    const [lastCellChanged, setLastCellChanged] = useState({ row: -1, col: -1 });

    const colorRef = useRef<boolean>(color);
    colorRef.current = color;

    const { height, width } = useDimensions();

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
            redrawCells();
        })();

        return () => {
            if (timeoutRef.current === null) {
                return;
            }

            clearTimeout(timeoutRef.current);
        }

    }, [height, width]);

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

                if (cells[idx] === 0) {
                    ctx.fillStyle = DEAD_CELL_COLOR;

                } else {
                    ctx.fillStyle = colorRef.current ? CELL_COLORS[Math.floor(Math.log2(cells[idx]))] : LIVE_CELL_COLOR;
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

        drawCells(ctx, cells);
    }

    function getCells(): Uint32Array {
        const cellsPtr = game.current!.cells();

        return new Uint32Array(memory.current!.buffer, cellsPtr, width * height);
    }

    function renderLoop(): void {
        if (game.current === null) {
            return;
        }

        game.current.tick();

        redrawCells();

        timeoutRef.current = setTimeout(() => renderLoop(), 200);
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

        setLastCellChanged({ row, col });

        if (mouseDown) {
            if (row === lastCellChanged.row && col === lastCellChanged.col) {
                return;
            }

            const cells = getCells();
            const index = getIndex(row, col);

            if (cells[index] > 0) {
                return;
            }
        }

        game.current?.toggle_cell(row, col);

        redrawCells();
    }

    function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
        setMouseDown(true);
        handleCellClicked(event);
    }

    function handleMouseUp() {
        setMouseDown(false);
    }

    function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
        if (!mouseDown) {
            return;
        }

        handleCellClicked(event);
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
        colorRef.current = !color;

        redrawCells();
    }

    return {
        isRunning,
        color,
        width,
        height,
        canvas,
        handleStartStopClicked,
        handleClearClicked,
        handleColorChanged,
        handleCellClicked,
        handleMouseDown,
        handleMouseUp,
        handleMouseMove
    }
}