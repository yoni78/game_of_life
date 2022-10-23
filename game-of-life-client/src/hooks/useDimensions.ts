import { useEffect, useState } from "react";
import { CELL_SIZE } from "../consts";

export function useDimensions() {
    const [width, setWidth] = useState(calculateWidth());
    const [height, setHeight] = useState(calculateHeight());

    function handleResize() {
        setWidth(calculateWidth());
        setHeight(calculateHeight());
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);
    }, []);

    return {
        width,
        height
    }
}

function calculateWidth(): number {
    return Math.floor(Math.floor((window.innerWidth / CELL_SIZE)) * 0.85);
}

function calculateHeight(): number {
    const ratio = window.innerHeight > 1000 ? 0.75 : 0.65;
    return Math.floor(Math.floor((window.innerHeight / CELL_SIZE)) * ratio);
}