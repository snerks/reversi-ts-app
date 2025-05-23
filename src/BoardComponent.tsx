import React from 'react';
import type { Board } from './reversi';
import './Board.css';

interface BoardProps {
    board: Board;
    validMoves: [number, number][];
    onCellClick: (x: number, y: number) => void;
}

export const BoardComponent: React.FC<BoardProps> = ({ board, validMoves, onCellClick }) => {
    const isValid = (x: number, y: number) => validMoves.some(([vx, vy]) => vx === x && vy === y);
    return (
        <div className="reversi-board">
            {board.map((row, x) => (
                <div className="reversi-row" key={x}>
                    {row.map((cell, y) => (
                        <div
                            className={`reversi-cell${isValid(x, y) ? ' valid' : ''}`}
                            key={y}
                            onClick={() => isValid(x, y) && onCellClick(x, y)}
                        >
                            {cell && <div className={`piece ${cell === 'B' ? 'black' : 'white'}`}></div>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
