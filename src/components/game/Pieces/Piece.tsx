import { ThreeEvent } from '@react-three/fiber'
import React from 'react'
import { usePubSub } from '../../../hooks'
import { PieceObject } from './PieceObj'

interface ChessPieceProps {
  pieceId: string
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ pieceId }) => {
  const { publish } = usePubSub()

  const pieceRef = React.useRef<THREE.Group>(null)

  const handleClick = React.useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      publish('piece_selected', { pieceId, pieceRef })
    },
    [publish]
  )

  return (
    <PieceObject
      handleClick={handleClick}
      pieceId={pieceId}
      pieceRef={pieceRef}
    />
  )
}
