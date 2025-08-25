import React from 'react';
import * as THREE from 'three';
import { PieceType } from '../../../types';
import { getPubsub } from '../../../utils/PubSub';
import { useGLTF } from '@react-three/drei';
import { liftDownPiece, liftPiece } from '../../../utils/liftPiece';

function brightenTexturedObject(object, brightnessFactor = 1.5) {
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const material = child.material;

            // Store original values
            if (material.userData.originalToneMapping === undefined) {
                material.userData.originalToneMapping = material.toneMapped;
                material.userData.originalColor = material.color
                    ? material.color.clone()
                    : new THREE.Color(1, 1, 1);
            }

            // Disable tone mapping and brighten with color multiplier
            material.toneMapped = false;
            if (material.color) {
                material.color.setScalar(brightnessFactor);
            }
        }
    });
}

// Method 2: Using map texture modulation with color
function modulateTextureColor(
    object,
    colorMultiplier = new THREE.Color(1.3, 1.3, 1.3)
) {
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const material = child.material;

            // Store original color
            if (!material.userData.originalColor) {
                material.userData.originalColor = material.color
                    ? material.color.clone()
                    : new THREE.Color(1, 1, 1);
            }

            // Set color to modulate the texture
            if (material.color) {
                material.color.copy(colorMultiplier);
            }
        }
    });
}

// Method 3: Adding a subtle emissive texture effect (less blurry)
function addSubtleEmissive(
    object,
    emissiveStrength = 0.05,
    emissiveColor = 0xffffff
) {
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            const material = child.material;

            if (material.emissive) {
                // Store original values
                if (!material.userData.originalEmissive) {
                    material.userData.originalEmissive =
                        material.emissive.clone();
                    material.userData.originalEmissiveIntensity =
                        material.emissiveIntensity || 0;
                }

                // Set a very subtle emissive color
                material.emissive.setHex(emissiveColor);
                material.emissiveIntensity = emissiveStrength;
            }
        }
    });
}

