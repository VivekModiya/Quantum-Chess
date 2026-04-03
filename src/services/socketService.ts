import { io, Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  MoveData,
  BoardSnapshot,
} from '../../shared/socketEvents'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SERVER_URL = window.location.origin

let socket: TypedSocket | null = null

export function getSocket(): TypedSocket | null {
  return socket
}

export function connectToGame(gameId: string, playerId: string): TypedSocket {
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  socket.on('connect', () => {
    socket!.emit('join_game', { gameId, playerId })
  })

  return socket
}

export function spectateGame(gameId: string): TypedSocket {
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    socket!.emit('spectate_game', { gameId })
  })

  return socket
}

export function sendMove(move: MoveData, snapshot?: BoardSnapshot): void {
  socket?.emit('make_move', { ...move, snapshot })
}

export function sendResign(): void {
  socket?.emit('resign')
}

export function sendDrawOffer(): void {
  socket?.emit('offer_draw')
}

export function sendAcceptDraw(): void {
  socket?.emit('accept_draw')
}

export function sendDeclineDraw(): void {
  socket?.emit('decline_draw')
}

export function sendAbort(): void {
  socket?.emit('abort_game')
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
