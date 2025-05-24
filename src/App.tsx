import React, { useState, useEffect } from 'react';
import { createInitialBoard, getValidMoves, makeMove, countPieces } from './reversi';
import type { Player, Board } from './reversi';
import { BoardComponent } from './BoardComponent';
import './App.css';
import './Board.css';

const THEMES = {
  light: {
    '--reversi-bg': '#f3f3f3',
    '--reversi-board': '#197d2b',
    '--reversi-cell': '#249c3a',
    '--reversi-cell-valid': '#3fcf5a',
    '--reversi-black': '#222',
    '--reversi-white': '#fff',
    '--reversi-text': '#222',
    '--reversi-ui-bg': '#fff',
  },
  dark: {
    '--reversi-bg': '#242424',
    '--reversi-board': '#197d2b',
    '--reversi-cell': '#249c3a',
    '--reversi-cell-valid': '#3fcf5a',
    // '--reversi-black': '#fff',
    // '--reversi-white': '#222',
    '--reversi-black': '#222',
    '--reversi-white': '#fff',
    '--reversi-text': '#fff',
    '--reversi-ui-bg': '#222',
  },
};

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  const themeVars = THEMES[theme];
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Minimax AI for Reversi
function evaluateBoard(board: Board, player: Player): number {
  // Simple evaluation: difference in piece count
  const { B, W } = countPieces(board);
  return player === 'B' ? B - W : W - B;
}

function minimax(board: Board, player: Player, depth: number, maximizing: boolean): [number, number, number] | null {
  const validMoves = getValidMoves(board, player);
  if (depth === 0 || validMoves.length === 0) {
    return [-1, -1, evaluateBoard(board, player)];
  }
  let bestMove: [number, number] | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;
  for (const [x, y] of validMoves) {
    const newBoard = makeMove(board, x, y, player);
    const nextPlayer: Player = player === 'B' ? 'W' : 'B';
    const result = minimax(newBoard, nextPlayer, depth - 1, !maximizing);
    const score = result ? result[2] : 0;
    if (maximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = [x, y];
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = [x, y];
      }
    }
  }
  if (!bestMove) return null;
  return [bestMove[0], bestMove[1], bestScore];
}

const DIFFICULTY_LEVELS = [
  { label: 'Easy', depth: 1 },
  { label: 'Medium', depth: 3 },
  { label: 'Hard', depth: 6 },
];

function getAIMove(board: Board, player: Player, difficulty: number): [number, number] | null {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;
  if (difficulty === 0) {
    // Easy: random move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  const result = minimax(board, player, DIFFICULTY_LEVELS[difficulty].depth, true);
  if (result && result[0] !== -1) return [result[0], result[1]];
  return validMoves[0];
}

function App() {
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B');
  const [gameOver, setGameOver] = useState(false);
  const [playComputer, setPlayComputer] = useState<'none' | 'B' | 'W'>('none');
  const [difficulty, setDifficulty] = useState(1); // 0: Easy, 1: Medium, 2: Hard
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('reversi-theme');
    const savedDifficulty = localStorage.getItem('reversi-difficulty');
    const savedPlayComputer = localStorage.getItem('reversi-playComputer');
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedDifficulty && ['0', '1', '2'].includes(savedDifficulty)) setDifficulty(Number(savedDifficulty));
    if (savedPlayComputer === 'none' || savedPlayComputer === 'B' || savedPlayComputer === 'W') setPlayComputer(savedPlayComputer);
  }, []);

  // Save preferences to localStorage when changed
  useEffect(() => {
    localStorage.setItem('reversi-theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('reversi-difficulty', String(difficulty));
  }, [difficulty]);
  useEffect(() => {
    localStorage.setItem('reversi-playComputer', playComputer);
  }, [playComputer]);

  const validMoves = getValidMoves(board, currentPlayer);
  const { B, W } = countPieces(board);

  // AI move effect
  React.useEffect(() => {
    if (gameOver) return;
    if (playComputer !== 'none' && currentPlayer === playComputer) {
      const aiMove = getAIMove(board, currentPlayer, difficulty);
      if (aiMove) {
        setTimeout(() => handleCellClick(aiMove[0], aiMove[1]), 500);
      }
    }
    // eslint-disable-next-line
  }, [board, currentPlayer, playComputer, gameOver, difficulty]);

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
    <div className="App" style={{ background: 'var(--reversi-bg)', color: 'var(--reversi-text)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, marginTop: 8, marginLeft: 8 }}>
        <button
          style={{ background: 'var(--reversi-ui-bg)', color: 'var(--reversi-text)', border: '1px solid #888', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {/* Switch to */}
          {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
      </div>
      {/* <h1>Reversi</h1> */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 16 }}>Current Player: <span style={{ color: currentPlayer === 'B' ? '#222' : '#fff', background: currentPlayer === 'B' ? '#fff' : '#222', borderRadius: '50%', padding: '0 8px' }}>{currentPlayer}</span></span>
        <span style={{ marginRight: 16 }}>Black: {B}</span>
        <span style={{ marginRight: 16 }}>White: {W}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Mode:</label>
        <select value={playComputer} onChange={e => setPlayComputer(e.target.value as 'none' | 'B' | 'W')} style={{ fontSize: '1.2rem' }} title='Mode'>
          <option value="none">None (2 Players)</option>
          <option value="B">Computer as Black</option>
          <option value="W">Computer as White</option>
        </select>
        {playComputer !== 'none' && (
          <div style={{ marginTop: 1 }}>
            <br />
            <span style={{ marginLeft: 16 }}>
              <label style={{ marginRight: 8 }}>Difficulty:</label>
              <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} style={{ fontSize: '1.2rem' }}>
                {DIFFICULTY_LEVELS.map((d, i) => (
                  <option value={i} key={d.label}>{d.label}</option>
                ))}
              </select>
            </span>
          </div>
        )}
      </div>
      <BoardComponent board={board} validMoves={validMoves} onCellClick={handleCellClick} />
      <div style={{ marginTop: 3 }}>
        {gameOver && (
          <>
            <h2>Game Over</h2>
            <p>{B === W ? 'Draw!' : B > W ? 'Black wins!' : 'White wins!'}</p>
          </>
        )}
        <button onClick={handleRestart}>Restart</button>
      </div>
    </div>
  );
}

export default App;
