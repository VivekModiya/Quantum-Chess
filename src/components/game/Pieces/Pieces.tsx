import React from 'react'
import { HighLightedMoves } from '../MoveHighlight'
import { ChessPiece } from './Piece'
import { useChess } from '../../../provider'

export const Pieces: React.FC = () => {
  const { capturedPieces, chess } = useChess()

  return (
    <group>
      {chess.activePieces(capturedPieces).map(([pieceId]) => (
        <ChessPiece key={pieceId} pieceId={pieceId} />
      ))}
      <HighLightedMoves />
    </group>
  )
}
