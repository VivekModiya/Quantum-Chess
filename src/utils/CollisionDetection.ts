import * as THREE from 'three'
import type { CollisionBounds } from '../types'

class CollisionDetection {
  private bounds: CollisionBounds = {
    roomRadius: 150,
    roomHeight: 120,
    minHeight: 1,
    collisionDistance: 6,
  }

  private raycaster: THREE.Raycaster = new THREE.Raycaster()

  // Pre-allocated Vector3 pool to avoid per-frame GC pressure
  private _directionToNewPos = new THREE.Vector3()
  private _moveVector = new THREE.Vector3()
  private _testPosX = new THREE.Vector3()
  private _testPosY = new THREE.Vector3()
  private _testPosZ = new THREE.Vector3()
  private _axisVec = new THREE.Vector3()

  public checkCollision(newPosition: THREE.Vector3): boolean {
    // Check cylindrical room boundaries
    const distanceFromCenter = Math.sqrt(
      newPosition.x * newPosition.x + newPosition.z * newPosition.z
    )

    if (
      distanceFromCenter >
      this.bounds.roomRadius - this.bounds.collisionDistance
    ) {
      return true // Hit cylindrical wall
    }

    // Check floor and ceiling boundaries
    if (
      newPosition.y < this.bounds.minHeight ||
      newPosition.y > this.bounds.roomHeight - this.bounds.collisionDistance
    ) {
      return true // Hit floor or ceiling
    }

    return false // No collision with room boundaries
  }

  public checkObjectCollision(
    currentPosition: THREE.Vector3,
    newPosition: THREE.Vector3,
    roomObjects: THREE.Object3D[]
  ): boolean {
    if (!roomObjects || roomObjects.length === 0) return false

    this._directionToNewPos.copy(newPosition).sub(currentPosition).normalize()
    const distance = currentPosition.distanceTo(newPosition)

    this.raycaster.set(currentPosition, this._directionToNewPos)

    // Get all objects that could be collided with
    const collidableObjects: THREE.Mesh[] = []
    roomObjects.forEach(obj => {
      if (obj.traverse) {
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            collidableObjects.push(child)
          }
        })
      } else if (obj instanceof THREE.Mesh) {
        collidableObjects.push(obj)
      }
    })

    const intersects = this.raycaster.intersectObjects(collidableObjects, false)

    return (
      intersects.length > 0 &&
      intersects[0].distance < Math.max(distance, this.bounds.collisionDistance)
    )
  }

  public getValidPosition(
    currentPosition: THREE.Vector3,
    attemptedPosition: THREE.Vector3,
    roomObjects: THREE.Object3D[]
  ): THREE.Vector3 {
    // First check if the attempted position is valid
    if (
      !this.checkCollision(attemptedPosition) &&
      !this.checkObjectCollision(
        currentPosition,
        attemptedPosition,
        roomObjects
      )
    ) {
      return attemptedPosition
    }

    // Try moving in individual axes to allow sliding along walls
    this._moveVector.copy(attemptedPosition).sub(currentPosition)

    const testPositions = [
      this._testPosX
        .copy(currentPosition)
        .add(this._axisVec.set(this._moveVector.x, 0, 0)), // X only
      this._testPosY
        .copy(currentPosition)
        .add(this._axisVec.set(0, this._moveVector.y, 0)), // Y only
      this._testPosZ
        .copy(currentPosition)
        .add(this._axisVec.set(0, 0, this._moveVector.z)), // Z only
    ]

    for (const testPos of testPositions) {
      if (
        !this.checkCollision(testPos) &&
        !this.checkObjectCollision(currentPosition, testPos, roomObjects)
      ) {
        return testPos
      }
    }

    // If no movement is possible, return current position
    return currentPosition
  }
}

export default CollisionDetection
