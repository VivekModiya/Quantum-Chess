import React, { useReducer, useCallback, useMemo } from 'react';
import { PieceColor, PieceType } from '../types';
import { DEFAULT_CHESS_POSITION, SQUARE_PIECE_MAP } from '../constants/chess';
import {
    generateLegalMoves,
    isInCheck,
    isCheckmate,
    isStalemate,
    getAllLegalMoves,
    formatSquare,
} from '../utils/calculate';

type Square = string;

export interface Piece {
    type: PieceType;
    color: PieceColor;
}

export interface Move {
    from: Square;
    to: Square;
    piece: Piece;
    capturedPiece?: Piece;
    timestamp: number;
    algebraicNotation?: string; // e4, Nf3, etc.
}

export interface ChessState {
    board: Map<Square, Piece | null>;
    currentTurn: PieceColor;
    moveHistory: Move[];
    gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
    squarePieceMap: Map<string, string | null>;
    halfMoveClock: number; // For 50-move rule
    fullMoveNumber: number;
    castlingRights: {
        whiteKingside: boolean;
        whiteQueenside: boolean;
        blackKingside: boolean;
        blackQueenside: boolean;
    };
    enPassantTarget: Square | null;
}

type ChessAction =
    | { type: 'MAKE_MOVE'; payload: { from: Square; to: Square } }
    | { type: 'UNDO_MOVE' }
    | { type: 'RESET_GAME' }
    | {
          type: 'SET_POSITION';
          payload: { position: Record<Square, Piece | null> };
      }
    | { type: 'SET_TURN'; payload: PieceColor }
    | { type: 'UPDATE_GAME_STATUS' };

// Helper function to create initial board
const createInitialBoard = (): Map<Square, Piece | null> => {
    const board = new Map<Square, Piece | null>();

    // Initialize all squares to null first
    for (let file = 0; file < 8; file++) {
        for (let rank = 1; rank <= 8; rank++) {
            const square = formatSquare(file, rank);
            board.set(square, null);
        }
    }

    // Set initial positions
    Object.entries(DEFAULT_CHESS_POSITION).forEach(([square, piece]) => {
        board.set(square, piece);
    });

    return board;
};

// Utility to render board in console (2D view)
export function printBoard(board: Map<string, Piece | null>) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let output = '\n';

    for (let rank = 8; rank >= 1; rank--) {
        output += rank + ' '; // Rank number at left
        for (let file = 0; file < 8; file++) {
            const square = files[file] + rank;
            const piece = board.get(square);

            if (piece) {
                const symbol =
                    piece.type[0].toUpperCase() +
                    (piece.color === 'white' ? 'w' : 'b');
                output += symbol.padEnd(3, ' ');
            } else {
                output += '-- '.padEnd(3, ' ');
            }
        }
        output += '\n';
    }

    output += '   ' + files.map((f) => f.toUpperCase()).join('  ') + '\n';
    console.log(output);
}

const initialState: ChessState = {
    board: createInitialBoard(),
    squarePieceMap: new Map(Object.entries(SQUARE_PIECE_MAP)),
    currentTurn: 'white',
    moveHistory: [],
    gameStatus: 'playing',
    halfMoveClock: 0,
    fullMoveNumber: 1,
    castlingRights: {
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true,
    },
    enPassantTarget: null,
};

