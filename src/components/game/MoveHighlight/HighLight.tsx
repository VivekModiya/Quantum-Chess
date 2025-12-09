import React from 'react'

import { usePubSub } from '../../../hooks'
import { parseSquare } from '../../../utils/calculations/calculate'
import { useChess } from '../../../provider'
import { INDEX_TO_FILE } from '../../../constants'
import { InvisibleClickable } from './InvisibleClickable'
import { SquareHighlight } from './SquareHighlight'
import { CircleHighlight } from './CircleHighlight'
import { BorderHighlight } from './BorderHighlight'

const moveHightlightColor = '#552c00'
const captureColor = '#4b4997'
const selectedPieceHighlightColor = '#a07b00'
const lastMoveHighlightColor = '#ae3232'
const checkHighlightColor = '#ff0000'

export const HighLightedMoves = () => {
  const {
    selectedPiece,
    currentLegalMoves = [],
    chess,
    currentTurn,
    settings,
    lastMoveSquares,
    kingInCheckSquare,
  } = useChess()
  const pubsub = usePubSub()

  const selectedPieceSquare = chess.squareOf(selectedPiece ?? '')

  const moves = [
    ...(currentLegalMoves ? currentLegalMoves : []),
    selectedPieceSquare ?? '',
  ]

  const allPositions = React.useMemo(() => {
    const allSquares = Array.from(Array(8))
      .map((_, i) => {
        return Array.from(Array(8)).map((_, j) => {
          return `${INDEX_TO_FILE[i]}${j + 1}`
        })
      })
      .flat()

    return allSquares.map(m => {
      const [col, row] = parseSquare(m)
      const x = (7 - col) * 10 - 35
      const z = row * 10 - 35
      return { square: m, position: [x, 2.5, z] as [number, number, number] }
    })
  }, [])

  const hasOpponentPiece = React.useCallback(
    (square: string) => {
      const { color, piece } = chess.at(square) ?? {}
      if (color !== currentTurn && piece) {
        return true
      }
      return false
    },
    [chess, currentTurn]
  )

  return allPositions.map(({ position, square }) => {
    return (
      <group position={position} key={square}>
        {(() => {
          // Show selected piece highlight
          if (selectedPieceSquare === square) {
            return (
              <SquareHighlight
                key={`selected-${square}`}
                color={selectedPieceHighlightColor}
                position={position}
              />
            )
          }

          // Show legal move highlights
          if (moves.includes(square) && settings.highlightMoves) {
            return (
              <>
                {hasOpponentPiece(square) ? (
                  <SquareHighlight
                    key={`selected-${square}`}
                    color={captureColor}
                    position={position}
                  />
                ) : (
                  <CircleHighlight
                    key={`selected-${square}`}
                    color={moveHightlightColor}
                    position={position}
                  />
                )}
                <InvisibleClickable
                  handleClick={e => {
                    e.stopPropagation()
                    pubsub.publish('make_move', { toSquare: square })
                  }}
                  position={position}
                />
              </>
            )
          }

          // Show king in check highlight
          if (kingInCheckSquare === square && settings.highlightMoves) {
            return (
              <SquareHighlight
                key={`check-${square}`}
                color={checkHighlightColor}
                position={position}
                opacity={1}
              />
            )
          }

          if (
            lastMoveSquares &&
            (lastMoveSquares.from === square || lastMoveSquares.to === square)
          ) {
            return (
              <BorderHighlight
                key={`last-move-${square}`}
                color={lastMoveHighlightColor}
                position={position}
              />
            )
          }

          // Show invisible clickable for legal moves even if highlights are off
          if (moves.includes(square) && !settings.highlightMoves) {
            return (
              <InvisibleClickable
                key={`click-${square}`}
                handleClick={e => {
                  e.stopPropagation()
                  pubsub.publish('make_move', { toSquare: square })
                }}
                position={position}
              />
            )
          }
        })()}
      </group>
    )
  })
}
