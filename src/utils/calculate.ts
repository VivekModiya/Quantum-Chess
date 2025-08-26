import { DIRECTIONS, FILE_TO_INDEX, INDEX_TO_FILE } from '../constants/chess';
import { PieceColor, PieceType } from '../types';
import { Piece } from './Chess';

// Utility functions
export const isValidSquare = (file: number, rank: number): boolean =>
    file >= 0 && file <= 7 && rank >= 0 && rank <= 7;

export const parseSquare = (square: string): [number, number] => [
    FILE_TO_INDEX[square[0]],
    parseInt(square[1]) - 1,
];

export const formatSquare = (file: number, rank: number): string =>
    `${INDEX_TO_FILE[file]}${rank + 1}`;

export const squareToCoords = (square: string): [number, number] =>
    parseSquare(square);
export const coordsToSquare = (file: number, rank: number): string =>
    formatSquare(file, rank);

// Core movement generation
interface MoveGenerationOptions {
    includeBlocked?: boolean;
    maxDistance?: number;
    capturesOnly?: boolean;
}

const generateDirectionalMoves = (
    file: number,
    rank: number,
    directions: readonly (readonly [number, number])[],
    board: Map<string, Piece | null>,
    piece: Piece,
    options: MoveGenerationOptions = {}
): string[] => {
    const moves: string[] = [];
    const { maxDistance = 8 } = options;

    for (const [df, dr] of directions) {
        let currentFile = file;
        let currentRank = rank;
        let distance = 0;

        while (distance < maxDistance) {
            currentFile += df;
            currentRank += dr;
            distance++;

            if (isValidSquare(currentFile, currentRank) === false) break;

            const targetSquare = formatSquare(currentFile, currentRank);
            const targetPiece = board.get(targetSquare);

            if (targetPiece) {
                // Square is occupied
                if (targetPiece.color !== piece.color) {
                    moves.push(targetSquare);
                }
                // Can't move further in this direction
                break;
            } else {
                // Empty square
                moves.push(targetSquare);
            }
        }
    }

    return moves;
};

// Piece-specific move generators
export const generatePawnMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    const moves: string[] = [];
    const direction = piece.color === 'white' ? 1 : -1;
    const startRank = piece.color === 'white' ? 1 : 6;

    // Forward moves
    const oneSquareForward = rank + direction;
    if (isValidSquare(file, oneSquareForward)) {
        const oneSquareSquare = formatSquare(file, oneSquareForward);
        if (!board.get(oneSquareSquare)) {
            moves.push(oneSquareSquare);

            // Two squares forward from starting position
            if (rank === startRank) {
                const twoSquareForward = rank + 2 * direction;
                if (isValidSquare(file, twoSquareForward)) {
                    const twoSquareSquare = formatSquare(
                        file,
                        twoSquareForward
                    );
                    if (!board.get(twoSquareSquare)) {
                        moves.push(twoSquareSquare);
                    }
                }
            }
        }
    }

    // Captures
    for (const captureFile of [file - 1, file + 1]) {
        const captureRank = rank + direction;
        if (isValidSquare(captureFile, captureRank)) {
            const captureSquare = formatSquare(captureFile, captureRank);
            const targetPiece = board.get(captureSquare);
            if (targetPiece && targetPiece.color !== piece.color) {
                moves.push(captureSquare);
            }
        }
    }

    return moves;
};

export const generateKnightMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    return generateDirectionalMoves(
        file,
        rank,
        DIRECTIONS.KNIGHT,
        board,
        piece,
        { maxDistance: 1 }
    );
};

export const generateBishopMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    return generateDirectionalMoves(
        file,
        rank,
        DIRECTIONS.DIAGONAL,
        board,
        piece
    );
};

export const generateRookMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    return generateDirectionalMoves(
        file,
        rank,
        DIRECTIONS.ORTHOGONAL,
        board,
        piece
    );
};

