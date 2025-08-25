import gsap from 'gsap';

// Assume `piece` is a THREE.Mesh
export function liftPiece(piece: THREE.Object3D) {
    gsap.to(piece.position, {
        y: piece.position.y + 3,
        duration: 0.2, // 200 ms
        ease: 'power1.out',
    });

    gsap.to(piece.scale, {
        x: piece.scale.x + 0.2,
        y: piece.scale.y + 0.2,
        z: piece.scale.z + 0.2,
        duration: 0.2,
        ease: 'power1.out',
    });
}

export function liftDownPiece(piece: THREE.Object3D) {
    gsap.to(piece.position, {
        y: piece.position.y - 3,
        duration: 0.2, // 200 ms
        ease: 'power1.out',
    });

    gsap.to(piece.scale, {
        x: piece.scale.x - 0.2,
        y: piece.scale.y - 0.2,
        z: piece.scale.z - 0.2,
        duration: 0.2,
        ease: 'power1.out',
    });
}
