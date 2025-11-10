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

export interface ChessState {
  board: Map<Square, Piece | null>
  currentTurn: PieceColor
  squarePieceMap: Map<string, string | null>
  capturedPieces: string[]
}

export type ChessAction =
  | { type: 'MAKE_MOVE'; payload: { from: Square; to: Square } }
  | { type: 'RESET_GAME' }
  | {
      type: 'PROMOTE_PAWN'
      payload: { square: Square; piece: Piece }
    }
