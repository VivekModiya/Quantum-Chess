import { PieceColor } from '../../types'
import {
  ChessAction,
  ChessState,
  BoardState,
  CastlingRights,
  BoardPiece,
} from '../../types/chess'
import { ChessBoard } from '../../utils/chess/ChessBoard'
import {
  isEnPassantCapture,
  getEnPassantCapturedPawnSquare,
  isCastlingMove,
  getCastlingRookMove,
} from '../../utils/calculations/calculate'
import { animatePieceMove } from '../../utils'

const movePieceToSquare = (
  board: BoardState,
  pieceId: string,
  toSquare: string
): BoardState => {
  const newBoard = { ...board }
  const piece = newBoard[pieceId]

  if (!piece) {
    return newBoard
  }

  newBoard[pieceId] = {
    ...piece,
    square: toSquare,
  }

  return newBoard
}

const handleCaptures = (
  board: BoardState,
  chess: ChessBoard,
  piece: { piece: string; color: PieceColor },
  to: string,
  enPassantTarget: string | null
): { newBoard: BoardState; capturedPieces: BoardPiece[] } => {
  const newBoard = { ...board }
  const capturedPieces: BoardPiece[] = []

  // Regular capture
  const capturedPieceId = chess.pieceIdAt(to)
  if (capturedPieceId) {
    const capturedPiece = newBoard[capturedPieceId]
    if (capturedPiece) {
      capturedPieces.push(capturedPiece)
    }
    delete newBoard[capturedPieceId]
  }

  // En passant capture
  if (
    isEnPassantCapture(
      { type: piece.piece as any, color: piece.color },
      to,
      enPassantTarget
    )
  ) {
    const capturedPawnSquare = getEnPassantCapturedPawnSquare(to, piece.color)
    const capturedPawnId = chess.pieceIdAt(capturedPawnSquare)
    if (capturedPawnId) {
      const capturedPawn = newBoard[capturedPawnId]
      if (capturedPawn) {
        capturedPieces.push(capturedPawn)
      }
      delete newBoard[capturedPawnId]
    }
  }

  return { newBoard, capturedPieces }
}

const handleCastling = (
  board: BoardState,
  chess: ChessBoard,
  piece: { piece: string; color: PieceColor },
  from: string,
  to: string,
  getPieceRef?: (pieceId: string) => any,
  onComplete?: () => void
): BoardState => {
  if (
    !isCastlingMove({ type: piece.piece as any, color: piece.color }, from, to)
  ) {
    return board
  }

  const rookMove = getCastlingRookMove(to)
  if (!rookMove) {
    return board
  }

  const rookId = chess.pieceIdAt(rookMove.from)
  if (!rookId) {
    return board
  }

  // Move the rook
  const boardAfterRookMove = movePieceToSquare(board, rookId, rookMove.to)

  // Animate rook if getPieceRef provided
  if (getPieceRef) {
    const rookRef = getPieceRef(rookId)
    if (rookRef?.current) {
      animatePieceMove({
        toSquare: rookMove.to,
        fromSquare: rookMove.from,
        pieceObject: rookRef.current,
        onComplete: onComplete || (() => {}),
      })
    }
  }

  return boardAfterRookMove
}

/**
 * Calculate en passant target square after a pawn move
 */
const calculateEnPassantTarget = (
  piece: { piece: string; color: PieceColor },
  from: string,
  to: string
): string | null => {
  if (piece.piece !== 'pawn') {
    return null
  }

  const fromRank = parseInt(from[1]) - 1
  const [toFile, toRank] = [
    to.charCodeAt(0) - 'a'.charCodeAt(0),
    parseInt(to[1]) - 1,
  ]

  // Check if pawn moved two squares
  if (Math.abs(toRank - fromRank) === 2) {
    const enPassantRank = (fromRank + toRank) / 2
    return String.fromCharCode('a'.charCodeAt(0) + toFile) + (enPassantRank + 1)
  }

  return null
}

/**
 * Update castling rights based on the move
 */
const updateCastlingRights = (
  castlingRights: CastlingRights,
  piece: { piece: string; color: PieceColor },
  from: string,
  to: string,
  capturedPieceId: string | null
): CastlingRights => {
  const newRights = { ...castlingRights }

  if (piece.piece === 'king') {
    if (piece.color === 'white') {
      newRights.whiteKingside = false
      newRights.whiteQueenside = false
    } else {
      newRights.blackKingside = false
      newRights.blackQueenside = false
    }
    return newRights
  }

  if (piece.piece === 'rook') {
    if (from === 'h1') newRights.whiteKingside = false
    if (from === 'a1') newRights.whiteQueenside = false
    if (from === 'h8') newRights.blackKingside = false
    if (from === 'a8') newRights.blackQueenside = false
  }

  if (capturedPieceId) {
    if (to === 'h1') newRights.whiteKingside = false
    if (to === 'a1') newRights.whiteQueenside = false
    if (to === 'h8') newRights.blackKingside = false
    if (to === 'a8') newRights.blackQueenside = false
  }

  return newRights
}

/**
 * Initial chess game state
 */
export const initialState: ChessState = {
  board: ChessBoard.createInitial(),
  currentTurn: 'white',
  lastMove: null,
  capturedPieces: [],
  enPassantTarget: null,
  castlingRights: {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  },
}

export const chessReducer = (
  state: ChessState,
  action: ChessAction
): ChessState => {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { pieceId, from, to, getPieceRef, onComplete } = action.payload
      const piece = state.board[pieceId]

      if (!piece || piece.square !== from) {
        return state
      }

      const chess = new ChessBoard(state.board)

      const { newBoard, capturedPieces } = handleCaptures(
        state.board,
        chess,
        piece,
        to,
        state.enPassantTarget
      )

      let boardAfterMove = movePieceToSquare(newBoard, pieceId, to)

      if (getPieceRef) {
        const pieceRef = getPieceRef(pieceId)
        if (pieceRef?.current) {
          animatePieceMove({
            toSquare: to,
            fromSquare: from,
            pieceObject: pieceRef.current,
            onComplete: onComplete || (() => {}),
          })
        }
      }

      // Step 3: Handle castling (move rook if castling)
      boardAfterMove = handleCastling(
        boardAfterMove,
        chess,
        piece,
        from,
        to,
        getPieceRef,
        onComplete
      )

      const newEnPassantTarget = calculateEnPassantTarget(piece, from, to)

      const newCastlingRights = updateCastlingRights(
        state.castlingRights,
        piece,
        from,
        to,
        capturedPieces[0] ? 'captured' : null
      )

      const nextTurn: PieceColor =
        state.currentTurn === 'white' ? 'black' : 'white'

      return {
        ...state,
        board: boardAfterMove,
        currentTurn: nextTurn,
        lastMove: { from, to, pieceId },
        capturedPieces: [...state.capturedPieces, ...capturedPieces],
        enPassantTarget: newEnPassantTarget,
        castlingRights: newCastlingRights,
      }
    }

    case 'RESET_GAME':
      return initialState

    case 'PROMOTE_PAWN': {
      const { pieceId, targetPiece } = action.payload
      const piece = state.board[pieceId]

      if (!piece || piece.piece !== 'pawn') {
        return state
      }

      const newBoard = { ...state.board }
      newBoard[pieceId] = {
        ...piece,
        piece: targetPiece,
      }

      return {
        ...state,
        board: newBoard,
      }
    }

    default:
      return state
  }
}
