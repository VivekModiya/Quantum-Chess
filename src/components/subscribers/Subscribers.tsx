import React from 'react'
import { usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import { animatePieceMove, liftPiece, lowerPiece, playSound } from '../../utils'

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
      subscribe('piece_selected', ({ pieceId, pieceRef }) => {
        const pieceColor = chess.pieceInfo(pieceId)?.color
        if (selectedPiece?.current?.id === pieceId) {
          lowerPiece(selectedPiece?.current?.ref?.current)
          setSelectedPiece(null)
          publish('calculate_legal_moves', { square: null })
        } else if (currentTurn === pieceColor) {
          liftPiece(pieceRef?.current)
          lowerPiece(selectedPiece?.current?.ref?.current)
          setSelectedPiece({ id: pieceId, ref: pieceRef })
          publish('calculate_legal_moves', {
            square: getPieceSquare(pieceId),
          })
        }
      }),
      subscribe('make_move', ({ toSquare }) => {
        const pieceId = selectedPiece?.current?.id
        const fromSquare = getPieceSquare(selectedPiece?.current?.id)
        if (fromSquare && toSquare && pieceId) {
          const pieceInfo = chess.pieceInfo(pieceId)
          const color = pieceInfo?.color
          const type = pieceInfo?.type

          // Make the move first
          const moveSuccess = makeMove(fromSquare, toSquare)

          if (moveSuccess) {
            animatePieceMove({
              toSquare,
              fromSquare,
              pieceObject: selectedPiece?.current?.ref?.current,
              onComplete: () => {
                publish('make_sound', undefined)

                // Publish move_completed event after animation finishes
                publish('move_completed', {
                  fromSquare,
                  toSquare,
                  pieceId,
                  pieceType: type || '',
                  pieceColor: color || '',
                })
              },
            })
          }

          setSelectedPiece(null)
          publish('calculate_legal_moves', { square: null })
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
              promotePawn(toSquare, 'queen', pieceId)
            }
          }
        }
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
