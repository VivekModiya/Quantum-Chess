import { shadowConfig } from "../../../config"

export interface CircleHighlightProps {
  color: string
  position: [number, number, number]
}

export const CircleHighlight = (props: CircleHighlightProps) => {
  const { color } = props

  return (
    <mesh receiveShadow={shadowConfig}>
      <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        opacity={0.7}
        transparent={true}
      />
    </mesh>
  )
}
