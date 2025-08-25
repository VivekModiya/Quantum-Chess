import React from 'react';
import * as THREE from 'three';
import { PieceType } from '../../../types';
import { getPubsub } from '../../../utils/PubSub';
import { useGLTF } from '@react-three/drei';
import { liftDownPiece, liftPiece } from '../../../utils/liftPiece';

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
    const { scene } = useGLTF(`/src/assets/pieces/${piece}.glb`);
    const groupRef = React.useRef<THREE.Group>(null);
    const modelRef = React.useRef<THREE.Group>(null);
    const [isSelected, setIsSelected] = React.useState(false);

    const blackPieceColor = 0x572a00;
    const whitePieceColor = 0xffd092;
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

        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(colorHash),
                    roughness: 0.1,
                    metalness: 0.5,
                });
                if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.emissive.set(0xff0000);
                    mesh.material.emissiveIntensity = 0.1;
                }
            }
        });

        // Get the bounding box in local space (before rotation)
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

    // Subscribe to piece selection events
    React.useEffect(() => {
        const pubSub = getPubsub();
        if (!pubSub || !groupRef.current) return;

        const handlePieceSelection = (selectedPiece: any) => {
            if (!groupRef.current) return;

            if (selectedPiece.pieceId === pieceId) {
                if (!isSelected) {
                    liftPiece(groupRef.current);
                    setIsSelected(true);
                }
            } else if (selectedPiece.pieceId) {
                if (isSelected) {
                    liftDownPiece(groupRef.current);
                    setIsSelected(false);
                }
            }
        };

        const unsubscribe = pubSub.subscribe(
            'piece_selected',
            handlePieceSelection
        );
        return unsubscribe;
    }, [pieceId, isSelected]);

    const handleClick = (e: THREE.Event) => {
        e.stopPropagation();
        const pubSub = getPubsub();
        if (pubSub) {
            pubSub.publish('piece_selected', { pieceId });
        }
    };

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
                isSelected,
            }}
            onClick={handleClick}
        >
            <group ref={modelRef} position={centerOffset}>
                <primitive object={modifiedScene} />
            </group>
        </group>
    );
};
