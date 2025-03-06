import { z } from 'zod';
import { GameRoom, Position } from 'othello-core';

// Schemas de entrada
export const PositionSchema = z.object({
  row: z.number().min(0).max(7),
  col: z.number().min(0).max(7),
});

export const CreateRoomSchema = z.object({
  creatorId: z.string(),
  creatorName: z.string(),
});

export const JoinRoomSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  playerName: z.string(),
});

export const MakeMoveSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  position: PositionSchema,
});

export const SkipTurnSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export const SurrenderSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

export const SendMessageSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  message: z.string().min(1).max(500),
});

export const LeaveRoomSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
});

// Tipos inferidos dos schemas
export type PositionInput = z.infer<typeof PositionSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
export type MakeMoveInput = z.infer<typeof MakeMoveSchema>;
export type SkipTurnInput = z.infer<typeof SkipTurnSchema>;
export type SurrenderInput = z.infer<typeof SurrenderSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type LeaveRoomInput = z.infer<typeof LeaveRoomSchema>;

// Tipos de resposta
export type CreateRoomResponse = GameRoom;
export type JoinRoomResponse = GameRoom;
export type MakeMoveResponse = GameRoom;
export type SkipTurnResponse = GameRoom;
export type SurrenderResponse = GameRoom;
export type SendMessageResponse = GameRoom;
export type LeaveRoomResponse = GameRoom | undefined;
export type ListRoomsResponse = GameRoom[]; 