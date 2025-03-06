import { initTRPC } from '@trpc/server';
import { RoomManager } from 'othello-core';
import {
  CreateRoomSchema,
  JoinRoomSchema,
  MakeMoveSchema,
  SkipTurnSchema,
  SurrenderSchema,
  SendMessageSchema,
  LeaveRoomSchema,
} from './types';
import { z } from 'zod';

const t = initTRPC.create();

// Criar uma instância do gerenciador de salas
const roomManager = new RoomManager();

// Criar o router
export const router = t.router({
  // Criar uma nova sala
  createRoom: t.procedure
    .input(CreateRoomSchema)
    .mutation(({ input }) => {
      return roomManager.createRoom(input.creatorId, input.creatorName);
    }),

  // Listar salas disponíveis
  listRooms: t.procedure.query(() => {
    return roomManager.listAvailableRooms();
  }),

  // Obter uma sala específica
  getRoom: t.procedure
    .input(z.string())
    .query(({ input }) => {
      return roomManager.getRoom(input);
    }),

  // Entrar em uma sala
  joinRoom: t.procedure
    .input(JoinRoomSchema)
    .mutation(({ input }) => {
      return roomManager.joinRoom(input.roomId, input.playerId, input.playerName);
    }),

  // Fazer uma jogada
  makeMove: t.procedure
    .input(MakeMoveSchema)
    .mutation(({ input }) => {
      return roomManager.makeMove(input.roomId, input.playerId, input.position);
    }),

  // Pular turno
  skipTurn: t.procedure
    .input(SkipTurnSchema)
    .mutation(({ input }) => {
      return roomManager.skipTurn(input.roomId, input.playerId);
    }),

  // Desistir do jogo
  surrender: t.procedure
    .input(SurrenderSchema)
    .mutation(({ input }) => {
      return roomManager.surrender(input.roomId, input.playerId);
    }),

  // Enviar mensagem no chat
  sendMessage: t.procedure
    .input(SendMessageSchema)
    .mutation(({ input }) => {
      return roomManager.sendMessage(input.roomId, input.playerId, input.message);
    }),

  // Sair da sala
  leaveRoom: t.procedure
    .input(LeaveRoomSchema)
    .mutation(({ input }) => {
      return roomManager.leaveRoom(input.roomId, input.playerId);
    }),
}); 