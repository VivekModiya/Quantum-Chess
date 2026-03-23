import React from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { assetUrl } from '../../../utils'

export const Skybox: React.FC = () => {
  const cloudTexture = useLoader(
    THREE.TextureLoader,
    assetUrl('images/cloud.png')
  )

  // Configure texture for sky background with repeating
  cloudTexture.wrapS = THREE.RepeatWrapping
  cloudTexture.wrapT = THREE.RepeatWrapping
  cloudTexture.repeat.set(4, 3) // Repeat pattern for better coverage

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial
        map={cloudTexture}
        side={THREE.BackSide}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  )
}
