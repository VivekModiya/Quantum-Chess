import React from 'react';

import { useGLTF } from '@react-three/drei';

interface RoomProps {
    position?: [number, number, number];
    scale?: number;
}

export const Room: React.FC<RoomProps> = ({
    position = [0, 50, 0],
    scale = 10,
}) => {
    const { scene } = useGLTF('/src/assets/room/round_room.glb');
    const groupRef = React.useRef<THREE.Group>(null);

    // Clone and modify the room model
    const modifiedRoom = React.useMemo(() => {
        if (!scene) return null;

        const clonedScene = scene.clone();
        clonedScene.scale.set(scale, scale, scale);

        // Enable shadow receiving for room surfaces
        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.receiveShadow = true;
                if (child.userData.isWall) {
                    child.castShadow = false; // Walls don't cast shadows onto themselves
                }
            }
        });

        return clonedScene;
    }, [scene, scale]);

    if (!modifiedRoom) return null;

    return (
        <group ref={groupRef} position={position}>
            <primitive object={modifiedRoom} />
        </group>
    );
};
