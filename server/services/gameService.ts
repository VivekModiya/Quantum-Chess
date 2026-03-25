import { generateId } from '../utils/idGenerator.js'
import { readGame, writeGame } from './storageService.js'
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

function oppositeColor(color: PlayerColor): PlayerColor {
  return color === 'white' ? 'black' : 'white'
}

export function createGame(req: CreateGameRequest): CreateGameResponse {
  const { timeControl, color } = req
  const gameId = generateId()
  const playerId = generateId()
  const assignedColor = resolveColor(color)

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
    createdAt: Date.now(),
  }

  writeGame(game)

  return { gameId, playerId, assignedColor }
}

export type JoinGameError = { code: 'NOT_FOUND' } | { code: 'GAME_FULL' }

export function joinGame(gameId: string): JoinGameResponse | JoinGameError {
  const game = readGame(gameId)

  if (!game) return { code: 'NOT_FOUND' }
  if (game.status !== 'waiting') return { code: 'GAME_FULL' }

  const playerId = generateId()
  const assignedColor: PlayerColor =
    game.players.white === null ? 'white' : 'black'

  game.players[assignedColor] = { playerId, joinedAt: Date.now() }
  game.status = 'active'

  writeGame(game)

  return { gameId, playerId, assignedColor }
}
