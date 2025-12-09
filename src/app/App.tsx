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
  SceneLighting,
  Subscribers,
  CapturedPieces,
  Settings,
} from '../components'
import styles from './index.module.scss'
import { PawnPromotionDialog } from '../components/ui/Portals/PawnPromotionDialog'
import { GameOverDialog } from '../components/ui/Portals/GameOverDialog'

export const App = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)
  const resetViewRef = React.useRef<(() => void) | null>(null)

  const handleResetView = React.useCallback(() => {
    if (resetViewRef.current) {
      resetViewRef.current()
    }
  }, [])

  const setResetViewFn = React.useCallback((fn: () => void) => {
    resetViewRef.current = fn
  }, [])

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
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            <SceneLighting />
            <Board position={[0, 0, 0]} />
            <Pieces />
            <MovementControls
              isLocked={isLocked}
              setIsLocked={setIsLocked}
              onResetView={setResetViewFn}
            />
          </Suspense>
        </Canvas>
        <Instructions
          isVisible={true}
          isFPPMode={isLocked}
          onResetView={handleResetView}
        />
        <Crosshair isVisible={isLocked} />
        <Settings />
        <CapturedPieces />
        <PawnPromotionDialog />
        <GameOverDialog />
      </div>
    </ChessProvider>
  )
}
