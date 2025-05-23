// Reversi (Othello) game logic and types
export type Player = "B" | "W";
export type Cell = Player | null;
export type Board = Cell[][];

export const BOARD_SIZE = 8;

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
  board[3][3] = "W";
  board[3][4] = "B";
  board[4][3] = "B";
  board[4][4] = "W";
  return board;
}

const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function isOnBoard(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

export function getValidMoves(
  board: Board,
  player: Player
): [number, number][] {
  const opponent: Player = player === "B" ? "W" : "B";
  const validMoves: [number, number][] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[x][y] !== null) continue;
      for (const [dx, dy] of directions) {
        let nx = x + dx,
          ny = y + dy,
          foundOpponent = false;
        while (isOnBoard(nx, ny) && board[nx][ny] === opponent) {
          nx += dx;
          ny += dy;
          foundOpponent = true;
        }
        if (foundOpponent && isOnBoard(nx, ny) && board[nx][ny] === player) {
          validMoves.push([x, y]);
          break;
        }
      }
    }
  }
  return validMoves;
}

export function makeMove(
  board: Board,
  x: number,
  y: number,
  player: Player
): Board {
  if (board[x][y] !== null) return board;
  const opponent: Player = player === "B" ? "W" : "B";
  let flipped = false;
  const newBoard = board.map((row) => [...row]);
  for (const [dx, dy] of directions) {
    let nx = x + dx,
      ny = y + dy,
      pieces: [number, number][] = [];
    while (isOnBoard(nx, ny) && newBoard[nx][ny] === opponent) {
      pieces.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    if (pieces.length && isOnBoard(nx, ny) && newBoard[nx][ny] === player) {
      for (const [fx, fy] of pieces) newBoard[fx][fy] = player;
      flipped = true;
    }
  }
  if (flipped) newBoard[x][y] = player;
  return newBoard;
}

export function countPieces(board: Board): { B: number; W: number } {
  let B = 0,
    W = 0;
  for (const row of board)
    for (const cell of row) {
      if (cell === "B") B++;
      if (cell === "W") W++;
    }
  return { B, W };
}
