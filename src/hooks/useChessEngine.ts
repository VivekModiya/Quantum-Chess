import { useReducer, useCallback, useMemo } from 'react';
import { PieceColor, PieceType } from '../types';
import { DEFAULT_CHESS_POSITION } from '../constants/chess';
import {
    generateLegalMoves,
    isInCheck,
    isCheckmate,
    isStalemate,
    getAllLegalMoves,
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
            const square = `${String.fromCharCode(97 + file)}${rank}`;
            board.set(square, null);
        }
    }

    // Set initial positions
    Object.entries(DEFAULT_CHESS_POSITION).forEach(([square, piece]) => {
        board.set(square, piece);
    });

    return board;
};

const initialState: ChessState = {
    board: createInitialBoard(),
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

    // Memoized selectors
    const boardArray = useMemo(
        () => Array.from(state.board.entries()),
        [state.board]
    );

    const isGameOver = useMemo(
        () => ['checkmate', 'stalemate', 'draw'].includes(state.gameStatus),
        [state.gameStatus]
    );

    const winner = useMemo(() => {
        if (state.gameStatus === 'checkmate') {
            return state.currentTurn === 'white' ? 'black' : 'white';
        }
        return null;
    }, [state.gameStatus, state.currentTurn]);

    // Actions
    const makeMove = useCallback(
        (from: Square, to: Square): boolean => {
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

    const undoMove = useCallback((): boolean => {
        if (state.moveHistory.length === 0) return false;

        dispatch({ type: 'UNDO_MOVE' });

        setTimeout(() => {
            dispatch({ type: 'UPDATE_GAME_STATUS' });
        }, 0);

        return true;
    }, [state.moveHistory.length]);

    const resetGame = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
    }, []);

    const setPosition = useCallback(
        (position: Record<Square, Piece | null>) => {
            dispatch({ type: 'SET_POSITION', payload: { position } });
            dispatch({ type: 'UPDATE_GAME_STATUS' });
        },
        []
    );

    // Getters
    const getPiece = useCallback(
        (square: Square): Piece | null => {
            return state.board.get(square) || null;
        },
        [state.board]
    );

    const getLegalMoves = useCallback(
        (square: Square): Square[] => {
            const piece = getPiece(square);
            if (!piece || piece.color !== state.currentTurn) {
                return [];
            }
            return generateLegalMoves(square, piece, state.board);
        },
        [state.board, state.currentTurn, getPiece]
    );

    const getAllCurrentPlayerMoves = useCallback(() => {
        return getAllLegalMoves(state.board, state.currentTurn);
    }, [state.board, state.currentTurn]);

    const isSquareAttacked = useCallback(
        (square: Square, byColor: PieceColor): boolean => {
            // Implementation would check if square is attacked by pieces of byColor
            return false; // Placeholder
        },
        []
    );

    const isValidMove = useCallback(
        (from: Square, to: Square): boolean => {
            const piece = getPiece(from);
            if (!piece || piece.color !== state.currentTurn) {
                return false;
            }
            return getLegalMoves(from).includes(to);
        },
        [getPiece, getLegalMoves, state.currentTurn]
    );

    // Computed properties
    const isInCheckNow = useMemo(
        () => isInCheck(state.board, state.currentTurn),
        [state.board, state.currentTurn]
    );

    const isCheckmateNow = useMemo(
        () => isCheckmate(state.board, state.currentTurn),
        [state.board, state.currentTurn]
    );

    const isStalemateNow = useMemo(
        () => isStalemate(state.board, state.currentTurn),
        [state.board, state.currentTurn]
    );

    return {
        // State
        board: state.board,
        boardArray,
        currentTurn: state.currentTurn,
        moveHistory: state.moveHistory,
        gameStatus: state.gameStatus,
        isGameOver,
        winner,
        isInCheck: isInCheckNow,
        isCheckmate: isCheckmateNow,
        isStalemate: isStalemateNow,
        halfMoveClock: state.halfMoveClock,
        fullMoveNumber: state.fullMoveNumber,
        castlingRights: state.castlingRights,

        // Actions
        makeMove,
        undoMove,
        resetGame,
        setPosition,

        // Getters
        getPiece,
        getLegalMoves,
        getAllCurrentPlayerMoves,
        isSquareAttacked,
        isValidMove,
    };
};
