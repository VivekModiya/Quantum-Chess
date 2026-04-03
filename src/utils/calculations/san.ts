import { PieceColor, PieceType } from '../../types'
import { Piece, CastlingRights } from '../../types'
import { isInCheck, generateLegalMoves, isCheckmate } from './calculate'

const PIECE_LETTER: Record<string, string> = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  pawn: '',
}

/**
 * Generate Standard Algebraic Notation for a move.
 *
 * Call this BEFORE the move is applied to the board, but with enough
 * info to know what the move does (captures, castling, etc.).
 */
export function generateSAN(opts: {
  piece: PieceType
  color: PieceColor
  from: string
  to: string
  isCapture: boolean
  isCastling: boolean
  isEnPassant: boolean
  promotion?: PieceType
  /** board map AFTER the move has been applied */
  boardAfterMove: Map<string, Piece | null>
  /** board map BEFORE the move */
  boardBeforeMove: Map<string, Piece | null>
  castlingRights: CastlingRights
  enPassantTarget: string | null
  nextTurn: PieceColor
}): string {
  const {
    piece,
    color,
    from,
    to,
    isCapture,
    isCastling,
    isEnPassant,
    promotion,
    boardAfterMove,
    boardBeforeMove,
    castlingRights,
    enPassantTarget,
    nextTurn,
  } = opts

  // Castling
  if (isCastling) {
    const file = to.charCodeAt(0) - 'a'.charCodeAt(0)
    return file >= 6 ? 'O-O' : 'O-O-O'
  }

  let san = ''

  if (piece === 'pawn') {
    if (isCapture || isEnPassant) {
      san += from[0] // file of departure for pawn captures
    }
  } else {
    san += PIECE_LETTER[piece] || ''

    // Disambiguation: check if another piece of the same type and color
    // can also move to the same square
    const disambiguation = getDisambiguation(
      boardBeforeMove,
      piece,
      color,
      from,
      to,
      castlingRights,
      enPassantTarget
    )
    san += disambiguation
  }

  if (isCapture || isEnPassant) {
    san += 'x'
  }

  san += to

  if (promotion) {
    san += '=' + (PIECE_LETTER[promotion] || 'Q')
  }

  // Check / checkmate suffix
  if (isInCheck(boardAfterMove, nextTurn)) {
    // See if it's checkmate
    if (
      isCheckmate(boardAfterMove, nextTurn, enPassantTarget, castlingRights)
    ) {
      san += '#'
    } else {
      san += '+'
    }
  }

  return san
}

function getDisambiguation(
  board: Map<string, Piece | null>,
  pieceType: PieceType,
  color: PieceColor,
  from: string,
  to: string,
  castlingRights: CastlingRights,
  enPassantTarget: string | null
): string {
  const candidates: string[] = []

  for (const [sq, p] of board.entries()) {
    if (!p || sq === from) continue
    if (p.type !== pieceType || p.color !== color) continue
    const moves = generateLegalMoves(
      sq,
      p,
      board,
      enPassantTarget,
      castlingRights
    )
    if (moves.includes(to)) {
      candidates.push(sq)
    }
  }

  if (candidates.length === 0) return ''

  const fromFile = from[0]
  const fromRank = from[1]

  const sameFile = candidates.some(sq => sq[0] === fromFile)
  const sameRank = candidates.some(sq => sq[1] === fromRank)

  if (!sameFile) return fromFile
  if (!sameRank) return fromRank
  return from // both file and rank needed
}
