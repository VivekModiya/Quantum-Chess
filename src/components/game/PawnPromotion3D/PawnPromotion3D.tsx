import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber'
import { usePubSub } from '../../../hooks'
import { useChess } from '../../../provider'
import { PieceModel } from '../Pieces/PieceModel'
import { PromotablePiece, PieceColor } from '../../../types'
import { Square } from '../../../types/chess'

const PROMOTABLE_PIECES: PromotablePiece[] = [
  'queen',
  'rook',
  'bishop',
  'knight',
]

// Horizontal spacing of the 4 pieces inside the box
const PIECE_X_POSITIONS = [-12, -4, 4, 12]

interface PromotionData {
  toSquare: Square
  pieceId: string
}

export const PawnPromotion3D: React.FC = () => {
  const [promotionData, setPromotionData] = useState<PromotionData | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  const scaleRef = useRef(0)

  const pubSub = usePubSub()
  const { chess } = useChess()
  const { camera } = useThree()

  const pieceColor: PieceColor =
    (chess.byId(promotionData?.pieceId ?? '')?.color as PieceColor) ?? 'white'

  const isOpen = Boolean(promotionData)

  // When the dialog opens, snapshot camera position/orientation and position
  // the group 50 units in front of the camera. Since camera movement is locked
  // while the dialog is open, no per-frame tracking is needed.
  useEffect(() => {
    const unsub = pubSub.subscribe(
      'open_promotion_dialog',
      ({ pieceId, toSquare }) => {
        if (groupRef.current) {
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
            camera.quaternion
          )
          const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
            camera.quaternion
          )
          groupRef.current.position
            .copy(camera.position)
            .addScaledVector(forward, 50)
            .addScaledVector(up, -5)
          groupRef.current.quaternion.copy(camera.quaternion)
        }
        setPromotionData({ pieceId, toSquare })
      }
    )
    return unsub
  }, [pubSub, camera])

  // Animate scale 0 → 1 on open, 1 → 0 on close
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = isOpen ? 1 : 0
    const next = THREE.MathUtils.lerp(
      scaleRef.current,
      target,
      1 - Math.exp(-12 * delta)
    )
    scaleRef.current = next
    const clamped = Math.max(0, next)
    groupRef.current.visible = clamped > 0.01
    groupRef.current.scale.setScalar(clamped)
  })

  const handlePieceClick = (piece: PromotablePiece) => {
    if (!promotionData) return
    pubSub.publish('promotion_piece_selected', {
      piece,
      pieceId: promotionData.pieceId,
      toSquare: promotionData.toSquare,
    })
    setPromotionData(null)
  }

  return (
    <group ref={groupRef} visible={false}>
      {/* Outer dark wooden border */}
      <mesh position={[0, 9, 0]}>
        <boxGeometry args={[40, 20, 2]} />
        <meshStandardMaterial color="#3d1a00" />
      </mesh>

      {/* Inner cream panel — positioned slightly in front along group +Z */}
      <mesh position={[0, 9, 0.6]}>
        <boxGeometry args={[38, 18, 1]} />
        <meshStandardMaterial color="#00000053" />
      </mesh>

      {/* 4 promotion pieces — boardZ=1.5 puts them in front of the panel */}
      {PROMOTABLE_PIECES.map((piece, i) => (
        <PieceModel
          key={piece}
          piece={piece}
          color={pieceColor}
          boardX={PIECE_X_POSITIONS[i]}
          boardZ={1}
          pieceRotation={0}
          scale={1}
          interactive={true}
          showRim={true}
          handleClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            handlePieceClick(piece)
          }}
        />
      ))}
    </group>
  )
}