export const generateQueenMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    const orthogonalMoves = generateDirectionalMoves(
        file,
        rank,
        DIRECTIONS.ORTHOGONAL,
        board,
        piece
    );
    const diagonalMoves = generateDirectionalMoves(
        file,
        rank,
        DIRECTIONS.DIAGONAL,
        board,
        piece
    );
    return [...orthogonalMoves, ...diagonalMoves];
};

export const generateKingMoves = (
    square: string,
    board: Map<string, Piece | null>,
    piece: Piece
): string[] => {
    const [file, rank] = parseSquare(square);
    return generateDirectionalMoves(file, rank, DIRECTIONS.KING, board, piece, {
        maxDistance: 1,
    });
};

// Main move generation function
export const generatePossibleMoves = (
    square: string,
    piece: Piece,
    board: Map<string, Piece | null>
): string[] => {
    const generators: Record<
        PieceType,
        (sq: string, b: Map<string, Piece | null>, p: Piece) => string[]
    > = {
        pawn: generatePawnMoves,
        knight: generateKnightMoves,
        bishop: generateBishopMoves,
        rook: generateRookMoves,
        queen: generateQueenMoves,
        king: generateKingMoves,
    };

    return generators[piece.type](square, board, piece);
};

// King and check utilities
export const findKing = (
    board: Map<string, Piece | null>,
    color: PieceColor
): string | null => {
    for (const [square, piece] of board.entries()) {
        if (piece?.type === 'king' && piece.color === color) {
            return square;
        }
    }
    return null;
};

export const isSquareAttacked = (
    board: Map<string, Piece | null>,
    square: string,
    byColor: PieceColor
): boolean => {
    for (const [pieceSquare, piece] of board.entries()) {
        if (piece?.color === byColor) {
            // Special case for pawns - only check capture squares, not forward moves
            if (piece.type === 'pawn') {
                const [file, rank] = parseSquare(pieceSquare);
                const direction = piece.color === 'white' ? 1 : -1;
                const captureSquares = [
                    [file - 1, rank + direction],
                    [file + 1, rank + direction],
                ]
                    .filter(([f, r]) => isValidSquare(f, r))
                    .map(([f, r]) => formatSquare(f, r));

                if (captureSquares.includes(square)) {
                    return true;
                }
            } else {
                const moves = generatePossibleMoves(pieceSquare, piece, board);
                if (moves.includes(square)) {
                    return true;
                }
            }
        }
    }
    return false;
};

export const isInCheck = (
    board: Map<string, Piece | null>,
    color: PieceColor
): boolean => {
    const kingSquare = findKing(board, color);
    if (!kingSquare) return false;

    const oppositeColor: PieceColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingSquare, oppositeColor);
};

// Advanced check analysis
export interface CheckInfo {
    isInCheck: boolean;
    attackingPieces: Array<{ square: string; piece: Piece }>;
    checkPaths: string[][]; // Squares that must be blocked to resolve check
}

