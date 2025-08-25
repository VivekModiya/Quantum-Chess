import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Instructions from './UI/Instructions';
import Crosshair from './UI/Crosshair';
import PointerPosition from './UI/PointerPosition';
import { getPubsub } from '../utils';
import useMovement from '../hooks/useMovement';

// Lighting Components
const SceneLighting: React.FC = () => {
    const primarySpotlightRef = useRef<THREE.SpotLight>(null);
    const chessBoardLightRef = useRef<THREE.DirectionalLight>(null);

    // Optional: Add light helpers in development
    // useHelper(primarySpotlightRef, THREE.SpotLightHelper, 'cyan');
    // useHelper(chessBoardLightRef, THREE.DirectionalLightHelper, 5, 'red');

    return (
        <group>
            {/* Ambient light */}
            <ambientLight color={0x404040} intensity={1} />

            {/* Primary spotlight for chess board */}
            <spotLight
                ref={primarySpotlightRef}
                position={[0, 100, 0]}
                target-position={[0, 0, 0]}
                color={0xffffff}
                intensity={10}
                angle={Math.PI / 4}
                penumbra={0.2}
                distance={150}
                decay={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={5}
                shadow-camera-far={20}
                shadow-bias={-0.0005}
            />

            {/* Chess board directional light */}
            <directionalLight
                ref={chessBoardLightRef}
                position={[0, 50, 0]}
                target-position={[0, 0, 0]}
                color={0xffffff}
                intensity={5.0}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={5}
                shadow-camera-bottom={-5}
                shadow-camera-near={8}
                shadow-camera-far={25}
            />

            {/* Piece detail light */}
            <pointLight
                position={[-2, 8, 2]}
                color={0xfff8dc}
                intensity={0.8}
                distance={15}
                decay={1.5}
            />

            {/* Room general lighting */}
            <directionalLight
                position={[8, 12, 6]}
                target-position={[0, 0, 0]}
                color={0xb3d9ff}
                intensity={0.4}
            />

            {/* Accent lights */}
            <pointLight
                position={[-6, 6, -6]}
                color={0xff9966}
                intensity={0.3}
                distance={12}
                decay={1.8}
            />
            <pointLight
                position={[6, 6, 6]}
                color={0x66aaff}
                intensity={0.28}
                distance={12}
                decay={1.8}
            />

            {/* Hemisphere light */}
            <hemisphereLight
                skyColor={0x87ceeb}
                groundColor={0x2d1b0f}
                intensity={0.2}
                position={[0, 20, 0]}
            />
        </group>
    );
};

// Chess Board Component
const ChessBoard: React.FC = () => {
    return (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[8, 0.2, 8]} />
            <meshStandardMaterial
                color='#8B4513'
                roughness={0.3}
                metalness={0.1}
            />
        </mesh>
    );
};

// Room Walls Component
const Room: React.FC = () => {
    return (
        <group>
            {/* Floor */}
            <mesh
                position={[0, -5, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <circleGeometry args={[15, 32]} />
                <meshStandardMaterial color='#2c2c2c' roughness={0.8} />
            </mesh>

            {/* Cylindrical walls */}
            <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[15, 15, 20, 32, 1, true]} />
                <meshStandardMaterial
                    color='#3c3c3c'
                    side={THREE.DoubleSide}
                    roughness={0.9}
                />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, 15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[15, 32]} />
                <meshStandardMaterial color='#1a1a1a' roughness={0.9} />
            </mesh>
        </group>
    );
};

// Chess Pieces Component (simplified example)
const ChessPieces: React.FC = () => {
    const pieces = [
        { position: [-3, 1, -3], color: '#fff', type: 'pawn' },
        { position: [-2, 1, -3], color: '#fff', type: 'pawn' },
        { position: [2, 1, 3], color: '#000', type: 'pawn' },
        { position: [3, 1, 3], color: '#000', type: 'pawn' },
    ];

    return (
        <group>
            {pieces.map((piece, index) => (
                <mesh
                    key={index}
                    position={piece.position}
                    castShadow
                    userData={{
                        pieceId: `${piece.type}-${index}`,
                        piece: true,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        const pubSub = getPubsub();
                        pubSub?.publish('piece_selected', e.object.userData);
                    }}
                >
                    <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
                    <meshStandardMaterial
                        color={piece.color}
                        roughness={0.2}
                        metalness={0.1}
                    />
                </mesh>
            ))}
        </group>
    );
};

// Movement Controls Component
const MovementControls: React.FC<{ isLocked: boolean }> = ({ isLocked }) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const roomObjectsRef = useRef<THREE.Object3D[]>([]);
    const { updateMovement } = useMovement(controlsRef, roomObjectsRef);

    useFrame(() => {
        if (isLocked && controlsRef.current) {
            updateMovement();
        }
    });

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift' && controlsRef.current) {
                controlsRef.current.lock();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return <PointerLockControls ref={controlsRef} camera={camera} />;
};

// Main Scene Component
const Scene: React.FC<{ isLocked: boolean }> = ({ isLocked }) => {
    return (
        <>
            <SceneLighting />
            <Room />
            <ChessBoard />
            <ChessPieces />
            <MovementControls isLocked={isLocked} />
        </>
    );
};

// Main Component
export const CylindricalRoom: React.FC = () => {
    const [isLocked, setIsLocked] = React.useState(false);

    const handlePointerLockChange = React.useCallback((isLocked: boolean) => {
        setIsLocked(isLocked);
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <Canvas
                camera={{ fov: 40, near: 0.1, far: 1000, position: [0, 5, 5] }}
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.1,
                    outputEncoding: THREE.sRGBEncoding,
                }}
                shadows={{
                    enabled: true,
                    type: THREE.PCFSoftShadowMap,
                }}
                style={{ background: '#1a1a2e' }}
                onPointerLockChange={handlePointerLockChange}
            >
                <Suspense fallback={null}>
                    <Scene isLocked={isLocked} />
                </Suspense>
            </Canvas>

            <PointerPosition isVisible={isLocked} />
            <Instructions isVisible={isLocked} />
            <Crosshair isVisible={isLocked} />
        </div>
    );
};
