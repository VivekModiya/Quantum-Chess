import React from 'react'
import * as THREE from 'three'

import { ThreeEvent } from '@react-three/fiber'
import { useChess } from '../../../provider'
import { usePubSub } from '../../../hooks'
import { PieceModel } from './PieceModel'

interface PieceObjectProps {
  pieceId: string
  handleClick: (e: ThreeEvent<MouseEvent>) => void
  pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
}

export const PieceObject: React.FC<PieceObjectProps> = ({
  pieceId,
  handleClick,
  pieceRef,
}) => {
  const { chess } = useChess()
  const pieceData = chess.byId(pieceId)
  const { subscribe } = usePubSub()

  // Track the square we're currently rendering at (to prevent flicker during animation)
  const [renderSquare, setRenderSquare] = React.useState(
    pieceData?.square ?? ''
  )

  // Early return if piece doesn't exist
  if (!pieceData) return null

  const { color, piece, square } = pieceData

  // Listen for move completion to update render position
  React.useEffect(() => {
    const unsubscribe = subscribe(
      'move_completed',
      ({ pieceId: movedPieceId, toSquare }) => {
        if (movedPieceId === pieceId) {
          // Update render square only after animation completes
          setRenderSquare(toSquare)
        }
      }
    )
    return unsubscribe
  }, [pieceId, subscribe])

  // Initialize render square on first render
  React.useEffect(() => {
    if (renderSquare === '' && square) {
      setRenderSquare(square)
    }
  }, [square, renderSquare])

  const coords = chess.coords(renderSquare ?? '')
  const { file, rank } = coords ?? { file: 0, rank: 0 }
  const boardX = -(file - 1) * 10 + 35
  const boardZ = (rank - 1) * 10 - 35

  const pieceRotation = React.useMemo(() => {
    if (color === 'black' && piece === 'knight') {
      return Math.PI
    } else if (piece === 'bishop') {
      return color === 'black' ? Math.PI / 2 : -Math.PI / 2
    }
    return 0
  }, [color, piece])

  const userData = React.useMemo(
    () => ({
      piece,
      color,
      isPiece: true,
      pieceId,
      isSelected: false,
    }),
    [piece, color, pieceId]
  )

  return (
    <PieceModel
      piece={piece}
      color={color}
      boardX={boardX}
      boardZ={boardZ}
      pieceRotation={pieceRotation}
      handleClick={handleClick}
      pieceRef={pieceRef}
      userData={userData}
    />
  )
}
