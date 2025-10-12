import React, { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

import * as THREE from 'three'

import { Canvas } from '@react-three/fiber'

import { Crosshair, Instructions, Loader, PointerPosition, Scene } from './UI'
import { Subscribers } from './subscribers'

export const Game: React.FC = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Subscribers />
      {/* <AudioComponent /> */}
      <Canvas
        camera={{
          fov: 40,
          near: 0.1,
          far: 1000,
          position: [0, 100, -100], // Initial camera position
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace, // Updated from outputEncoding
        }}
        shadows={{
          enabled: true,
          type: THREE.PCFSoftShadowMap,
        }}
        style={{ background: '#a76100ff' }}
      >
        <Suspense fallback={null}>
          <Scene isLocked={isLocked} setIsLocked={setIsLocked} />
        </Suspense>
      </Canvas>

      <Suspense fallback={<Loader />}>
        <div />
      </Suspense>

      <PointerPosition isVisible={isLocked} />
      <Instructions isVisible={!isLocked} />
      <Crosshair isVisible={isLocked} />
    </div>
  )
}
