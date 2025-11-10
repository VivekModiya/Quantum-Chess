import React from 'react'
import { HighLightedMoves } from '../MoveHighlight'
import { ChessPiece } from './Piece'
import { useChessEngine } from '../../../hooks'

export const Pieces: React.FC = () => {
  const { chess } = useChessEngine()

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
