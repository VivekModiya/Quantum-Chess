import React, { useState } from 'react';

import * as THREE from 'three';

import { useThree } from '@react-three/fiber';

import { getPubsub } from '../../utils/PubSub';

export const InteractionHandler: React.FC = () => {
    const { scene, camera } = useThree();
    const [pointer] = useState(() => new THREE.Vector2(0, 0));
    const [raycaster] = useState(() => new THREE.Raycaster());

    React.useEffect(() => {
        const pubSub = getPubsub();
        if (!pubSub) return;

        const handleMouseMove = (event: MouseEvent) => {
            // Convert mouse position to normalized device coordinates (-1 to +1)
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        const handleClick = () => {
            // Update raycaster with current mouse position
            raycaster.setFromCamera(pointer, camera);

            // Check for intersections with all objects in the scene
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                let obj: THREE.Object3D | null = intersects[0].object;

                // Traverse up the object hierarchy to find piece data
                while (obj && !obj.userData.isPiece) {
                    obj = obj.parent;
                }

                if (obj && obj.userData?.pieceId) {
                    pubSub.publish('piece_selected', obj.userData);
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick);
        };
    }, [scene, camera, pointer, raycaster]);

    return null; // This component doesn't render anything visual
};
