import { useState } from 'react';
import { createInitialBoard, getValidMoves, makeMove, countPieces } from './reversi';
import type { Player, Board } from './reversi';
import { BoardComponent } from './BoardComponent';
import './App.css';
import './Board.css';

function App() {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B');
  const [gameOver, setGameOver] = useState(false);

  const validMoves = getValidMoves(board, currentPlayer);
  const { B, W } = countPieces(board);

  const handleCellClick = (x: number, y: number) => {
    if (gameOver) return;
    if (!validMoves.some(([vx, vy]) => vx === x && vy === y)) return;
    const newBoard = makeMove(board, x, y, currentPlayer);
    const nextPlayer: Player = currentPlayer === 'B' ? 'W' : 'B';
    const nextValidMoves = getValidMoves(newBoard, nextPlayer);
    if (nextValidMoves.length === 0 && getValidMoves(newBoard, currentPlayer).length === 0) {
      setGameOver(true);
    } else {
      setCurrentPlayer(nextValidMoves.length > 0 ? nextPlayer : currentPlayer);
    }
    setBoard(newBoard);
  };

  const handleRestart = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('B');
    setGameOver(false);
  };

  return (
    <div className="App">
      <h1>Reversi (Othello)</h1>
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 16 }}>Current Player: <span style={{ color: currentPlayer === 'B' ? '#222' : '#fff', background: currentPlayer === 'B' ? '#fff' : '#222', borderRadius: '50%', padding: '0 8px' }}>{currentPlayer}</span></span>
        <span style={{ marginRight: 16 }}>Black: {B}</span>
        <span>White: {W}</span>
      </div>
      <BoardComponent board={board} validMoves={validMoves} onCellClick={handleCellClick} />
      {gameOver && (
        <div style={{ marginTop: 16 }}>
          <h2>Game Over</h2>
          <p>{B === W ? 'Draw!' : B > W ? 'Black wins!' : 'White wins!'}</p>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
