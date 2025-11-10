import React from 'react'
import { HighLightedMoves } from '../MoveHighlight'
import { ChessPiece } from './Piece'
import { useChess } from '../../../provider'

export const Pieces: React.FC = () => {
  const { capturedPieces, chess, board } = useChess()

  console.log({ capturedPieces })
  const activePieces = React.useMemo(() => {
    return chess.activePieces(capturedPieces)
  }, [board, capturedPieces, chess])

  return (
    <group>
      {activePieces.map(([pieceId]) => (
        <ChessPiece key={pieceId} pieceId={pieceId} />
      ))}
      <HighLightedMoves />
    </group>
  )
}
