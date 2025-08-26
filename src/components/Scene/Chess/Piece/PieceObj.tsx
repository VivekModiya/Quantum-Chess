import React from 'react';
import * as THREE from 'three';
import { PieceType } from '../../../../types';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface PieceObjectProps {
    piece: PieceType;
    color: 'white' | 'black';
    position: [number, number, number];
    scale?: number;
    pieceId: number;
    handleClick: (
        e: ThreeEvent<MouseEvent>,
        ref: React.RefObject<THREE.Group<THREE.Object3DEventMap>>
    ) => void;
}

const blackPieceColor = 'rgb(17, 9, 0)'
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(Number) as [number, number, number];

const whitePieceColor = 'rgb(255,217,150)'
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(Number) as [number, number, number];

export const PieceObject: React.FC<PieceObjectProps> = ({
    piece,
    color,
    position,
    scale = 1,
    pieceId,
    handleClick,
}) => {
    const { scene } = useGLTF(`/src/assets/pieces/${piece}.glb`);
    const groupRef = React.useRef<THREE.Group>(null);
    const modelRef = React.useRef<THREE.Group>(null);

    const colorHash = color === 'white' ? whitePieceColor : blackPieceColor;

    // Clone and modify the loaded model with proper centering
    const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
        if (!scene)
            return {
                modifiedScene: null,
                centerOffset: new THREE.Vector3(),
                yOffset: 0,
            };

        const clonedScene = scene.clone();
        clonedScene.scale.set(
            0.2 + scale * 0.8,
            0.2 + scale,
            0.2 + scale * 0.8
        );

        // modulateTextureColor(clonedScene, new THREE.Color(0, 0, 200));

        clonedScene.traverse((child) => {
            // @ts-ignore
            if (child.isMesh && child.material) {
                // @ts-ignore
                const material = child.material;

                // Store original color
                if (!material.userData.originalColor) {
                    material.userData.originalColor = material.color
                        ? material.color.clone()
                        : new THREE.Color(1, 1, 1);
                }

                // Set color to modulate the texture
                if (material.color) {
                    material.color.copy(new THREE.Color(...colorHash));
                }
            }
        });

        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        const centerOffset = new THREE.Vector3(-center.x, -center.y, -center.z);

        // Create a temporary group to calculate post-rotation bounds
        const tempGroup = new THREE.Group();
        const tempModel = clonedScene.clone();
        tempModel.position.copy(centerOffset);
        tempGroup.add(tempModel);
        tempGroup.rotation.x = -Math.PI / 2;

        // Calculate how much to lift the piece so bottom touches y=0
        const rotatedBox = new THREE.Box3().setFromObject(tempGroup);
        const yOffset = -rotatedBox.min.y;

        return { modifiedScene: clonedScene, centerOffset, yOffset };
    }, [scene, scale, colorHash]);

    // Calculate final positioning
    const adjustedPosition = React.useMemo(() => {
        return [
            position[0],
            position[1] + yOffset + 2.55, // Lift to sit on floor
            position[2],
        ] as [number, number, number];
    }, [position, yOffset]);

    if (!modifiedScene) return null;

    return (
        <group
            ref={groupRef}
            position={adjustedPosition}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
            userData={{
                piece,
                color,
                isPiece: true,
                pieceId,
            }}
            onClick={(e) => handleClick(e, groupRef)}
        >
            <group ref={modelRef} position={centerOffset}>
                <primitive object={modifiedScene} />
            </group>
        </group>
    );
};
