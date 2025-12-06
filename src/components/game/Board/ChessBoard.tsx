import React from 'react'
import * as THREE from 'three'

import { BoardCoordinates } from '../Notations/Notations'

interface ChessBoardProps {
  position?: [number, number, number]
  frameWidth?: number // Configurable frame width
}

export const Board: React.FC<ChessBoardProps> = ({
  position = [0, 0, 0],
  frameWidth = 6,
}) => {
  const groupRef = React.useRef<THREE.Group>(null)

  // Create board texture using canvas
  const boardTexture = React.useMemo(() => {
    const createBoardTexture = async (): Promise<THREE.CanvasTexture> => {
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = src
          img.onload = () => resolve(img)
          img.onerror = reject
        })
      }

      try {
        // Load single chess board image
        const boardImage = await loadImage('/textures/boardTexture.jpg')

        // Create canvas with optimized size
        const boardCanvas = document.createElement('canvas')
        boardCanvas.width = 1024
        boardCanvas.height = 1024
        const ctx = boardCanvas.getContext('2d')!

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw the board image scaled to canvas size
        ctx.drawImage(boardImage, 0, 0, 1024, 1024)

        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = 'rgba(109, 65, 0, 0.4)' // Adjust 0.4 to control darkness (0.0 = no change, 1.0 = black)
        ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height)
        ctx.restore()

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(boardCanvas)
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.anisotropy = 16
        texture.encoding = THREE.sRGBEncoding
        texture.generateMipmaps = true
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping

        return texture
      } catch (error) {
        console.error('Error loading board texture:', error)

        // Fallback: create a simple procedural board
        const boardCanvas = document.createElement('canvas')
        boardCanvas.width = 2048
        boardCanvas.height = 2048

        const texture = new THREE.CanvasTexture(boardCanvas)
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.anisotropy = 16
        texture.encoding = THREE.sRGBEncoding
        texture.generateMipmaps = true
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping

        return texture
      }
    }

    return createBoardTexture()
  }, [])

  const frameTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    const frameSize = frameWidth * 32
    const boardSize = 1024
    const total = boardSize + frameSize * 2

    canvas.width = canvas.height = total
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const outer = '#b5783eff',
      inner = '#814e2aff'

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

  const [boardTex, setBoardTex] = React.useState<THREE.CanvasTexture | null>(
    null
  )
  const [frameTex, setFrameTex] = React.useState<THREE.CanvasTexture | null>(
    null
  )

  React.useEffect(() => {
    boardTexture.then(setBoardTex)
    setFrameTex(frameTexture)
  }, [boardTexture, frameTexture])

  // Calculate dimensions based on frameWidth
  const totalBoardSize = 80 + frameWidth * 2
  const borderOffset = 80 / 2 + 0.25

  // Border color
  const borderColor = 0x654321 // Dark brown wood color

  return (
    <group ref={groupRef} position={position}>
      {/* Base/thickness of the board - adjusted size */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[totalBoardSize, 5, totalBoardSize]} />
        <meshStandardMaterial
          color={'#6d4013'}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Top */}
      <mesh position={[0, 0, -borderOffset]} castShadow receiveShadow>
        <boxGeometry args={[totalBoardSize - 5, 5.5, 0.5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Bottom */}
      <mesh position={[0, 0, borderOffset]} castShadow receiveShadow>
        <boxGeometry args={[totalBoardSize - 5, 5.5, 0.5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Left */}
      <mesh position={[-borderOffset, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 5.5, totalBoardSize - 5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Border - Right */}
      <mesh position={[borderOffset, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 5.5, totalBoardSize - 5]} />
        <meshStandardMaterial
          color={borderColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Board top with squares - keep at 80x80 */}
      {boardTex && (
        <mesh
          position={[0, 2.55, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          castShadow
        >
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial
            map={boardTex}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Board frame - adjusted to use totalBoardSize */}
      {frameTex && (
        <mesh
          position={[0, 2.52, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
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
