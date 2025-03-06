export type Player = 'black' | 'white';

export type Piece = Player | null;

export type Position = [number, number];

export type Board = Piece[][];

export interface GameState {
  board: Board;
  turn: Player;
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
}

export function createNewGame(): GameState {
  // Initialize a new game with the starting board layout
  // and black player going first
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = 'white';
  board[3][4] = 'black'; 
  board[4][3] = 'black';
  board[4][4] = 'white';

  return {
    board,
    turn: 'black',
    blackScore: 2,
    whiteScore: 2,  
    gameOver: false,
  };
}

export function placePiece(game: GameState, player: Player, position: Position): GameState {
  // Validate the move
  if (!isValidMove(game, player, position)) {
    throw new Error('Invalid move');
  }

  // Place the piece
  const [row, col] = position;
  const newBoard = [...game.board];
  newBoard[row][col] = player;

  // Flip captured opponent pieces
  const captured = getCapturedPieces(game.board, player, position);
  for (const [capturedRow, capturedCol] of captured) {
    newBoard[capturedRow][capturedCol] = player;
  }

  // Update scores
  const blackScore = countPieces(newBoard, 'black');
  const whiteScore = countPieces(newBoard, 'white');

  // Check if game is over
  const gameOver = isGameOver(newBoard);

  // Switch turns
  const turn = player === 'black' ? 'white' : 'black';

  return {
    board: newBoard,
    turn,
    blackScore,
    whiteScore,
    gameOver,
  };
}

function isValidMove(game: GameState, player: Player, position: Position): boolean {
  // Check if position is empty
  const [row, col] = position;
  if (game.board[row][col] !== null) {
    return false;
  }

  // Check if move captures any opponent pieces
  const captured = getCapturedPieces(game.board, player, position);
  return captured.length > 0;
}

function getCapturedPieces(board: Board, player: Player, position: Position): Position[] {
  const [row, col] = position;
  const captured: Position[] = [];
  const opponent = player === 'black' ? 'white' : 'black';

  // Check each direction (horizontal, vertical, diagonal)
  for (const [rowDelta, colDelta] of [
    [-1, -1], [-1, 0], [-1, 1], 
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]) {
    let curRow = row + rowDelta;
    let curCol = col + colDelta;
    const capturedInDirection: Position[] = [];

    // Keep going in this direction as long as we find opponent pieces
    while (
      curRow >= 0 && curRow < 8 && 
      curCol >= 0 && curCol < 8 &&
      board[curRow][curCol] === opponent
    ) {
      capturedInDirection.push([curRow, curCol]);
      curRow += rowDelta;
      curCol += colDelta;
    }

    // If the line ends with the current player's piece, the pieces are captured
    if (
      curRow >= 0 && curRow < 8 && 
      curCol >= 0 && curCol < 8 &&
      board[curRow][curCol] === player      
    ) {
      captured.push(...capturedInDirection);
    }
  }

  return captured;
}

function countPieces(board: Board, player: Player): number {
  // Count the number of pieces on the board for the given player
  return board.flat().filter(piece => piece === player).length;
}

function isGameOver(board: Board): boolean {
  // Check if board is full
  if (board.flat().every(piece => piece !== null)) {
    return true;
  }

  // Check if either player has a valid move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === null) {
        if (getCapturedPieces(board, 'black', [row, col]).length > 0) {
          return false;
        }
        if (getCapturedPieces(board, 'white', [row, col]).length > 0) {
          return false;
        }
      }
    }
  }

  // No valid moves for either player
  return true;
}

export function getValidMoves(game: GameState): Position[] {
  const validMoves: Position[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (game.board[row][col] === null) {
        if (isValidMove(game, game.turn, [row, col])) {
          validMoves.push([row, col]);
        }
      }
    }
  }

  return validMoves;  
} 