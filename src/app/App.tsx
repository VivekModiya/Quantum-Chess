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
  Settings,
  Skybox,
} from '../components'
import styles from './index.module.scss'
import { GameOverDialog } from '../components/ui/Portals/GameOverDialog'
import { GameControls } from '../components/ui/GameControls'
import { assetUrl } from '../utils'
import { Clock } from '../components/game/Clock/Clock'
import { usePubSub } from '../hooks'
import { PawnPromotion3D } from '../components'

export const App = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)
  const [isPromotionOpen, setIsPromotionOpen] = React.useState(false)
  const resetViewRef = React.useRef<(() => void) | null>(null)

  const pubSub = usePubSub()

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
    const unsubOpen = pubSub.subscribe('open_promotion_dialog', () =>
      setIsPromotionOpen(true)
    )
    const unsubSelect = pubSub.subscribe('promotion_piece_selected', () =>
      setIsPromotionOpen(false)
    )
    return () => {
      unsubOpen()
      unsubSelect()
    }
  }, [pubSub])

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
              isPromotionOpen={isPromotionOpen}
            />
            <PawnPromotion3D />
          </Suspense>
        </Canvas>
        <Instructions
          isVisible={true}
          isFPPMode={isLocked}
          onResetView={handleResetView}
        />
        <Crosshair isVisible={isLocked} />
        <Settings />
        <GameOverDialog />
        <GameControls />
        {import.meta.env.DEV && (
          <button
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              padding: '8px 16px',
              cursor: 'pointer',
              background: '#3d1a00',
              color: '#fff9ed',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
            }}
            onClick={() =>
              pubSub.publish('open_promotion_dialog', {
                pieceId: 'debug-piece',
                toSquare: 'a1',
              })
            }
          >
            Test Promotion
          </button>
        )}
      </div>
    </ChessProvider>
  )
}
