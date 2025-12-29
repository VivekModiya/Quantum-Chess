import React from 'react'
import { ChessPiece } from './Piece'
import { useChess } from '../../../provider'
import { CanvasHighlights } from '../MoveHighlight/CanvasHighlights'

export const Pieces: React.FC = () => {
  const { capturedPieces, chess } = useChess()

  return (
    <group>
      {chess.activePieces(capturedPieces).map(([pieceId]) => (
        <ChessPiece key={pieceId} pieceId={pieceId} />
      ))}
      <CanvasHighlights />
    </group>
  )
}
