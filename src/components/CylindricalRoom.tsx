import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import Instructions from './UI/Instructions';
import Crosshair from './UI/Crosshair';
import Room from './Scene/Room';
import ChessBoard from './Scene/ChessBoard';
import PointerLockControls from '../utils/PointerLockControls';
import useMovement from '../hooks/useMovement';
import usePointerLock from '../hooks/usePointerLock';
import ChessPieceLoader from './Scene/ChessPieceLoader';
import PointerPosition from './UI/PointerPosition';
import { getPubsub } from '../utils/PubSub';

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

    // Realistic lighting setup focused on chess board
    const setupLighting = (scene: THREE.Scene): void => {
        // Clear existing lights
        lightsRef.current.forEach((light) => scene.remove(light));
        lightsRef.current = [];

        // 1. Brighter ambient light for general visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);
        lightsRef.current.push(ambientLight);

        // 2. Primary chess board spotlight (strong focused light)
        const primarySpotlight = new THREE.SpotLight(0xffffff, 10);
        primarySpotlight.position.set(0, 100, 0);
        primarySpotlight.target.position.set(0, 0, 0);
        primarySpotlight.angle = Math.PI / 4; // Wider cone for better coverage
        primarySpotlight.penumbra = 0.2; // Sharp focus
        primarySpotlight.distance = 150;
        primarySpotlight.decay = 1.5; // Less aggressive falloff
        primarySpotlight.castShadow = true;

        // High quality shadows for the main light
        primarySpotlight.shadow.mapSize.width = 2048;
        primarySpotlight.shadow.mapSize.height = 2048;
        primarySpotlight.shadow.camera.near = 5;
        primarySpotlight.shadow.camera.far = 20;
        primarySpotlight.shadow.bias = -0.0005;

        scene.add(primarySpotlight);
        scene.add(primarySpotlight.target);
        lightsRef.current.push(primarySpotlight);

        // 3. Chess board directional light (focused beam from above)
        const chessBoardLight = new THREE.DirectionalLight(0xffffff, 5.0);
        chessBoardLight.position.set(0, 50, 0);
        chessBoardLight.target.position.set(0, 0, 0);
        chessBoardLight.castShadow = true;
        chessBoardLight.shadow.mapSize.width = 2048;
        chessBoardLight.shadow.mapSize.height = 2048;
        chessBoardLight.shadow.camera.left = -5;
        chessBoardLight.shadow.camera.right = 5;
        chessBoardLight.shadow.camera.top = 5;
        chessBoardLight.shadow.camera.bottom = -5;
        chessBoardLight.shadow.camera.near = 8;
        chessBoardLight.shadow.camera.far = 25;
        scene.add(chessBoardLight);
        scene.add(chessBoardLight.target);
        lightsRef.current.push(chessBoardLight);

        // 4. Secondary point light for chess pieces detail
        const pieceDetailLight = new THREE.PointLight(0xfff8dc, 0.8);
        pieceDetailLight.position.set(-2, 8, 2);
        pieceDetailLight.distance = 15;
        pieceDetailLight.decay = 1.5;
        scene.add(pieceDetailLight);
        lightsRef.current.push(pieceDetailLight);

        // 5. Room general lighting (soft directional)
        const roomLight = new THREE.DirectionalLight(0xb3d9ff, 0.4);
        roomLight.position.set(8, 12, 6);
        roomLight.target.position.set(0, 0, 0);
        scene.add(roomLight);
        scene.add(roomLight.target);
        lightsRef.current.push(roomLight);

        // 6. Room accent lights (moderate intensity for atmosphere)
        const accentPositions = [
            { x: -6, y: 6, z: -6, color: 0xff9966, intensity: 0.3 },
            { x: 6, y: 6, z: 6, color: 0x66aaff, intensity: 0.28 },
        ];

        accentPositions.forEach((config) => {
            const accentLight = new THREE.PointLight(
                config.color,
                config.intensity
            );
            accentLight.position.set(config.x, config.y, config.z);
            accentLight.distance = 12;
            accentLight.decay = 1.8;
            scene.add(accentLight);
            lightsRef.current.push(accentLight);
        });

        // 7. Hemisphere light for overall ambient
        const hemisphereLight = new THREE.HemisphereLight(
            0x87ceeb, // Sky color (cool)
            0x2d1b0f, // Ground color (warm)
            0.2 // Higher intensity
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
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x1a1a2e); // Lighter background for better visibility

        // Enhanced renderer settings for realistic lighting
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1; // Brighter exposure for better visibility

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

        // Setup realistic lighting
        setupLighting(scene);

        // Create room components
        const room = new Room();
        room.create(scene, roomObjectsRef);

        const chessBoard = new ChessBoard();
        chessBoard.create().then((mesh) => {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            roomObjectsRef.current.push(mesh);
        });

        const piecesLoader = new ChessPieceLoader(scene, roomObjectsRef);
        piecesLoader.loadPieceToScene();

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

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(0, 0); // default center
        const pubSub = getPubsub();

        // update pointer position when not locked
        document.addEventListener('mousemove', (event) => {
            if (!controls.isLocked) {
                // convert mouse position to NDC (-1 to +1)
                pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }
        });

        document.addEventListener('click', () => {
            if (controls.isLocked) {
                // pointer lock: ray straight ahead
                raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            } else {
                // free pointer: use current mouse coords
                raycaster.setFromCamera(pointer, camera);
            }

            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                let obj: THREE.Object3D | null = intersects[0].object;

                // climb up until we find userData
                while (obj && !obj.userData.piece) {
                    obj = obj.parent;
                }

                if (obj && obj.userData?.pieceId) {
                    pubSub?.publish('piece_selected', obj.userData as any);
                }
            }
        });

        // Subtle animation loop with minimal light variations
        const animate = (): void => {
            animationIdRef.current = requestAnimationFrame(animate);

            if (controlsRef.current?.isLocked && controlsRef.current) {
                updateMovement();
            }

            renderer.render(scene, cameraRef.current || camera);
        };
        animate();
    }, [isInitialized, initializePointerLock, updateMovement]);

    React.useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                if (rendererRef.current) {
                    rendererRef.current.domElement.focus();
                }

                controlsRef.current?.lock();
            }
        });
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <PointerPosition isVisible={isLocked} />
            <Instructions isVisible={isLocked} />
            <Crosshair isVisible={isLocked} />
        </div>
    );
};
