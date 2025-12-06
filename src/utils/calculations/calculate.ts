import { DIRECTIONS, FILE_TO_INDEX, INDEX_TO_FILE } from '../../constants/chess'
import { PieceColor } from '../../types'
import { Piece, CastlingRights } from '../../types'

// Utility functions
export const isValidSquare = (file: number, rank: number): boolean =>
  file >= 0 && file <= 7 && rank >= 0 && rank <= 7

export const parseSquare = (square: string): [number, number] => [
  FILE_TO_INDEX[square[0]],
  parseInt(square[1]) - 1,
]

export const formatSquare = (file: number, rank: number): string =>
  `${INDEX_TO_FILE[file]}${rank + 1}`

export const squareToCoords = (square: string): [number, number] =>
  parseSquare(square)
export const coordsToSquare = (file: number, rank: number): string =>
  formatSquare(file, rank)

// En passant utilities
export const isEnPassantCapture = (
  piece: Piece,
  to: string,
  enPassantTarget: string | null
): boolean => {
  return (
    piece.type === 'pawn' && to === enPassantTarget && enPassantTarget !== null
  )
}

export const getEnPassantCapturedPawnSquare = (
  to: string,
  captorColor: PieceColor
): string => {
  const [toFile, toRank] = parseSquare(to)
  const captureDirection = captorColor === 'white' ? -1 : 1
  return formatSquare(toFile, toRank + captureDirection)
}

// Castling utilities
export const isCastlingMove = (
  piece: Piece,
  from: string,
  to: string
): boolean => {
  if (piece.type !== 'king') return false
  const [fromFile] = parseSquare(from)
  const [toFile] = parseSquare(to)
  return Math.abs(toFile - fromFile) === 2
}

export const getCastlingRookMove = (
  kingTo: string
): { from: string; to: string } | null => {
  const [toFile, toRank] = parseSquare(kingTo)

  // Kingside castling (king moves to g-file)
  if (toFile === 6) {
    return {
      from: formatSquare(7, toRank), // Rook from h-file
      to: formatSquare(5, toRank), // Rook to f-file
    }
  }

  // Queenside castling (king moves to c-file)
  if (toFile === 2) {
    return {
      from: formatSquare(0, toRank), // Rook from a-file
      to: formatSquare(3, toRank), // Rook to d-file
    }
  }

  return null
}

// Core movement generation
interface MoveGenerationOptions {
  includeBlocked?: boolean
  maxDistance?: number
  capturesOnly?: boolean
}

const generateDirectionalMoves = (
  file: number,
  rank: number,
  directions: readonly (readonly [number, number])[],
  board: Map<string, Piece | null>,
  piece: Piece,
  options: MoveGenerationOptions = {}
): string[] => {
  const moves: string[] = []
  const { maxDistance = 8 } = options

  for (const [df, dr] of directions) {
    let currentFile = file
    let currentRank = rank
    let distance = 0

    while (distance < maxDistance) {
      currentFile += df
      currentRank += dr
      distance++

      if (isValidSquare(currentFile, currentRank) === false) break

      const targetSquare = formatSquare(currentFile, currentRank)
      const targetPiece = board.get(targetSquare)

      if (targetPiece) {
        // Square is occupied
        if (targetPiece.color !== piece.color) {
          moves.push(targetSquare)
        }
        // Can't move further in this direction
        break
      } else {
        // Empty square
        moves.push(targetSquare)
      }
    }
  }

  return moves
}

// Piece-specific move generators
export const generatePawnMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece,
  enPassantTarget?: string | null
): string[] => {
  const [file, rank] = parseSquare(square)
  const moves: string[] = []
  const direction = piece.color === 'white' ? 1 : -1
  const startRank = piece.color === 'white' ? 1 : 6

  // Forward moves
  const oneSquareForward = rank + direction
  if (isValidSquare(file, oneSquareForward)) {
    const oneSquareSquare = formatSquare(file, oneSquareForward)
    if (!board.get(oneSquareSquare)) {
      moves.push(oneSquareSquare)

      // Two squares forward from starting position
      if (rank === startRank) {
        const twoSquareForward = rank + 2 * direction
        if (isValidSquare(file, twoSquareForward)) {
          const twoSquareSquare = formatSquare(file, twoSquareForward)
          if (!board.get(twoSquareSquare)) {
            moves.push(twoSquareSquare)
          }
        }
      }
    }
  }

  // Captures
  for (const captureFile of [file - 1, file + 1]) {
    const captureRank = rank + direction
    if (isValidSquare(captureFile, captureRank)) {
      const captureSquare = formatSquare(captureFile, captureRank)
      const targetPiece = board.get(captureSquare)
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(captureSquare)
      }

      // En passant capture
      if (enPassantTarget && captureSquare === enPassantTarget) {
        moves.push(captureSquare)
      }
    }
  }

  return moves
}

