import { CellState, GameBoard, GameState, MoveResult, PlayerColor, Position } from './types';

// Direções para verificar as capturas (horizontal, vertical e diagonal)
const DIRECTIONS = [
  { row: -1, col: 0 },  // Norte
  { row: -1, col: 1 },  // Nordeste
  { row: 0, col: 1 },   // Leste
  { row: 1, col: 1 },   // Sudeste
  { row: 1, col: 0 },   // Sul
  { row: 1, col: -1 },  // Sudoeste
  { row: 0, col: -1 },  // Oeste
  { row: -1, col: -1 }, // Noroeste
];

export function createInitialGameState(): GameState {
  // Criar tabuleiro 8x8 vazio
  const board: GameBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill('empty'));

  // Configuração inicial padrão do Othello
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';

  // Preto sempre começa no Othello
  const currentPlayer: PlayerColor = 'black';

  const state: GameState = {
    board,
    currentPlayer,
    blackScore: 2,
    whiteScore: 2,
    gameOver: false,
    winner: null,
    validMoves: [],
    lastMove: null,
  };

  // Calcular movimentos válidos para o jogador inicial
  state.validMoves = calculateValidMoves(state);

  return state;
}

export function makeMove(state: GameState, position: Position): MoveResult {
  // Verificar se é um movimento válido
  if (!isValidMove(state, position)) {
    return {
      success: false,
      newState: state,
      error: 'Movimento inválido',
    };
  }

  // Criar cópia profunda do estado atual para não modificar o original
  const newState: GameState = JSON.parse(JSON.stringify(state));
  const { row, col } = position;

  // Colocar a peça na posição escolhida
  newState.board[row][col] = newState.currentPlayer;
  newState.lastMove = { row, col };

  // Capturar peças
  const capturedPieces = capturePieces(newState, position);

  // Mudar o turno para o próximo jogador
  newState.currentPlayer = newState.currentPlayer === 'black' ? 'white' : 'black';

  // Recalcular pontuação
  updateScore(newState);

  // Calcular movimentos válidos para o próximo jogador
  newState.validMoves = calculateValidMoves(newState);

  // Verificar se o jogo acabou
  checkGameOver(newState);

  return {
    success: true,
    newState,
    capturedPieces,
  };
}

export function skipTurn(state: GameState): MoveResult {
  // Só pode pular o turno se não houver movimentos válidos
  if (state.validMoves.length > 0) {
    return {
      success: false,
      newState: state,
      error: 'Não é possível pular o turno quando há movimentos válidos',
    };
  }

  // Criar cópia profunda do estado atual
  const newState: GameState = JSON.parse(JSON.stringify(state));

  // Mudar o turno para o próximo jogador
  newState.currentPlayer = newState.currentPlayer === 'black' ? 'white' : 'black';

  // Calcular movimentos válidos para o próximo jogador
  newState.validMoves = calculateValidMoves(newState);

  // Verificar se o jogo acabou
  checkGameOver(newState);

  return {
    success: true,
    newState,
  };
}

// Verificar se um movimento é válido
function isValidMove(state: GameState, position: Position): boolean {
  return state.validMoves.some(
    move => move.row === position.row && move.col === position.col
  );
}

// Calcular todos os movimentos válidos para o jogador atual
function calculateValidMoves(state: GameState): Position[] {
  const validMoves: Position[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (state.board[row][col] !== 'empty') continue;

      const position = { row, col };
      if (wouldCaptureAnyPieces(state, position)) {
        validMoves.push(position);
      }
    }
  }

  return validMoves;
}

// Verificar se um movimento capturaria alguma peça
function wouldCaptureAnyPieces(state: GameState, position: Position): boolean {
  return DIRECTIONS.some(dir => wouldCaptureInDirection(state, position, dir));
}

// Verificar se um movimento capturaria peças em uma direção específica
function wouldCaptureInDirection(
  state: GameState,
  position: Position,
  direction: Position
): boolean {
  const { row, col } = position;
  const playerColor = state.currentPlayer;
  const opponentColor = playerColor === 'black' ? 'white' : 'black';

  let currRow = row + direction.row;
  let currCol = col + direction.col;
  
  // Verificar se a primeira peça na direção é do oponente
  if (
    currRow < 0 || currRow >= 8 || 
    currCol < 0 || currCol >= 8 || 
    state.board[currRow][currCol] !== opponentColor
  ) {
    return false;
  }

  // Continuar verificando na direção
  currRow += direction.row;
  currCol += direction.col;
  
  while (currRow >= 0 && currRow < 8 && currCol >= 0 && currCol < 8) {
    if (state.board[currRow][currCol] === 'empty') {
      return false;
    }
    
    if (state.board[currRow][currCol] === playerColor) {
      return true;
    }
    
    currRow += direction.row;
    currCol += direction.col;
  }
  
  return false;
}

