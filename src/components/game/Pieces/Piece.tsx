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

  const { setPieceRef } = useChess()

  const pieceRef = React.useRef<THREE.Group>(null)

  React.useEffect(() => setPieceRef(pieceId, pieceRef), [])

  const handleClick = React.useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      publish('piece_selected', { pieceId, pieceRef })
    },
    [publish, pieceId]
  )

  return (
    <PieceObject
      handleClick={handleClick}
      pieceId={pieceId}
      pieceRef={pieceRef}
    />
  )
}
