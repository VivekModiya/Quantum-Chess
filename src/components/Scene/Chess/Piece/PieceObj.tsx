import React from 'react'
import * as THREE from 'three'
import { PieceType } from '../../../../types'
import { useGLTF } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'

interface PieceObjectProps {
  piece: PieceType
  color: 'white' | 'black'
  position: [number, number, number]
  scale?: number
  pieceId: string
  handleClick: (e: ThreeEvent<MouseEvent>) => void
  pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>
}

export const PieceObject: React.FC<PieceObjectProps> = ({
  piece,
  color,
  position,
  scale = 1,
  pieceId,
  handleClick,
  pieceRef,
}) => {
  const { scene } = useGLTF(`/src/assets/pieces/${piece}.glb`)
  const modelRef = React.useRef<THREE.Group>(null)

  const blackPieceColor = 'rgb(8, 4, 0)'
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(Number) as [number, number, number]

  const whitePieceColor = 'rgb(124, 101, 63)'
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(Number) as [number, number, number]

  const colorHash = color === 'white' ? whitePieceColor : blackPieceColor

  // Clone and modify the loaded model with proper centering
  const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
    if (!scene)
      return {
        modifiedScene: null,
        centerOffset: new THREE.Vector3(),
        yOffset: 0,
      }

    const clonedScene = scene.clone()
    clonedScene.scale.set(0.2 + scale * 0.8, 0.2 + scale, 0.2 + scale * 0.8)

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
  }, [scene, scale, colorHash, color, pieceId])

  // Calculate final positioning
  const adjustedPosition = React.useMemo(() => {
    return [
      position[0],
      position[1] + yOffset + 2.55, // Lift to sit on floor
      position[2],
    ] as [number, number, number]
  }, [position, yOffset])

  if (!modifiedScene) return null

  return (
    <group
      ref={pieceRef}
      position={adjustedPosition}
      rotation={[-Math.PI / 2, 0, 0]}
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
