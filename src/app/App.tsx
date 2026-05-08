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
import { GameIntroAnimation } from '../components/game/GameIntroAnimation/GameIntroAnimation'
import { CubeLoader } from '../components/ui/Loading/CubeLoader'

// Fires onReady once after Suspense resolves (assets loaded)
const SceneReady: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const called = React.useRef(false)
  React.useEffect(() => {
    if (!called.current) {
      called.current = true
      onReady()
    }
  }, [onReady])
  return null
}

export const App = () => {
  const [isLocked, setIsLocked] = React.useState<boolean>(false)
  const [isPromotionOpen, setIsPromotionOpen] = React.useState(false)
  const [isIntroPlaying, setIsIntroPlaying] = React.useState(false)
  const [sceneReady, setSceneReady] = React.useState(false)
  const introDecidedRef = React.useRef(false)
  const resetViewRef = React.useRef<(() => void) | null>(null)

  const pubSub = usePubSub()

  const { playerColor, gameMode, timers, gameState } = useSocket()

  // Determine camera role
  const cameraRole: CameraRole =
    gameMode === 'spectator' ? 'spectator' : (playerColor ?? 'white')
  const initialPosition = getCameraPosition(cameraRole)

  // Camera config with player-specific position
  const playerCameraConfig = {
    fov: 25,
    near: 1,
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

  // Decide whether to play intro animation on first gameState arrival
  React.useEffect(() => {
    if (introDecidedRef.current || !gameState) return
    introDecidedRef.current = true
    if (gameState.moves.length === 0) {
      setIsIntroPlaying(true)
    }
  }, [gameState])

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
          camera={{ ...playerCameraConfig, zoom: 1 }}
          gl={renderConfig}
          shadows={shadowConfig}
          style={{ background: 'transparent' }}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
        >
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
              animating={isIntroPlaying}
            />
            {isIntroPlaying && (
              <GameIntroAnimation
                initialPosition={initialPosition}
                onComplete={() => setIsIntroPlaying(false)}
              />
            )}
            <PawnPromotion3D />
            <SceneReady onReady={() => setSceneReady(true)} />
          </Suspense>
        </Canvas>
        {!sceneReady && <CubeLoader />}
        <Instructions
          isVisible={true}
          isFPPMode={isLocked}
          onResetView={handleResetView}
        />
        <Crosshair isVisible={isLocked} />
        <Settings />
        <GameOverDialog />
        <GameControls />
        {/* Test promotion button — commented out, uncomment for manual testing
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
        */}
      </div>
    </ChessProvider>
  )
}
