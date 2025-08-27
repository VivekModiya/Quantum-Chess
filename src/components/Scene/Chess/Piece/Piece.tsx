import React from 'react';
import { PieceType } from '../../../../types';
import { ThreeEvent } from '@react-three/fiber';
import { PieceObject } from './PieceObj';
import { usePubSub } from '../../../../hooks';

interface ChessPieceProps {
    piece: PieceType;
    color: 'white' | 'black';
    position: [number, number, number];
    scale?: number;
    pieceId: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
    piece,
    color,
    position,
    scale = 1,
    pieceId,
}) => {
    const { publish } = usePubSub();

    const pieceRef = React.useRef<THREE.Group>(null);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        publish('piece_selected', { pieceId, pieceRef });
    };

    return (
        <PieceObject
            color={color}
            handleClick={handleClick}
            piece={piece}
            pieceId={pieceId}
            position={position}
            scale={scale}
            pieceRef={pieceRef}
        />
    );
};
