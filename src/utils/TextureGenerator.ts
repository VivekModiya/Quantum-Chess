import * as THREE from 'three';

export function createGridTexture(): THREE.CanvasTexture {
    const gridSize = 512;
    const gridDivisions = 16;
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d')!;

    // Fill white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, gridSize, gridSize);

    // Draw grid lines
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    for (let i = 0; i <= gridDivisions; i++) {
        const pos = (i / gridDivisions) * gridSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, gridSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(gridSize, pos);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    return texture;
}

export function createColorfulWallTexture(): THREE.CanvasTexture {
    const wallCanvas = document.createElement('canvas');
    const wallSize = 1024;
    wallCanvas.width = wallSize;
    wallCanvas.height = wallSize;
    const ctx = wallCanvas.getContext('2d')!;

    // Create aesthetic gradient background
    const gradient = ctx.createLinearGradient(0, 0, wallSize, wallSize);
    gradient.addColorStop(0, '#ff6b9d');
    gradient.addColorStop(0.2, '#c44569');
    gradient.addColorStop(0.4, '#f8b500');
    gradient.addColorStop(0.6, '#00d2d3');
    gradient.addColorStop(0.8, '#54a0ff');
    gradient.addColorStop(1, '#5f27cd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, wallSize, wallSize);

    // Add colorful geometric patterns
    const colors = [
        '#ff9ff3',
        '#54a0ff',
        '#5ee6eb',
        '#fffa65',
        '#ff6348',
        '#1dd1a1',
        '#feca57',
        '#ff9ff3',
        '#a55eea',
    ];

    // Random circles
    for (let i = 0; i < 50; i++) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * wallSize;
        const y = Math.random() * wallSize;
        const radius = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Random triangles
    for (let i = 0; i < 30; i++) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * wallSize;
        const y = Math.random() * wallSize;
        const size = Math.random() * 40 + 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
        ctx.closePath();
        ctx.fill();
    }

    // Random rectangles and wavy lines
    for (let i = 0; i < 40; i++) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * wallSize;
        const y = Math.random() * wallSize;
        const width = Math.random() * 50 + 15;
        const height = Math.random() * 50 + 15;
        ctx.fillRect(x, y, width, height);
    }

    for (let i = 0; i < 15; i++) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.lineWidth = Math.random() * 8 + 3;
        ctx.beginPath();
        const startX = Math.random() * wallSize;
        const startY = Math.random() * wallSize;
        ctx.moveTo(startX, startY);

        for (let j = 0; j < 5; j++) {
            const cpX = startX + (Math.random() - 0.5) * 200;
            const cpY = startY + (Math.random() - 0.5) * 200;
            const endX = startX + (Math.random() - 0.5) * 300;
            const endY = startY + (Math.random() - 0.5) * 300;
            ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        }
        ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 2);

    return wallTexture;
}
