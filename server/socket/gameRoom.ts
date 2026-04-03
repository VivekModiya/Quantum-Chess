import type { Server, Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  GameStateData,
  GameResult,
  PlayerColor,
} from '../../shared/socketEvents.js'
import { getGame, persistGame } from '../services/gameCache.js'
import {
  startTimer,
  switchTimer,
  stopTimer,
  isTimerRunning,
} from '../services/timerService.js'
import {
  getPlayerBySocket,
  setPlayerSocket,
  removePlayerSocket,
  setSpectatorSocket,
  removeSpectatorSocket,
} from './socketHandler.js'
import type { GameRecord } from '../types/game.js'

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>

function buildGameState(
  game: GameRecord,
  connectedSockets: Map<
    string,
    { gameId: string; playerId: string; color: PlayerColor }
  >
): GameStateData {
  // Determine connection status from active sockets — use playerId index for O(1) lookup
  let whiteConnected = false
  let blackConnected = false
  const whitePlayerId = game.players.white?.playerId
  const blackPlayerId = game.players.black?.playerId

  for (const s of connectedSockets.values()) {
    if (s.gameId !== game.id) continue
    if (!whiteConnected && whitePlayerId && s.playerId === whitePlayerId) {
      whiteConnected = true
    }
    if (!blackConnected && blackPlayerId && s.playerId === blackPlayerId) {
      blackConnected = true
    }
    if (whiteConnected && blackConnected) break
  }

  // Compute live timer values (deduct elapsed from active side)
  let liveTimers = { ...game.timers }
  if (game.lastMoveTimestamp && game.status === 'active') {
    const elapsed = Date.now() - game.lastMoveTimestamp
    const activeSide = game.currentTurn
    liveTimers[activeSide] = Math.max(0, liveTimers[activeSide] - elapsed)
  }

  return {
    gameId: game.id,
    status: game.status,
    currentTurn: game.currentTurn,
    moves: game.moves,
    timers: liveTimers,
    timeControl: game.timeControl,
    players: {
      white: game.players.white
        ? { playerId: game.players.white.playerId, connected: whiteConnected }
        : null,
      black: game.players.black
        ? { playerId: game.players.black.playerId, connected: blackConnected }
        : null,
    },
    drawOffer: game.drawOffer,
    result: game.result,
    snapshot: game.snapshot,
    pgn: game.pgn,
  }
}

// Track connected players across all games
const connectedPlayers = new Map<
  string,
  { gameId: string; playerId: string; color: PlayerColor }
>()

function endGame(io: IOServer, game: GameRecord, result: GameResult): void {
  game.status = 'completed'
  game.result = result
  stopTimer(game.id)
  persistGame(game)
  io.to(game.id).emit('game_over', result)
}

