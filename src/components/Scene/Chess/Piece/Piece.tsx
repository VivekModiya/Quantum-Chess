import React from 'react';
import { PieceType } from '../../../../types';
import { ThreeEvent } from '@react-three/fiber';
import { useChess } from '../../../provider/ChessContextProvide';
import { PieceObject } from './PieceObj';

interface ChessPieceProps {
    piece: PieceType;
    color: 'white' | 'black';
    position: [number, number, number];
    scale?: number;
    pieceId: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
    piece,
    color,
    position,
    scale = 1,
    pieceId,
}) => {
    const { pubsub } = useChess();

    const handleClick = (
        e: ThreeEvent<MouseEvent>,
        ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>>
    ) => {
        e.stopPropagation();
        pubsub.publish('piece_selected', { pieceId, pieceRef: ref });
    };

    return (
        <PieceObject
            color={color}
            handleClick={(e, groupRef) => handleClick(e, groupRef)}
            piece={piece}
            pieceId={pieceId}
            position={position}
            scale={scale}
        />
    );
};
