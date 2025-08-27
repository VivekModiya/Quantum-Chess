import React from 'react'
import { usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import { animatePieceMove, liftPiece, lowerPiece } from '../../utils/animations'
import { playSound } from '../../utils/audioManager'

export const Subscribers = React.memo(() => {
  const { subscribe, publish } = usePubSub()
  const {
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    makeMove,
  } = useChess()

  React.useEffect(() => {
    const unsubscribe = [
      subscribe('calculate_legal_moves', ({ square }) => {
        const moves = getLegalMoves(square)
        publish('legal_move_calculated', { moves })
      }),
      subscribe('piece_selected', ({ pieceId, pieceRef }) => {
        lowerPiece(selectedPiece?.current?.ref?.current)
        if (selectedPiece?.current?.id === pieceId) {
          setSelectedPiece(null)
          publish('calculate_legal_moves', { square: null })
        } else {
          liftPiece(pieceRef?.current)
          setSelectedPiece({ id: pieceId, ref: pieceRef })
          publish('calculate_legal_moves', {
            square: getPieceSquare(pieceId),
          })
        }
      }),
      subscribe('make_move', ({ toSquare }) => {
        const fromSquare = getPieceSquare(selectedPiece?.current?.id)
        animatePieceMove({
          toSquare,
          fromSquare,
          pieceObject: selectedPiece?.current?.ref?.current,
          onComplete: () => {
            setSelectedPiece(null)
            publish('calculate_legal_moves', { square: null })
            publish('make_sound', undefined)
            makeMove(fromSquare, toSquare)
          },
        })
      }),
      subscribe('make_sound', () => {
        playSound('move')
      }),
    ]
    return () => unsubscribe.forEach(us => us())
  }, [
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    makeMove,
    subscribe,
    publish,
  ])
  return null
})
