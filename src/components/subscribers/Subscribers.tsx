import React from 'react'
import { getSquareCoords, usePubSub } from '../../hooks'
import { useChess } from '../../provider'
import {
  animatePieceMove,
  liftPiece,
  lowerPiece,
} from '../../utils/animations/animations'
import { playSound } from '../../utils/audio/audioManager'

export const Subscribers = React.memo(() => {
  const { subscribe, publish } = usePubSub()
  const {
    getLegalMoves,
    selectedPiece,
    setSelectedPiece,
    getPieceSquare,
    getPieceFromId,
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
        const pieceColor = getPieceFromId(pieceId)?.color
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
          const { color, type } = getPieceFromId(pieceId) ?? {}

          publish('making_move', {
            fromSquare,
            toSquare,
            pieceId,
          })
          animatePieceMove({
            toSquare,
            fromSquare,
            pieceObject: selectedPiece?.current?.ref?.current,
            onComplete: () => {
              publish('make_sound', undefined)
            },
          })
          setSelectedPiece(null)
          publish('calculate_legal_moves', { square: null })

          // Make the move first
          const moveSuccess = makeMove(fromSquare, toSquare)

          // Then check for promotion
          if (moveSuccess && type === 'pawn') {
            const { rank } = getSquareCoords(toSquare) ?? {}
            if (
              (color === 'white' && rank === 8) ||
              (color === 'black' && rank === 1)
            ) {
              // Small delay to ensure move is processed
              setTimeout(() => {
                promotePawn(toSquare, 'queen')
              }, 0)
            }
          }
        }
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
    getPieceFromId,
    makeMove,
    promotePawn,
    currentTurn,
    subscribe,
    publish,
  ])
  return null
})
