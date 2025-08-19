import { PieceType } from '@/types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ChessPieceLoader {
    private loader: GLTFLoader;

    private readonly blackPieceColor: number = 0x662700;
    private readonly whitePieceColor: number = 0xf0d9b5;

    constructor() {
        this.loader = new GLTFLoader();
    }

    private loadPiece(
        scene: THREE.Scene,
        piece: PieceType,
        color: number,
        position: [x: number, y: number, z: number]
    ): void {
        this.loader.load(
            `src/assets/pieces/${piece}.glb`,
            (gltf) => {
                const model = gltf.scene.clone();

                // Apply material first
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.material = new THREE.MeshPhysicalMaterial({
                            color: new THREE.Color(color),
                            roughness: 0,
                            metalness: 0,
                            
                        });
                    }
                });

                // Get the bounding box in local space
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());

                // Create a wrapper group for clean positioning
                const pieceGroup = new THREE.Group();

                // Add model to group with offset to center it
                model.position.set(-center.x, -center.y, -center.z);
                pieceGroup.add(model);

                // Apply rotation to the entire group
                pieceGroup.rotation.x = -Math.PI / 2;

                // After rotation, we need to adjust for the floor
                // Calculate how much to lift the piece so bottom touches y=0
                const rotatedBox = new THREE.Box3().setFromObject(pieceGroup);
                const yOffset = -rotatedBox.min.y;

                // Position the group at the desired world position
                pieceGroup.position.set(
                    position[0],
                    position[1] + yOffset + 2.55, // Lift to sit on floor
                    position[2]
                );

                scene.add(pieceGroup);
            },
            undefined,
            (error) =>
                console.error(`Error loading src/assets/${piece}.glb:`, error)
        );
    }

    public loadPieceToScene(scene: THREE.Scene): void {
        const pieceOrder: PieceType[] = [
            'rook',
            'knight',
            'bishop',
            'queen',
            'king',
            'bishop',
            'knight',
            'rook',
        ];

        // Place pieces with proper chess positions
        for (let col = 0; col < 8; col++) {
            // White pieces (closer to camera)
            this.loadPiece(scene, pieceOrder[col], this.whitePieceColor, [
                col * 10 - 35, // X: -35 to +35
                0, // Y: floor level
                -35, // Z: back row
            ]);
            this.loadPiece(scene, 'pawn', this.whitePieceColor, [
                col * 10 - 35,
                0,
                -25, // Z: pawn row
            ]);

            // Black pieces (farther from camera)
            this.loadPiece(scene, pieceOrder[col], this.blackPieceColor, [
                col * 10 - 35,
                0,
                35, // Z: back row
            ]);
            this.loadPiece(scene, 'pawn', this.blackPieceColor, [
                col * 10 - 35,
                0,
                25, // Z: pawn row
            ]);
        }
    }

    // Helper method to test one piece
    public loadTestPiece(scene: THREE.Scene, piece: PieceType = 'king'): void {
        this.loadPiece(scene, piece, this.whitePieceColor, [0, 0, 0]);
    }
}