export const generateKnightMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece
): string[] => {
  const [file, rank] = parseSquare(square)
  return generateDirectionalMoves(file, rank, DIRECTIONS.KNIGHT, board, piece, {
    maxDistance: 1,
  })
}

export const generateBishopMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece
): string[] => {
  const [file, rank] = parseSquare(square)
  return generateDirectionalMoves(file, rank, DIRECTIONS.DIAGONAL, board, piece)
}

export const generateRookMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece
): string[] => {
  const [file, rank] = parseSquare(square)
  return generateDirectionalMoves(
    file,
    rank,
    DIRECTIONS.ORTHOGONAL,
    board,
    piece
  )
}

export const generateQueenMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece
): string[] => {
  const [file, rank] = parseSquare(square)
  const orthogonalMoves = generateDirectionalMoves(
    file,
    rank,
    DIRECTIONS.ORTHOGONAL,
    board,
    piece
  )
  const diagonalMoves = generateDirectionalMoves(
    file,
    rank,
    DIRECTIONS.DIAGONAL,
    board,
    piece
  )
  return [...orthogonalMoves, ...diagonalMoves]
}

export const generateKingMoves = (
  square: string,
  board: Map<string, Piece | null>,
  piece: Piece,
  castlingRights?: CastlingRights
): string[] => {
  const [file, rank] = parseSquare(square)
  const moves = generateDirectionalMoves(
    file,
    rank,
    DIRECTIONS.KING,
    board,
    piece,
    {
      maxDistance: 1,
    }
  )

  // Add castling moves if applicable
  if (castlingRights) {
    const baseRank = piece.color === 'white' ? 0 : 7
    const isOnBaseRank = rank === baseRank && file === 4 // King on e1 or e8

    if (isOnBaseRank) {
      // Check kingside castling
      const canCastleKingside =
        piece.color === 'white'
          ? castlingRights.whiteKingside
          : castlingRights.blackKingside

      if (canCastleKingside) {
        const f1 = formatSquare(5, baseRank)
        const g1 = formatSquare(6, baseRank)
        const h1 = formatSquare(7, baseRank)

        // Check if squares between king and rook are empty
        if (!board.get(f1) && !board.get(g1)) {
          // Check if rook is present
          const rookPiece = board.get(h1)
          if (
            rookPiece &&
            rookPiece.type === 'rook' &&
            rookPiece.color === piece.color
          ) {
            // Don't check here if king is in check or passes through check
            // That will be validated in isMoveLegal
            moves.push(g1)
          }
        }
      }

      // Check queenside castling
      const canCastleQueenside =
        piece.color === 'white'
          ? castlingRights.whiteQueenside
          : castlingRights.blackQueenside

      if (canCastleQueenside) {
        const d1 = formatSquare(3, baseRank)
        const c1 = formatSquare(2, baseRank)
        const b1 = formatSquare(1, baseRank)
        const a1 = formatSquare(0, baseRank)

        // Check if squares between king and rook are empty
        if (!board.get(d1) && !board.get(c1) && !board.get(b1)) {
          // Check if rook is present
          const rookPiece = board.get(a1)
          if (
            rookPiece &&
            rookPiece.type === 'rook' &&
            rookPiece.color === piece.color
          ) {
            moves.push(c1)
          }
        }
      }
    }
  }

  return moves
}

// Main move generation function
export const generatePossibleMoves = (
  square: string,
  piece: Piece,
  board: Map<string, Piece | null>,
  enPassantTarget?: string | null,
  castlingRights?: CastlingRights
): string[] => {
  if (piece.type === 'pawn') {
    return generatePawnMoves(square, board, piece, enPassantTarget)
  } else if (piece.type === 'king') {
    return generateKingMoves(square, board, piece, castlingRights)
  } else if (piece.type === 'knight') {
    return generateKnightMoves(square, board, piece)
  } else if (piece.type === 'bishop') {
    return generateBishopMoves(square, board, piece)
  } else if (piece.type === 'rook') {
    return generateRookMoves(square, board, piece)
  } else if (piece.type === 'queen') {
    return generateQueenMoves(square, board, piece)
  }
  return []
}

