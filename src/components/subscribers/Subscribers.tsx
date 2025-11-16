import React from 'react'
import { usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import { playSound } from '../../utils'

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
    currentTurn,
  } = useChess()

  React.useEffect(() => {
    const unsubscribe = [
      subscribe('calculate_legal_moves', ({ square }) => {
        const moves = getLegalMoves(square)
        publish('legal_move_calculated', { moves })
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
              publish('open_promotion_dialog', { pieceId, toSquare })
            }
          }
        }
      ),
      subscribe('promotion_piece_selected', ({ piece, pieceId, toSquare }) =>
        promotePawn(toSquare, piece, pieceId)
      ),
      subscribe('make_sound', () => {
        playSound('move')
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
    currentTurn,
    subscribe,
    publish,
  ])
  return null
})
