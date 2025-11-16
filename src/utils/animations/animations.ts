import gsap from 'gsap'
import { parseSquare } from '../calculations/calculate'
import { SQUARE_SIZE } from '../../constants/chess'
import { Callback } from '../../hooks'

// Assume pieces start at y=0 and scale=1 (adjust these defaults as needed)

const LIFTED_Y_OFFSET = 3

export function liftPiece(piece?: THREE.Object3D | null) {
  if (!piece) return
  gsap.killTweensOf([piece.position, piece.scale])

  gsap.to(piece.position, {
    y: piece.position.y + LIFTED_Y_OFFSET,
    duration: 0.3,
    ease: 'power1.out',
  })
}

export function lowerPiece(piece?: THREE.Object3D | null) {
  if (!piece) return

  gsap.killTweensOf([piece.position, piece.scale])

  gsap.to(piece.position, {
    y: piece.position.y - LIFTED_Y_OFFSET,
    duration: 0.3,
    ease: 'power1.out',
  })
}

export function animatePieceMove(args: {
  pieceObject?: THREE.Object3D | null
  fromSquare?: string | null
  toSquare?: string | null
  onComplete: Callback
}) {
  const { toSquare, fromSquare, pieceObject, onComplete } = args
  if (!pieceObject || !fromSquare || !toSquare) {
    return
  }
  const [startCol, startRow] = parseSquare(fromSquare)
  const [endCol, endRow] = parseSquare(toSquare)

  const dx = -(endCol - startCol) * SQUARE_SIZE
  const dz = (endRow - startRow) * SQUARE_SIZE

  gsap.killTweensOf(pieceObject.position)

  // Step 1: Lift the piece up
  gsap.to(pieceObject.position, {
    x: pieceObject.position.x + dx,
    z: pieceObject.position.z + dz,
    y: pieceObject.position.y + LIFTED_Y_OFFSET,
    duration: 0.4,
    ease: 'power1.inOut',
    onComplete: () => {
      // Step 3: Lower the piece down
      gsap.to(pieceObject.position, {
        y: pieceObject.position.y - LIFTED_Y_OFFSET,
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => onComplete({}),
      })
    },
  })
}