// King and check utilities
export const findKing = (
  board: Map<string, Piece | null>,
  color: PieceColor
): string | null => {
  for (const [square, piece] of board.entries()) {
    if (piece?.type === 'king' && piece.color === color) {
      return square
    }
  }
  return null
}

export const isSquareAttacked = (
  board: Map<string, Piece | null>,
  square: string,
  byColor: PieceColor,
  enPassantTarget?: string | null
): boolean => {
  for (const [pieceSquare, piece] of board.entries()) {
    if (piece?.color === byColor) {
      // Special case for pawns - only check capture squares, not forward moves
      if (piece.type === 'pawn') {
        const [file, rank] = parseSquare(pieceSquare)
        const direction = piece.color === 'white' ? 1 : -1
        const captureSquares = [
          [file - 1, rank + direction],
          [file + 1, rank + direction],
        ]
          .filter(([f, r]) => isValidSquare(f, r))
          .map(([f, r]) => formatSquare(f, r))

        if (captureSquares.includes(square)) {
          return true
        }
      } else {
        const moves = generatePossibleMoves(
          pieceSquare,
          piece,
          board,
          enPassantTarget
        )
        if (moves.includes(square)) {
          return true
        }
      }
    }
  }
  return false
}

export const isInCheck = (
  board: Map<string, Piece | null>,
  color: PieceColor
): boolean => {
  const kingSquare = findKing(board, color)
  if (!kingSquare) return false

  const oppositeColor: PieceColor = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(board, kingSquare, oppositeColor)
}

// Advanced check analysis
export interface CheckInfo {
  isInCheck: boolean
  attackingPieces: Array<{ square: string; piece: Piece }>
  checkPaths: string[][] // Squares that must be blocked to resolve check
}

export const analyzeCheck = (
  board: Map<string, Piece | null>,
  color: PieceColor
): CheckInfo => {
  const kingSquare = findKing(board, color)
  if (!kingSquare) {
    return { isInCheck: false, attackingPieces: [], checkPaths: [] }
  }

  const oppositeColor: PieceColor = color === 'white' ? 'black' : 'white'
  const attackingPieces: Array<{ square: string; piece: Piece }> = []
  const checkPaths: string[][] = []

  const [kingFile, kingRank] = parseSquare(kingSquare)

  // Check for sliding piece attacks (rook, bishop, queen)
  const slidingChecks = [
    { directions: DIRECTIONS.ORTHOGONAL, pieceTypes: ['rook', 'queen'] },
    { directions: DIRECTIONS.DIAGONAL, pieceTypes: ['bishop', 'queen'] },
  ]

  for (const { directions, pieceTypes } of slidingChecks) {
    for (const [df, dr] of directions) {
      const path: string[] = []
      let currentFile = kingFile
      let currentRank = kingRank

      while (true) {
        currentFile += df
        currentRank += dr

        if (!isValidSquare(currentFile, currentRank)) break

        const square = formatSquare(currentFile, currentRank)
        const piece = board.get(square)

        path.push(square)

        if (piece) {
          if (
            piece.color === oppositeColor &&
            pieceTypes.includes(piece.type)
          ) {
            attackingPieces.push({ square, piece })
            checkPaths.push([...path])
          }
          break
        }
      }
    }
  }

  // Check for knight attacks
  for (const [df, dr] of DIRECTIONS.KNIGHT) {
    const file = kingFile + df
    const rank = kingRank + dr

    if (isValidSquare(file, rank)) {
      const square = formatSquare(file, rank)
      const piece = board.get(square)

      if (piece?.color === oppositeColor && piece.type === 'knight') {
        attackingPieces.push({ square, piece })
        checkPaths.push([square])
      }
    }
  }

  // Check for pawn attacks
  const pawnDirection = color === 'white' ? -1 : 1
  for (const df of [-1, 1]) {
    const file = kingFile + df
    const rank = kingRank + pawnDirection

    if (isValidSquare(file, rank)) {
      const square = formatSquare(file, rank)
      const piece = board.get(square)

      if (piece?.color === oppositeColor && piece.type === 'pawn') {
        attackingPieces.push({ square, piece })
        checkPaths.push([square])
      }
    }
  }

  return {
    isInCheck: attackingPieces.length > 0,
    attackingPieces,
    checkPaths,
  }
}

