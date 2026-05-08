import React from 'react'
import * as THREE from 'three'

import { useGLTF } from '@react-three/drei'
import { PieceColor, PieceType } from '../../../types'
import { shadowConfig } from '../../../config'
import { PIECE_COLOR_RGB } from '../../../constants'
import { assetUrl } from '../../../utils'

interface CapturedPieceModelProps {
  color: PieceColor
  piece: PieceType
  position: [number, number, number]
  pieceScale?: number
}

const BASE_SCALE = 1.4

export const CapturedPieceModel: React.FC<CapturedPieceModelProps> = React.memo(
  ({ color, piece, position, pieceScale = 0.7 }) => {
    const { scene } = useGLTF(assetUrl(`models/${piece}.glb`))

    const colorHash = React.useMemo(() => PIECE_COLOR_RGB[color], [color])

    const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
      if (!scene) {
        return {
          modifiedScene: null,
          centerOffset: new THREE.Vector3(),
          yOffset: 0,
        }
      }

      const clonedScene = scene.clone()
      clonedScene.scale.set(
        BASE_SCALE * pieceScale,
        BASE_SCALE * pieceScale,
        BASE_SCALE * pieceScale
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

          newMaterial.color.set(colorHash)
          newMaterial.metalness = 0.3
          newMaterial.roughness = 0.5
          child.material = newMaterial

          child.castShadow = shadowConfig
          child.receiveShadow = shadowConfig
        }
      })

      const box = new THREE.Box3().setFromObject(clonedScene)
      const center = box.getCenter(new THREE.Vector3())
      const centerOffset = new THREE.Vector3(-center.x, -center.y, -center.z)

      const tempGroup = new THREE.Group()
      const tempModel = clonedScene.clone()
      tempModel.position.copy(centerOffset)
      tempGroup.add(tempModel)
      tempGroup.rotation.x = -Math.PI / 2

      const rotatedBox = new THREE.Box3().setFromObject(tempGroup)
      const yOffset = -rotatedBox.min.y

      return { modifiedScene: clonedScene, centerOffset, yOffset }
    }, [scene, colorHash, pieceScale])

    React.useEffect(() => {
      return () => {
        if (modifiedScene) {
          modifiedScene.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry?.dispose()
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose())
              } else {
                child.material?.dispose()
              }
            }
          })
        }
      }
    }, [modifiedScene])

    const pieceRotation = React.useMemo(() => {
      if (color === 'black' && piece === 'knight') return Math.PI
      if (piece === 'bishop')
        return color === 'black' ? Math.PI / 2 : -Math.PI / 2
      return 0
    }, [color, piece])

    if (!modifiedScene) return null

    const adjustedPosition: [number, number, number] = [
      position[0],
      position[1] + yOffset,
      position[2],
    ]

    return (
      <group
        position={adjustedPosition}
        rotation={[-Math.PI / 2, 0, pieceRotation]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
        frustumCulled={true}
      >
        <group position={centerOffset}>
          <primitive object={modifiedScene} />
        </group>
      </group>
    )
  }
)