export const analyzeCheck = (
    board: Map<string, Piece | null>,
    color: PieceColor
): CheckInfo => {
    const kingSquare = findKing(board, color);
    if (!kingSquare) {
        return { isInCheck: false, attackingPieces: [], checkPaths: [] };
    }

    const oppositeColor: PieceColor = color === 'white' ? 'black' : 'white';
    const attackingPieces: Array<{ square: string; piece: Piece }> = [];
    const checkPaths: string[][] = [];

    const [kingFile, kingRank] = parseSquare(kingSquare);

    // Check for sliding piece attacks (rook, bishop, queen)
    const slidingChecks = [
        { directions: DIRECTIONS.ORTHOGONAL, pieceTypes: ['rook', 'queen'] },
        { directions: DIRECTIONS.DIAGONAL, pieceTypes: ['bishop', 'queen'] },
    ];

    for (const { directions, pieceTypes } of slidingChecks) {
        for (const [df, dr] of directions) {
            const path: string[] = [];
            let currentFile = kingFile;
            let currentRank = kingRank;

            while (true) {
                currentFile += df;
                currentRank += dr;

                if (!isValidSquare(currentFile, currentRank)) break;

                const square = formatSquare(currentFile, currentRank);
                const piece = board.get(square);

                path.push(square);

                if (piece) {
                    if (
                        piece.color === oppositeColor &&
                        pieceTypes.includes(piece.type)
                    ) {
                        attackingPieces.push({ square, piece });
                        checkPaths.push([...path]);
                    }
                    break;
                }
            }
        }
    }

    // Check for knight attacks
    for (const [df, dr] of DIRECTIONS.KNIGHT) {
        const file = kingFile + df;
        const rank = kingRank + dr;

        if (isValidSquare(file, rank)) {
            const square = formatSquare(file, rank);
            const piece = board.get(square);

            if (piece?.color === oppositeColor && piece.type === 'knight') {
                attackingPieces.push({ square, piece });
                checkPaths.push([square]);
            }
        }
    }

    // Check for pawn attacks
    const pawnDirection = color === 'white' ? -1 : 1;
    for (const df of [-1, 1]) {
        const file = kingFile + df;
        const rank = kingRank + pawnDirection;

        if (isValidSquare(file, rank)) {
            const square = formatSquare(file, rank);
            const piece = board.get(square);

            if (piece?.color === oppositeColor && piece.type === 'pawn') {
                attackingPieces.push({ square, piece });
                checkPaths.push([square]);
            }
        }
    }

    return {
        isInCheck: attackingPieces.length > 0,
        attackingPieces,
        checkPaths,
    };
};

// Legal move filtering
export const isMoveLegal = (
    from: string,
    to: string,
    piece: Piece,
    board: Map<string, Piece | null>
): boolean => {
    // Create a copy of the board with the move made
    const newBoard = new Map(board);
    newBoard.set(to, piece);
    newBoard.set(from, null);

    // Check if the king would be in check after this move
    return isInCheck(newBoard, piece.color) === false;
};

export const filterLegalMoves = (
    moves: string[],
    from: string,
    piece: Piece,
    board: Map<string, Piece | null>
): string[] => {
    return moves.filter((to) => isMoveLegal(from, to, piece, board));
};

export const generateLegalMoves = (
    square: string,
    piece: Piece,
    board: Map<string, Piece | null>
): string[] => {
    const possibleMoves = generatePossibleMoves(square, piece, board);
    return filterLegalMoves(possibleMoves, square, piece, board);
};

// Game state analysis
export const isCheckmate = (
    board: Map<string, Piece | null>,
    color: PieceColor
): boolean => {
    if (!isInCheck(board, color)) return false;

    // Check if any piece has legal moves
    for (const [square, piece] of board.entries()) {
        if (piece?.color === color) {
            const legalMoves = generateLegalMoves(square, piece, board);
            if (legalMoves.length > 0) return false;
        }
    }

    return true;
};

export const isStalemate = (
    board: Map<string, Piece | null>,
    color: PieceColor
): boolean => {
    if (isInCheck(board, color)) return false;

    // Check if any piece has legal moves
    const allLegalMoves = getAllLegalMoves(board, color);
    if (allLegalMoves.length > 0) {
        return false;
    }

    return true;
};

export const getAllLegalMoves = (
    board: Map<string, Piece | null>,
    color: PieceColor
): Array<{ from: string; to: string; piece: Piece }> => {
    const allMoves: Array<{ from: string; to: string; piece: Piece }> = [];

    for (const [square, piece] of board.entries()) {
        if (piece?.color === color) {
            const legalMoves = generateLegalMoves(square, piece, board);
            for (const move of legalMoves) {
                allMoves.push({ from: square, to: move, piece });
            }
        }
    }

    return allMoves;
};
