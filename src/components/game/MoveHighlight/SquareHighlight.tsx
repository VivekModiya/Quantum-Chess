import { shadowConfig } from "../../../config"

export interface SquareHighlightProps {
  color: string
  position: [number, number, number]
  emissiveIntensity?: number
  opacity?: number
}

export const SquareHighlight = (props: SquareHighlightProps) => {
  const { color, emissiveIntensity = 0.6, opacity = 0.5 } = props

  return (
    <mesh receiveShadow={shadowConfig}>
      <boxGeometry args={[10, 0.2, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        opacity={opacity}
        transparent={true}
      />
    </mesh>
  )
}
