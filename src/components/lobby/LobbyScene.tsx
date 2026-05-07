import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, useGLTF } from '@react-three/drei'
import { ChessProvider } from '../../provider'
import { renderConfig, shadowConfig } from '../../config'
import { Board, Pieces, SceneLighting, Skybox } from '../index'
import { assetUrl } from '../../utils'

// Kick off model downloads immediately when this module loads so the game
// Canvas finds everything cached and skips the loading screen.
;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
  useGLTF.preload(assetUrl(`models/${piece}.glb`))
})

export const LobbyScene: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{
          fov: 25,
          near: 1,
          far: 1000,
          position: [0, 140, 150],
        }}
        gl={{ ...renderConfig, logarithmicDepthBuffer: true }}
        shadows={shadowConfig}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        performance={{ min: 0.5 }}
        dpr={[1, 2]}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0)
        }}
      >
        <ChessProvider>
          <Suspense fallback={null}>
            <Sky
              distance={450000}
              sunPosition={[200, 200, 0]}
              inclination={0.49}
              azimuth={0.25}
              turbidity={4}
              rayleigh={2}
              mieCoefficient={0.005}
              mieDirectionalG={0.8}
            />
            <Skybox />
            <SceneLighting />
            <Board position={[0, 0, 0]} />
            <Pieces />
          </Suspense>
        </ChessProvider>
      </Canvas>
    </div>
  )
}
