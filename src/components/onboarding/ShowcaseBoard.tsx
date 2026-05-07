import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

interface ShowcaseBoardProps {
  position?: [number, number, number]
  frameWidth?: number
}

// Self-contained board constants for showcase
const SHOWCASE_BOARD = {
  SIZE: 80,
  Y_OFFSET: 2.2,
  SQUARE_COLORS: { light: '#ffffff', dark: '#000000' },
  BASE_COLOR: '#c9af96',
  FRAME_COLOR: '#5c5c5c',
} as const

// Simplified utility function for assets in showcase
const getAssetUrl = (path: string): string => {
  const baseUrl = '/'
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}

// Simplified board component for showcase that doesn't need ChessProvider or external configs
export const ShowcaseBoard: React.FC<ShowcaseBoardProps> = ({
  position = [0, 0, 0],
  frameWidth = 6,
}) => {
  const groupRef = React.useRef<THREE.Group>(null)

  // Load tile textures for the board surface
  const tileTextures = useTexture({
    map: getAssetUrl('textures/Tiles074_1K-JPG_Color.jpg'),
    normalMap: getAssetUrl('textures/Tiles074_1K-JPG_NormalGL.jpg'),
    roughnessMap: getAssetUrl('textures/Tiles074_1K-JPG_Roughness.jpg'),
    displacementMap: getAssetUrl('textures/Tiles074_1K-JPG_Displacement.jpg'),
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
    map: getAssetUrl('textures/Wood062_1K-JPG_Color.jpg'),
    normalMap: getAssetUrl('textures/Wood062_1K-JPG_NormalGL.jpg'),
    roughnessMap: getAssetUrl('textures/Wood062_1K-JPG_Roughness.jpg'),
    aoMap: getAssetUrl('textures/Wood062_1K-JPG_AmbientOcclusion.jpg'),
  })

  // Configure border textures to repeat
  React.useMemo(() => {
    Object.values(borderTextures).forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(4, 4)
      texture.needsUpdate = true
    })
  }, [borderTextures])

  // Load piece texture for the base (same as chess pieces)
  const baseTextures = useTexture({
    map: getAssetUrl('textures/Texture_White__Color.jpg'),
    normalMap: getAssetUrl('textures/Texture_White_NormalGL.jpg'),
    roughnessMap: getAssetUrl('textures/Texture_White_Roughness.jpg'),
    aoMap: getAssetUrl('textures/Texture_White_AmbientOcclusion.jpg'),
  })

  // Configure base textures
  React.useMemo(() => {
    Object.values(baseTextures).forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(3, 3)
      texture.needsUpdate = true
    })
  }, [baseTextures])

  const frameSize = SHOWCASE_BOARD.SIZE + frameWidth * 2

  return (
    <group ref={groupRef} position={position}>
      {/* Base Layer */}
      <mesh position={[0, -1, 0]} receiveShadow castShadow>
        <boxGeometry args={[frameSize + 4, 2, frameSize + 4]} />
        <meshStandardMaterial
          map={baseTextures.map}
          normalMap={baseTextures.normalMap}
          roughnessMap={baseTextures.roughnessMap}
          aoMap={baseTextures.aoMap}
          color={SHOWCASE_BOARD.BASE_COLOR}
        />
      </mesh>

      {/* Border Frame */}
      <mesh position={[0, SHOWCASE_BOARD.Y_OFFSET, 0]} receiveShadow castShadow>
        <boxGeometry args={[frameSize, 0.5, frameSize]} />
        <meshStandardMaterial
          map={borderTextures.map}
          normalMap={borderTextures.normalMap}
          roughnessMap={borderTextures.roughnessMap}
          aoMap={borderTextures.aoMap}
          color={SHOWCASE_BOARD.FRAME_COLOR}
        />
      </mesh>

      {/* Board Surface */}
      <mesh
        position={[0, SHOWCASE_BOARD.Y_OFFSET + 0.25, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[SHOWCASE_BOARD.SIZE, 0.25, SHOWCASE_BOARD.SIZE]} />
        <meshStandardMaterial
          map={tileTextures.map}
          normalMap={tileTextures.normalMap}
          roughnessMap={tileTextures.roughnessMap}
          displacementMap={tileTextures.displacementMap}
          displacementScale={0.1}
        />
      </mesh>

      {/* Chess Squares Pattern */}
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8)
        const col = i % 8
        const isLight = (row + col) % 2 === 0
        const x = (col - 3.5) * 10
        const z = (row - 3.5) * 10

        return (
          <mesh
            key={i}
            position={[x, SHOWCASE_BOARD.Y_OFFSET + 0.42, z]}
            receiveShadow
          >
            <boxGeometry args={[10, 0.01, 10]} />
            <meshStandardMaterial
              color={
                isLight
                  ? SHOWCASE_BOARD.SQUARE_COLORS.light
                  : SHOWCASE_BOARD.SQUARE_COLORS.dark
              }
              transparent
              opacity={0.8}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        )
      })}
    </group>
  )
}
