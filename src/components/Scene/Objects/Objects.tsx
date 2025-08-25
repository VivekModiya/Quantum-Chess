import { useGLTF } from '@react-three/drei';

import { Room } from '../Room/Room';
import { ChessBoard } from '../Chess/ChessBoard';
import { ChessPieces } from '../Chess/PiecesCollection';

export const Objects: React.FC = () => {
    useGLTF.preload('/src/assets/room/round_room.glb');
    ['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach((piece) => {
        useGLTF.preload(`/src/assets/pieces/${piece}.glb`);
    });
    return (
        <group>
            <Room position={[0, 50, 0]} scale={10} />
            <ChessBoard position={[0, 0, 0]} />
            <ChessPieces />
        </group>
    );
};
