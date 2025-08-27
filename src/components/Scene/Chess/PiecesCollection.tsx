import React from 'react'
import { PieceType } from '../../../types'
import { ChessPiece } from './Piece'
import { formatSquare } from '../../../utils/calculate'
import { PIECE_SQUARE_MAP, SQUARE_PIECE_MAP } from '../../../constants/chess'
import { HighLightedMoves } from './HighLight'
import { useChess } from '../../../provider'

export const ChessPieces: React.FC = () => {
  const pieceOrder: PieceType[] = [
    'rook',
    'knight',
    'bishop',
    'king',
    'queen',
    'bishop',
    'knight',
    'rook',
  ]

  const getPieceId = (file: number, rank: number) => {
    const square = formatSquare(file, rank)
    return SQUARE_PIECE_MAP[square as keyof typeof PIECE_SQUARE_MAP]
  }

  const { capturedPieces } = useChess()

  const pieces = React.useMemo(() => {
    const pieces: Array<{
      piece: PieceType
      color: 'white' | 'black'
      position: [number, number, number]
      scale: number
      pieceId: string
    }> = []

    // Generate all pieces with proper chess positions
    for (let col = 0; col < 8; col++) {
      const x = col * 10 - 35
      const y = 0

      // White pieces (closer to camera)
      pieces.push({
        piece: pieceOrder[col],
        color: 'white',
        position: [x, y, -35],
        scale: 1.2,
        pieceId: getPieceId(7 - col, 0),
      })

      pieces.push({
        piece: 'pawn',
        color: 'white',
        position: [x, y, -25],
        scale: 1,
        pieceId: getPieceId(7 - col, 1),
      })

      pieces.push({
        piece: 'pawn',
        color: 'black',
        position: [x, y, 25],
        scale: 1,
        pieceId: getPieceId(7 - col, 6),
      })

      // Black pieces (farther from camera)
      pieces.push({
        piece: pieceOrder[col],
        color: 'black',
        position: [x, y, 35],
        scale: 1.2,
        pieceId: getPieceId(7 - col, 7),
      })
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
