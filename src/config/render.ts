import { GLProps } from '@react-three/fiber'
import * as THREE from 'three'

export const renderConfig: GLProps = {
  antialias: true,
  powerPreference: 'high-performance',
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.1,
  outputColorSpace: THREE.SRGBColorSpace,
}
