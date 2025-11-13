import { PieceColor } from '../../types'
import { ChessAction, ChessState } from '../../types/chess'
import { ChessBoard } from '../../utils/chess/ChessBoard'
import {
  isEnPassantCapture,
  getEnPassantCapturedPawnSquare,
} from '../../utils/calculations/calculate'

/**
 * Initial chess game state
 */
export const initialState: ChessState = {
  board: ChessBoard.createInitial(),
  currentTurn: 'white',
  lastMove: null,
  capturedPieces: [],
  enPassantTarget: null,
}

export const chessReducer = (
  state: ChessState,
  action: ChessAction
): ChessState => {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { pieceId, from, to } = action.payload
      const piece = state.board[pieceId]

      if (!piece || piece.square !== from) {
        return state
      }

      const newBoard = { ...state.board }
      const chess = new ChessBoard(state.board)

      const capturedPieceId = chess.pieceIdAt(to)
      const newCapturedPieces = [...state.capturedPieces]

      // Handle regular capture
      if (capturedPieceId && capturedPieceId !== pieceId) {
        newCapturedPieces.push(capturedPieceId)
        delete newBoard[capturedPieceId]
      }

      // Handle en passant capture
      if (
        isEnPassantCapture(
          { type: piece.piece, color: piece.color },
          to,
          state.enPassantTarget
        )
      ) {
        const capturedPawnSquare = getEnPassantCapturedPawnSquare(
          to,
          piece.color
        )
        const capturedPawnId = chess.pieceIdAt(capturedPawnSquare)
        if (capturedPawnId) {
          newCapturedPieces.push(capturedPawnId)
          delete newBoard[capturedPawnId]
        }
      }

      newBoard[pieceId] = {
        ...piece,
        square: to,
      }

      // Calculate new en passant target square
      let newEnPassantTarget: string | null = null
      if (piece.piece === 'pawn') {
        const fromRank = parseInt(from[1]) - 1
        const [toFile, toRank] = [
          to.charCodeAt(0) - 'a'.charCodeAt(0),
          parseInt(to[1]) - 1,
        ]

        // Check if pawn moved two squares
        if (Math.abs(toRank - fromRank) === 2) {
          // Set en passant target to the square the pawn "jumped over"
          const enPassantRank = (fromRank + toRank) / 2
          newEnPassantTarget =
            String.fromCharCode('a'.charCodeAt(0) + toFile) +
            (enPassantRank + 1)
        }
      }

      // Switch turn
      const nextTurn: PieceColor =
        state.currentTurn === 'white' ? 'black' : 'white'

      const newState = {
        ...state,
        board: newBoard,
        currentTurn: nextTurn,
        lastMove: { from, to, pieceId },
        capturedPieces: newCapturedPieces,
        enPassantTarget: newEnPassantTarget,
      }
      return newState
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
