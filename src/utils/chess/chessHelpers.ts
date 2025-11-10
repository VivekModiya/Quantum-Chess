import { PieceColor, PieceType } from '../../types'
import { Piece, Square, SquareCoords } from '../../types/chess'
import { DEFAULT_CHESS_POSITION } from '../../constants'
import { formatSquare } from '../calculations/calculate'

/**
 * Gets the coordinates (file and rank) from a square string
 * @param square - Square notation (e.g., 'e4')
 * @returns Object with file and rank numbers, or null if invalid
 */
export function getSquareCoords(square: string): SquareCoords | null {
  if (square.length !== 2) return null

  const fileStr = square[0].toLowerCase()
  const rank = parseInt(square[1])

  if (fileStr < 'a' || fileStr > 'h' || rank < 1 || rank > 8) return null

  return {
    file: fileStr.charCodeAt(0) - 'a'.charCodeAt(0) + 1,
    rank,
  }
}

/**
 * Converts a piece ID to a Piece object
 * @param pieceId - Piece ID in format like 'pw' (pawn white) or 'kb' (king black)
 * @returns Piece object with type and color, or null if invalid
 */
export function getPieceFromId(pieceId: string): Piece | null {
  const pieceMap = {
    p: 'pawn',
    b: 'bishop',
    n: 'knight',
    k: 'king',
    q: 'queen',
    r: 'rook',
  } satisfies Record<string, PieceType>

  const colorMap = {
    w: 'white',
    b: 'black',
  } satisfies Record<string, PieceColor>

  const piece = pieceMap[pieceId[0] as keyof typeof pieceMap]
  const color = colorMap[pieceId[1] as keyof typeof colorMap]

  if (piece && color) {
    return {
      color,
      type: piece,
    }
  }

  return null
}

/**
 * Creates the initial chess board with starting positions
 * @returns Map of squares to pieces
 */
export function createInitialBoard(): Map<Square, Piece | null> {
  const board = new Map<Square, Piece | null>()

  // Initialize all squares to null first
  for (let file = 0; file < 8; file++) {
    for (let rank = 1; rank <= 8; rank++) {
      const square = formatSquare(file, rank)
      board.set(square, null)
    }
  }

  // Set initial positions
  Object.entries(DEFAULT_CHESS_POSITION).forEach(([square, piece]) => {
    board.set(square, piece)
  })

  return board
}
