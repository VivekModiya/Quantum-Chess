import * as THREE from 'three';

class Objects {
    public create(): THREE.Mesh[] {
        const objects: THREE.Mesh[] = [];

        // Cube
        const cubeGeometry = new THREE.BoxGeometry(12, 12, 12);
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(-45, 45, -45);
        objects.push(cube);

        // Sphere
        const sphereGeometry = new THREE.SphereGeometry(9, 32, 32);
        const sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0x4444ff,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(60, 45, -30);
        objects.push(sphere);

        // Cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(6, 6, 18, 32);
        const cylinderMaterial = new THREE.MeshLambertMaterial({
            color: 0x44ff44,
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(0, 45, 75);
        objects.push(cylinder);

        // Torus
        const torusGeometry = new THREE.TorusGeometry(9, 3, 16, 100);
        const torusMaterial = new THREE.MeshLambertMaterial({
            color: 0xff44ff,
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(-75, 45, 30);
        objects.push(torus);

        // Additional geometric objects
        this.addAdditionalObjects(objects);

        return objects;
    }

    private addAdditionalObjects(objects: THREE.Mesh[]): void {
        // Octahedron
        const octahedronGeometry = new THREE.OctahedronGeometry(8);
        const octahedronMaterial = new THREE.MeshLambertMaterial({
            color: 0xff8800,
        });
        const octahedron = new THREE.Mesh(
            octahedronGeometry,
            octahedronMaterial
        );
        octahedron.position.set(30, 45, 60);
        objects.push(octahedron);

        // Dodecahedron
        const dodecahedronGeometry = new THREE.DodecahedronGeometry(7);
        const dodecahedronMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff88,
        });
        const dodecahedron = new THREE.Mesh(
            dodecahedronGeometry,
            dodecahedronMaterial
        );
        dodecahedron.position.set(-60, 45, -20);
        objects.push(dodecahedron);

        // Icosahedron
        const icosahedronGeometry = new THREE.IcosahedronGeometry(6);
        const icosahedronMaterial = new THREE.MeshLambertMaterial({
            color: 0x8800ff,
        });
        const icosahedron = new THREE.Mesh(
            icosahedronGeometry,
            icosahedronMaterial
        );
        icosahedron.position.set(80, 45, 20);
        objects.push(icosahedron);

        // Continue with other objects...
        const geometries = [
            {
                geo: new THREE.ConeGeometry(8, 20, 32),
                color: 0xffff00,
                pos: [-30, 40, 90],
            },
            {
                geo: new THREE.TetrahedronGeometry(10),
                color: 0x00ffff,
                pos: [50, 65, -70],
            },
            {
                geo: new THREE.TorusGeometry(12, 2, 8, 100),
                color: 0xff0088,
                pos: [-90, 60, -60],
            },
            {
                geo: new THREE.CylinderGeometry(4, 4, 15, 32),
                color: 0x88ff00,
                pos: [25, 55, -40],
            },
            {
                geo: new THREE.TorusKnotGeometry(8, 2, 100, 16),
                color: 0xff4400,
                pos: [-40, 50, -90],
            },
        ];

        geometries.forEach(({ geo, color, pos }) => {
            const material = new THREE.MeshLambertMaterial({ color });
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(pos[0], pos[1], pos[2]);
            if (geo instanceof THREE.TorusGeometry && pos[0] === -90) {
                mesh.rotation.x = Math.PI / 4;
            }
            objects.push(mesh);
        });

        // Standing plane
        const planeGeometry = new THREE.PlaneGeometry(20, 30);
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x4400ff,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(100, 15, -10);
        plane.rotation.y = Math.PI / 4;
        objects.push(plane);
    }
}

export default Objects;
