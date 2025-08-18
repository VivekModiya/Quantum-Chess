import * as THREE from 'three';
import {
    createGridTexture,
    createColorfulWallTexture,
} from '../../utils/TextureGenerator';

class Room {
    private readonly roomRadius: number = 150;
    private readonly roomHeight: number = 120;

    public create(): THREE.Mesh[] {
        const meshes: THREE.Mesh[] = [];

        // Floor (circular)
        const floorGeometry = new THREE.CircleGeometry(this.roomRadius, 32);
        const floorTexture = createGridTexture();
        const floorMaterial = new THREE.MeshLambertMaterial({
            map: floorTexture,
            side: THREE.DoubleSide,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.userData.isFloor = true;
        meshes.push(floor);

        console.log(floor.position); // Mesh position
        floor.geometry.computeBoundingBox();
        console.log(floor.geometry.boundingBox); // Geometry's actual extents

        // Ceiling (circular)
        const ceiling = new THREE.Mesh(floorGeometry, floorMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.roomHeight;
        ceiling.userData.isCeiling = true;
        meshes.push(ceiling);

        // Cylindrical walls
        const wallGeometry = new THREE.CylinderGeometry(
            this.roomRadius,
            this.roomRadius,
            this.roomHeight,
            32,
            1,
            true
        );

        const wallTexture = createColorfulWallTexture();
        const wallMaterial = new THREE.MeshLambertMaterial({
            map: wallTexture,
            side: THREE.DoubleSide,
        });

        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = this.roomHeight / 2;
        walls.userData.isWall = true;
        meshes.push(walls);

        return meshes;
    }
}

export default Room;
