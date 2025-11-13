import { PieceColor } from '../../types'
import { ChessAction, ChessState } from '../../types/chess'
import { ChessBoard } from '../../utils/chess/ChessBoard'
import {
  isEnPassantCapture,
  getEnPassantCapturedPawnSquare,
  isCastlingMove,
  getCastlingRookMove,
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

      // Handle castling - move the rook as well
      if (isCastlingMove({ type: piece.piece, color: piece.color }, from, to)) {
        const rookMove = getCastlingRookMove(to)
        if (rookMove) {
          const rookId = chess.pieceIdAt(rookMove.from)
          if (rookId) {
            newBoard[rookId] = {
              ...newBoard[rookId],
              square: rookMove.to,
            }
          }
        }
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

      // Update castling rights
      const newCastlingRights = { ...state.castlingRights }

      // If king moves, remove all castling rights for that color
      if (piece.piece === 'king') {
        if (piece.color === 'white') {
          newCastlingRights.whiteKingside = false
          newCastlingRights.whiteQueenside = false
        } else {
          newCastlingRights.blackKingside = false
          newCastlingRights.blackQueenside = false
        }
      }

      // If rook moves or is captured, remove corresponding castling right
      if (piece.piece === 'rook' || capturedPieceId) {
        // Check if a rook moved from its starting square
        if (piece.piece === 'rook') {
          if (from === 'h1') newCastlingRights.whiteKingside = false
          if (from === 'a1') newCastlingRights.whiteQueenside = false
          if (from === 'h8') newCastlingRights.blackKingside = false
          if (from === 'a8') newCastlingRights.blackQueenside = false
        }

        // Check if a rook was captured on its starting square
        if (capturedPieceId) {
          if (to === 'h1') newCastlingRights.whiteKingside = false
          if (to === 'a1') newCastlingRights.whiteQueenside = false
          if (to === 'h8') newCastlingRights.blackKingside = false
          if (to === 'a8') newCastlingRights.blackQueenside = false
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
        castlingRights: newCastlingRights,
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
