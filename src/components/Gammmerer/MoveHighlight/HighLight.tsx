import React from 'react'

import { ThreeEvent } from '@react-three/fiber'

import { usePubSub } from '../../../hooks'
import { parseSquare } from '../../../utils/calculate'

interface HighLightProps {
  position: [number, number, number]
  handleClick: (event: ThreeEvent<MouseEvent>) => void
}

export const HighLight = (props: HighLightProps) => {
  const { handleClick, position } = props

  const color = '#552c00'
  return (
    <group position={position}>
      {/* Visible circular highlight */}
      <mesh>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          opacity={0.7}
          transparent={true}
        />
      </mesh>

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
  const [moves, setMoves] = React.useState<string[]>([])
  const pubsub = usePubSub()

  React.useEffect(() => {
    const unsubscribe = pubsub.subscribe('legal_move_calculated', params =>
      setMoves(params.moves)
    )

    return unsubscribe
  }, [pubsub])

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
      {positions.map(({ position, square }) => (
        <HighLight
          key={square}
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
