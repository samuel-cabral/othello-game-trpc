import { createInitialGameState, makeMove, skipTurn, surrender } from './game';
import { ChatMessage, GameRoom, GameState, Player, PlayerColor, Position } from './types';
import { v4 as uuidv4 } from 'uuid';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  // Criar uma nova sala de jogo
  createRoom(creatorId: string, creatorName: string): GameRoom {
    const roomId = uuidv4();
    const initialGameState = createInitialGameState();
    
    const room: GameRoom = {
      id: roomId,
      gameState: initialGameState,
      players: [
        {
          id: creatorId,
          name: creatorName,
          color: 'black' // Criador sempre começa como preto
        }
      ],
      spectators: [],
      messages: []
    };
    
    this.rooms.set(roomId, room);
    return room;
  }

  // Obter uma sala por ID
  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  // Listar todas as salas disponíveis
  listAvailableRooms(): GameRoom[] {
    return Array.from(this.rooms.values())
      .filter(room => room.players.length < 2 && !room.gameState.gameOver);
  }

  // Adicionar jogador a uma sala
  joinRoom(roomId: string, playerId: string, playerName: string): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Se já tem 2 jogadores, adicionar como espectador
    if (room.players.length >= 2) {
      if (!room.spectators.includes(playerId)) {
        room.spectators.push(playerId);
      }
      return room;
    }

    // Se o jogador já está na sala, não fazer nada
    if (room.players.some(p => p.id === playerId)) {
      return room;
    }

    // Adicionar jogador
    const playerColor: PlayerColor = room.players[0].color === 'black' ? 'white' : 'black';
    room.players.push({
      id: playerId,
      name: playerName,
      color: playerColor
    });

    return room;
  }

  // Fazer jogada
  makeMove(roomId: string, playerId: string, position: Position): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Verificar se é a vez do jogador
    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;
    if (player.color !== room.gameState.currentPlayer) return undefined;

    // Fazer a jogada
    const result = makeMove(room.gameState, position);
    if (result.success) {
      room.gameState = result.newState;
    }

    return room;
  }

  // Pular turno (quando não há movimentos válidos)
  skipTurn(roomId: string, playerId: string): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Verificar se é a vez do jogador
    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;
    if (player.color !== room.gameState.currentPlayer) return undefined;

    // Pular turno
    const result = skipTurn(room.gameState);
    if (result.success) {
      room.gameState = result.newState;
    }

    return room;
  }

  // Desistir do jogo
  surrender(roomId: string, playerId: string): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Verificar se o jogador está na sala
    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;

    // Desistir
    room.gameState = surrender(room.gameState, player.color);
    
    return room;
  }

  // Enviar mensagem no chat
  sendMessage(roomId: string, playerId: string, message: string): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Verificar se o jogador está na sala (como jogador ou espectador)
    const player = room.players.find(p => p.id === playerId);
    const isSpectator = room.spectators.includes(playerId);
    
    if (!player && !isSpectator) return undefined;

    // Adicionar mensagem
    const chatMessage: ChatMessage = {
      playerId,
      playerName: player ? player.name : 'Espectador',
      message,
      timestamp: Date.now()
    };

    room.messages.push(chatMessage);
    
    return room;
  }

  // Remover um jogador da sala
  leaveRoom(roomId: string, playerId: string): GameRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Verificar se o jogador é um espectador
    const spectatorIndex = room.spectators.indexOf(playerId);
    if (spectatorIndex !== -1) {
      room.spectators.splice(spectatorIndex, 1);
      return room;
    }

    // Verificar se o jogador é um jogador ativo
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      // Se o jogo já acabou, simplesmente remover o jogador
      if (room.gameState.gameOver) {
        room.players.splice(playerIndex, 1);
      } else {
        // Se o jogo está em andamento, considerar como uma desistência
        const player = room.players[playerIndex];
        room.gameState = surrender(room.gameState, player.color);
      }
      
      // Se não há mais jogadores, remover a sala
      if (room.players.length === 0 && room.spectators.length === 0) {
        this.rooms.delete(roomId);
        return undefined;
      }
    }

    return room;
  }

  // Limpar salas antigas ou vazias
  cleanupRooms(): void {
    const currentTime = Date.now();
    const MAX_ROOM_AGE = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    for (const [roomId, room] of this.rooms.entries()) {
      // Remover salas vazias
      if (room.players.length === 0 && room.spectators.length === 0) {
        this.rooms.delete(roomId);
        continue;
      }
      
      // Remover salas antigas com jogos finalizados
      const lastMessageTime = room.messages.length > 0 
        ? room.messages[room.messages.length - 1].timestamp 
        : 0;
        
      if (room.gameState.gameOver && (currentTime - lastMessageTime) > MAX_ROOM_AGE) {
        this.rooms.delete(roomId);
      }
    }
  }
} 