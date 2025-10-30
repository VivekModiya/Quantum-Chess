import React, { Suspense } from 'react'

import * as THREE from 'three'

import { Canvas } from '@react-three/fiber'

import { SceneLighting } from './scene/Lighting/SceneLighting'
import { Subscribers } from './subscribers'
import {
  Crosshair,
  Instructions,
  Loader,
  MovementControls,
  PointerPosition,
} from './ui'

import { useGLTF } from '@react-three/drei'
import { Board, Pieces } from './Gammmerer'

export const Game: React.FC = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)

  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(`/models/${piece}.glb`)
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
