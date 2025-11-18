import { ThreeEvent } from '@react-three/fiber'
import React from 'react'
import { usePubSub } from '../../../hooks'
import { PieceObject } from './PieceObj'
import { useChess } from '../../../provider'

interface ChessPieceProps {
  pieceId: string
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ pieceId }) => {
  const { publish } = usePubSub()

  const { setPieceRef, currentLegalMoves, chess } = useChess()

  const pieceRef = React.useRef<THREE.Group>(null)

  React.useEffect(() => {
    setPieceRef(pieceId, pieceRef)
  }, [])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const { square } = chess.byId(pieceId) ?? {}
    // If the current piece is being captured then it will be captured
    if (square && currentLegalMoves?.includes(square)) {
      publish('make_move', { toSquare: square })
    }
    // else piece will be
    e.stopPropagation()
    publish('piece_selected', { pieceId })
  }

  return (
    <PieceObject
      handleClick={handleClick}
      pieceId={pieceId}
      pieceRef={pieceRef}
    />
  )
}
