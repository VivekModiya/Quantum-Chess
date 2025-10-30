import React, { Suspense } from 'react'

import * as THREE from 'three'

import { Canvas } from '@react-three/fiber'

import { SceneLighting } from './scene/Lighting/SceneLighting'
import { Subscribers } from './subscribers'
import { Crosshair, Instructions, Loader, PointerPosition } from './uiLower'

import { useGLTF } from '@react-three/drei'
import { Board } from './game/Board'
import { Pieces } from './game/Pieces'
import { MovementControls } from './uiLower/Controls'

export const Game: React.FC = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)

  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(`/src/assets/pieces/${piece}.glb`)
    })
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Subscribers />
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 1000,
          position: [0, 900, -900], // Initial camera position
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
        <Suspense fallback={<Loader />}>
          <SceneLighting />
          <group>
            <Board position={[0, 0, 0]} />
            <Pieces />
          </group>
          <MovementControls isLocked={isLocked} setIsLocked={setIsLocked} />
        </Suspense>
      </Canvas>
      <PointerPosition isVisible={isLocked} />
      <Instructions isVisible={!isLocked} />
      <Crosshair isVisible={isLocked} />
    </div>
  )
}
