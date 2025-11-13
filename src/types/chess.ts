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
}

/**
 * Board state - maps piece IDs to their current state
 * Captured pieces are removed from the board state entirely
 * Example: { 'pw0': { square: 'e2', piece: 'pawn', color: 'white' } }
 */
export type BoardState = Record<string, BoardPiece>

export interface LastMove {
  from: Square
  to: Square
  pieceId: string
}

export interface CastlingRights {
  whiteKingside: boolean
  whiteQueenside: boolean
  blackKingside: boolean
  blackQueenside: boolean
}

export interface ChessState {
  board: BoardState
  currentTurn: PieceColor
  lastMove: LastMove | null
  capturedPieces: string[] // Array of captured piece IDs
  enPassantTarget: Square | null // Square where en passant capture is possible
  castlingRights: CastlingRights // Tracks which castling moves are still legal
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
