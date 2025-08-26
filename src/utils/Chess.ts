// Chess.ts
import { PieceColor, PieceType } from '../types';
import { DEFAULT_CHESS_POSITION } from '../constants/chess';
import { generateLegalMoves } from './calculate';

type Square = string;
export type Piece = {
    type: PieceType;
    color: PieceColor;
};

export default class Chess {
    private board: Map<Square, Piece | null>; // current piece positions
    private turn: PieceColor;

    constructor() {
        this.board = new Map<Square, Piece | null>();
        this.turn = 'white';
        this.initializeBoard();
    }

    private initializeBoard() {
        Object.entries(DEFAULT_CHESS_POSITION).forEach(([key, value]) => {
            this.board.set(key, value);
        });
    }

    public getPiece(square: Square): Piece | null {
        return this.board.get(square) || null;
    }

    public isOccupiedByCurrentPlayer(square: Square): boolean {
        return this.board.get(square)?.color === this.turn;
    }

    public isOccupiedByOpponent(square: Square): boolean {
        const pieceColor = this.board.get(square)?.color;
        if (pieceColor) {
            return pieceColor !== this.turn;
        }
        return false;
    }

    public getLegalMoves(square: Square): Square[] {
        const piece = this.getPiece(square);
        if (piece) {
            return generateLegalMoves(square, piece, this.board);
        }
        return [];
    }

    public movePiece(from: Square, to: Square): boolean {
        const piece = this.board.get(from);
        if (!piece) return false;

        this.board.set(to, piece);
        this.board.set(from, null);

        this.switchTurn();
        return true;
    }

    // Whose turn is it?
    public getTurn(): PieceColor {
        return this.turn;
    }

    private switchTurn() {
        this.turn = this.turn === 'white' ? 'black' : 'white';
    }
}
