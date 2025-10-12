import React from 'react'
import { getSquareCoords, usePubSub } from '../../hooks'
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
    getPieceFromId,
    makeMove,
  } = useChess()

  React.useEffect(() => {
    const unsubscribe = [
      subscribe('calculate_legal_moves', ({ square }) => {
        const moves = getLegalMoves(square)
        publish('legal_move_calculated', { moves })
      }),
      subscribe('piece_selected', ({ pieceId, pieceRef }) => {
        console.log({ square: getPieceSquare(pieceId), pieceId })
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
        const pieceId = selectedPiece?.current?.id
        const fromSquare = getPieceSquare(selectedPiece?.current?.id)
        if (fromSquare && toSquare && pieceId) {
          publish('making_move', {
            fromSquare,
            toSquare,
            pieceId,
            onComplete: () => {},
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
      subscribe('piece_moved', ({ toSquare, pieceId }) => {
        const { color, type } = getPieceFromId(pieceId) ?? {}
        const { rank } = getSquareCoords(toSquare) ?? {}
        if (rank === 8) {
          if (color === 'white' && type === 'pawn') {
            alert('alert to select a White piece')
          }
        } else if (rank === 1) {
          if (color === 'black' && type === 'pawn') {
            alert('alert to select piece a Black Piece')
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
