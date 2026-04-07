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

export const Board: React.FC<ChessBoardProps> = ({
  position = [0, 0, 0],
  frameWidth = 6,
}) => {
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

  const frameTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    const frameSize = frameWidth * 32
    const boardSize = 1024
    const total = boardSize + frameSize * 2

    canvas.width = canvas.height = total
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // const outer = '#b5783eff',
    //   inner = '#814e2aff'

    const outer = 'rgba(95, 77, 68, 0.26)' // Dark brown wood color
    const inner = 'rgb(68, 47, 5)' // Lighter brown for inner frame

    // Top
    let grad = ctx.createLinearGradient(0, 0, 0, frameSize)
    grad.addColorStop(0, outer)
    grad.addColorStop(1, inner)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(frameSize, frameSize)
    ctx.lineTo(total - frameSize, frameSize)
    ctx.lineTo(total, 0)
    ctx.closePath()
    ctx.fill()

    // Left
    grad = ctx.createLinearGradient(0, 0, frameSize, 0)
    grad.addColorStop(0, outer)
    grad.addColorStop(1, inner)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(frameSize, frameSize)
    ctx.lineTo(frameSize, total - frameSize)
    ctx.lineTo(0, total)
    ctx.closePath()
    ctx.fill()

    // Bottom
    grad = ctx.createLinearGradient(0, total - frameSize, 0, total)
    grad.addColorStop(0, inner)
    grad.addColorStop(1, outer)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, total)
    ctx.lineTo(frameSize, total - frameSize)
    ctx.lineTo(total - frameSize, total - frameSize)
    ctx.lineTo(total, total)
    ctx.closePath()
    ctx.fill()

    // Right
    grad = ctx.createLinearGradient(total - frameSize, 0, total, 0)
    grad.addColorStop(0, inner)
    grad.addColorStop(1, outer)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(total, total)
    ctx.lineTo(total - frameSize, total - frameSize)
    ctx.lineTo(total - frameSize, frameSize)
    ctx.lineTo(total, 0)
    ctx.closePath()
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16
    texture.encoding = THREE.sRGBEncoding
    texture.generateMipmaps = true
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    return texture
  }, [frameWidth])

  const [frameTex, setFrameTex] = React.useState<THREE.CanvasTexture | null>(
    null
  )

  React.useEffect(() => {
    setFrameTex(frameTexture)
  }, [frameTexture])

  // Calculate dimensions based on frameWidth
  const totalBoardSize = BOARD.SIZE + frameWidth * 2
  const borderOffset = BOARD.SIZE / 2 + 0.25

  // Border color
  const borderColor = BOARD.BORDER_COLOR

  return (
    <group ref={groupRef} position={position}>
      {/* Base/thickness of the board - adjusted size */}
      <mesh
        position={[0, 0, 0]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
      >
        <boxGeometry args={[totalBoardSize, 5, totalBoardSize]} />
        <meshStandardMaterial
          color={BOARD.BASE_COLOR}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Top */}
      <mesh
        position={[0, 0, -borderOffset]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
      >
        <boxGeometry args={[totalBoardSize - 5, 5.5, 0.5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Bottom */}
      <mesh
        position={[0, 0, borderOffset]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
      >
        <boxGeometry args={[totalBoardSize - 5, 5.5, 0.5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Left */}
      <mesh
        position={[-borderOffset, 0, 0]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
      >
        <boxGeometry args={[0.5, 5.5, totalBoardSize - 5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Right */}
      <mesh
        position={[borderOffset, 0, 0]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
      >
        <boxGeometry args={[0.5, 5.5, totalBoardSize - 5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Board top with tile texture - keep at 80x80 */}
      <mesh
        position={[0, BOARD.Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={shadowConfig}
        castShadow={shadowConfig}
      >
        <planeGeometry args={[BOARD.SIZE, BOARD.SIZE]} />
        <meshStandardMaterial
          map={tileTextures.map}
          normalMap={tileTextures.normalMap}
          // roughnessMap={tileTextures.roughnessMap}
          displacementMap={tileTextures.displacementMap}
          roughness={0}
        />
      </mesh>

      {/* Board frame - adjusted to use totalBoardSize */}
      {frameTex && (
        <mesh
          position={[0, 2.52, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow={shadowConfig}
        >
          <planeGeometry args={[totalBoardSize, totalBoardSize]} />
          <meshStandardMaterial
            map={frameTex}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      )}
      <BoardCoordinates />
    </group>
  )
}
