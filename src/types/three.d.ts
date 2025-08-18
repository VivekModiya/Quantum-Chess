import * as THREE from 'three';

declare module 'three' {
    interface Object3D {
        userData: {
            isWall?: boolean;
            isFloor?: boolean;
            isCeiling?: boolean;
            pieceType?: string;
            pieceColor?: string;
            [key: string]: any;
        };
    }
}
