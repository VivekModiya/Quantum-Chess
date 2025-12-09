import React, { useCallback, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, OrbitControls } from '@react-three/drei'
import { useMovement } from '../../../hooks/three'

interface MovementControlsProps {
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  onResetView?: (resetFn: () => void) => void
}

export const MovementControls: React.FC<MovementControlsProps> = ({
  isLocked,
  setIsLocked,
  onResetView,
}) => {
  const { camera, gl } = useThree()
  const pointerLockControlsRef = useRef<any>(null)
  const orbitControlsRef = useRef<any>(null)
  const roomObjectsRef = useRef<THREE.Object3D[]>([])

  const [controlMode, setControlMode] = useState<'orbit' | 'fps'>('orbit')

  // Store camera state for seamless transitions
  const cameraStateRef = useRef<{
    position: THREE.Vector3
    rotation: THREE.Euler
    target: THREE.Vector3
  }>({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    target: new THREE.Vector3(0, 0, 0),
  })

  const { updateMovement } = useMovement(pointerLockControlsRef, roomObjectsRef)

  // Track if we're waiting to lock on next click
  const pendingLockRef = useRef(false)

  // Animation state for camera reset
  const animationRef = useRef<{
    isAnimating: boolean
    startPosition: THREE.Vector3
    startTarget: THREE.Vector3
    endPosition: THREE.Vector3
    endTarget: THREE.Vector3
    startTime: number
    duration: number
  } | null>(null)

  // Expose reset view function to parent
  useEffect(() => {
    if (onResetView) {
      const resetView = () => {
        if (orbitControlsRef.current && controlMode === 'orbit') {
          // Start animation from current position to default
          const currentPosition = camera.position.clone()
          const currentTarget = orbitControlsRef.current.target.clone()
          const targetPosition = new THREE.Vector3(0, 900, -900)
          const targetCenter = new THREE.Vector3(0, 0, 0)

          animationRef.current = {
            isAnimating: true,
            startPosition: currentPosition,
            startTarget: currentTarget,
            endPosition: targetPosition,
            endTarget: targetCenter,
            startTime: performance.now(),
            duration: 1000, // 1 second animation
          }
        }
      }
      onResetView(resetView)
    }
  }, [onResetView, camera, controlMode])

  // Handle shift key to toggle between FPS and orbit mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent repeat events when holding the key
      if (event.repeat) return

      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        setControlMode(prevMode => {
          const newMode = prevMode === 'orbit' ? 'fps' : 'orbit'

          if (newMode === 'fps') {
            // Switching to FPS mode
            if (orbitControlsRef.current) {
              cameraStateRef.current.position.copy(camera.position)
              cameraStateRef.current.rotation.copy(camera.rotation)
              cameraStateRef.current.target.copy(
                orbitControlsRef.current.target
              )
            }

            // Try to lock immediately - this works if Shift is considered a user gesture
            const lockPromise = gl.domElement.requestPointerLock()

            // If it fails (returns a promise that rejects), we'll catch it silently
            // and the user will need to click
            if (lockPromise) {
              lockPromise.catch(() => {
                // Pointer lock was blocked, set flag to lock on next click
                pendingLockRef.current = true
              })
            }
          } else {
            // Switching to orbit mode
            cameraStateRef.current.position.copy(camera.position)
            cameraStateRef.current.rotation.copy(camera.rotation)

            // Unlock pointer
            if (pointerLockControlsRef.current) {
              pointerLockControlsRef.current.unlock()
              setIsLocked(false)
            }

            // Restore camera state for orbit mode
            setTimeout(() => {
              if (orbitControlsRef.current) {
                camera.position.copy(cameraStateRef.current.position)
                camera.rotation.copy(cameraStateRef.current.rotation)

                // Calculate target based on camera direction
                const direction = new THREE.Vector3()
                camera.getWorldDirection(direction)
                const distance =
                  cameraStateRef.current.position.distanceTo(
                    cameraStateRef.current.target
                  ) || 5
                orbitControlsRef.current.target.copy(
                  cameraStateRef.current.position
                    .clone()
                    .add(direction.multiplyScalar(distance))
                )

                orbitControlsRef.current.update()
              }
            }, 0)
          }

          return newMode
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [camera, setIsLocked, gl, controlMode])

  // Handle canvas click to activate pointer lock if pending
  useEffect(() => {
    const handleCanvasClick = () => {
      if (controlMode === 'fps' && !isLocked && pendingLockRef.current) {
        gl.domElement.requestPointerLock()
        pendingLockRef.current = false
      }
    }

    gl.domElement.addEventListener('click', handleCanvasClick)

    return () => {
      gl.domElement.removeEventListener('click', handleCanvasClick)
    }
  }, [controlMode, isLocked, gl])

  // Animation loop
  useFrame(() => {
    // Handle camera reset animation
    if (animationRef.current?.isAnimating && orbitControlsRef.current) {
      const animation = animationRef.current
      const elapsed = performance.now() - animation.startTime
      const progress = Math.min(elapsed / animation.duration, 1)

      // Easing function (ease-in-out)
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

      // Interpolate camera position
      camera.position.lerpVectors(
        animation.startPosition,
        animation.endPosition,
        easeProgress
      )

      // Interpolate camera target
      orbitControlsRef.current.target.lerpVectors(
        animation.startTarget,
        animation.endTarget,
        easeProgress
      )

      orbitControlsRef.current.update()

      // Stop animation when complete
      if (progress >= 1) {
        animationRef.current = null
      }
    }

    if (controlMode === 'fps' && isLocked && pointerLockControlsRef.current) {
      updateMovement()
    }
  })

  // Handle pointer lock events for FPS mode
  const handleLock = useCallback(() => {
    setIsLocked(true)
  }, [setIsLocked])

  const handleUnlock = useCallback(() => {
    setIsLocked(false)
  }, [setIsLocked])

  return (
    <>
      {/* OrbitControls - active when in orbit mode */}
      {controlMode === 'orbit' && (
        <OrbitControls
          ref={orbitControlsRef}
          camera={camera}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={100}
        />
      )}

      {/* PointerLockControls - active when in FPS mode */}
      {controlMode === 'fps' && (
        <PointerLockControls
          ref={pointerLockControlsRef}
          camera={camera}
          onLock={handleLock}
          onUnlock={handleUnlock}
        />
      )}
    </>
  )
}

export default MovementControls
