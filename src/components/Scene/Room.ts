import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Room {
    private loader: GLTFLoader;

    constructor() {
        this.loader = new GLTFLoader();
    }

    public create(
        scene: THREE.Scene,
        ref: React.MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>[]>
    ) {
        this.loader.load(
            `src/assets/room/round_room.glb`,
            (gltf) => {
                const model = gltf.scene.clone();
                const group = new THREE.Group();
                model.scale.set(10, 10, 10);

                // Enable shadow receiving for room surfaces
                model.receiveShadow = true;
                if (model.userData.isWall) {
                    model.castShadow = false; // Walls don't cast shadows onto themselves
                }
                scene.add(model);

                group.add(model);
                const box = new THREE.Box3().setFromObject(model);

                const size = new THREE.Vector3(0, 0, 0);
                box.getSize(size);

                group.position.set(0, 50, 0);

                scene.add(group);
                ref.current.push(group);
            },
            undefined,
            (error) =>
                console.error(
                    `Error loading src/assets/room/round_room.glb:`,
                    error
                )
        );
    }
}

export default Room;
