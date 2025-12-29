import React from 'react'
import * as THREE from 'three'
import { useChess } from '../../../provider'
import { usePubSub } from '../../../hooks'
import { parseSquare } from '../../../utils/calculations/calculate'
import { INDEX_TO_FILE } from '../../../constants'
import { InvisibleClickable } from './InvisibleClickable'

const CANVAS_SIZE = 1024
const SQUARE_SIZE = CANVAS_SIZE / 8
const BOARD_SIZE = 80

interface HighlightData {
  square: string
  type: 'selected' | 'move' | 'capture' | 'lastMove' | 'check'
}

export const CanvasHighlights: React.FC = () => {
  const {
    selectedPiece,
    currentLegalMoves = [],
    chess,
    currentTurn,
    settings,
    lastMoveSquares,
    kingInCheckSquare,
  } = useChess()
  const pubsub = usePubSub()

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const textureRef = React.useRef<THREE.CanvasTexture | null>(null)

  const selectedPieceSquare = chess.squareOf(selectedPiece ?? '')

  // Create canvas and texture once
  React.useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
      canvasRef.current = canvas

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
      textureRef.current = texture
    }
  }, [])

  // Draw highlights whenever dependencies change
  React.useEffect(() => {
    if (!canvasRef.current || !textureRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const highlights: HighlightData[] = []

    // Add check highlight
    if (kingInCheckSquare && settings.highlightMoves) {
      highlights.push({ square: kingInCheckSquare, type: 'check' })
    }

    // Add last move highlights
    if (lastMoveSquares && settings.highlightMoves) {
      if (lastMoveSquares.from) {
        highlights.push({ square: lastMoveSquares.from, type: 'lastMove' })
      }
      if (lastMoveSquares.to) {
        highlights.push({ square: lastMoveSquares.to, type: 'lastMove' })
      }
    }

    // Add selected piece highlight
    if (selectedPieceSquare) {
      highlights.push({ square: selectedPieceSquare, type: 'selected' })
    }

    // Add legal move highlights
    if (settings.highlightMoves && currentLegalMoves) {
      currentLegalMoves.forEach(square => {
        const hasOpponent =
          chess.at(square)?.color !== currentTurn && chess.at(square)?.piece
        highlights.push({
          square,
          type: hasOpponent ? 'capture' : 'move',
        })
      })
    }

    // Draw each highlight
    highlights.forEach(({ square, type }) => {
      const [col, row] = parseSquare(square)
      // Fix coordinate mapping to match board orientation
      const x = (7 - col) * SQUARE_SIZE
      const y = row * SQUARE_SIZE

      switch (type) {
        case 'selected':
          drawSquareHighlight(ctx, x, y, '#a07b00', 0.5)
          break
        case 'move':
          drawCircleHighlight(ctx, x, y, '#743800bc', 1)
          break
        case 'capture':
          drawSquareHighlight(ctx, x, y, '#4b4997', 0.5)
          break
        case 'lastMove':
          drawRoundedBorderHighlight(ctx, x, y, '#8d4424ff', 24)
          break
        case 'check':
          drawSquareHighlight(ctx, x, y, '#e30000df', 1)
          break
      }
    })

    // Update texture
    textureRef.current.needsUpdate = true
  }, [
    selectedPieceSquare,
    currentLegalMoves,
    chess,
    currentTurn,
    settings,
    lastMoveSquares,
    kingInCheckSquare,
  ])

  const allPositions = React.useMemo(() => {
    const allSquares = Array.from(Array(8))
      .map((_, i) => {
        return Array.from(Array(8)).map((_, j) => {
          return `${INDEX_TO_FILE[i]}${j + 1}`
        })
      })
      .flat()

    return allSquares.map(m => {
      const [col, row] = parseSquare(m)
      const x = (7 - col) * 10 - 35
      const z = row * 10 - 35
      return { square: m, position: [x, 2.5, z] as [number, number, number] }
    })
  }, [])

  const moves = [
    ...(currentLegalMoves ? currentLegalMoves : []),
    selectedPieceSquare ?? '',
  ]

  return (
    <>
      {/* Canvas texture overlay */}
      {textureRef.current && (
        <mesh position={[0, 2.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BOARD_SIZE, BOARD_SIZE]} />
          <meshBasicMaterial
            map={textureRef.current}
            transparent={true}
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Invisible clickable canvas overlay */}
      {allPositions.map(({ position, square }) => {
        if (moves.includes(square) && settings.highlightMoves) {
          return (
            <group position={position} key={square}>
              <InvisibleClickable
                position={position}
                handleClick={e => {
                  e.stopPropagation()
                  pubsub.publish('make_move', { toSquare: square })
                }}
              />
            </group>
          )
        }
        return null
      })}
    </>
  )
}

// Helper functions to draw different highlight types
function drawSquareHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number
) {
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.fillRect(x + 0.6, y - 1.2, SQUARE_SIZE, SQUARE_SIZE)
  ctx.globalAlpha = 1
}

function drawCircleHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number
) {
  const centerX = x + SQUARE_SIZE / 2
  const centerY = y + SQUARE_SIZE / 2
  const radius = SQUARE_SIZE * 0.18

  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawRoundedBorderHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  radius: number = 12 // you can tweak this
) {
  const lineWidth = 5
  const padding = lineWidth / 2 + 6
  const size = SQUARE_SIZE - lineWidth - 12

  // Safety clamp for radius
  radius = Math.min(radius, size / 2)

  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.moveTo(x + padding + radius, y + padding)

  ctx.lineTo(x + padding + size - radius, y + padding)
  ctx.arcTo(
    x + padding + size,
    y + padding,
    x + padding + size,
    y + padding + radius,
    radius
  )

  ctx.lineTo(x + padding + size, y + padding + size - radius)
  ctx.arcTo(
    x + padding + size,
    y + padding + size,
    x + padding + size - radius,
    y + padding + size,
    radius
  )

  ctx.lineTo(x + padding + radius, y + padding + size)
  ctx.arcTo(
    x + padding,
    y + padding + size,
    x + padding,
    y + padding + size - radius,
    radius
  )

  ctx.lineTo(x + padding, y + padding + radius)
  ctx.arcTo(x + padding, y + padding, x + padding + radius, y + padding, radius)

  ctx.closePath()
  ctx.stroke()

  ctx.globalAlpha = 1
}
