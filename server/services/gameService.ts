import { generateId } from '../utils/idGenerator.js'
import { getGame, persistGame } from './gameCache.js'
import type {
  ColorChoice,
  CreateGameRequest,
  CreateGameResponse,
  GameRecord,
  JoinGameResponse,
  PlayerColor,
} from '../types/game.js'

function resolveColor(choice: ColorChoice): PlayerColor {
  if (choice === 'random') {
    return Math.random() < 0.5 ? 'white' : 'black'
  }
  return choice
}

export function createGame(req: CreateGameRequest): CreateGameResponse {
  const { timeControl, color } = req
  const gameId = generateId()
  const playerId = generateId()
  const assignedColor = resolveColor(color)

  const timeMs = timeControl * 60 * 1000

  const game: GameRecord = {
    id: gameId,
    status: 'waiting',
    timeControl,
    players: {
      white:
        assignedColor === 'white' ? { playerId, joinedAt: Date.now() } : null,
      black:
        assignedColor === 'black' ? { playerId, joinedAt: Date.now() } : null,
    },
    moves: [],
    timers: { white: timeMs, black: timeMs },
    currentTurn: 'white',
    lastMoveTimestamp: null,
    result: null,
    drawOffer: null,
    snapshot: null,
    pgn: '',
    createdAt: Date.now(),
  }

  persistGame(game)

  return { gameId, playerId, assignedColor }
}

export type JoinGameError = { code: 'NOT_FOUND' } | { code: 'GAME_FULL' }

export function joinGame(gameId: string): JoinGameResponse | JoinGameError {
  const game = getGame(gameId)

  if (!game) return { code: 'NOT_FOUND' }
  if (game.status !== 'waiting') return { code: 'GAME_FULL' }

  const playerId = generateId()
  const assignedColor: PlayerColor =
    game.players.white === null ? 'white' : 'black'

  game.players[assignedColor] = { playerId, joinedAt: Date.now() }
  game.status = 'active'

  persistGame(game)

  return { gameId, playerId, assignedColor }
}
