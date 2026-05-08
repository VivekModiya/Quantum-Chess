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
const PIECE_X_POSITIONS = [-15, -5, 5, 15]
interface PromotionData {
  toSquare: Square
  pieceId: string
}

export const PawnPromotion3D: React.FC = React.memo(() => {
  const [promotionData, setPromotionData] = useState<PromotionData | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  const scaleRef = useRef(0)
  const pieceGroupRefs = useRef<(THREE.Group | null)[]>([
    null,
    null,
    null,
    null,
  ])

  const pubSub = usePubSub()
  const { chess } = useChess()
  const { camera } = useThree()

  const pieceColor: PieceColor =
    (chess.byId(promotionData?.pieceId ?? '')?.color as PieceColor) ?? 'white'

  const isOpen = Boolean(promotionData)

  const positionDialog = () => {
    if (!groupRef.current) return
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    )
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
    groupRef.current.position
      .copy(camera.position)
      .addScaledVector(forward, 50)
      .addScaledVector(up, -5)
    groupRef.current.quaternion.copy(camera.quaternion)
  }

  useEffect(() => {
    const unsub = pubSub.subscribe(
      'open_promotion_dialog',
      ({ pieceId, toSquare }) => {
        positionDialog()
        setPromotionData({ pieceId, toSquare })
      }
    )
    return unsub
  }, [pubSub, camera])

  // Animate scale + rotate pieces
  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Scale animation
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

    // Rotate pieces while dialog is visible — each at a slightly different speed
    if (clamped > 0.01) {
      pieceGroupRefs.current.forEach((ref, i) => {
        if (ref) ref.rotation.y += delta * (0.55 + i * 0.08)
      })
    }
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
    <>
      {/* ── Main promotion dialog ── */}
      <group ref={groupRef} visible={false}>
        {/* Backdrop — large semi-transparent dark overlay */}
        <mesh position={[0, 9, -8]} renderOrder={-1}>
          <planeGeometry args={[600, 450]} />
          <meshBasicMaterial
            color="#00020a"
            opacity={0.82}
            transparent
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Outer embossed golden frame */}
        <mesh position={[0, 9, -6]}>
          <boxGeometry args={[58, 29.6, 2]} />
          <meshStandardMaterial color="#850000" metalness={0} roughness={0} />
        </mesh>

        {/* Main panel surface */}
        <mesh position={[0, 9, -4.6]}>
          <boxGeometry args={[55, 27, 0.8]} />
          <meshStandardMaterial color="#000000" metalness={0} roughness={0} />
        </mesh>

        {/* Rotating piece groups */}
        {PROMOTABLE_PIECES.map((piece, i) => (
          <group
            key={piece}
            position={[PIECE_X_POSITIONS[i], 0, 2.2]}
            ref={el => {
              pieceGroupRefs.current[i] = el
            }}
          >
            <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[4.5, 48]} />
              <meshBasicMaterial
                color="#ffc3c3"
                opacity={0.1}
                transparent
                depthWrite={false}
              />
            </mesh>

            <PieceModel
              piece={piece}
              color={pieceColor}
              boardX={0}
              boardZ={0}
              pieceRotation={0}
              scale={1}
              interactive={true}
              handleClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                handlePieceClick(piece)
              }}
            />
          </group>
        ))}
      </group>
    </>
  )
})
