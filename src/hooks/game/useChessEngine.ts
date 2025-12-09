import React, { useCallback, useReducer, useMemo } from 'react'

import { chessReducer, initialState } from './chessReducer'
import { BoardPiece, PromotablePiece, Square } from '../../types'
import { GameSettings } from '../../types/chess'
import { ChessBoard, generateLegalMoves } from '../../utils'

export const useChessEngine = () => {
  const [state, dispatch] = useReducer(chessReducer, initialState)
  const [selectedPiece, setSelectedPiece] = React.useState<string | null>(null)
  const [currentLegalMoves, setCurrentLegalMoves] = React.useState<
    string[] | null
  >(null)

  const chess = useMemo(() => new ChessBoard(state.board), [state.board])

  const pieceRefs = React.useRef<
    Record<string, React.RefObject<THREE.Group<THREE.Object3DEventMap>>>
  >({})

  const setPieceRef = useCallback(
    (
      pieceId: string,
      ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>>
    ) => {
      pieceRefs.current[pieceId] = ref
    },
    []
  )

  const getPieceRef = useCallback(
    (
      pieceId: string
    ): React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null => {
      return pieceRefs.current[pieceId] || null
    },
    []
  )

  const removePieceRef = useCallback((pieceId: string) => {
    delete pieceRefs.current[pieceId]
  }, [])

  const makeMove = useCallback(
    (
      from: Square | null,
      to: Square | null,
      onComplete: () => void
    ): boolean => {
      if (!from || !to) return false

      const pieceId = chess.pieceIdAt(from)
      if (!pieceId) return false

      const piece = chess.byId(pieceId)
      if (!piece || piece.color !== state.currentTurn) {
        return false
      }

      const legalMoves = generateLegalMoves(
        from,
        { type: piece.piece, color: piece.color },
        chess.toMap(),
        state.enPassantTarget,
        state.castlingRights
      )
      if (!legalMoves.includes(to)) {
        return false
      }

      dispatch({
        type: 'MAKE_MOVE',
        payload: { pieceId, from, to, getPieceRef, onComplete },
      })

      return true
    },
    [chess, state.currentTurn, state.enPassantTarget, state.castlingRights]
  )

  const promotePawn = useCallback(
    (
      square: Square,
      targetPiece: PromotablePiece,
      pieceIdOverride?: string
    ) => {
      const pieceId = pieceIdOverride || chess.pieceIdAt(square)

      if (!pieceId) {
        console.error('Cannot promote: no piece at square', square)
        return
      }

      const piece = state.board[pieceId]

      if (!piece || piece.piece !== 'pawn') {
        console.error('Cannot promote: not a pawn at square', square, piece)
        return
      }

      dispatch({
        type: 'PROMOTE_PAWN',
        payload: {
          pieceId: pieceId!,
          targetPiece,
        },
      })
    },
    [chess, state.board]
  )

  const getPiece = useCallback(
    (square: Square): BoardPiece | null => {
      return chess.at(square)
    },
    [chess]
  )

  const getPieceSquare = useCallback(
    (pieceId?: string | null): Square | null => {
      if (!pieceId) return ''
      return chess.squareOf(pieceId)
    },
    [chess]
  )

  const getLegalMoves = useCallback(
    (square?: Square | null): Square[] => {
      if (!square) return []
      const piece = chess.at(square)

      if (!piece || piece.color !== state.currentTurn) {
        return []
      }

      return generateLegalMoves(
        square,
        { type: piece.piece, color: piece.color },
        chess.toMap(),
        state.enPassantTarget,
        state.castlingRights
      )
    },
    [chess, state.currentTurn, state.enPassantTarget, state.castlingRights]
  )

  const _setSelectedPiece = React.useCallback(
    (val: React.SetStateAction<string | null>) => {
      if (!val) {
        setCurrentLegalMoves(null)
      }
      setSelectedPiece(val)
    },
    [setCurrentLegalMoves, setSelectedPiece]
  )

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
    setSelectedPiece(null)
    setCurrentLegalMoves(null)
  }, [])

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }, [])

  return {
    board: state.board,
    currentTurn: state.currentTurn,
    selectedPiece,
    currentLegalMoves,
    capturedPieces: state.capturedPieces,
    enPassantTarget: state.enPassantTarget,
    castlingRights: state.castlingRights,
    settings: state.settings,
    lastMoveSquares: state.lastMoveSquares,

    chess,

    makeMove,
    promotePawn,
    resetGame,
    updateSettings,
    setSelectedPiece: _setSelectedPiece,
    setCurrentLegalMoves,

    getPiece,
    getLegalMoves,
    getPieceSquare,

    // Piece ref management
    setPieceRef,
    getPieceRef,
    removePieceRef,
  }
}
