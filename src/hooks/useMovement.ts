import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import CollisionDetection from '../utils/CollisionDetection'
import PointerLockControls from '../utils/PointerLockControls'
import type { MovementState } from '../types'

const useMovement = (
  controlsRef: React.MutableRefObject<PointerLockControls | null>,
  roomObjectsRef: React.MutableRefObject<THREE.Object3D[]>
) => {
  const movementRef = useRef<MovementState>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  })

  const prevTimeRef = useRef<number>(performance.now())
  const collisionDetection = useRef(new CollisionDetection())

  const onKeyDown = useCallback((event: KeyboardEvent): void => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        movementRef.current.moveForward = true
        break
      case 'KeyA':
      case 'ArrowLeft':
        movementRef.current.moveLeft = true
        break
      case 'KeyS':
      case 'ArrowDown':
        movementRef.current.moveBackward = true
        break
      case 'KeyD':
      case 'ArrowRight':
        movementRef.current.moveRight = true
        break
      case 'KeyQ':
        movementRef.current.moveUp = true
        break
      case 'KeyE':
        movementRef.current.moveDown = true
        break
    }
  }, [])

  const onKeyUp = useCallback((event: KeyboardEvent): void => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        movementRef.current.moveForward = false
        break
      case 'KeyA':
      case 'ArrowLeft':
        movementRef.current.moveLeft = false
        break
      case 'KeyS':
      case 'ArrowDown':
        movementRef.current.moveBackward = false
        break
      case 'KeyD':
      case 'ArrowRight':
        movementRef.current.moveRight = false
        break
      case 'KeyQ':
        movementRef.current.moveUp = false
        break
      case 'KeyE':
        movementRef.current.moveDown = false
        break
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, false)
    document.addEventListener('keyup', onKeyUp, false)

    return () => {
      document.removeEventListener('keydown', onKeyDown, false)
      document.removeEventListener('keyup', onKeyUp, false)
    }
  }, [onKeyDown, onKeyUp])

  const updateMovement = useCallback((): void => {
    if (!controlsRef.current) {
      console.log('Canceled')
      return
    }

    const time = performance.now()
    const delta = (time - prevTimeRef.current) / 1000

    const controls = controlsRef.current
    const movement = movementRef.current

    // Get the camera's forward direction
    const cameraDirection = new THREE.Vector3()
    controls.getDirection(cameraDirection)

    // Get the camera's right direction
    const cameraRight = new THREE.Vector3()
    cameraRight
      .crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))
      .normalize()

    // Calculate movement based on camera orientation
    const moveVector = new THREE.Vector3()

    if (movement.moveForward || movement.moveBackward) {
      const forwardMultiplier = movement.moveForward ? 1 : -1
      moveVector.add(
        cameraDirection.clone().multiplyScalar(forwardMultiplier * 75.0 * delta)
      )
    }

    if (movement.moveLeft || movement.moveRight) {
      const rightMultiplier = movement.moveRight ? 1 : -1
      moveVector.add(
        cameraRight.clone().multiplyScalar(rightMultiplier * 75.0 * delta)
      )
    }

    // Vertical movement (Q/E keys)
    if (movement.moveUp || movement.moveDown) {
      const verticalMultiplier = movement.moveUp ? 1 : -1
      moveVector.y += verticalMultiplier * 75.0 * delta
    }

    // Get current position and calculate new position
    const currentPosition = controls.getObject().position.clone()
    const attemptedPosition = currentPosition.clone().add(moveVector)

    // Use collision detection to get valid position
    const validPosition = collisionDetection.current.getValidPosition(
      currentPosition,
      attemptedPosition,
      roomObjectsRef.current
    )

    controlsRef.current.getObject().position.copy(validPosition)
    prevTimeRef.current = time
  }, [])

  return { updateMovement }
}

export default useMovement
