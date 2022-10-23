import { RefObject } from 'react';
import { CELL_SIZE } from '../consts';

interface Props {
    canvasRef: RefObject<HTMLCanvasElement>
    height: number
    width: number
    handleCellClicked: (event: React.MouseEvent<HTMLCanvasElement>) => void
}
function GameGrid({ canvasRef, height, width, handleCellClicked }: Props) {
    return (
        <canvas ref={canvasRef} className='cursor-pointer' height={(CELL_SIZE + 1) * (height + 1)} width={(CELL_SIZE + 1) * (width + 1)} onClick={handleCellClicked} />
    )
}

export default GameGrid