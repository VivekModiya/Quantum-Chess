import React from 'react'
import { useChess } from '../../../provider'
import { HighLightedMoves } from '../MoveHighlight'
import { ChessPiece } from './Piece'

export const Pieces: React.FC = () => {
  const { chess } = useChess()

  const activePieces = chess.activePieces()

  return (
    <group>
      {activePieces.map(([pieceId]) => (
        <ChessPiece key={pieceId} pieceId={pieceId} />
      ))}
      <HighLightedMoves />
    </group>
  )
}
