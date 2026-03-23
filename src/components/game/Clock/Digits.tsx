import { Text3D } from '@react-three/drei'
import { assetUrl } from '../../../utils'

export interface DigitsProps {
  value?: string | number
  size?: number
  height?: number
  position?: [number, number, number]
}

export const Digits = (props: DigitsProps) => {
  const { value = '8888', size = 1, height = 0.3, position = [0, 0, 0] } = props

  // Don't render if value is empty or null
  const displayValue = String(value).trim()
  if (!displayValue) {
    return null
  }

  const TEXT_CONFIG = {
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelSegments: 3,
    bevelThickness: 0.05,
  }

  return (
    <Text3D
      font={assetUrl('fonts/digital.json')}
      size={size}
      height={height}
      position={position}
      rotation={[0, Math.PI / 2, Math.PI]}
      {...TEXT_CONFIG}
    >
      {displayValue}
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.5}
        metalness={0}
        emissive="#ffffff"
        emissiveIntensity={0.3}
        transparent={false}
        depthWrite={true}
      />
    </Text3D>
  )
}
