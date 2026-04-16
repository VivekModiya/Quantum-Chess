import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SceneLighting, Skybox } from '../index'
import { ShowcaseBoard } from './ShowcaseBoard'
import { assetUrl } from '../../utils'
import styles from './index.module.scss'

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

// Showcase scene with initial chess setup
const ShowcaseScene: React.FC<{ onTourComplete: () => void }> = ({
  onTourComplete,
}) => {
  // Preload chess piece models
  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(assetUrl(`models/${piece}.glb`))
    })
  }, [])

  return (
    <>
      <CameraTour onTourComplete={onTourComplete} />
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
      {/* Simplified board without chess pieces for smooth showcase experience */}
    </>
  )
}

interface OnboardingShowcaseProps {
  onShowcaseComplete: () => void
}

export const OnboardingShowcase: React.FC<OnboardingShowcaseProps> = ({
  onShowcaseComplete,
}) => {
  const [tourComplete, setTourComplete] = React.useState(false)

  const handleTourComplete = () => {
    setTourComplete(true)
    // Small delay before showing dialog for smooth transition
    setTimeout(() => {
      onShowcaseComplete()
    }, 300)
  }

  return (
    <div className={styles.showcaseContainer}>
      <Canvas
        camera={{
          fov: 60,
          near: 0.1,
          far: 1000,
          position: [120, 100, 120], // Starting position
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
          <ShowcaseScene onTourComplete={handleTourComplete} />
        </React.Suspense>
      </Canvas>

      {/* Overlay text during showcase */}
      <div
        className={`${styles.showcaseOverlay} ${tourComplete ? styles.fadeOut : ''}`}
      >
        <div className={styles.welcomeText}>
          <h1 className={styles.title}>Welcome to 3D Chess</h1>
          <p className={styles.subtitle}>
            Preparing your magical chess experience...
          </p>
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
