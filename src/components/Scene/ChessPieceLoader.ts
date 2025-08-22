import { PieceType } from '@/types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ChessPieceLoader {
    private loader: GLTFLoader;

    private readonly blackPieceColor: number = 0x572a00;
    private readonly whitePieceColor: number = 0xffd092;

    constructor() {
        this.loader = new GLTFLoader();
    }

    private async loadPiece(
        scene: THREE.Scene,
        ref: React.MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>[]>,
        piece: PieceType,
        color: number,
        position: [x: number, y: number, z: number],
        scale: number = 1
    ) {
        this.loader.load(
            `src/assets/pieces/${piece}.glb`,
            (gltf) => {
                const model = gltf.scene.clone();
                model.scale.set(
                    0.2 + scale * 0.8,
                    0.2 + scale,
                    0.2 + scale * 0.8
                );
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(color),
                            roughness: 0.2,
                            metalness: 0.1,
                        });
                        if (
                            mesh.material instanceof THREE.MeshStandardMaterial
                        ) {
                            mesh.material.emissive.set(0xff0000);
                            mesh.material.emissiveIntensity = 0.1;
                        }
                    }
                });

                // Apply material first

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

                pieceGroup.castShadow = true;
                pieceGroup.receiveShadow = true;

                scene.add(pieceGroup);
                ref.current.push(pieceGroup);
            },
            undefined,
            (error) =>
                console.error(`Error loading src/assets/${piece}.glb:`, error)
        );
    }

    public async loadPieceToScene(
        scene: THREE.Scene,
        ref: React.MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>[]>
    ): Promise<void> {
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
            this.loadPiece(
                scene,
                ref,
                pieceOrder[col],
                this.whitePieceColor,
                [
                    col * 10 - 35, // X: -35 to +35
                    0, // Y: floor level
                    -35, // Z: back row
                ],
                1.2
            );
            this.loadPiece(scene, ref, 'pawn', this.whitePieceColor, [
                col * 10 - 35,
                0,
                -25, // Z: pawn row
            ]);

            // Black pieces (farther from camera)
            this.loadPiece(
                scene,
                ref,
                pieceOrder[col],
                this.blackPieceColor,
                [
                    col * 10 - 35,
                    0,
                    35, // Z: back row
                ],
                1.2
            );
            this.loadPiece(scene, ref, 'pawn', this.blackPieceColor, [
                col * 10 - 35,
                0,
                25, // Z: pawn row
            ]);
        }
    }
}
