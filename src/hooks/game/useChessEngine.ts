import React, { useCallback, useReducer, useMemo } from 'react'

import { chessReducer, initialState } from './chessReducer'
import { BoardPiece, PromotablePiece, Square } from '../../types'
import { ChessBoard, generateLegalMoves } from '../../utils'

/**
 * Main chess engine hook
 * Manages chess game state and provides actions for interacting with the game
 */
export const useChessEngine = () => {
  const [state, dispatch] = useReducer(chessReducer, initialState)

  // Create ChessBoard instance - memoized to avoid recreation on every render
  const chess = useMemo(() => new ChessBoard(state.board), [state.board])

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

      const pieceId = chess.pieceIdAt(from)
      if (!pieceId) return false

      const piece = chess.byId(pieceId)
      if (!piece || piece.isCaptured || piece.color !== state.currentTurn) {
        return false
      }

      // Check if move is legal
      const legalMoves = generateLegalMoves(
        from,
        { type: piece.piece, color: piece.color },
        chess.toMap()
      )
      if (!legalMoves.includes(to)) {
        return false
      }

      dispatch({ type: 'MAKE_MOVE', payload: { pieceId, from, to } })

      return true
    },
    [chess, state.currentTurn]
  )

  /**
   * Promotes a pawn to the specified piece type
   */
  const promotePawn = useCallback(
    (square: Square, targetPiece: PromotablePiece) => {
      const pieceId = chess.pieceIdAt(square)
      if (!pieceId) {
        console.error('Cannot promote: no piece at square', square)
        return
      }

      const piece = chess.byId(pieceId)
      console.log({ piece })
      if (!piece || piece.piece !== 'pawn') {
        console.error('Cannot promote: not a pawn at square', square)
        return
      }

      console.log({ pieceId, targetPiece })

      dispatch({
        type: 'PROMOTE_PAWN',
        payload: {
          pieceId,
          targetPiece,
        },
      })
    },
    [chess]
  )

  /**
   * Gets the piece at a specific square
   */
  const getPiece = useCallback(
    (square: Square): BoardPiece | null => {
      return chess.at(square)
    },
    [chess]
  )

  /**
   * Gets the square where a piece with the given ID is located
   */
  const getPieceSquare = useCallback(
    (pieceId?: string | null): Square | null => {
      if (!pieceId) return ''
      return chess.squareOf(pieceId)
    },
    [chess]
  )

  /**
   * Gets all legal moves for the piece at the specified square
   * Returns empty array if no piece, wrong turn, or invalid square
   */
  const getLegalMoves = useCallback(
    (square?: Square | null): Square[] => {
      if (!square) return []
      const piece = chess.at(square)

      if (!piece || piece.isCaptured || piece.color !== state.currentTurn) {
        return []
      }

      return generateLegalMoves(
        square,
        { type: piece.piece, color: piece.color },
        chess.toMap()
      )
    },
    [chess, state.currentTurn]
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
    capturedPieces: chess.capturedPieces(),

    // ChessBoard utility instance
    chess,

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
