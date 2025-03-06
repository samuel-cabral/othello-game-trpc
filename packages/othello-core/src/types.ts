export type CellState = 'empty' | 'black' | 'white';
export type Position = { row: number; col: number };
export type GameBoard = CellState[][];
export type PlayerColor = 'black' | 'white';

export interface GameState {
  board: GameBoard;
  currentPlayer: PlayerColor;
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
  winner: PlayerColor | 'draw' | null;
  validMoves: Position[];
  lastMove: Position | null;
}

export interface MoveResult {
  success: boolean;
  newState: GameState;
  error?: string;
  capturedPieces?: Position[];
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
}

export interface GameRoom {
  id: string;
  gameState: GameState;
  players: Player[];
  spectators: string[];
  messages: ChatMessage[];
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface GameSession {
  roomId: string;
  playerId: string;
} 