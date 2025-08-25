import { PieceType } from '../../../types';
import { ChessPiece } from './Piece';

export const ChessPieces: React.FC = () => {
    const pieceOrder: PieceType[] = [
        'rook',
        'knight',
        'bishop',
        'queen',
        'king',
        'bishop',
        'knight',
        'rook',
    ];

    const pieces: Array<{
        piece: PieceType;
        color: 'white' | 'black';
        position: [number, number, number];
        scale: number;
        pieceId: number;
    }> = [];

    let pieceId = 1;

    // Generate all pieces with proper chess positions
    for (let col = 0; col < 8; col++) {
        const x = col * 10 - 35;
        const y = 0;

        // White pieces (closer to camera)
        pieces.push({
            piece: pieceOrder[col],
            color: 'white',
            position: [x, y, -35],
            scale: 1.2,
            pieceId: pieceId++,
        });

        pieces.push({
            piece: 'pawn',
            color: 'white',
            position: [x, y, -25],
            scale: 1,
            pieceId: pieceId++,
        });

        // Black pieces (farther from camera)
        pieces.push({
            piece: pieceOrder[col],
            color: 'black',
            position: [x, y, 35],
            scale: 1.2,
            pieceId: pieceId++,
        });

        pieces.push({
            piece: 'pawn',
            color: 'black',
            position: [x, y, 25],
            scale: 1,
            pieceId: pieceId++,
        });
    }

    return (
        <group>
            {pieces.map((pieceProps) => (
                <ChessPiece key={pieceProps.pieceId} {...pieceProps} />
            ))}
        </group>
    );
};
