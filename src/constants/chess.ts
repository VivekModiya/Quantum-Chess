import { Piece } from '../utils/Chess';

export const DEFAULT_CHESS_POSITION: Record<string, Piece> = {
    a1: { type: 'rook', color: 'white' },
    a2: { type: 'bishop', color: 'white' },
    a3: { type: 'knight', color: 'white' },
    a4: { type: 'queen', color: 'white' },
    a5: { type: 'king', color: 'white' },
    a6: { type: 'knight', color: 'white' },
    a7: { type: 'bishop', color: 'white' },
    a8: { type: 'rook', color: 'white' },

    b1: { type: 'pawn', color: 'white' },
    b2: { type: 'pawn', color: 'white' },
    b3: { type: 'pawn', color: 'white' },
    b4: { type: 'pawn', color: 'white' },
    b5: { type: 'pawn', color: 'white' },
    b6: { type: 'pawn', color: 'white' },
    b7: { type: 'pawn', color: 'white' },
    b8: { type: 'pawn', color: 'white' },

    g1: { type: 'pawn', color: 'black' },
    g2: { type: 'pawn', color: 'black' },
    g3: { type: 'pawn', color: 'black' },
    g4: { type: 'pawn', color: 'black' },
    g5: { type: 'pawn', color: 'black' },
    g6: { type: 'pawn', color: 'black' },
    g7: { type: 'pawn', color: 'black' },
    g8: { type: 'pawn', color: 'black' },

    h1: { type: 'rook', color: 'black' },
    h2: { type: 'bishop', color: 'black' },
    h3: { type: 'knight', color: 'black' },
    h4: { type: 'queen', color: 'black' },
    h5: { type: 'king', color: 'black' },
    h6: { type: 'knight', color: 'black' },
    h7: { type: 'bishop', color: 'black' },
    h8: { type: 'rook', color: 'black' },
};

export const FILE_TO_INDEX: Record<string, number> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
};

export const INDEX_TO_FILE: Record<number, string> = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
    4: 'e',
    5: 'f',
    6: 'g',
    7: 'h',
};

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
} as const;
