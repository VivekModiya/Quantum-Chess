import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SceneLighting, Skybox } from '../index'
import { ShowcaseBoard } from './ShowcaseBoard'
import { assetUrl } from '../../utils'
import styles from './index.module.scss'

// Notifies parent when Suspense content has mounted (assets loaded)
const LoadFence: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const called = useRef(false)
  React.useEffect(() => {
    if (!called.current) {
      called.current = true
      onReady()
    }
  }, [onReady])
  return null
}

// Camera tour component that animates around the board
const CameraTour: React.FC<{ onTourComplete: () => void }> = ({
  onTourComplete,
}) => {
  const { camera } = useThree()
  const startTime = useRef<number>(Date.now())
  const tourComplete = useRef<boolean>(false)

  useFrame(() => {
    if (tourComplete.current) return

    const elapsed = (Date.now() - startTime.current) / 1000
    const duration = 3 // 3 seconds

    if (elapsed >= duration) {
      tourComplete.current = true
      onTourComplete()
      return
    }

    // Smooth progress from 0 to 1
    const t = elapsed / duration
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // cubic ease-in-out

    // Start high and far, move closer to showcase the board
    const radius = 120 - eased * 40 // From 120 to 80
    const height = 100 - eased * 20 // From 100 to 80
    const angle = eased * Math.PI * 1.5 // 270 degree rotation

    // Camera path showcasing different angles
    camera.position.x = Math.cos(angle) * radius
    camera.position.z = Math.sin(angle) * radius
    camera.position.y = height

    // Always look at the center of the board with slight offset
    camera.lookAt(0, 0, 0)
  })

  return null
}

const StaticCamera: React.FC = () => {
  const { camera } = useThree()

  React.useEffect(() => {
    camera.position.set(0, 80, 80)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Showcase scene with initial chess setup
const ShowcaseScene: React.FC<{
  onTourComplete: () => void
  onAssetsReady: () => void
  playTour: boolean
}> = ({ onTourComplete, onAssetsReady, playTour }) => {
  // Preload chess piece models
  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(assetUrl(`models/${piece}.glb`))
    })
  }, [])

  return (
    <>
      <LoadFence onReady={onAssetsReady} />
      {playTour ? (
        <CameraTour onTourComplete={onTourComplete} />
      ) : (
        <StaticCamera />
      )}
      <Sky
        distance={450000}
        sunPosition={[120, 120, 120]}
        inclination={0.5}
        azimuth={0.3}
        turbidity={8}
      />
      <Skybox />
      <SceneLighting />
      <ShowcaseBoard position={[0, 0, 0]} />
    </>
  )
}

interface OnboardingShowcaseProps {
  onShowcaseComplete: () => void
  playTour?: boolean
  showOverlay?: boolean
}

export const OnboardingShowcase: React.FC<OnboardingShowcaseProps> = ({
  onShowcaseComplete,
  playTour = true,
  showOverlay = true,
}) => {
  const [assetsLoaded, setAssetsLoaded] = React.useState(false)

  const handleTourComplete = () => {
    if (!playTour) return
    setTimeout(() => {
      onShowcaseComplete()
    }, 300)
  }

  const handleAssetsReady = React.useCallback(() => {
    setAssetsLoaded(true)
  }, [])

  return (
    <div className={styles.showcaseContainer}>
      <Canvas
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [120, 100, 120],
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        shadows={{
          enabled: true,
          type: THREE.PCFSoftShadowMap,
        }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100vh',
        }}
        performance={{ min: 0.5 }}
        dpr={[1, 2]}
      >
        <React.Suspense fallback={null}>
          <ShowcaseScene
            onTourComplete={handleTourComplete}
            onAssetsReady={handleAssetsReady}
            playTour={playTour}
          />
        </React.Suspense>
      </Canvas>

      {/* Standard loading spinner — only visible while assets load */}
      {showOverlay && !assetsLoaded && (
        <div className={styles.showcaseOverlay}>
          <div className={styles.loader}>
            <div className={styles.spinnerRing} />
          </div>
        </div>
      )}
    </div>
  )
}
