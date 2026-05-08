import React from 'react'
import * as THREE from 'three'

import { useTexture } from '@react-three/drei'
import { BoardCoordinates } from '../Notations/Notations'
import { shadowConfig } from '../../../config'
import { BOARD } from '../../../constants'
import { assetUrl } from '../../../utils'

interface ChessBoardProps {
  position?: [number, number, number]
  frameWidth?: number // Configurable frame width
}

export const Board: React.FC<ChessBoardProps> = React.memo(
  ({ position = [0, 0, 0], frameWidth = 6 }) => {
    const groupRef = React.useRef<THREE.Group>(null)

    // Load tile textures for the board surface
    const tileTextures = useTexture({
      map: assetUrl('textures/Tiles074_1K-JPG_Color.jpg'),
      normalMap: assetUrl('textures/Tiles074_1K-JPG_NormalGL.jpg'),
      roughnessMap: assetUrl('textures/Tiles074_1K-JPG_Roughness.jpg'),
      displacementMap: assetUrl('textures/Tiles074_1K-JPG_Displacement.jpg'),
    })

    // Configure tile textures
    React.useMemo(() => {
      Object.values(tileTextures).forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(8 / 6, 8 / 6)
        texture.needsUpdate = true
      })
    }, [tileTextures])

    // Load wood textures for the border
    const borderTextures = useTexture({
      map: assetUrl('textures/Wood062_1K-JPG_Color.jpg'),
      normalMap: assetUrl('textures/Wood062_1K-JPG_NormalGL.jpg'),
      roughnessMap: assetUrl('textures/Wood062_1K-JPG_Roughness.jpg'),
      aoMap: assetUrl('textures/Wood062_1K-JPG_AmbientOcclusion.jpg'),
    })

    // Configure border textures to repeat
    React.useMemo(() => {
      Object.values(borderTextures).forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(3, 3)
        texture.needsUpdate = true
      })
    }, [borderTextures])

    // Load piece texture for the base (same as chess pieces)
    const baseTextures = useTexture({
      map: assetUrl('textures/Texture_White__Color.jpg'),
    })

    // Configure base textures to repeat
    React.useMemo(() => {
      Object.values(baseTextures).forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(4, 4)
        texture.needsUpdate = true
      })
    }, [baseTextures])

    // Calculate dimensions based on frameWidth
    const totalBoardSize = BOARD.SIZE + frameWidth * 2
    const borderOffset = BOARD.SIZE / 2 + 0.25

    // Stable geometry args — R3F recreates geometry when array reference changes
    const geoArgs = React.useMemo(
      () => ({
        base: [totalBoardSize, 5, totalBoardSize] as [number, number, number],
        borderH: [totalBoardSize - 5, 5.8, 0.5] as [number, number, number],
        borderV: [0.5, 5.8, totalBoardSize - 5] as [number, number, number],
        surface: [BOARD.SIZE, 0.4, BOARD.SIZE] as [number, number, number],
      }),
      [totalBoardSize]
    )

    return (
      <group ref={groupRef} position={position as any}>
        {/* Base/thickness of the board - adjusted size */}
        <mesh
          position={[0, 0, 0]}
          castShadow={shadowConfig}
          receiveShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.base} />
          <meshStandardMaterial
            color={BOARD.BASE_COLOR}
            map={baseTextures.map}
            roughness={1}
            metalness={1}
            envMapIntensity={0}
          />
        </mesh>

        {/* Border - Top */}
        <mesh
          position={[0, 0.2, -borderOffset]}
          castShadow={shadowConfig}
          receiveShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.borderH} />
          <meshStandardMaterial
            color={BOARD.FRAME_COLOR}
            map={borderTextures.map}
            normalMap={borderTextures.normalMap}
            roughnessMap={borderTextures.roughnessMap}
            aoMap={borderTextures.aoMap}
          />
        </mesh>

        {/* Border - Bottom */}
        <mesh
          position={[0, 0.2, borderOffset]}
          castShadow={shadowConfig}
          receiveShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.borderH} />
          <meshStandardMaterial
            color={BOARD.FRAME_COLOR}
            map={borderTextures.map}
            normalMap={borderTextures.normalMap}
            roughnessMap={borderTextures.roughnessMap}
            aoMap={borderTextures.aoMap}
          />
        </mesh>

        {/* Border - Left */}
        <mesh
          position={[-borderOffset, 0.2, 0]}
          castShadow={shadowConfig}
          receiveShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.borderV} />
          <meshStandardMaterial
            color={BOARD.FRAME_COLOR}
            map={borderTextures.map}
            normalMap={borderTextures.normalMap}
            roughnessMap={borderTextures.roughnessMap}
            aoMap={borderTextures.aoMap}
          />
        </mesh>

        {/* Border - Right */}
        <mesh
          position={[borderOffset, 0.2, 0]}
          castShadow={shadowConfig}
          receiveShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.borderV} />
          <meshStandardMaterial
            color={BOARD.FRAME_COLOR}
            map={borderTextures.map}
            normalMap={borderTextures.normalMap}
            roughnessMap={borderTextures.roughnessMap}
            aoMap={borderTextures.aoMap}
          />
        </mesh>

        {/* Board top with tile texture - keep at 80x80 */}
        <mesh
          position={[0, 2.7, 0]}
          receiveShadow={shadowConfig}
          castShadow={shadowConfig}
        >
          <boxGeometry args={geoArgs.surface} />
          <meshStandardMaterial
            map={tileTextures.map}
            normalMap={tileTextures.normalMap}
            roughness={0}
          />
        </mesh>

        {/* Board frame - adjusted to use totalBoardSize */}
        <BoardCoordinates />
      </group>
    )
  }
)
