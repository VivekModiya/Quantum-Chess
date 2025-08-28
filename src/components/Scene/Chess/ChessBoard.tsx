import React from 'react'
import * as THREE from 'three'

interface ChessBoardProps {
  position?: [number, number, number]
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  position = [0, 0, 0],
}) => {
  const groupRef = React.useRef<THREE.Group>(null)

  // Create board texture using canvas
  const boardTexture = React.useMemo(() => {
    const createBoardTexture = async (): Promise<THREE.CanvasTexture> => {
      const boardCanvas = document.createElement('canvas')
      const squareSize = 512
      boardCanvas.width = squareSize * 8
      boardCanvas.height = squareSize * 8
      const ctx = boardCanvas.getContext('2d')!

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Load textures
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
        const textures = await Promise.all(
          Array.from({ length: 33 }).map((_, i) => {
            if (i === 32) {
              return loadImage(
                new URL(
                  '../../../assets/board_squares/square_light.jpg',
                  import.meta.url
                ).href
              )
            }
            return loadImage(
              new URL(
                `../../../assets/board_squares/square_${i % 16}.jpg`,
                import.meta.url
              ).href
            )
          })
        )

        let blackIndex = 0
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const isLight = (row + col) % 2 === 0
            const index = isLight ? 32 : blackIndex++ % 16

            ctx.drawImage(
              textures[index],
              col * squareSize,
              row * squareSize,
              squareSize,
              squareSize
            )

            // Apply contrast enhancement overlay
            if (isLight) {
              ctx.save()
              ctx.globalCompositeOperation = 'screen'
              ctx.fillStyle = 'rgba(255, 96, 96, 0.3)'
              ctx.fillRect(
                col * squareSize,
                row * squareSize,
                squareSize,
                squareSize
              )

              ctx.globalCompositeOperation = 'overlay'
              ctx.fillStyle = 'rgba(255, 248, 220, 0.1)'
              ctx.fillRect(
                col * squareSize,
                row * squareSize,
                squareSize,
                squareSize
              )
              ctx.restore()
            } else {
              ctx.save()
              ctx.globalCompositeOperation = 'multiply'
              ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
              ctx.fillRect(
                col * squareSize,
                row * squareSize,
                squareSize,
                squareSize
              )

              ctx.globalCompositeOperation = 'overlay'
              ctx.fillStyle = 'rgba(224, 188, 26, 0.4)'
              ctx.fillRect(
                col * squareSize,
                row * squareSize,
                squareSize,
                squareSize
              )
              ctx.restore()
            }
          }
        }
      } catch (error) {
        console.error('Error loading board textures:', error)
      }

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

    return createBoardTexture()
  }, [])

  // Create frame texture
  const frameTexture = React.useMemo(() => {
    const createBoardFrame = async (): Promise<THREE.CanvasTexture> => {
      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = 5120
      frameCanvas.height = 5120
      const ctx = frameCanvas.getContext('2d')!

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

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
        const verticalImage = await loadImage(
          new URL(
            '../../../assets/board_frame/frame_vertical.jpg',
            import.meta.url
          ).href
        )
        const horizontalImage = await loadImage(
          new URL(
            '../../../assets/board_frame/frame_horizontal.jpg',
            import.meta.url
          ).href
        )

        // Top frame
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(640, 640)
        ctx.lineTo(4480, 640)
        ctx.lineTo(5120, 0)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(horizontalImage, 0, 0, 5120, 5120)
        ctx.restore()

        // Left frame
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(640, 640)
        ctx.lineTo(640, 4480)
        ctx.lineTo(0, 5120)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(verticalImage, 0, 0, 5120, 5120)
        ctx.restore()

        // Bottom frame
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(0, 5120)
        ctx.lineTo(640, 4480)
        ctx.lineTo(4480, 4480)
        ctx.lineTo(5120, 5120)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(horizontalImage, 0, 0, 5120, 5120)
        ctx.restore()

        // Right frame
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(5120, 5120)
        ctx.lineTo(4480, 4480)
        ctx.lineTo(4480, 640)
        ctx.lineTo(5120, 0)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(verticalImage, 0, 0, 5120, 5120)
        ctx.restore()
      } catch (error) {
        console.error('Error loading frame textures:', error)
      }

      const texture = new THREE.CanvasTexture(frameCanvas)
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = 16
      texture.encoding = THREE.sRGBEncoding
      texture.generateMipmaps = true
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      return texture
    }

    return createBoardFrame()
  }, [])

  const [boardTex, setBoardTex] = React.useState<THREE.CanvasTexture | null>(
    null
  )
  const [frameTex, setFrameTex] = React.useState<THREE.CanvasTexture | null>(
    null
  )

  React.useEffect(() => {
    boardTexture.then(setBoardTex)
    frameTexture.then(setFrameTex)
  }, [boardTexture, frameTexture])

  return (
    <group ref={groupRef} position={position}>
      {/* Base/thickness of the board */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[100, 5, 100]} />
        <meshLambertMaterial color={0x8b4513} />
      </mesh>

      {/* Board top with squares */}
      {boardTex && (
        <mesh
          position={[0, 2.55, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[80, 80]} />
          <meshLambertMaterial map={boardTex} />
        </mesh>
      )}

      {/* Board frame */}
      {frameTex && (
        <mesh position={[0, 2.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial map={frameTex} />
        </mesh>
      )}
    </group>
  )
}