export function handleGameRoom(io: IOServer, socket: IOSocket): void {
  socket.on('join_game', ({ gameId, playerId }) => {
    const game = getGame(gameId)
    if (!game) {
      socket.emit('error', { message: 'Game not found' })
      return
    }

    // Find which color this player is
    let playerColor: PlayerColor | null = null
    if (game.players.white?.playerId === playerId) playerColor = 'white'
    else if (game.players.black?.playerId === playerId) playerColor = 'black'

    if (!playerColor) {
      socket.emit('error', { message: 'Player not found in this game' })
      return
    }

    // Join the Socket.IO room
    socket.join(gameId)
    setPlayerSocket(socket.id, { gameId, playerId, color: playerColor })
    connectedPlayers.set(socket.id, { gameId, playerId, color: playerColor })

    // Notify others of reconnection/join
    socket.to(gameId).emit('player_reconnected', { color: playerColor })

    // Send full game state to the joining player
    const state = buildGameState(game, connectedPlayers)
    socket.emit('game_state', state)

    // If game is active and timer should be running (moves have been made), restart timer
    if (
      game.status === 'active' &&
      game.moves.length > 0 &&
      !isTimerRunning(gameId)
    ) {
      startTimer(
        gameId,
        timers => io.to(gameId).emit('timer_update', timers),
        result => {
          const g = getGame(gameId)
          if (g) endGame(io, g, result)
        }
      )
    }
  })

  socket.on('spectate_game', ({ gameId }) => {
    const game = getGame(gameId)
    if (!game) {
      socket.emit('error', { message: 'Game not found' })
      return
    }

    socket.join(gameId)
    setSpectatorSocket(socket.id, gameId)

    const state = buildGameState(game, connectedPlayers)
    socket.emit('game_state', state)
  })

  socket.on('make_move', moveData => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) {
      socket.emit('error', { message: 'Not in a game' })
      return
    }

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active') {
      socket.emit('error', { message: 'Game not active' })
      return
    }

    // Verify it's this player's turn
    if (game.currentTurn !== playerInfo.color) {
      socket.emit('error', { message: 'Not your turn' })
      return
    }

    // Extract snapshot from the payload (client sends it alongside the move)
    const { snapshot, ...move } = moveData

    // Record the move
    game.moves.push(move)

    // Build PGN incrementally from SAN provided by client
    if (move.san) {
      const moveNumber = Math.ceil(game.moves.length / 2)
      if (game.currentTurn === 'white') {
        game.pgn += (game.pgn ? ' ' : '') + moveNumber + '. ' + move.san
      } else {
        game.pgn += ' ' + move.san
      }
    }

    // Store latest board snapshot
    if (snapshot) {
      game.snapshot = snapshot
    }

    // Handle timer
    const isFirstMove = game.moves.length === 1
    if (isFirstMove) {
      // Start timer on first move
      startTimer(
        playerInfo.gameId,
        timers => io.to(playerInfo.gameId).emit('timer_update', timers),
        result => {
          const g = getGame(playerInfo.gameId)
          if (g) endGame(io, g, result)
        }
      )
    } else {
      // Deduct elapsed time from current player, switch clock
      switchTimer(playerInfo.gameId)
    }

    // Switch turn
    const previousTurn = game.currentTurn
    game.currentTurn = previousTurn === 'white' ? 'black' : 'white'

    // Clear any pending draw offer on move
    game.drawOffer = null

    persistGame(game)

    // Broadcast move to all in room (including sender for confirmation)
    io.to(playerInfo.gameId).emit('move_made', {
      move,
      currentTurn: game.currentTurn,
      timers: { ...game.timers },
      snapshot: game.snapshot,
      pgn: game.pgn,
    })
  })

  socket.on('resign', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) return

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active') return

    const winner: PlayerColor = playerInfo.color === 'white' ? 'black' : 'white'
    endGame(io, game, { type: 'win', winner, reason: 'resignation' })
  })

  socket.on('offer_draw', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) return

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active') return

    game.drawOffer = { from: playerInfo.color }
    persistGame(game)

    socket
      .to(playerInfo.gameId)
      .emit('draw_offered', { from: playerInfo.color })
  })

  socket.on('accept_draw', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) return

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active' || !game.drawOffer) return

    // Only the opponent of the one who offered can accept
    if (game.drawOffer.from === playerInfo.color) return

    endGame(io, game, { type: 'draw', reason: 'agreement' })
  })

  socket.on('decline_draw', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) return

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active' || !game.drawOffer) return

    if (game.drawOffer.from === playerInfo.color) return

    game.drawOffer = null
    persistGame(game)

    socket.to(playerInfo.gameId).emit('draw_declined')
  })

  socket.on('abort_game', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (!playerInfo) return

    const game = getGame(playerInfo.gameId)
    if (!game || game.status !== 'active') return

    // Only allow abort before 2 total moves
    if (game.moves.length >= 2) {
      socket.emit('error', { message: 'Cannot abort after 2 moves' })
      return
    }

    endGame(io, game, { type: 'aborted' })
  })

  socket.on('disconnect', () => {
    const playerInfo = getPlayerBySocket(socket.id)
    if (playerInfo) {
      connectedPlayers.delete(socket.id)
      removePlayerSocket(socket.id)

      // Notify room that player disconnected
      socket
        .to(playerInfo.gameId)
        .emit('player_disconnected', { color: playerInfo.color })
      return
    }

    // Check if spectator
    removeSpectatorSocket(socket.id)
  })
}
