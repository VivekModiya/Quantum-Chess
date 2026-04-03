// Shared event types for Socket.IO communication between client and server

export type PlayerColor = 'white' | 'black'

export interface MoveData {
  from: string
  to: string
  promotion?: string
  /** Standard Algebraic Notation for this move (e.g. "e4", "Nf3", "O-O") */
  san?: string
}

export interface TimerData {
  white: number // remaining ms
  black: number // remaining ms
}

/** Serialisable piece on board (same shape as client BoardPiece) */
export interface SnapshotPiece {
  square: string
  piece: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
  color: 'white' | 'black'
}

/** Full board snapshot sent alongside each move for instant state restore */
export interface BoardSnapshot {
  board: Record<string, SnapshotPiece>
  capturedPieces: SnapshotPiece[]
  castlingRights: {
    whiteKingside: boolean
    whiteQueenside: boolean
    blackKingside: boolean
    blackQueenside: boolean
  }
  enPassantTarget: string | null
  halfMoveClock: number
  positionHistory: string[]
  lastMoveSquares: { from: string; to: string } | null
  currentTurn: PlayerColor
}

export interface GameStateData {
  gameId: string
  status: 'waiting' | 'active' | 'completed'
  currentTurn: PlayerColor
  moves: MoveData[]
  timers: TimerData
  timeControl: number // minutes
  players: {
    white: { playerId: string; connected: boolean } | null
    black: { playerId: string; connected: boolean } | null
  }
  drawOffer: { from: PlayerColor } | null
  result: GameResult | null
  snapshot: BoardSnapshot | null
  /** PGN string of the game so far */
  pgn: string
}

export type GameResult =
  | {
      type: 'win'
      winner: PlayerColor
      reason: 'checkmate' | 'timeout' | 'resignation' | 'abandoned'
    }
  | {
      type: 'draw'
      reason: 'agreement' | 'repetition' | '50 moves' | 'insufficient material'
    }
  | { type: 'stalemate' }
  | { type: 'aborted' }

// Client → Server events
export interface ClientToServerEvents {
  join_game: (payload: { gameId: string; playerId: string }) => void
  spectate_game: (payload: { gameId: string }) => void
  make_move: (payload: MoveData & { snapshot?: BoardSnapshot }) => void
  resign: () => void
  offer_draw: () => void
  accept_draw: () => void
  decline_draw: () => void
  abort_game: () => void
}

// Server → Client events
export interface ServerToClientEvents {
  game_state: (payload: GameStateData) => void
  move_made: (payload: {
    move: MoveData
    currentTurn: PlayerColor
    timers: TimerData
    snapshot: BoardSnapshot | null
    pgn: string
  }) => void
  timer_update: (payload: TimerData) => void
  game_over: (payload: GameResult) => void
  player_joined: (payload: { color: PlayerColor }) => void
  player_disconnected: (payload: { color: PlayerColor }) => void
  player_reconnected: (payload: { color: PlayerColor }) => void
  draw_offered: (payload: { from: PlayerColor }) => void
  draw_declined: () => void
  error: (payload: { message: string }) => void
}
