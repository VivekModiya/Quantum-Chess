import React from 'react';

import { SceneLighting } from './SceneLighting';
import { MovementControls } from './MovementControls';
import { Objects } from '../Scene';

interface SceneProps {
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
}

export const Scene: React.FC<SceneProps> = ({ isLocked, setIsLocked }) => {
    return (
        <>
            {/* Lighting setup */}
            <SceneLighting />

            {/* Scene objects */}
            <Objects />

            {/* Controls and interactions */}
            <MovementControls isLocked={isLocked} setIsLocked={setIsLocked} />
        </>
    );
};
