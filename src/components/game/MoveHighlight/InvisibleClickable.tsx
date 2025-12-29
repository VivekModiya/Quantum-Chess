import { ThreeEvent } from '@react-three/fiber'

export interface InvisibleClickableProps {
  position: [number, number, number]
  handleClick: (e: ThreeEvent<MouseEvent>) => void
}

export const InvisibleClickable = (props: InvisibleClickableProps) => {
  const { handleClick } = props

  return (
    <mesh
      onClick={handleClick}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial />
    </mesh>
  )
}
