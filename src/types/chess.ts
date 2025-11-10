import { PieceColor, PieceType } from './index'

export type Square = string

export interface Piece {
  type: PieceType
  color: PieceColor
}

export interface SquareCoords {
  file: number
  rank: number
}

/**
 * Represents a chess piece on the board with all its state
 */
export interface BoardPiece {
  square: Square
  piece: PieceType
  color: PieceColor
  isCaptured: boolean
}

/**
 * Board state - maps piece IDs to their current state
 * Example: { 'pw0': { square: 'e2', piece: 'pawn', color: 'white', isCaptured: false } }
 */
export type BoardState = Record<string, BoardPiece>

export interface LastMove {
  from: Square
  to: Square
  pieceId: string
}

export interface ChessState {
  board: BoardState
  currentTurn: PieceColor
  lastMove: LastMove | null
}

export type ChessAction =
  | {
      type: 'MAKE_MOVE'
      payload: { pieceId: string; from: Square; to: Square }
    }
  | { type: 'RESET_GAME' }
  | {
      type: 'PROMOTE_PAWN'
      payload: { pieceId: string; targetPiece: PieceType }
    }
