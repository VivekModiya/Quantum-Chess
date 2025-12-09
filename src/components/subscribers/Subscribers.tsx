import React from 'react'
import { usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import {
  playSound,
  isCheckmate,
  isStalemate,
  isThreefoldRepetition,
  isFiftyMoveRule,
  isInsufficientMaterial,
} from '../../utils'
import { PieceColor } from '../../types'

export const Subscribers = React.memo(() => {
  const { subscribe, publish } = usePubSub()
  const {
    chess,
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    makeMove,
    promotePawn,
    resetGame,
    currentTurn,
    setCurrentLegalMoves,
    enPassantTarget,
    castlingRights,
    settings,
    positionHistory,
    halfMoveClock,
  } = useChess()

  React.useEffect(() => {
    const unsubscribe = [
      subscribe('calculate_legal_moves', ({ square }) => {
        const moves = getLegalMoves(square)
        setCurrentLegalMoves(moves)
      }),
      subscribe('piece_selected', ({ pieceId }) => {
        const pieceData = chess.byId(pieceId)
        if (!pieceData) return

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

        const fromSquare = getPieceSquare(selectedPiece)
        if (fromSquare && toSquare) {
          const pieceInfo = chess.byId(selectedPiece)
          const color = pieceInfo?.color
          const type = pieceInfo?.piece

          // Make the move first
          makeMove(fromSquare, toSquare, () => {
            publish('make_sound', undefined)
            publish('move_completed', {
              fromSquare,
              toSquare,
              pieceId: selectedPiece,
              pieceType: type || '',
              pieceColor: color || '',
            })
          })

          setSelectedPiece(null)
        }
      }),
      subscribe(
        'move_completed',
        ({ toSquare, pieceId, pieceType, pieceColor }) => {
          // Handle pawn promotion after move animation completes
          if (pieceType === 'pawn') {
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
          // Note: currentTurn has already switched to the next player in the reducer
          // So currentTurn is the player who needs to move now (potential victim)
          // pieceColor is the player who just moved (potential winner)
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
          playSound('move')
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
    currentTurn,
    subscribe,
    publish,
    enPassantTarget,
    castlingRights,
    setCurrentLegalMoves,
    settings,
    positionHistory,
    halfMoveClock,
  ])
  return null
})
