import { PieceColor } from '../../types'
import { ChessAction, ChessState } from '../../types/chess'
import { SQUARE_PIECE_MAP } from '../../constants'
import { createInitialBoard } from '../../utils/chess/chessHelpers'

/**
 * Initial chess game state
 */
export const initialState: ChessState = {
  board: createInitialBoard(),
  squarePieceMap: new Map(Object.entries(SQUARE_PIECE_MAP)),
  currentTurn: 'white',
  capturedPieces: [],
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
      const { from, to } = action.payload
      const piece = state.board.get(from)

      if (!piece) return state

      // Create new board with the move
      const newBoard = new Map(state.board)
      newBoard.set(to, piece)
      newBoard.set(from, null)

      const newSquarePieceMap = new Map(state.squarePieceMap)
      newSquarePieceMap.set(to, newSquarePieceMap.get(from) ?? null)
      newSquarePieceMap.set(from, null)

      let newCapturedPieces = [...state.capturedPieces]
      const capturedPieceId = state.squarePieceMap.get(to)

      if (capturedPieceId) {
        newCapturedPieces.push(capturedPieceId)
      }

      // Switch turn
      const nextTurn: PieceColor =
        state.currentTurn === 'white' ? 'black' : 'white'

      return {
        ...state,
        board: newBoard,
        currentTurn: nextTurn,
        squarePieceMap: newSquarePieceMap,
        capturedPieces: newCapturedPieces,
      }
    }

    case 'RESET_GAME':
      return initialState

    case 'PROMOTE_PAWN': {
      const { square, piece } = action.payload
      const newBoard = new Map(state.board)
      newBoard.set(square, piece)
      return {
        ...state,
        board: newBoard,
      }
    }

    default:
      return state
  }
}
