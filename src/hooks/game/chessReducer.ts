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
}

/**
 * Chess game reducer - handles all state mutations
 */
export const chessReducer = (
  state: ChessState,
  action: ChessAction
): ChessState => {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { pieceId, from, to } = action.payload
      const piece = state.board[pieceId]

      if (!piece || piece.isCaptured || piece.square !== from) {
        return state
      }

      // Create new board state
      const newBoard = { ...state.board }
      const chess = new ChessBoard(state.board)

      // Check if there's a piece to capture at the destination
      const capturedPieceId = chess.pieceIdAt(to)

      if (capturedPieceId && capturedPieceId !== pieceId) {
        // Remove the captured piece from the board
        delete newBoard[capturedPieceId]
      }

      // Move the piece
      newBoard[pieceId] = {
        ...piece,
        square: to,
      }

      // Switch turn
      const nextTurn: PieceColor =
        state.currentTurn === 'white' ? 'black' : 'white'

      return {
        ...state,
        board: newBoard,
        currentTurn: nextTurn,
        lastMove: { from, to, pieceId },
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

      const nextTurn: PieceColor =
        state.currentTurn === 'white' ? 'black' : 'white'

      return {
        ...state,
        board: newBoard,
        currentTurn: nextTurn,
      }
    }

    default:
      return state
  }
}
