import React, { useCallback, useRef } from 'react';

import * as THREE from 'three';

import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';

import useMovement from '../../hooks/useMovement';

interface MovementControlsProps {
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
}

export const MovementControls: React.FC<MovementControlsProps> = ({
    isLocked,
    setIsLocked,
}) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const roomObjectsRef = useRef<THREE.Object3D[]>([]);
    const { updateMovement } = useMovement(controlsRef, roomObjectsRef);

    // Animation loop for movement
    useFrame(() => {
        if (isLocked && controlsRef.current) {
            updateMovement();
        }
    });

    // Handle pointer lock events
    const handleLock = useCallback(() => {
        setIsLocked(true);
    }, [setIsLocked]);

    const handleUnlock = useCallback(() => {
        setIsLocked(false);
    }, [setIsLocked]);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift' && controlsRef.current) {
                controlsRef.current.lock();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <PointerLockControls
            ref={controlsRef}
            camera={camera}
            onLock={handleLock}
            onUnlock={handleUnlock}
        />
    );
};
