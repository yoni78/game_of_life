import { RefObject } from 'react';
import { CELL_SIZE } from '../consts';

interface Props {
    canvasRef: RefObject<HTMLCanvasElement>
    height: number
    width: number
    onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
    onMouseUp: () => void
    onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void

}
function GameGrid({ canvasRef, height, width, onMouseDown, onMouseMove, onMouseUp }: Props) {
    return (
        <canvas ref={canvasRef}
            className='cursor-pointer'
            height={(CELL_SIZE + 1) * (height + 1)} width={(CELL_SIZE + 1) * (width + 1)}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        />
    )
}

export default GameGrid