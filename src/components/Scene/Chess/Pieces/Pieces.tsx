import React from 'react'
import { PieceType } from '../../../../types'
import { ChessPiece } from './Piece'
import { formatSquare } from '../../../../utils/calculate'
import { PIECE_SQUARE_MAP, SQUARE_PIECE_MAP } from '../../../../constants/chess'
import { HighLightedMoves } from '../MoveHighlight/HighLight'
import { useChess } from '../../../../provider'
import { getSquareCoords } from '../../../../hooks'

export const Pieces: React.FC = () => {
  const getPieceId = (file: number, rank: number) => {
    const square = formatSquare(file, rank)
    return SQUARE_PIECE_MAP[square as keyof typeof PIECE_SQUARE_MAP]
  }

  const { capturedPieces, board } = useChess()

  const pieces = React.useMemo(() => {
    const pieces: Array<{
      piece: PieceType
      color: 'white' | 'black'
      position: [number, number, number]
      scale: number
      pieceId: string
    }> = []

    for (const [square, piece] of board.entries()) {
      const { color, type } = piece ?? {}
      const { file, rank } = getSquareCoords(square) ?? {}
      if (file && rank && color && type) {
        const x = -(file - 1) * 10 + 35
        const z = (rank - 1) * 10 - 35

        console.table({
          type,
          color,
          square,
          pieceId: getPieceId(file - 1, rank - 1),
          x,
          z,
        })
        pieces.push({
          piece: type,
          color,
          position: [x, 0, z],
          scale: 1.2,
          pieceId: getPieceId(file - 1, rank - 1),
        })
      }
    }

    return pieces
  }, [])

  return (
    <group>
      {pieces
        .filter(p => !capturedPieces.includes(p.pieceId))
        .map(pieceProps => (
          <ChessPiece key={pieceProps.pieceId} {...pieceProps} />
        ))}
      <HighLightedMoves />
    </group>
  )
}
