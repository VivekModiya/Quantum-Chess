import { Center, Text3D } from '@react-three/drei'
import { assetUrl } from '../../../utils'

export interface DigitsProps {
  value?: string | number
  size?: number
  height?: number
  position?: [number, number, number]
  color?: string
}

export const Digits = (props: DigitsProps) => {
  const {
    value = '8888',
    size = 1,
    height = 0.3,
    position = [0, 0, 0],
    color = '#ffffff',
  } = props

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
    <Center
      position={position}
      rotation={[0, Math.PI / 2, Math.PI]}
      renderOrder={1000}
    >
      <Text3D
        font={assetUrl('fonts/digital.json')}
        size={size}
        height={height}
        {...TEXT_CONFIG}
        renderOrder={1000}
      >
        {displayValue}
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0}
          emissive={color}
          emissiveIntensity={0.3}
          transparent={false}
          depthWrite={true}
        />
      </Text3D>
    </Center>
  )
}
