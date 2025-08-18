

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import StartButton from './UI/StartButton';
import Instructions from './UI/Instructions';
import Crosshair from './UI/Crosshair';
import Room from './Scene/Room';
import Objects from './Scene/Objects';
import ChessBoard from './Scene/ChessBoard';
import PointerLockControls from '../utils/PointerLockControls';
import useMovement from '../hooks/useMovement';
import usePointerLock from '../hooks/usePointerLock';
import ChessPieceLoader from './Scene/ChessPieceLoader';

export const CylindricalRoom = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<PointerLockControls | null>(null);
    const roomObjectsRef = useRef<THREE.Object3D[]>([]);
    const animationIdRef = useRef<number | null>(null);
    const lightsRef = useRef<THREE.Light[]>([]);

    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const { isLocked, initializePointerLock } = usePointerLock();
    const { updateMovement } = useMovement(controlsRef, roomObjectsRef);

    // Enhanced lighting setup function
    const setupLighting = (scene: THREE.Scene): void => {
        // Clear existing lights
        lightsRef.current.forEach((light) => scene.remove(light));
        lightsRef.current = [];

        // 1. Soft ambient
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        scene.add(ambientLight);
        lightsRef.current.push(ambientLight);

        // 2. Main directional (sunlight style)
        const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        mainDirectionalLight.position.set(15, 25, 10);
        mainDirectionalLight.castShadow = true;
        mainDirectionalLight.shadow.mapSize.width = 2048;
        mainDirectionalLight.shadow.mapSize.height = 2048;
        scene.add(mainDirectionalLight);
        lightsRef.current.push(mainDirectionalLight);

        // 3. Ceiling spotlight (down on board)
        const ceilingSpotlight = new THREE.SpotLight(0xffffff, 0.7);
        ceilingSpotlight.position.set(0, 18, 0);
        ceilingSpotlight.target.position.set(0, 0, 0);
        ceilingSpotlight.angle = Math.PI / 3;
        ceilingSpotlight.penumbra = 0.4;
        ceilingSpotlight.castShadow = true;
        scene.add(ceilingSpotlight);
        scene.add(ceilingSpotlight.target);
        lightsRef.current.push(ceilingSpotlight);

        // 4. Chessboard local point light
        const chessBoardLight = new THREE.PointLight(0xfff8dc, 0.4, 12);
        chessBoardLight.position.set(0, 5, 0);
        chessBoardLight.castShadow = true;
        scene.add(chessBoardLight);
        lightsRef.current.push(chessBoardLight);

        // 5. Rim lights (subtle, just for depth)
        const rimLightPositions = [
            { x: 8, y: 12, z: 8 },
            { x: -8, y: 12, z: 8 },
            { x: 8, y: 12, z: -8 },
            { x: -8, y: 12, z: -8 },
        ];
        rimLightPositions.forEach((pos) => {
            const rimLight = new THREE.PointLight(0x4a90e2, 0.25, 15);
            rimLight.position.set(pos.x, pos.y, pos.z);
            scene.add(rimLight);
            lightsRef.current.push(rimLight);
        });

        // 6. Warm accent lights (very soft)
        const warmLight1 = new THREE.PointLight(0xffaa44, 0.25, 10);
        warmLight1.position.set(6, 3, 6);
        scene.add(warmLight1);
        lightsRef.current.push(warmLight1);

        const warmLight2 = new THREE.PointLight(0xffaa44, 0.25, 10);
        warmLight2.position.set(-6, 3, -6);
        scene.add(warmLight2);
        lightsRef.current.push(warmLight2);

        // 7. Hemisphere for gentle bounce
        const hemisphereLight = new THREE.HemisphereLight(
            0x87ceeb,
            0x362d1d,
            0.2
        );
        hemisphereLight.position.set(0, 20, 0);
        scene.add(hemisphereLight);
        lightsRef.current.push(hemisphereLight);
    };

    useEffect(() => {
        if (!mountRef.current || isInitialized) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x1a1a2e); // Darker, more atmospheric background

        // Enhanced renderer settings for better lighting
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        mountRef.current.appendChild(renderer.domElement);
        controlsRef.current?.updateElement(renderer.domElement);

        // Store references
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // Initialize controls
        const controls = new PointerLockControls(camera, renderer.domElement);
        controlsRef.current = controls;
        scene.add(controls.getObject());

        // Initialize pointer lock
        initializePointerLock(controls);

        // Setup enhanced lighting
        setupLighting(scene);

        // Create room components
        const room = new Room();
        const roomMeshes = room.create();
        roomMeshes.forEach((mesh) => {
            // Enable shadow receiving for room surfaces
            mesh.receiveShadow = true;
            if (mesh.userData.isWall) {
                mesh.castShadow = false; // Walls don't cast shadows
            }
            scene.add(mesh);
        });

        // // Create objects
        // const objects = new Objects();
        // const objectMeshes = objects.create();
        // objectMeshes.forEach((mesh) => {
        //     // Enable shadows for objects
        //     mesh.castShadow = true;
        //     mesh.receiveShadow = true;
        //     scene.add(mesh);
        //     roomObjectsRef.current.push(mesh);
        // });

        // Create chess board
        const chessBoard = new ChessBoard();
        chessBoard.create().then((mesh) => {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            roomObjectsRef.current.push(mesh);
        });

        const piecesLoader = new ChessPieceLoader();
        piecesLoader.loadPieceToScene(scene);

        // Add walls to collision detection
        roomObjectsRef.current.push(
            ...roomMeshes.filter((mesh) => mesh.userData.isWall)
        );

        // Handle window resize
        const handleResize = (): void => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        setIsInitialized(true);

        // Enhanced animation loop with light animations
        const animate = (): void => {
            animationIdRef.current = requestAnimationFrame(animate);

            const time = Date.now() * 0.001;

            // Subtle light animations
            if (lightsRef.current.length > 0) {
                // Gentle flickering for warm accent lights
                if (lightsRef.current[5]) {
                    // warmLight1
                    lightsRef.current[5].intensity =
                        0.4 + Math.sin(time * 2) * 0.05;
                }
                if (lightsRef.current[6]) {
                    // warmLight2
                    lightsRef.current[6].intensity =
                        0.4 + Math.cos(time * 1.5) * 0.05;
                }

                // Subtle movement for rim lights
                lightsRef.current.slice(3, 7).forEach((light, index) => {
                    if (light instanceof THREE.PointLight) {
                        light.intensity = 0.6 + Math.sin(time + index) * 0.1;
                    }
                });
            }

            if (controlsRef.current?.isLocked && controlsRef.current) {
                updateMovement();
            }

            renderer.render(scene, cameraRef.current || camera);
        };
        animate();
    }, [isInitialized, initializePointerLock, updateMovement]);

    const handleStart = (): void => {
        if (rendererRef.current) {
            rendererRef.current.domElement.focus();
        }

        controlsRef.current?.lock();
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <StartButton isLocked={isLocked} onStart={handleStart} />
            <Instructions isVisible={isLocked} />
            <Crosshair isVisible={isLocked} />
        </div>
    );
};
