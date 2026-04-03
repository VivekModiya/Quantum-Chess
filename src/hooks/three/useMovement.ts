import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import CollisionDetection from '../../utils/CollisionDetection'
import PointerLockControls from '../../utils/PointerLockControls'
import type { MovementState } from '../../types'

interface ExtendedMovementState extends MovementState {
  isFlying: boolean
}

export const useMovement = (
  controlsRef: React.MutableRefObject<PointerLockControls | null>,
  roomObjectsRef: React.MutableRefObject<THREE.Object3D[]>
) => {
  const movementRef = useRef<ExtendedMovementState>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    isFlying: false,
  })

  const prevTimeRef = useRef<number>(performance.now())
  const collisionDetection = useRef(new CollisionDetection())

  // Pre-allocated Vector3 pool to avoid per-frame GC pressure
  const _cameraDirection = useRef(new THREE.Vector3())
  const _cameraRight = useRef(new THREE.Vector3())
  const _upVector = useRef(new THREE.Vector3(0, 1, 0))
  const _moveVector = useRef(new THREE.Vector3())
  const _horizontalDir = useRef(new THREE.Vector3())
  const _tempVec = useRef(new THREE.Vector3())

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
      case 'ShiftLeft':
      case 'ShiftRight':
        movementRef.current.isFlying = true
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
      case 'ShiftLeft':
      case 'ShiftRight':
        movementRef.current.isFlying = false
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

    // Reuse pre-allocated Vector3 instances
    const cameraDirection = _cameraDirection.current
    controls.getDirection(cameraDirection)

    const cameraRight = _cameraRight.current
    cameraRight.crossVectors(cameraDirection, _upVector.current).normalize()

    const moveVector = _moveVector.current.set(0, 0, 0)
    const moveSpeed = 75.0

    if (movement.moveForward || movement.moveBackward) {
      const forwardMultiplier = movement.moveForward ? 1 : -1

      if (movement.isFlying) {
        // In fly mode, move in the exact direction the camera is looking (including pitch)
        _tempVec.current
          .copy(cameraDirection)
          .multiplyScalar(forwardMultiplier * moveSpeed * delta)
        moveVector.add(_tempVec.current)
      } else {
        // In ground mode, move only in horizontal plane
        const horizontalDirection = _horizontalDir.current.copy(cameraDirection)
        horizontalDirection.y = 0
        horizontalDirection.normalize()
        moveVector.add(
          horizontalDirection.multiplyScalar(
            forwardMultiplier * moveSpeed * delta
          )
        )
      }
    }

    if (movement.moveLeft || movement.moveRight) {
      const rightMultiplier = movement.moveRight ? 1 : -1
      _tempVec.current
        .copy(cameraRight)
        .multiplyScalar(rightMultiplier * moveSpeed * delta)
      moveVector.add(_tempVec.current)
    }

    // Vertical movement (Q/E keys) - works in both modes
    if (movement.moveUp || movement.moveDown) {
      const verticalMultiplier = movement.moveUp ? 1 : -1
      moveVector.y += verticalMultiplier * moveSpeed * delta
    }

    // Get current position and calculate new position
    const currentPosition = controls.getObject().position
    // Use _tempVec for attemptedPosition
    const attemptedPosition = _tempVec.current
      .copy(currentPosition)
      .add(moveVector)

    let validPosition: THREE.Vector3

    if (movement.isFlying) {
      // In fly mode, allow free movement without ground collision
      validPosition = attemptedPosition
    } else {
      // In ground mode, use collision detection
      validPosition = collisionDetection.current.getValidPosition(
        currentPosition,
        attemptedPosition,
        roomObjectsRef.current
      )
    }

    controlsRef.current.getObject().position.copy(validPosition)
    prevTimeRef.current = time
  }, [])

  const getMovementState = useCallback(() => {
    return {
      isFlying: movementRef.current.isFlying,
      hasMovement: Object.values(movementRef.current).some(
        (value, index) => index < 6 && value // Check only movement booleans, not isFlying
      ),
    }
  }, [])

  return { updateMovement, getMovementState }
}

export default useMovement
