import React from 'react'

import { ThreeEvent } from '@react-three/fiber'

import { usePubSub } from '../../../hooks'
import { parseSquare } from '../../../utils/calculations/calculate'
import { useChess } from '../../../provider'

interface HighLightProps {
  position: [number, number, number]
  handleClick: (event: ThreeEvent<MouseEvent>) => void
  square: string
}

export const HighLight = (props: HighLightProps) => {
  const { handleClick, position, square } = props

  const { currentTurn, chess } = useChess()

  const hasOpponentPiece = React.useMemo(() => {
    const { color, piece } = chess.at(square) ?? {}
    if (color !== currentTurn && piece) {
      return true
    }
    return false
  }, [chess, currentTurn, square])

  const color = '#552c00'
  const captureColor = '#4b4997'

  return (
    <group position={position}>
      {hasOpponentPiece ? (
        // Square highlight for capture moves
        <mesh receiveShadow>
          <boxGeometry args={[10, 0.2, 10]} />
          <meshStandardMaterial
            color={captureColor}
            emissive={captureColor}
            emissiveIntensity={0.6}
            opacity={0.5}
            transparent={true}
          />
        </mesh>
      ) : (
        // Circular highlight for regular moves
        <mesh receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            opacity={0.7}
            transparent={true}
          />
        </mesh>
      )}

      {/* Invisible clickable box (slightly larger) */}
      <mesh
        onClick={handleClick}
        // small Y offset to avoid z-fighting with board surface
        position={[0, 0, 0]}
      >
        <boxGeometry args={[10, 0.5, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

export const HighLightedMoves = () => {
  const { selectedPiece, currentLegalMoves = [] } = useChess()
  const pubsub = usePubSub()

  const moves = currentLegalMoves ?? []

  const positions = React.useMemo(() => {
    return moves.map(m => {
      const [col, row] = parseSquare(m)
      const x = (7 - col) * 10 - 35
      const z = row * 10 - 35
      return { square: m, position: [x, 2.5, z] }
    })
  }, [moves])

  return (
    <>
      {selectedPiece &&
        positions.map(({ position, square }) => (
          <HighLight
            key={square}
            square={square}
            position={position as [number, number, number]}
            handleClick={e => {
              e.stopPropagation()
              pubsub.publish('make_move', { toSquare: square })
            }}
          />
        ))}
    </>
  )
}
