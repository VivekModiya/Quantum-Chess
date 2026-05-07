import React, { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { assetUrl } from '../../../utils'

const SPHERE_ARGS: [number, number, number] = [500, 32, 32]

export const Skybox: React.FC = React.memo(() => {
  const cloudTexture = useLoader(
    THREE.TextureLoader,
    assetUrl('images/cloud.png')
  )

  // Configure texture once
  useMemo(() => {
    cloudTexture.wrapS = THREE.RepeatWrapping
    cloudTexture.wrapT = THREE.RepeatWrapping
    cloudTexture.repeat.set(4, 3)
  }, [cloudTexture])

  return (
    <mesh>
      <sphereGeometry args={SPHERE_ARGS} />
      <meshStandardMaterial
        map={cloudTexture}
        side={THREE.BackSide}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  )
})
