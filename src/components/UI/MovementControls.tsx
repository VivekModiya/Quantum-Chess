import React, { useCallback, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, OrbitControls } from '@react-three/drei'
import useMovement from '../../hooks/useMovement'

interface MovementControlsProps {
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
}

export const MovementControls: React.FC<MovementControlsProps> = ({
  isLocked,
  setIsLocked,
}) => {
  const { camera } = useThree()
  const pointerLockControlsRef = useRef<any>(null)
  const orbitControlsRef = useRef<any>(null)
  const roomObjectsRef = useRef<THREE.Object3D[]>([])

  const [controlMode, setControlMode] = useState<'orbit' | 'fps'>('orbit')
  const [isShiftPressed, setIsShiftPressed] = useState(false)

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

  // Handle shift key for immediate mode switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        if (!isShiftPressed) {
          // Only trigger on first press
          setIsShiftPressed(true)

          // Save current camera state before switching to FPS
          if (orbitControlsRef.current) {
            cameraStateRef.current.position.copy(camera.position)
            cameraStateRef.current.rotation.copy(camera.rotation)
            cameraStateRef.current.target.copy(orbitControlsRef.current.target)
          }

          setControlMode('fps')
          // Immediately lock pointer when Shift is pressed
          setTimeout(() => {
            if (pointerLockControlsRef.current) {
              pointerLockControlsRef.current.lock()
              setIsLocked(true)
            }
          }, 0)
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        setIsShiftPressed(false)

        // Save current camera state before switching to orbit
        cameraStateRef.current.position.copy(camera.position)
        cameraStateRef.current.rotation.copy(camera.rotation)

        // Immediately return to orbit mode when Shift is released
        setControlMode('orbit')
        if (pointerLockControlsRef.current) {
          pointerLockControlsRef.current.unlock()
          setIsLocked(false)
        }

        // Restore camera state after switching to orbit
        setTimeout(() => {
          if (orbitControlsRef.current) {
            camera.position.copy(cameraStateRef.current.position)
            camera.rotation.copy(cameraStateRef.current.rotation)

            // Calculate target based on camera direction to maintain view direction
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
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [isShiftPressed, camera])

  // Animation loop
  useFrame(() => {
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
