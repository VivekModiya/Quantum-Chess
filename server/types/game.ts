import type {
  MoveData,
  GameResult,
  BoardSnapshot,
} from '../../shared/socketEvents.js'

export type PlayerColor = 'white' | 'black'
export type ColorChoice = PlayerColor | 'random'
export type GameStatus = 'waiting' | 'active' | 'completed'

export interface PlayerRecord {
  playerId: string
  joinedAt: number
}

export interface GameRecord {
  id: string
  status: GameStatus
  /** Time control in minutes */
  timeControl: number
  players: {
    white: PlayerRecord | null
    black: PlayerRecord | null
  }
  /** Full move history for reconnection / spectating */
  moves: MoveData[]
  /** Remaining time in ms per player */
  timers: {
    white: number
    black: number
  }
  /** Whose turn it is */
  currentTurn: PlayerColor
  /** Timestamp of last move (for calculating elapsed time) */
  lastMoveTimestamp: number | null
  /** Game result if completed */
  result: GameResult | null
  /** Pending draw offer */
  drawOffer: { from: PlayerColor } | null
  /** Full board snapshot (updated after every move) */
  snapshot: BoardSnapshot | null
  /** PGN string built incrementally from moves */
  pgn: string
  /** Pending rematch request */
  rematchRequest: { from: PlayerColor } | null
  createdAt: number
}

export interface CreateGameRequest {
  timeControl: number
  color: ColorChoice
}

export interface CreateGameResponse {
  gameId: string
  playerId: string
  assignedColor: PlayerColor
}

export interface JoinGameResponse {
  gameId: string
  playerId: string
  assignedColor: PlayerColor
}
