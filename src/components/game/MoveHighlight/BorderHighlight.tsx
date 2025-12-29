import { shadowConfig } from '../../../config'

export interface BorderHighlightProps {
  color: string
  position: [number, number, number]
}

export const BorderHighlight = (props: BorderHighlightProps) => {
  const { color } = props
  const borderThickness = 0.5
  const cornerRadius = 1.5
  const tubeRadius = borderThickness
  const squareWidth = 9

  const yPos = -0.4

  return (
    <>
      {/* Top border */}
      <mesh
        position={[0, yPos, squareWidth / 2 - borderThickness / 2]}
        rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}
        receiveShadow={shadowConfig}
      >
        <cylinderGeometry
          args={[tubeRadius, tubeRadius, squareWidth - 2 * cornerRadius, 16]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom border */}
      <mesh
        position={[0, yPos, -(squareWidth / 2) + borderThickness / 2]}
        rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}
        receiveShadow={shadowConfig}
      >
        <cylinderGeometry
          args={[tubeRadius, tubeRadius, squareWidth - 2 * cornerRadius, 16]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Left border */}
      <mesh
        position={[-(squareWidth / 2) + borderThickness / 2, yPos, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow={shadowConfig}
      >
        <cylinderGeometry
          args={[tubeRadius, tubeRadius, squareWidth - 2 * cornerRadius, 16]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Right border */}
      <mesh
        position={[squareWidth / 2 - borderThickness / 2, yPos, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow={shadowConfig}
      >
        <cylinderGeometry
          args={[tubeRadius, tubeRadius, squareWidth - 2 * cornerRadius, 16]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Top-right corner (quarter torus) */}
      <mesh
        position={[
          squareWidth / 2 - cornerRadius - borderThickness / 2,
          yPos,
          squareWidth / 2 - cornerRadius - borderThickness / 2,
        ]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        receiveShadow={shadowConfig}
      >
        <torusGeometry args={[cornerRadius, tubeRadius, 16, 32, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Top-left corner (quarter torus) */}
      <mesh
        position={[
          -(squareWidth / 2) + cornerRadius + borderThickness / 2,
          yPos,
          squareWidth / 2 - cornerRadius - borderThickness / 2,
        ]}
        rotation={[-Math.PI / 2, Math.PI, -Math.PI / 2]}
        receiveShadow={shadowConfig}
      >
        <torusGeometry args={[cornerRadius, tubeRadius, 16, 32, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom-left corner (quarter torus) */}
      <mesh
        position={[
          -(squareWidth / 2) + cornerRadius + borderThickness / 2,
          yPos,
          -(squareWidth / 2) + cornerRadius + borderThickness / 2,
        ]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        receiveShadow={shadowConfig}
      >
        <torusGeometry args={[cornerRadius, tubeRadius, 16, 32, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom-right corner (quarter torus) */}
      <mesh
        position={[
          squareWidth / 2 - cornerRadius - borderThickness / 2,
          yPos,
          -squareWidth / 2 + cornerRadius + borderThickness / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={shadowConfig}
      >
        <torusGeometry args={[cornerRadius, tubeRadius, 16, 32, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          opacity={1}
          transparent={false}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
