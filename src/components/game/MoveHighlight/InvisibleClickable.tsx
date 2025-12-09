import { ThreeEvent } from '@react-three/fiber'

export interface InvisibleClickableProps {
  position: [number, number, number]
  handleClick: (e: ThreeEvent<MouseEvent>) => void
}

export const InvisibleClickable = (props: InvisibleClickableProps) => {
  const { handleClick } = props

  return (
    <mesh onClick={handleClick} position={[0, 0, 0]} receiveShadow={true}>
      <boxGeometry args={[10, 0.5, 10]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
