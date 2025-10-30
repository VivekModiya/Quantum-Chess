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
          makeMove(fromSquare, toSquare)
        }
      }),
      subscribe('make_sound', () => {
        playSound('move')
      }),
      subscribe('making_move', ({ toSquare, pieceId }) => {
        const { color, type } = getPieceFromId(pieceId) ?? {}
        const { rank } = getSquareCoords(toSquare) ?? {}
        if (rank === 8) {
          if (color === 'white' && type === 'pawn') {
            promotePawn(pieceId, 'queen')
          }
        } else if (rank === 1) {
          if (color === 'black' && type === 'pawn') {
            promotePawn(pieceId, 'queen')
          }
        }
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