// Capturar peças em todas as direções
function capturePieces(state: GameState, position: Position): Position[] {
  const capturedPieces: Position[] = [];
  
  DIRECTIONS.forEach(dir => {
    const capturedInDirection = captureInDirection(state, position, dir);
    capturedPieces.push(...capturedInDirection);
  });
  
  return capturedPieces;
}

// Capturar peças em uma direção específica
function captureInDirection(
  state: GameState,
  position: Position,
  direction: Position
): Position[] {
  const { row, col } = position;
  const playerColor = state.currentPlayer;
  const opponentColor = playerColor === 'black' ? 'white' : 'black';
  const capturedPieces: Position[] = [];
  
  let currRow = row + direction.row;
  let currCol = col + direction.col;
  
  // Verificar se a primeira peça na direção é do oponente
  if (
    currRow < 0 || currRow >= 8 || 
    currCol < 0 || currCol >= 8 || 
    state.board[currRow][currCol] !== opponentColor
  ) {
    return [];
  }
  
  const potentialCaptures: Position[] = [];
  
  // Continuar verificando na direção
  while (currRow >= 0 && currRow < 8 && currCol >= 0 && currCol < 8) {
    if (state.board[currRow][currCol] === 'empty') {
      return [];
    }
    
    if (state.board[currRow][currCol] === opponentColor) {
      potentialCaptures.push({ row: currRow, col: currCol });
    }
    
    if (state.board[currRow][currCol] === playerColor) {
      // Capturar todas as peças entre a posição original e esta posição
      potentialCaptures.forEach(pos => {
        state.board[pos.row][pos.col] = playerColor;
        capturedPieces.push(pos);
      });
      
      return capturedPieces;
    }
    
    currRow += direction.row;
    currCol += direction.col;
  }
  
  return [];
}

// Atualizar a pontuação com base no tabuleiro atual
function updateScore(state: GameState): void {
  let blackCount = 0;
  let whiteCount = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (state.board[row][col] === 'black') {
        blackCount++;
      } else if (state.board[row][col] === 'white') {
        whiteCount++;
      }
    }
  }
  
  state.blackScore = blackCount;
  state.whiteScore = whiteCount;
}

// Verificar se o jogo acabou
function checkGameOver(state: GameState): void {
  // Se o jogador atual não tem movimentos válidos
  if (state.validMoves.length === 0) {
    // Temporariamente mudar para o outro jogador para verificar seus movimentos
    const tempState = JSON.parse(JSON.stringify(state));
    tempState.currentPlayer = tempState.currentPlayer === 'black' ? 'white' : 'black';
    const otherPlayerMoves = calculateValidMoves(tempState);
    
    // Se nenhum jogador tem movimentos válidos, o jogo acabou
    if (otherPlayerMoves.length === 0) {
      state.gameOver = true;
      
      // Determinar o vencedor
      if (state.blackScore > state.whiteScore) {
        state.winner = 'black';
      } else if (state.whiteScore > state.blackScore) {
        state.winner = 'white';
      } else {
        state.winner = 'draw';
      }
    }
  }
}

// Verificar se todo o tabuleiro está preenchido
function isBoardFull(state: GameState): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (state.board[row][col] === 'empty') {
        return false;
      }
    }
  }
  return true;
}

// Função para desistir do jogo
export function surrender(state: GameState, playerColor: PlayerColor): GameState {
  const newState = JSON.parse(JSON.stringify(state));
  
  newState.gameOver = true;
  newState.winner = playerColor === 'black' ? 'white' : 'black';
  
  return newState;
}

// Função auxiliar para debug
export function printBoard(board: GameBoard): void {
  const symbols = {
    empty: '.',
    black: '●',
    white: '○',
  };
  
  console.log('  0 1 2 3 4 5 6 7');
  for (let row = 0; row < 8; row++) {
    let line = `${row} `;
    for (let col = 0; col < 8; col++) {
      line += symbols[board[row][col]] + ' ';
    }
    console.log(line);
  }
} 