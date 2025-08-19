import * as THREE from 'three';

class ChessBoard {
    public async create(): Promise<THREE.Object3D> {
        const boardItems = new THREE.Group();

        // Create base/thickness for the board with thickness of 5
        const baseGeometry = new THREE.BoxGeometry(100, 5, 100); // Width, Height(thickness), Depth
        const baseMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b4513, // Wood brown color
        });
        const boardBase = new THREE.Mesh(baseGeometry, baseMaterial);
        boardBase.position.y = 0; // Center the base
        boardBase.castShadow = true;
        boardBase.receiveShadow = true;
        boardItems.add(boardBase);

        // Your existing board top (adjusted position)
        const boardTexture = await this.createBoardTexture();
        const boardTopGeometry = new THREE.PlaneGeometry(80, 80);
        const boardTopMaterial = new THREE.MeshLambertMaterial({
            map: boardTexture,
        });
        const boardTop = new THREE.Mesh(boardTopGeometry, boardTopMaterial);
        boardTop.rotation.x = -Math.PI / 2;
        boardTop.position.y = 2.55; // On top of the 5-unit thick base
        boardTop.receiveShadow = true;
        boardItems.add(boardTop);

        // Your existing frame (adjusted position)
        const boardFrames = await this.getBoardFrameTexture();
        const frameGeometry = new THREE.PlaneGeometry(100, 100);
        const frameMaterial = new THREE.MeshLambertMaterial({
            map: boardFrames,
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.rotation.x = -Math.PI / 2;
        frame.position.y = 2.52; // Slightly below board top
        boardItems.add(frame);

        return boardItems;
    }
    private boardFrameTexture: THREE.CanvasTexture | null = null;

    private async getBoardFrameTexture(): Promise<THREE.CanvasTexture> {
        if (!this.boardFrameTexture) {
            this.boardFrameTexture = await this.createBoardFrame();
        }
        return this.boardFrameTexture;
    }

    private async createBoardFrame(): Promise<THREE.CanvasTexture> {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = 5120;
        frameCanvas.height = 5120;
        const ctx = frameCanvas.getContext('2d')!;

        // Enable smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const verticalImage = await this.loadImage(
            new URL(
                '../../assets/board_frame/frame_vertical.jpg',
                import.meta.url
            ).href
        );
        const horizontalImage = await this.loadImage(
            new URL(
                '../../assets/board_frame/frame_horizontal.jpg',
                import.meta.url
            ).href
        );

        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(640, 640);
        ctx.lineTo(4480, 640);
        ctx.lineTo(5120, 0);
        ctx.closePath();
        ctx.clip(); // everything drawn after this is masked
        ctx.drawImage(horizontalImage, 0, 0, 5120, 5120);
        ctx.restore();

        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(640, 640);
        ctx.lineTo(640, 4480);
        ctx.lineTo(0, 5120);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(verticalImage, 0, 0, 5120, 5120);
        ctx.restore();

        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.moveTo(0, 5120);
        ctx.lineTo(640, 4480);
        ctx.lineTo(4480, 4480);
        ctx.lineTo(5120, 5120);
        ctx.closePath();
        ctx.clip(); // everything drawn after this is masked
        ctx.drawImage(horizontalImage, 0, 0, 5120, 5120);
        ctx.restore();

        ctx.save(); // Save the current state
        ctx.beginPath();
        ctx.moveTo(5120, 5120);
        ctx.lineTo(4480, 4480);
        ctx.lineTo(4480, 640);
        ctx.lineTo(5120, 0);
        ctx.closePath();
        ctx.clip(); // everything drawn after this is masked
        ctx.drawImage(verticalImage, 0, 0, 5120, 5120);
        ctx.restore();

        const texture = new THREE.CanvasTexture(frameCanvas);
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Best for distance viewing
        texture.magFilter = THREE.LinearFilter; // Smooth close-up viewing
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding; // Better color reproduction
        texture.generateMipmaps = true; // Enable automatic mipmap generation
        texture.wrapS = THREE.ClampToEdgeWrapping; // Prevent edge artifacts
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
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
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // 30% white overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );

                    // Add slight warm tint to light squares
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = 'rgba(255, 248, 220, 0.2)'; // Warm cream overlay
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
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.37)'; // 40% black overlay
                    ctx.fillRect(
                        col * squareSize,
                        row * squareSize,
                        squareSize,
                        squareSize
                    );

                    // Add subtle cool tint to dark squares
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.fillStyle = 'rgba(224, 188, 26, 0.4)'; // Cool dark overlay
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
        texture.wrapS = THREE.ClampToEdgeWrapping; // Prevent edge artifacts
        texture.wrapT = THREE.ClampToEdgeWrapping;
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