// Chess reducer
const chessReducer = (state: ChessState, action: ChessAction): ChessState => {
    switch (action.type) {
        case 'MAKE_MOVE': {
            const { from, to } = action.payload;
            const piece = state.board.get(from);
            const capturedPiece = state.board.get(to);

            if (!piece) return state;

            // Create new board with the move
            const newBoard = new Map(state.board);
            newBoard.set(to, piece);
            newBoard.set(from, null);

            const newSquarePieceMap = new Map(state.squarePieceMap);
            newSquarePieceMap.set(to, newSquarePieceMap.get(from) ?? null);
            newSquarePieceMap.set(from, null);

            // Create move record
            const move: Move = {
                from,
                to,
                piece,
                capturedPiece: capturedPiece || undefined,
                timestamp: Date.now(),
            };

            // Update castling rights if king or rook moved
            const newCastlingRights = { ...state.castlingRights };
            if (piece.type === 'king') {
                if (piece.color === 'white') {
                    newCastlingRights.whiteKingside = false;
                    newCastlingRights.whiteQueenside = false;
                } else {
                    newCastlingRights.blackKingside = false;
                    newCastlingRights.blackQueenside = false;
                }
            } else if (piece.type === 'rook') {
                if (from === 'a1') newCastlingRights.whiteQueenside = false;
                if (from === 'h1') newCastlingRights.whiteKingside = false;
                if (from === 'a8') newCastlingRights.blackQueenside = false;
                if (from === 'h8') newCastlingRights.blackKingside = false;
            }

            // Update half-move clock
            const newHalfMoveClock =
                piece.type === 'pawn' || capturedPiece
                    ? 0
                    : state.halfMoveClock + 1;

            // Update full move number
            const newFullMoveNumber =
                state.currentTurn === 'black'
                    ? state.fullMoveNumber + 1
                    : state.fullMoveNumber;

            // Switch turn
            const nextTurn: PieceColor =
                state.currentTurn === 'white' ? 'black' : 'white';

            return {
                ...state,
                board: newBoard,
                currentTurn: nextTurn,
                moveHistory: [...state.moveHistory, move],
                halfMoveClock: newHalfMoveClock,
                fullMoveNumber: newFullMoveNumber,
                castlingRights: newCastlingRights,
                enPassantTarget: null, // Reset en passant (would need proper logic)
            };
        }

        case 'UNDO_MOVE': {
            if (state.moveHistory.length === 0) return state;

            const lastMove = state.moveHistory[state.moveHistory.length - 1];
            const newBoard = new Map(state.board);

            // Restore the piece to its original position
            newBoard.set(lastMove.from, lastMove.piece);

            // Restore captured piece or set square to null
            newBoard.set(lastMove.to, lastMove.capturedPiece || null);

            // Switch turn back
            const previousTurn: PieceColor =
                state.currentTurn === 'white' ? 'black' : 'white';

            // Remove last move from history
            const newMoveHistory = state.moveHistory.slice(0, -1);

            // Restore previous game state (simplified - would need more complex logic for full restoration)
            return {
                ...state,
                board: newBoard,
                currentTurn: previousTurn,
                moveHistory: newMoveHistory,
                gameStatus: 'playing', // Simplified
            };
        }

        case 'RESET_GAME':
            return initialState;

        case 'SET_POSITION': {
            const newBoard = new Map<Square, Piece | null>();
            Object.entries(action.payload.position).forEach(
                ([square, piece]) => {
                    newBoard.set(square, piece);
                }
            );

            return {
                ...state,
                board: newBoard,
            };
        }

        case 'SET_TURN':
            return {
                ...state,
                currentTurn: action.payload,
            };

        case 'UPDATE_GAME_STATUS': {
            // Determine game status based on current position
            let newStatus: ChessState['gameStatus'] = 'playing';

            if (isCheckmate(state.board, state.currentTurn)) {
                newStatus = 'checkmate';
            } else if (isStalemate(state.board, state.currentTurn)) {
                newStatus = 'stalemate';
            } else if (isInCheck(state.board, state.currentTurn)) {
                newStatus = 'check';
            } else if (state.halfMoveClock >= 100) {
                // 50-move rule
                newStatus = 'draw';
            }

            return {
                ...state,
                gameStatus: newStatus,
            };
        }

        default:
            return state;
    }
};

// Main chess hook
export const useChessEngine = () => {
    const [state, dispatch] = useReducer(chessReducer, initialState);

    const makeMove = useCallback(
        (from: Square | null, to: Square | null): boolean => {
            if (!from || !to) return false;
            const piece = state.board.get(from);
            if (!piece || piece.color !== state.currentTurn) {
                return false;
            }

            // Check if move is legal
            const legalMoves = generateLegalMoves(from, piece, state.board);
            if (!legalMoves.includes(to)) {
                return false;
            }

            dispatch({ type: 'MAKE_MOVE', payload: { from, to } });

            // Update game status after move
            setTimeout(() => {
                dispatch({ type: 'UPDATE_GAME_STATUS' });
            }, 0);

            return true;
        },
        [state.board, state.currentTurn]
    );

    // Getters
    const getPiece = useCallback(
        (square: Square): Piece | null => {
            return state.board.get(square) || null;
        },
        [state.board]
    );

    const getPieceSquare = useCallback(
        (pieceId?: string | null): Square | null => {
            if (!pieceId) return '';
            for (const [square, id] of state.squarePieceMap.entries()) {
                if (id === pieceId) {
                    return square;
                }
            }
            return null;
        },
        [state.squarePieceMap]
    );

    const getLegalMoves = useCallback(
        (square?: Square | null): Square[] => {
            if (!square) return [];
            const piece = getPiece(square);
            console.log(printBoard(state.board), piece, square);

            if (!piece || piece.color !== state.currentTurn) {
                return [];
            }
            return generateLegalMoves(square, piece, state.board);
        },
        [state.board, state.currentTurn, getPiece]
    );

    const selectedPiece = React.useRef<{
        id: string;
        ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null;
    } | null>(null);

    const setSelectedPiece = useCallback(
        (
            piece: {
                id: string;
                ref: React.RefObject<
                    THREE.Group<THREE.Object3DEventMap>
                > | null;
            } | null
        ): void => {
            selectedPiece.current = piece;
        },
        []
    );

    // Computed properties

    return {
        // State
        board: state.board,
        currentTurn: state.currentTurn,
        moveHistory: state.moveHistory,
        gameStatus: state.gameStatus,
        halfMoveClock: state.halfMoveClock,
        fullMoveNumber: state.fullMoveNumber,
        castlingRights: state.castlingRights,
        selectedPiece: selectedPiece,

        // Actions
        makeMove,
        setSelectedPiece,

        // Getters
        getPiece,
        getLegalMoves,
        getPieceSquare,
    };
};