// Method 4: Create a custom shader material that modifies texture brightness
function createBrightenedMaterial(originalMaterial, brightnessFactor = 1.3) {
    // This creates a custom shader that brightens the texture
    const brightenedMaterial = new THREE.ShaderMaterial({
        uniforms: {
            map: { value: originalMaterial.map },
            brightness: { value: brightnessFactor },
            normalMap: { value: originalMaterial.normalMap },
            roughnessMap: { value: originalMaterial.roughnessMap },
            metalnessMap: { value: originalMaterial.metalnessMap },
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D map;
            uniform float brightness;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vec4 texColor = texture2D(map, vUv);
                
                // Brighten the texture
                texColor.rgb *= brightness;
                
                // Simple lighting calculation
                vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
                float lightIntensity = max(dot(vNormal, lightDirection), 0.3);
                
                gl_FragColor = vec4(texColor.rgb * lightIntensity, texColor.a);
            }
        `,
    });

    return brightenedMaterial;
}

// Method 5: Post-processing approach using renderer capabilities
function enableBrightnessPostProcessing(renderer, scene, camera) {
    // This requires additional setup but gives the best results
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Increase exposure to brighten
}

// Method 6: Direct texture manipulation (most control)
function manipulateTextureBrightness(
    object,
    brightnessFactor = 1.3,
    contrastFactor = 1.1
) {
    object.traverse((child) => {
        if (child.isMesh && child.material && child.material.map) {
            const material = child.material;
            const texture = material.map;

            // Create a canvas to manipulate the texture
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Get the original image
            const image = texture.image;
            canvas.width = image.width;
            canvas.height = image.height;

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            // Modify brightness and contrast
            for (let i = 0; i < data.length; i += 4) {
                // Apply brightness (additive)
                data[i] = Math.min(255, data[i] * brightnessFactor); // Red
                data[i + 1] = Math.min(255, data[i + 1] * brightnessFactor); // Green
                data[i + 2] = Math.min(255, data[i + 2] * brightnessFactor); // Blue
                // Alpha channel (data[i + 3]) remains unchanged

                // Apply contrast
                data[i] = Math.min(
                    255,
                    Math.max(0, (data[i] - 128) * contrastFactor + 128)
                );
                data[i + 1] = Math.min(
                    255,
                    Math.max(0, (data[i + 1] - 128) * contrastFactor + 128)
                );
                data[i + 2] = Math.min(
                    255,
                    Math.max(0, (data[i + 2] - 128) * contrastFactor + 128)
                );
            }

            // Put the modified data back
            ctx.putImageData(imageData, 0, 0);

            // Create new texture from modified canvas
            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.wrapS = texture.wrapS;
            newTexture.wrapT = texture.wrapT;
            newTexture.magFilter = texture.magFilter;
            newTexture.minFilter = texture.minFilter;

            // Replace the texture
            material.map = newTexture;
            material.needsUpdate = true;
        }
    });
}

interface ChessPieceProps {
    piece: PieceType;
    color: 'white' | 'black';
    position: [number, number, number];
    scale?: number;
    pieceId: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
    piece,
    color,
    position,
    scale = 1,
    pieceId,
}) => {
    const { scene } = useGLTF(`/src/assets/pieces/${piece}.glb`);
    const groupRef = React.useRef<THREE.Group>(null);
    const modelRef = React.useRef<THREE.Group>(null);
    const [isSelected, setIsSelected] = React.useState(false);

    const blackPieceColor = 0x572a00;
    const whitePieceColor = 0xffd092;
    const colorHash = color === 'white' ? whitePieceColor : blackPieceColor;

    // Clone and modify the loaded model with proper centering
    const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
        if (!scene)
            return {
                modifiedScene: null,
                centerOffset: new THREE.Vector3(),
                yOffset: 0,
            };

        const clonedScene = scene.clone();
        clonedScene.scale.set(
            0.2 + scale * 0.8,
            0.2 + scale,
            0.2 + scale * 0.8
        );

        // brightenTexturedObject(clonedScene, 100); // 40% brighter

        // // More subtle - modulate with color
        modulateTextureColor(clonedScene, new THREE.Color(0, 0, 200));

        // // Very subtle emissive (won't blur as much)
        // addSubtleEmissive(clonedScene, 0.02, 0xffffff);

        // // Direct texture manipulation (best quality)
        // manipulateTextureBrightness(clonedScene, 1.3, 1.1);

        // clonedScene.traverse((child) => {
        //     if ((child as THREE.Mesh).isMesh) {
        //         const mesh = child as THREE.Mesh;
        //         mesh.material = new THREE.MeshStandardMaterial({
        //             color: new THREE.Color(colorHash),
        //             roughness: 0.1,
        //             metalness: 0.5,
        //         });
        //         if (mesh.material instanceof THREE.MeshStandardMaterial) {
        //             mesh.material.emissive.set(0xff0000);
        //             mesh.material.emissiveIntensity = 0.1;
        //         }
        //     }
        // });

        // Get the bounding box in local space (before rotation)
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        const centerOffset = new THREE.Vector3(-center.x, -center.y, -center.z);

        // Create a temporary group to calculate post-rotation bounds
        const tempGroup = new THREE.Group();
        const tempModel = clonedScene.clone();
        tempModel.position.copy(centerOffset);
        tempGroup.add(tempModel);
        tempGroup.rotation.x = -Math.PI / 2;

        // Calculate how much to lift the piece so bottom touches y=0
        const rotatedBox = new THREE.Box3().setFromObject(tempGroup);
        const yOffset = -rotatedBox.min.y;

        return { modifiedScene: clonedScene, centerOffset, yOffset };
    }, [scene, scale, colorHash]);

    // Calculate final positioning
    const adjustedPosition = React.useMemo(() => {
        return [
            position[0],
            position[1] + yOffset + 2.55, // Lift to sit on floor
            position[2],
        ] as [number, number, number];
    }, [position, yOffset]);

    // Subscribe to piece selection events
    React.useEffect(() => {
        const pubSub = getPubsub();
        if (!pubSub || !groupRef.current) return;

        const handlePieceSelection = (selectedPiece: any) => {
            if (!groupRef.current) return;

            if (selectedPiece.pieceId === pieceId) {
                if (!isSelected) {
                    liftPiece(groupRef.current);
                    setIsSelected(true);
                }
            } else if (selectedPiece.pieceId) {
                if (isSelected) {
                    liftDownPiece(groupRef.current);
                    setIsSelected(false);
                }
            }
        };

        const unsubscribe = pubSub.subscribe(
            'piece_selected',
            handlePieceSelection
        );
        return unsubscribe;
    }, [pieceId, isSelected]);

    const handleClick = (e: THREE.Event) => {
        e.stopPropagation();
        const pubSub = getPubsub();
        if (pubSub) {
            pubSub.publish('piece_selected', { pieceId });
        }
    };

    if (!modifiedScene) return null;

    return (
        <group
            ref={groupRef}
            position={adjustedPosition}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
            userData={{
                piece,
                color,
                isPiece: true,
                pieceId,
                isSelected,
            }}
            onClick={handleClick}
        >
            <group ref={modelRef} position={centerOffset}>
                <primitive object={modifiedScene} />
            </group>
        </group>
    );
};
