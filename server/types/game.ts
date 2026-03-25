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
