import type { Server, Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/socketEvents.js'
import { handleGameRoom } from './gameRoom.js'

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>

// Maps socketId → { gameId, playerId, color }
const socketPlayerMap = new Map<
  string,
  { gameId: string; playerId: string; color: 'white' | 'black' }
>()

// Maps socketId → gameId for spectators
const socketSpectatorMap = new Map<string, string>()

export function getPlayerBySocket(socketId: string) {
  return socketPlayerMap.get(socketId) ?? null
}

export function setPlayerSocket(
  socketId: string,
  info: { gameId: string; playerId: string; color: 'white' | 'black' }
) {
  socketPlayerMap.set(socketId, info)
}

export function removePlayerSocket(socketId: string) {
  socketPlayerMap.delete(socketId)
}

export function getSpectatorGame(socketId: string) {
  return socketSpectatorMap.get(socketId) ?? null
}

export function setSpectatorSocket(socketId: string, gameId: string) {
  socketSpectatorMap.set(socketId, gameId)
}

export function removeSpectatorSocket(socketId: string) {
  socketSpectatorMap.delete(socketId)
}

export function setupSocketHandler(io: IOServer): void {
  io.on('connection', (socket: IOSocket) => {
    console.log(`Socket connected: ${socket.id}`)
    handleGameRoom(io, socket)

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
      // Cleanup is handled in gameRoom.ts via the disconnect handler
    })
  })
}
