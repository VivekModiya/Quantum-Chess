import React from 'react'
import { HighLightedMoves } from '../MoveHighlight'
import { ChessPiece } from './Piece'
import { useChessEngine } from '../../../hooks'

export const Pieces: React.FC = () => {
  const { board } = useChessEngine()

  // Convert board state to entries array
  const activePieces = Object.entries(board)

  return (
    <group>
      {activePieces.map(([pieceId]) => (
        <ChessPiece key={pieceId} pieceId={pieceId} />
      ))}
      <HighLightedMoves />
    </group>
  )
}
