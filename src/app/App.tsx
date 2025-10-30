import React, { Suspense } from 'react'

import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

import { ChessProvider } from '../provider'
import { shadowConfig, renderConfig, cameraConfig } from '../config'
import {
  Board,
  Crosshair,
  Instructions,
  Loader,
  MovementControls,
  Pieces,
  PointerPosition,
  SceneLighting,
  Subscribers,
} from '../components'
import styles from './index.module.scss'

export const App = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)

  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(`/models/${piece}.glb`)
    })
  }, [])

  return (
    <ChessProvider>
      <div className={styles.app}>
        <Subscribers />
        <Canvas
          camera={cameraConfig}
          gl={renderConfig}
          shadows={shadowConfig}
          style={{ background: '#a76100ff' }}
        >
          <Suspense fallback={<Loader />}>
            <SceneLighting />
            <Board position={[0, 0, 0]} />
            <Pieces />
            <MovementControls isLocked={isLocked} setIsLocked={setIsLocked} />
          </Suspense>
        </Canvas>
        <PointerPosition isVisible={isLocked} />
        <Instructions isVisible={!isLocked} />
        <Crosshair isVisible={isLocked} />
      </div>
    </ChessProvider>
  )
}
