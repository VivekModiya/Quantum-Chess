import { PieceColor, PieceType } from '../../types'
import {
  Piece,
  Square,
  SquareCoords,
  BoardState,
  BoardPiece,
} from '../../types/chess'
import { PIECE_SQUARE_MAP } from '../../constants'

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
 * @param pieceId - Piece ID in format like 'pw1' (pawn white 1) or 'kb' (king black)
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
 * @returns BoardState object with all pieces in their initial positions
 */
export function createInitialBoard(): BoardState {
  const board: BoardState = {}

  // Create all pieces from PIECE_SQUARE_MAP
  Object.entries(PIECE_SQUARE_MAP).forEach(([pieceId, square]) => {
    const pieceInfo = getPieceFromId(pieceId)
    if (pieceInfo) {
      board[pieceId] = {
        square: square as Square,
        piece: pieceInfo.type,
        color: pieceInfo.color,
        isCaptured: false,
      }
    }
  })

  return board
}

/**
 * Gets the piece at a specific square
 * @param board - Current board state
 * @param square - Square to check
 * @returns BoardPiece if found, null otherwise
 */
export function getPieceAtSquare(
  board: BoardState,
  square: Square
): BoardPiece | null {
  for (const piece of Object.values(board)) {
    if (piece.square === square && !piece.isCaptured) {
      return piece
    }
  }
  return null
}

/**
 * Gets the piece ID at a specific square
 * @param board - Current board state
 * @param square - Square to check
 * @returns Piece ID if found, null otherwise
 */
export function getPieceIdAtSquare(
  board: BoardState,
  square: Square
): string | null {
  for (const [pieceId, piece] of Object.entries(board)) {
    if (piece.square === square && !piece.isCaptured) {
      return pieceId
    }
  }
  return null
}

/**
 * Gets all active (non-captured) pieces
 * @param board - Current board state
 * @returns Array of [pieceId, BoardPiece] tuples for active pieces
 */
export function getActivePieces(
  board: BoardState
): Array<[string, BoardPiece]> {
  return Object.entries(board).filter(([_, piece]) => !piece.isCaptured)
}

/**
 * Gets all captured pieces
 * @param board - Current board state
 * @returns Array of piece IDs that are captured
 */
export function getCapturedPieces(board: BoardState): string[] {
  return Object.entries(board)
    .filter(([_, piece]) => piece.isCaptured)
    .map(([pieceId]) => pieceId)
}

/**
 * Converts board state to a Map format for compatibility with move calculation functions
 * @param board - Current board state
 * @returns Map of squares to Piece objects
 */
export function boardToMap(board: BoardState): Map<Square, Piece | null> {
  const boardMap = new Map<Square, Piece | null>()

  // Initialize all squares to null
  for (let file = 0; file < 8; file++) {
    for (let rank = 1; rank <= 8; rank++) {
      const square = String.fromCharCode(97 + file) + (rank + 1)
      boardMap.set(square, null)
    }
  }

  // Set pieces
  Object.values(board).forEach(piece => {
    if (!piece.isCaptured) {
      boardMap.set(piece.square, {
        type: piece.piece,
        color: piece.color,
      })
    }
  })

  return boardMap
}
