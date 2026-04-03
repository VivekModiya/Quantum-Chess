import { PieceColor, PieceType } from '../../types'
import {
  Piece
} from '../../types/chess'

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
