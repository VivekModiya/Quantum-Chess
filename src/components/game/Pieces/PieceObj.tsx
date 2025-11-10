import React from 'react'
import * as THREE from 'three'

import { useGLTF } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { useChess } from '../../../provider'

interface PieceObjectProps {
  pieceId: string
  handleClick: (e: ThreeEvent<MouseEvent>) => void
  pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>
}

const PIECE_SCALE = 1.2

export const PieceObject: React.FC<PieceObjectProps> = ({
  pieceId,
  handleClick,
  pieceRef,
}) => {
  const { chess } = useChess()
  const pieceData = chess.byId(pieceId)

  // Early return if piece doesn't exist
  if (!pieceData) return null

  const { color, piece, square } = pieceData
  const coords = chess.coords(square ?? '')
  const { file, rank } = coords ?? { file: 0, rank: 0 }
  const x = -(file - 1) * 10 + 35
  const z = (rank - 1) * 10 - 35

  const { scene } = useGLTF(`/models/${piece}.glb`)
  const modelRef = React.useRef<THREE.Group>(null)

  // Memoize color calculations
  const colorHash = React.useMemo(() => {
    const blackPieceColor = [8, 4, 0] as [number, number, number]
    const whitePieceColor = [124, 101, 63] as [number, number, number]
    return color === 'white' ? whitePieceColor : blackPieceColor
  }, [color])

  // Clone and modify the loaded model with proper centering
  const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
    if (!scene)
      return {
        modifiedScene: null,
        centerOffset: new THREE.Vector3(),
        yOffset: 0,
      }

    const clonedScene = scene.clone()
    clonedScene.scale.set(
      0.2 + PIECE_SCALE * 0.8,
      0.2 + PIECE_SCALE,
      0.2 + PIECE_SCALE * 0.8
    )

    clonedScene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial

        const newMaterial = material.clone()

        if (newMaterial.map) {
          newMaterial.map.minFilter = THREE.LinearFilter
          newMaterial.map.magFilter = THREE.LinearFilter
          newMaterial.map.generateMipmaps = false
          newMaterial.map.needsUpdate = true
        }

        if (!newMaterial.userData.originalColor) {
          newMaterial.userData.originalColor = newMaterial.color.clone()
        }

        newMaterial.color.setRGB(colorHash[0], colorHash[1], colorHash[2])

        // Ensure the material settings preserve texture visibility
        newMaterial.metalness = 0.3
        newMaterial.roughness = 0.7

        child.material = newMaterial
      }
    })

    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = box.getCenter(new THREE.Vector3())
    const centerOffset = new THREE.Vector3(-center.x, -center.y, -center.z)

    // Create a temporary group to calculate post-rotation bounds
    const tempGroup = new THREE.Group()
    const tempModel = clonedScene.clone()
    tempModel.position.copy(centerOffset)
    tempGroup.add(tempModel)
    tempGroup.rotation.x = -Math.PI / 2

    // Calculate how much to lift the piece so bottom touches y=0
    const rotatedBox = new THREE.Box3().setFromObject(tempGroup)
    const yOffset = -rotatedBox.min.y

    return { modifiedScene: clonedScene, centerOffset, yOffset }
  }, [scene, colorHash, piece])

  // Calculate final positioning
  const adjustedPosition = React.useMemo(() => {
    return [
      x,
      yOffset + 2.55, // Lift to sit on floor
      z,
    ] as [number, number, number]
  }, [x, z, yOffset])

  if (!modifiedScene) return null

  const pieceRotation = React.useMemo(() => {
    if (color === 'black' && piece === 'knight') {
      return Math.PI
    } else if (piece === 'bishop') {
      return color === 'black' ? Math.PI / 2 : -Math.PI / 2
    }
    return 0
  }, [color, piece])

  return (
    <group
      ref={pieceRef}
      position={adjustedPosition}
      rotation={[-Math.PI / 2, 0, pieceRotation]}
      castShadow
      receiveShadow
      userData={{
        piece,
        color,
        isPiece: true,
        pieceId,
        isSelected: false,
      }}
      onClick={e => handleClick(e)}
    >
      <group ref={modelRef} position={centerOffset}>
        <primitive object={modifiedScene} />
      </group>
    </group>
  )
}
