import React, { Suspense } from 'react'

import { Canvas } from '@react-three/fiber'
import { useGLTF, Sky } from '@react-three/drei'

import { ChessProvider } from '../provider'
import { useSocket } from '../provider/SocketProvider'
import { shadowConfig, renderConfig, getCameraPosition } from '../config'
import type { CameraRole } from '../config/camera'
import {
  Board,
  CapturedPieces3D,
  Crosshair,
  Instructions,
  Loader,
  MovementControls,
  Pieces,
  SceneLighting,
  Subscribers,
  CapturedPieces,
  Settings,
  Skybox,
} from '../components'
import styles from './index.module.scss'
import { PawnPromotionDialog } from '../components/ui/Portals/PawnPromotionDialog'
import { GameOverDialog } from '../components/ui/Portals/GameOverDialog'
import { GameControls } from '../components/ui/GameControls'
import { assetUrl } from '../utils'
import { Clock } from '../components/game/Clock/Clock'

export const App = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)
  const resetViewRef = React.useRef<(() => void) | null>(null)

  const { playerColor, gameMode, timers, gameState } = useSocket()

  // Determine camera role
  const cameraRole: CameraRole =
    gameMode === 'spectator' ? 'spectator' : (playerColor ?? 'white')
  const initialPosition = getCameraPosition(cameraRole)

  // Camera config with player-specific position
  const playerCameraConfig = {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: initialPosition as [number, number, number],
  }

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
      useGLTF.preload(assetUrl(`models/${piece}.glb`))
    })
  }, [])

  return (
    <ChessProvider>
      <div className={styles.app}>
        <Subscribers />
        <Canvas
          camera={playerCameraConfig}
          gl={renderConfig}
          shadows={shadowConfig}
          style={{ background: 'transparent' }}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            <Sky
              distance={450000}
              sunPosition={[100, 100, 100]}
              inclination={0.6}
              azimuth={0.25}
              turbidity={10}
              rayleigh={3}
              mieCoefficient={1}
              mieDirectionalG={0.9}
            />
            <Skybox />
            <SceneLighting />
            <Board position={[0, 0, 0]} />
            <Pieces />
            <CapturedPieces3D />
            <Clock
              whiteTime={timers?.white}
              blackTime={timers?.black}
              activeSide={gameState?.currentTurn}
            />
            <MovementControls
              isLocked={isLocked}
              setIsLocked={setIsLocked}
              onResetView={setResetViewFn}
              initialPosition={initialPosition}
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
        <GameControls />
      </div>
    </ChessProvider>
  )
}
