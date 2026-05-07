import { Piece } from '../types/chess'

export const PIECE_COLOR_RGB: Record<'white' | 'black', string> = {
  white: '#c5ba9c',
  black: '#5a3b00',
}

export const PIECE_EMISSIVE: Record<
  'white' | 'black',
  { color: string; intensity: number }
> = {
  white: { color: '#ffffff', intensity: 0 },
  black: { color: '#ff9b2f', intensity: 0 },
}

// Board geometry & visual config
export const BOARD = {
  SIZE: 80,
  Y_OFFSET: 2.9,
  SQUARE_COLORS: { light: '#ffffff', dark: '#000000' },
  BORDER_COLOR: '#ffffff',
  BASE_COLOR: '#9d9d9d',
  FRAME_COLOR: '#000000',
} as const

// Highlight overlay colors & alphas per highlight type
export const HIGHLIGHT_COLORS = {
  selected: { color: '#a07b00', alpha: 0.5 },
  move: { color: '#743800bc', alpha: 1 },
  capture: { color: '#4b4997', alpha: 0.5 },
  lastMove: { color: '#9f7a00', alpha: 0.4 },
  check: { color: '#e30000df', alpha: 1 },
} as const

// Fresnel rim shader config
export const PIECE_RIM = {
  color: { white: '#a0a0a0', black: '#ffffff' } as Record<
    'white' | 'black',
    string
  >,
  power: 0.1,
} as const

// Hover pulse & fade animation config
export const PIECE_HOVER_ANIM = {
  pulseSpeed: 3,
  pulseMin: 0.05,
  pulseAmp: 0.15,
  sinFreq: 1.5,
  fadeSpeed: 6,
  snapThreshold: 0.0005,
  emissiveScale: 1,
} as const

// Default piece material properties
export const PIECE_MATERIAL = {
  metalness: 0.5,
  roughness: 0.9,
  displacementScale: 0.0,
  textureRepeat: 0,
} as const

// 3D clock display config
export const CLOCK_CONFIG = {
  activeColor: '#d40000',
  idleColor: '#ffffff',
  bgColor: '#192761',
  emissiveIntensity: 0.3,
  opacity: 0.5,
} as const

export const DEFAULT_CHESS_POSITION: Record<string, Piece> = {
  a1: { type: 'rook', color: 'white' },
  b1: { type: 'knight', color: 'white' },
  c1: { type: 'bishop', color: 'white' },
  d1: { type: 'queen', color: 'white' },
  e1: { type: 'king', color: 'white' },
  f1: { type: 'bishop', color: 'white' },
  g1: { type: 'knight', color: 'white' },
  h1: { type: 'rook', color: 'white' },

  a2: { type: 'pawn', color: 'white' },
  b2: { type: 'pawn', color: 'white' },
  c2: { type: 'pawn', color: 'white' },
  d2: { type: 'pawn', color: 'white' },
  e2: { type: 'pawn', color: 'white' },
  f2: { type: 'pawn', color: 'white' },
  g2: { type: 'pawn', color: 'white' },
  h2: { type: 'pawn', color: 'white' },

  a7: { type: 'pawn', color: 'black' },
  b7: { type: 'pawn', color: 'black' },
  c7: { type: 'pawn', color: 'black' },
  d7: { type: 'pawn', color: 'black' },
  e7: { type: 'pawn', color: 'black' },
  f7: { type: 'pawn', color: 'black' },
  g7: { type: 'pawn', color: 'black' },
  h7: { type: 'pawn', color: 'black' },

  a8: { type: 'rook', color: 'black' },
  b8: { type: 'knight', color: 'black' },
  c8: { type: 'bishop', color: 'black' },
  d8: { type: 'queen', color: 'black' },
  e8: { type: 'king', color: 'black' },
  f8: { type: 'bishop', color: 'black' },
  g8: { type: 'knight', color: 'black' },
  h8: { type: 'rook', color: 'black' },
}

export const FILE_TO_INDEX: Record<string, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
}

export const INDEX_TO_FILE: Record<number, string> = {
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'h',
}

// Direction vectors for different piece types
export const DIRECTIONS = {
  ORTHOGONAL: [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ] as const,
  DIAGONAL: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as const,
  KNIGHT: [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ] as const,
  KING: [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ] as const,
} as const

export const PIECE_SQUARE_MAP = {
  // White pawns
  pw1: 'a2',
  pw2: 'b2',
  pw3: 'c2',
  pw4: 'd2',
  pw5: 'e2',
  pw6: 'f2',
  pw7: 'g2',
  pw8: 'h2',

  // Black pawns
  pb1: 'a7',
  pb2: 'b7',
  pb3: 'c7',
  pb4: 'd7',
  pb5: 'e7',
  pb6: 'f7',
  pb7: 'g7',
  pb8: 'h7',

  // White pieces
  rw1: 'a1', // rook
  nw1: 'b1', // knight
  bw1: 'c1', // bishop
  qw: 'd1', // queen
  kw: 'e1', // king
  bw2: 'f1',
  nw2: 'g1',
  rw2: 'h1',

  // Black pieces
  rb1: 'a8', // rook
  nb1: 'b8', // knight
  bb1: 'c8', // bishop
  qb: 'd8', // queen
  kb: 'e8', // king
  bb2: 'f8',
  nb2: 'g8',
  rb2: 'h8',
}

export const SQUARE_PIECE_MAP = Object.fromEntries(
  Object.entries(PIECE_SQUARE_MAP).map(([p, s]) => [s, p])
)

export const SQUARE_SIZE = 10
