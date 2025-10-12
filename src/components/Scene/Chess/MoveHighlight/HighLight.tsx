import React from 'react'

import { ThreeEvent } from '@react-three/fiber'

import { usePubSub } from '../../../../hooks'
import { parseSquare } from '../../../../utils/calculate'

interface HighLightProps {
  position: [number, number, number]
  handleClick: (event: ThreeEvent<MouseEvent>) => void
}

export const HighLight = (props: HighLightProps) => {
  const { handleClick, position } = props
  return (
    <mesh castShadow receiveShadow position={position} onClick={handleClick}>
      <boxGeometry args={[10, 0.2, 10]} />
      <meshStandardMaterial
        color="#334bff"
        emissive="#0026ff"
        emissiveIntensity={0.5}
        opacity={0.7}
        transparent={true}
      />
    </mesh>
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
