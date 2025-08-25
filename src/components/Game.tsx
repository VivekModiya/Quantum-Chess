import React, { Suspense } from 'react';

import * as THREE from 'three';

import { Canvas } from '@react-three/fiber';

import { Scene } from './UI/Scene';
import { Loader } from './UI/Loader';
import Crosshair from './UI/Crosshair';
import Instructions from './UI/Instructions';
import PointerPosition from './UI/PointerPosition';

export const Game: React.FC = () => {
    const [isLocked, setIsLocked] = React.useState<boolean>(false);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* React Three Fiber Canvas */}
            <Canvas
                camera={{
                    fov: 40,
                    near: 0.1,
                    far: 1000,
                    position: [0, 5, 5], // Initial camera position
                }}
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.1,
                    outputColorSpace: THREE.SRGBColorSpace, // Updated from outputEncoding
                }}
                shadows={{
                    enabled: true,
                    type: THREE.PCFSoftShadowMap,
                }}
                style={{ background: '#1a1a2e' }}
            >
                <Suspense fallback={null}>
                    <Scene isLocked={isLocked} setIsLocked={setIsLocked} />
                </Suspense>
            </Canvas>

            {/* Loading overlay */}
            <Suspense fallback={<Loader />}>
                <div />
            </Suspense>

            {/* UI Overlays */}
            <PointerPosition isVisible={isLocked} />
            <Instructions isVisible={!isLocked} />
            <Crosshair isVisible={isLocked} />
        </div>
    );
};
