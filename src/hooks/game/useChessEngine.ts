import React, { useCallback, useReducer } from 'react'
import { generateLegalMoves } from '../../utils'
import { PromotablePiece } from '../../types'
import { Piece, Square } from '../../types/chess'
import { chessReducer, initialState } from './chessReducer'

/**
 * Main chess engine hook
 * Manages chess game state and provides actions for interacting with the game
 */
export const useChessEngine = () => {
  const [state, dispatch] = useReducer(chessReducer, initialState)

  // Ref to track the currently selected piece
  const selectedPiece = React.useRef<{
    id: string
    ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
  } | null>(null)

  /**
   * Makes a chess move from one square to another
   * Validates that the piece belongs to the current player and the move is legal
   */
  const makeMove = useCallback(
    (from: Square | null, to: Square | null): boolean => {
      if (!from || !to) return false
      const piece = state.board.get(from)
      if (!piece || piece.color !== state.currentTurn) {
        return false
      }

      // Check if move is legal
      const legalMoves = generateLegalMoves(from, piece, state.board)
      if (!legalMoves.includes(to)) {
        return false
      }

      dispatch({ type: 'MAKE_MOVE', payload: { from, to } })

      return true
    },
    [state.board, state.currentTurn]
  )

  /**
   * Promotes a pawn to the specified piece type
   */
  const promotePawn = useCallback(
    (square: Square, targetPiece: PromotablePiece) => {
      const piece = state.board.get(square)
      if (!piece || piece.type !== 'pawn') {
        console.error('Cannot promote: not a pawn at square', square)
        return
      }

      dispatch({
        type: 'PROMOTE_PAWN',
        payload: {
          square,
          piece: { color: piece.color, type: targetPiece },
        },
      })
    },
    [state.board]
  )

  /**
   * Gets the piece at a specific square
   */
  const getPiece = useCallback(
    (square: Square): Piece | null => {
      return state.board.get(square) || null
    },
    [state.board]
  )

  /**
   * Gets the square where a piece with the given ID is located
   */
  const getPieceSquare = useCallback(
    (pieceId?: string | null): Square | null => {
      if (!pieceId) return ''
      for (const [square, id] of state.squarePieceMap.entries()) {
        if (id === pieceId) {
          return square
        }
      }
      return null
    },
    [state.squarePieceMap]
  )

  /**
   * Gets all legal moves for the piece at the specified square
   * Returns empty array if no piece, wrong turn, or invalid square
   */
  const getLegalMoves = useCallback(
    (square?: Square | null): Square[] => {
      if (!square) return []
      const piece = getPiece(square)

      if (!piece || piece.color !== state.currentTurn) {
        return []
      }
      return generateLegalMoves(square, piece, state.board)
    },
    [state.board, state.currentTurn, getPiece]
  )

  /**
   * Sets the currently selected piece
   */
  const setSelectedPiece = useCallback(
    (
      piece: {
        id: string
        ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
      } | null
    ): void => {
      selectedPiece.current = piece
    },
    []
  )

  return {
    // State
    board: state.board,
    currentTurn: state.currentTurn,
    selectedPiece: selectedPiece,
    capturedPieces: state.capturedPieces,

    // Actions
    makeMove,
    setSelectedPiece,
    promotePawn,

    // Getters
    getPiece,
    getLegalMoves,
    getPieceSquare,
  }
}
