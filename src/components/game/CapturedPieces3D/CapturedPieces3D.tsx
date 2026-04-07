import React from 'react'

import { useChess } from '../../../provider'
import { BoardPiece, PieceColor, PieceType } from '../../../types'
import { PieceModel } from '../Pieces/PieceModel'

// Both groups sit beside the board at the same X offset, one row each.
// Black's side is negative Z (ranks 7-8), white's side is positive Z (ranks 1-2).
// black-captured pieces (taken by white) are placed near white's side: positive Z.
// white-captured pieces (taken by black) are placed near black's side: negative Z.
const BOARD_SURFACE_Y = 2.55
const GROUP_X = -49 // just beyond the board frame edge (-46)

const PIECES_PER_ROW = 8
const ROW_STEP_X = -5 // wrap to next column further from the board

// black-captured row: starts at positive Z (white's side, rank 1 area)
const BLACK_CAPTURED_Z_START = 40
// white-captured row: starts at negative Z (black's side, rank 8 area)
const WHITE_CAPTURED_Z_START = -40

const Z_SPACING = 5

const PIECE_ORDER: PieceType[] = ['pawn', 'bishop', 'knight', 'rook', 'queen']

const CAPTURED_PIECE_SCALE = 0.7

function getPieceRotation(color: PieceColor, piece: PieceType): number {
  if (color === 'black' && piece === 'knight') return Math.PI
  if (piece === 'bishop') return color === 'black' ? Math.PI / 2 : -Math.PI / 2
  return 0
}

// Single shelf spanning both capture areas
const SHELF_Z_LENGTH =
  Math.abs(BLACK_CAPTURED_Z_START - WHITE_CAPTURED_Z_START) +
  PIECES_PER_ROW * Z_SPACING -
  28

const CaptureShelf: React.FC = () => {
  return (
    <mesh position={[GROUP_X - 1, 2.4, 0]} renderOrder={10}>
      <boxGeometry args={[Math.abs(ROW_STEP_X) * 3, 0.1, SHELF_Z_LENGTH]} />
      <meshStandardMaterial
        color={'#192761'}
        emissive={'#000000'}
        emissiveIntensity={0.3}
        opacity={0.5}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  )
}

function computePosition(
  index: number,
  zStart: number,
  zDirection: 1 | -1
): [number, number, number] {
  const col = Math.floor(index / PIECES_PER_ROW)
  const row = index % PIECES_PER_ROW
  const x = GROUP_X + col * ROW_STEP_X
  const z = zStart - row * Z_SPACING * zDirection
  return [x, BOARD_SURFACE_Y, z]
}

export const CapturedPieces3D: React.FC = () => {
  const { capturedPieces } = useChess()

  // whiteCaptured: black pieces taken by the white player
  // blackCaptured: white pieces taken by the black player
  const whiteCaptured: BoardPiece[] = []
  const blackCaptured: BoardPiece[] = []

  capturedPieces.forEach(p => {
    if (p.color === 'white') {
      blackCaptured.push(p)
    } else {
      whiteCaptured.push(p)
    }
  })

  const sortedWhiteCaptured = [...whiteCaptured].sort(
    (a, b) => PIECE_ORDER.indexOf(a.piece) - PIECE_ORDER.indexOf(b.piece)
  )
  const sortedBlackCaptured = [...blackCaptured].sort(
    (a, b) => PIECE_ORDER.indexOf(a.piece) - PIECE_ORDER.indexOf(b.piece)
  )

  return (
    <group>
      <CaptureShelf />
      {sortedWhiteCaptured.map((p, i) => {
        const pos = computePosition(i, WHITE_CAPTURED_Z_START, -1)
        return (
          <PieceModel
            key={`white-captured-${i}-${p.piece}`}
            color={p.color}
            piece={p.piece}
            boardX={pos[0]}
            boardZ={pos[2]}
            pieceRotation={getPieceRotation(p.color, p.piece)}
            scale={CAPTURED_PIECE_SCALE}
            interactive={false}
            showRim={true}
          />
        )
      })}
      {sortedBlackCaptured.map((p, i) => {
        const pos = computePosition(i, BLACK_CAPTURED_Z_START, 1)
        return (
          <PieceModel
            key={`black-captured-${i}-${p.piece}`}
            color={p.color}
            piece={p.piece}
            boardX={pos[0]}
            boardZ={pos[2]}
            pieceRotation={getPieceRotation(p.color, p.piece)}
            scale={CAPTURED_PIECE_SCALE}
            interactive={false}
            showRim={true}
          />
        )
      })}
    </group>
  )
}
