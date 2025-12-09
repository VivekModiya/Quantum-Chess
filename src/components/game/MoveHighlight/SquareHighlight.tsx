export interface SquareHighlightProps {
  color: string
  position: [number, number, number]
}

export const SquareHighlight = (props: SquareHighlightProps) => {
  const { color } = props

  return (
    <mesh receiveShadow>
      <boxGeometry args={[10, 0.2, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        opacity={0.5}
        transparent={true}
      />
    </mesh>
  )
}
