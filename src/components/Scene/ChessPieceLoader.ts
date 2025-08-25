import { PieceType } from '../../types';
import { liftDownPiece, liftPiece } from '../../utils/liftPiece';
import { getPubsub } from '../../utils/PubSub';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ChessPieceLoader {
    private loader: GLTFLoader;

    private readonly blackPieceColor: number = 0x572a00;
    private readonly whitePieceColor: number = 0xffd092;
    private scene;
    private ref;

    constructor(
        scene: THREE.Scene,
        ref: React.MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>[]>
    ) {
        this.loader = new GLTFLoader();
        this.scene = scene;
        this.ref = ref;
    }

    private async loadPiece(params: {
        piece: PieceType;
        color: 'white' | 'black';
        position: [x: number, y: number, z: number];
        scale?: number;
        pieceId: number;
    }) {
        const { color, piece, pieceId, position, scale = 1 } = params;
        const pubSub = getPubsub();

        const colorHash =
            color === 'white' ? this.whitePieceColor : this.blackPieceColor;
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
                            color: new THREE.Color(colorHash),
                            roughness: 0.1,
                            metalness: 0.5,
                        });
                        if (
                            mesh.material instanceof THREE.MeshStandardMaterial
                        ) {
                            mesh.material.emissive.set(0xff0000);
                            mesh.material.emissiveIntensity = 0.1;
                        }
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

                pieceGroup.castShadow = true;
                pieceGroup.receiveShadow = true;
                pieceGroup.userData = {
                    piece,
                    color,
                    isPiece: true,
                    pieceId,
                    isSelected: false,
                };

                this.scene.add(pieceGroup);
                this.ref.current.push(pieceGroup);

                pubSub?.subscribe('piece_selected', (piece) => {
                    if (piece.pieceId === pieceId) {
                        if (pieceGroup.userData.isSelected === false) {
                            liftPiece(pieceGroup);
                            pieceGroup.userData.isSelected = true;
                        }
                    } else if (piece.pieceId) {
                        if (pieceGroup.userData.isSelected === true) {
                            liftDownPiece(pieceGroup);
                            pieceGroup.userData.isSelected = false;
                        }
                    }
                });
            },
            undefined,
            (error) =>
                console.error(`Error loading src/assets/${piece}.glb:`, error)
        );
    }

    public async loadPieceToScene(): Promise<void> {
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

        let pieceId = 1;
        // Place pieces with proper chess positions
        for (let col = 0; col < 8; col++) {
            let x = col * 10 - 35,
                y = 0,
                z = -35;
            this.loadPiece({
                piece: pieceOrder[col],
                color: 'white',
                position: [x, y, z],
                scale: 1.2,
                pieceId: pieceId++,
            });

            z = -25;
            this.loadPiece({
                piece: 'pawn',
                color: 'white',
                position: [x, y, z],
                pieceId: pieceId++,
            });

            // Black pieces (farther from camera)
            z = 35;
            this.loadPiece({
                piece: pieceOrder[col],
                color: 'black',
                position: [x, y, z],
                scale: 1.2,
                pieceId: pieceId++,
            });

            z = 25;
            this.loadPiece({
                piece: 'pawn',
                color: 'black',
                position: [x, y, z],
                pieceId: pieceId++,
            });
        }
    }
}
