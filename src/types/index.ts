import * as THREE from 'three'
import PointerLockControls from '../utils/PointerLockControls'

export interface MovementState {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  moveUp: boolean
  moveDown: boolean
}

export interface CollisionBounds {
  roomRadius: number
  roomHeight: number
  minHeight: number
  collisionDistance: number
}

export interface PointerLockCallbacks {
  onLockChange?: (isLocked: boolean) => void
  onLockError?: () => void
}

export interface SceneRefs {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  controls: PointerLockControls | null
  roomObjects: THREE.Object3D[]
}

export interface UIProps {
  isVisible?: boolean
  isLocked?: boolean
  onStart?: () => void
}

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'

export type PromotablePiece = 'queen' | 'knight' | 'rook' | 'bishop'

export type PieceColor = 'white' | 'black'

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  position: THREE.Vector3
}
