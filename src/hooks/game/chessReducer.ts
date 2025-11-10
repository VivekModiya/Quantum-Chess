import { PieceColor } from '../../types'
import { ChessAction, ChessState } from '../../types/chess'
import { ChessBoard } from '../../utils/chess/ChessBoard'

/**
 * Initial chess game state
 */
export const initialState: ChessState = {
  board: ChessBoard.createInitial(),
  currentTurn: 'white',
  lastMove: null,
  capturedPieces: [],
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

      if (capturedPieceId && capturedPieceId !== pieceId) {
        newCapturedPieces.push(capturedPieceId)
        delete newBoard[capturedPieceId]
      }

      newBoard[pieceId] = {
        ...piece,
        square: to,
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
