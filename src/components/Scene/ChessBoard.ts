import * as THREE from 'three';

class ChessBoard {
    public async create(): Promise<THREE.Object3D> {
        // Wait for the texture to be created
        const boardTexture = await this.createBoardTexture();
        const boardTopGeometry = new THREE.PlaneGeometry(80, 80);
        const boardTopMaterial = new THREE.MeshLambertMaterial({
            map: boardTexture,
        });
        const boardTop = new THREE.Mesh(boardTopGeometry, boardTopMaterial);
        boardTop.rotation.x = -Math.PI / 2;
        boardTop.position.y = 0.05;

        return boardTop;
    }

    private async createBoardTexture(): Promise<THREE.CanvasTexture> {
        const boardCanvas = document.createElement('canvas');
        const squareSize = 512; // Reduced from 1024 for better performance and smoother distant viewing
        boardCanvas.width = squareSize * 8; // 4096
        boardCanvas.height = squareSize * 8; // 4096
        const ctx = boardCanvas.getContext('2d')!;

        // Enable smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const textures = await Promise.all(
            Array.from({ length: 33 }).map((_, i) => {
                if (i === 32) {
                    return this.loadImage(
                        new URL(
                            '../../assets/board_squares/square_light.jpg',
                            import.meta.url
                        ).href
                    );
                }
                return this.loadImage(
                    new URL(
                        `../../assets/board_squares/square_${i % 16}.jpg`,
                        import.meta.url
                    ).href
                );
            })
        );

        let blackIndex = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const index = isLight ? 32 : blackIndex++ % 16;

                // Draw the base texture
                ctx.drawImage(
                    textures[index],
                    col * squareSize,
                    row * squareSize,
                    squareSize,
                    squareSize
                );

                // Apply contrast enhancement overlay
                if (isLight) {
                    // Make light squares lighter with a bright overlay
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen'; // Lightens the image
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // 30% white overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );

                    // Add slight warm tint to light squares
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = 'rgba(255, 248, 220, 0.3)'; // Warm cream overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );
                    ctx.restore();
                } else {
                    // Make dark squares darker with a dark overlay
                    ctx.save();
                    ctx.globalCompositeOperation = 'multiply'; // Darkens the image
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // 40% black overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );

                    // Add subtle cool tint to dark squares
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = 'rgba(20, 20, 40, 0.3)'; // Cool dark overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );
                    ctx.restore();
                }
            }
        }

        const texture = new THREE.CanvasTexture(boardCanvas);
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Best for distance viewing
        texture.magFilter = THREE.LinearFilter; // Smooth close-up viewing
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding; // Better color reproduction
        texture.generateMipmaps = true; // Enable automatic mipmap generation
        texture.wrapS = THREE.ClampToEdgeWrap; // Prevent edge artifacts
        texture.wrapT = THREE.ClampToEdgeWrap;
        return texture;
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS if needed
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }
}

export default ChessBoard;