// Legal move filtering
export const isMoveLegal = (
  from: string,
  to: string,
  piece: Piece,
  board: Map<string, Piece | null>,
  enPassantTarget?: string | null
): boolean => {
  // Special validation for castling
  if (isCastlingMove(piece, from, to)) {
    // King cannot be in check when castling
    if (isInCheck(board, piece.color)) {
      return false
    }

    // King cannot pass through check or land in check
    const [fromFile, fromRank] = parseSquare(from)
    const [toFile] = parseSquare(to)

    // Check all squares the king passes through
    const step = toFile > fromFile ? 1 : -1
    for (let file = fromFile + step; file !== toFile + step; file += step) {
      const squareToCheck = formatSquare(file, fromRank)
      const testBoard = new Map(board)
      testBoard.set(squareToCheck, piece)
      testBoard.set(from, null)

      if (isInCheck(testBoard, piece.color)) {
        return false
      }
    }

    return true
  }

  // Create a copy of the board with the move made
  const newBoard = new Map(board)
  newBoard.set(to, piece)
  newBoard.set(from, null)

  // Handle en passant capture - remove the captured pawn
  if (isEnPassantCapture(piece, to, enPassantTarget || null)) {
    const capturedPawnSquare = getEnPassantCapturedPawnSquare(to, piece.color)
    newBoard.set(capturedPawnSquare, null)
  }

  // Check if the king would be in check after this move
  return isInCheck(newBoard, piece.color) === false
}

export const filterLegalMoves = (
  moves: string[],
  from: string,
  piece: Piece,
  board: Map<string, Piece | null>,
  enPassantTarget?: string | null
): string[] => {
  return moves.filter(to =>
    isMoveLegal(from, to, piece, board, enPassantTarget)
  )
}

export const generateLegalMoves = (
  square: string,
  piece: Piece,
  board: Map<string, Piece | null>,
  enPassantTarget?: string | null,
  castlingRights?: CastlingRights
): string[] => {
  const possibleMoves = generatePossibleMoves(
    square,
    piece,
    board,
    enPassantTarget,
    castlingRights
  )
  return filterLegalMoves(possibleMoves, square, piece, board, enPassantTarget)
}

// Game state analysis
export const isCheckmate = (
  board: Map<string, Piece | null>,
  color: PieceColor,
  enPassantTarget?: string | null,
  castlingRights?: CastlingRights
): boolean => {
  const inCheck = isInCheck(board, color)

  if (!inCheck) {
    return false
  }

  // Check if any piece has legal moves
  for (const [square, piece] of board.entries()) {
    if (piece?.color === color) {
      const legalMoves = generateLegalMoves(
        square,
        piece,
        board,
        enPassantTarget,
        castlingRights
      )
      if (legalMoves.length > 0) {
        return false
      }
    }
  }

  return true
}

export const isStalemate = (
  board: Map<string, Piece | null>,
  color: PieceColor,
  enPassantTarget?: string | null,
  castlingRights?: CastlingRights
): boolean => {
  const inCheck = isInCheck(board, color)

  if (inCheck) {
    return false
  }

  // Check if any piece has legal moves
  const allLegalMoves = getAllLegalMoves(
    board,
    color,
    enPassantTarget,
    castlingRights
  )

  if (allLegalMoves.length > 0) {
    return false
  }

  return true
}

export const getAllLegalMoves = (
  board: Map<string, Piece | null>,
  color: PieceColor,
  enPassantTarget?: string | null,
  castlingRights?: CastlingRights
): Array<{ from: string; to: string; piece: Piece }> => {
  const allMoves: Array<{ from: string; to: string; piece: Piece }> = []

  for (const [square, piece] of board.entries()) {
    if (piece?.color === color) {
      const legalMoves = generateLegalMoves(
        square,
        piece,
        board,
        enPassantTarget,
        castlingRights
      )
      for (const move of legalMoves) {
        allMoves.push({ from: square, to: move, piece })
      }
    }
  }

  return allMoves
}
