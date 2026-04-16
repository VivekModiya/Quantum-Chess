import React from 'react'
import { usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import { useSocket } from '../../provider/SocketProvider'
import {
  isCheckmate,
  isStalemate,
  isThreefoldRepetition,
  isFiftyMoveRule,
  isInsufficientMaterial,
  assetUrl,
} from '../../utils'
import { PieceColor, PromotablePiece, Square } from '../../types'
import type { BoardSnapshot } from '../../../shared/socketEvents'

export const Subscribers = React.memo(() => {
  const { subscribe, publish } = usePubSub()
  const {
    chess,
    board,
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    makeMove,
    promotePawn,
    resetGame,
    restoreState,
    currentTurn,
    setCurrentLegalMoves,
    enPassantTarget,
    castlingRights,
    capturedPieces,
    settings,
    positionHistory,
    halfMoveClock,
    moveHistory,
    lastMoveSquares,
  } = useChess()

  const {
    playerColor,
    gameMode,
    doSendMove,
    lastOpponentMove,
    clearLastOpponentMove,
    gameState,
  } = useSocket()

  // Keep a ref to the latest moveHistory so we can read SAN inside subscriber closures
  const moveHistoryRef = React.useRef(moveHistory)
  moveHistoryRef.current = moveHistory

  // Holds from/to/san for a pawn promotion move until the player selects a piece.
  // Cleared after the deferred doSendMove is fired via the moveHistory useEffect.
  const pendingPromotionSendRef = React.useRef<{
    from: string
    to: string
    san: string | undefined
  } | null>(null)

  /** Build a BoardSnapshot from current chess state (call AFTER dispatch completes). */
  const buildSnapshotRef = React.useRef<() => BoardSnapshot>(() => ({
    board: {},
    capturedPieces: [],
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantTarget: null,
    halfMoveClock: 0,
    positionHistory: [],
    lastMoveSquares: null,
    currentTurn: 'white' as const,
  }))

  // Keep the ref always pointing to a function that reads the latest state.
  // We use a ref so the subscriber closures don't need to re-subscribe on
  // every state change — they just call buildSnapshotRef.current().
  buildSnapshotRef.current = () => ({
    board,
    capturedPieces,
    castlingRights,
    enPassantTarget,
    halfMoveClock,
    positionHistory,
    lastMoveSquares,
    currentTurn,
  })

  // On reconnection / initial load, restore board from server snapshot.
  const hasRestored = React.useRef(false)
  React.useEffect(() => {
    if (
      !hasRestored.current &&
      gameState &&
      gameState.snapshot &&
      moveHistory.length === 0
    ) {
      hasRestored.current = true

      // Convert server moves to MoveHistoryEntry[] for move list display
      const serverMoves = gameState.moves ?? []
      const restoredMoveHistory = serverMoves.map((m, i) => ({
        pieceId: '',
        piece: 'pawn' as const,
        color: (i % 2 === 0 ? 'white' : 'black') as 'white' | 'black',
        from: m.from,
        to: m.to,
        promotion: m.promotion as any,
        timestamp: 0,
        ...(m.san ? { san: m.san } : {}),
      }))

      restoreState({
        ...gameState.snapshot,
        moveHistory: restoredMoveHistory,
      })
    }
  }, [gameState, moveHistory.length, restoreState])

  // Handle opponent moves coming from the server
  React.useEffect(() => {
    if (!lastOpponentMove) return

    const { from, to } = lastOpponentMove

    // Find the piece at the 'from' square and apply the move
    const pieceId = chess.pieceIdAt(from)
    if (pieceId) {
      const piece = chess.byId(pieceId)
      if (piece) {
        makeMove(from, to, () => {
          publish('make_sound', undefined)
          publish('move_completed', {
            fromSquare: from,
            toSquare: to,
            pieceId,
            pieceType: piece.piece || '',
            pieceColor: piece.color || '',
            // Skip the promotion dialog — we apply it directly below.
            skipPromotion: true,
          })
          // Apply the opponent's promotion locally without opening the dialog.
          if (lastOpponentMove.promotion) {
            promotePawn(
              to as Square,
              lastOpponentMove.promotion as PromotablePiece,
              pieceId
            )
          }
        })
      }
    }

    clearLastOpponentMove()
  }, [
    lastOpponentMove,
    clearLastOpponentMove,
    chess,
    makeMove,
    publish,
    promotePawn,
  ])

  // Once PROMOTE_PAWN updates moveHistory with the chosen piece, send the
  // deferred promotion move to the server (with snapshot reflecting the
  // promoted piece on the board).
  React.useEffect(() => {
    if (!pendingPromotionSendRef.current) return
    const lastMove = moveHistory[moveHistory.length - 1]
    if (lastMove?.promotion) {
      const { from, to, san } = pendingPromotionSendRef.current
      doSendMove(
        { from, to, san, promotion: lastMove.promotion },
        buildSnapshotRef.current()
      )
      pendingPromotionSendRef.current = null
    }
  }, [moveHistory, doSendMove])

  React.useEffect(() => {
    const unsubscribe = [
      subscribe('calculate_legal_moves', ({ square }) => {
        const moves = getLegalMoves(square)
        setCurrentLegalMoves(moves)
      }),
      subscribe('piece_selected', ({ pieceId }) => {
        const pieceData = chess.byId(pieceId)
        if (!pieceData) return

        // Spectators cannot interact with pieces
        if (gameMode === 'spectator') return

        // Enforce: player can only select their own color pieces
        if (playerColor && pieceData.color !== playerColor) return

        // Deselect if clicking the same piece, or select if it's the current turn
        if (selectedPiece === pieceId) {
          setSelectedPiece(null)
        } else if (currentTurn === pieceData.color) {
          setSelectedPiece(pieceId)
          publish('calculate_legal_moves', { square: pieceData.square })
        }
      }),
      subscribe('make_move', ({ toSquare }) => {
        if (!selectedPiece) return

        // Spectators cannot make moves
        if (gameMode === 'spectator') return

        const fromSquare = getPieceSquare(selectedPiece)
        if (fromSquare && toSquare) {
          const pieceInfo = chess.byId(selectedPiece)
          const color = pieceInfo?.color
          const type = pieceInfo?.piece

          // Enforce: only move on your own turn
          if (playerColor && color !== playerColor) return
          if (playerColor && currentTurn !== playerColor) return

          // Make the move first (locally)
          makeMove(fromSquare, toSquare, () => {
            publish('make_sound', undefined)
            publish('move_completed', {
              fromSquare,
              toSquare,
              pieceId: selectedPiece,
              pieceType: type || '',
              pieceColor: color || '',
            })

            const lastEntry =
              moveHistoryRef.current[moveHistoryRef.current.length - 1]
            const toRank = parseInt(toSquare[1], 10)
            const isPawnPromotion =
              type === 'pawn' &&
              ((color === 'white' && toRank === 8) ||
                (color === 'black' && toRank === 1))

            if (isPawnPromotion) {
              // Defer socket send until the player selects a promotion piece.
              // The useEffect watching moveHistory will fire it once PROMOTE_PAWN
              // has updated the last moveHistory entry with the chosen piece.
              pendingPromotionSendRef.current = {
                from: fromSquare,
                to: toSquare,
                san: lastEntry?.san,
              }
            } else {
              // Non-promotion move: send immediately with current board snapshot.
              const snapshot = buildSnapshotRef.current()
              doSendMove(
                { from: fromSquare, to: toSquare, san: lastEntry?.san },
                snapshot
              )
            }
          })

          setSelectedPiece(null)
        }
      }),
      subscribe(
        'move_completed',
        ({ toSquare, pieceId, pieceType, pieceColor, skipPromotion }) => {
          // Handle pawn promotion after move animation completes.
          // skipPromotion is true for opponent moves — promotion is applied
          // directly in the lastOpponentMove effect without opening the dialog.
          if (!skipPromotion && pieceType === 'pawn') {
            const coords = chess.coords(toSquare)
            const rank = coords?.rank

            if (
              (pieceColor === 'white' && rank === 8) ||
              (pieceColor === 'black' && rank === 1)
            ) {
              if (settings.autoQueenPromotion) {
                promotePawn(toSquare, 'queen', pieceId)
                return
              }
              publish('open_promotion_dialog', { pieceId, toSquare })
              return // Don't check game over during promotion
            }
          }

          // Check for checkmate or stalemate after move
          const boardMap = chess.toMap()

          const isInCheckmate = isCheckmate(
            boardMap,
            currentTurn,
            enPassantTarget,
            castlingRights
          )
          const isInStalemate = isStalemate(
            boardMap,
            currentTurn,
            enPassantTarget,
            castlingRights
          )

          if (isInCheckmate) {
            publish('game_over', {
              type: 'win',
              subType: 'checkmate',
              winner: pieceColor as PieceColor,
            })
          } else if (isInStalemate) {
            publish('game_over', {
              type: 'stalemate',
              subType: 'stalemate',
            })
          } else if (isThreefoldRepetition(positionHistory)) {
            publish('game_over', {
              type: 'draw',
              subType: 'repetition',
            })
          } else if (isFiftyMoveRule(halfMoveClock)) {
            publish('game_over', {
              type: 'draw',
              subType: '50 moves',
            })
          } else if (isInsufficientMaterial(boardMap)) {
            publish('game_over', {
              type: 'draw',
              subType: 'insufficient material',
            })
          }
        }
      ),
      subscribe('promotion_piece_selected', ({ piece, pieceId, toSquare }) =>
        promotePawn(toSquare, piece, pieceId)
      ),
      subscribe('make_sound', () => {
        if (settings.soundEffects) {
          new Audio(assetUrl('audio/move.mp3')).play().catch(() => {})
        }
      }),
      subscribe('game_reset', () => {
        resetGame()
      }),
    ]
    return () => unsubscribe.forEach(us => us())
  }, [
    chess,
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    makeMove,
    promotePawn,
    resetGame,
    restoreState,
    currentTurn,
    subscribe,
    publish,
    enPassantTarget,
    castlingRights,
    setCurrentLegalMoves,
    settings,
    positionHistory,
    halfMoveClock,
    playerColor,
    gameMode,
    doSendMove,
  ])
  return null
})
