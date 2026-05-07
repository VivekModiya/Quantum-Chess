import React from 'react'
import * as THREE from 'three'

import { useGLTF, useTexture } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { shadowConfig } from '../../../config'
import {
  PIECE_COLOR_RGB,
  PIECE_EMISSIVE,
  PIECE_HOVER_ANIM,
  PIECE_MATERIAL,
  BOARD,
} from '../../../constants'
import { assetUrl } from '../../../utils'
import { PieceColor, PieceType } from '../../../types'

interface PieceModelProps {
  piece: PieceType
  color: PieceColor
  boardX: number
  boardZ: number
  pieceRotation: number
  handleClick?: (e: ThreeEvent<MouseEvent>) => void
  pieceRef?: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
  userData?: Record<string, unknown>
  /** Overall scale multiplier (default 1) */
  scale?: number
  /** Enable hover pulse animation (default true) */
  interactive?: boolean
}

const PIECE_SCALE = 1.5

/** Outline thickness in model-space units */
const OUTLINE_THICKNESS = 0.02
const OUTLINE_COLOR: Record<PieceColor, string> = {
  black: '#ae8e67',
  white: '#979797',
}

/**
 * Build an inverted-hull outline group from a source scene.
 * For each mesh: clone geometry, push vertices along normals,
 * and apply a flat BackSide material.
 */
function buildOutlineHull(
  source: THREE.Group,
  outlineColor: string,
  thickness: number
): THREE.Group {
  const hull = new THREE.Group()

  // Match the source scene's scale so outline aligns with the piece
  hull.scale.copy(source.scale)

  source.traverse(child => {
    if (!(child instanceof THREE.Mesh) || !child.geometry) return

    const geo = child.geometry.clone()
    const posAttr = geo.getAttribute('position')
    const normAttr = geo.getAttribute('normal')

    if (!posAttr || !normAttr) return

    // Push each vertex outward along its normal
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.setXYZ(
        i,
        posAttr.getX(i) + normAttr.getX(i) * thickness,
        posAttr.getY(i) + normAttr.getY(i) * thickness,
        posAttr.getZ(i) + normAttr.getZ(i) * thickness
      )
    }
    posAttr.needsUpdate = true

    const mat = new THREE.MeshBasicMaterial({
      color: outlineColor,
      side: THREE.BackSide,
    })

    const mesh = new THREE.Mesh(geo, mat)
    // Copy transform from source mesh
    mesh.position.copy(child.position)
    mesh.rotation.copy(child.rotation)
    mesh.scale.copy(child.scale)
    mesh.renderOrder = -2
    hull.add(mesh)
  })

  return hull
}

export const PieceModel: React.FC<PieceModelProps> = React.memo(
  ({
    piece,
    color,
    boardX,
    boardZ,
    pieceRotation,
    handleClick,
    pieceRef,
    userData,
    scale = 1,
    interactive = true,
  }) => {
    const { scene } = useGLTF(assetUrl(`models/${piece}.glb`))
    const modelRef = React.useRef<THREE.Group>(null)
    const hoveredRef = React.useRef(false)
    const outlineGroupRef = React.useRef<THREE.Group>(null)

    // BASE_EMISSIVE is the tracking-ref value; actual material intensity = BASE_EMISSIVE * PIECE_HOVER_ANIM.emissiveScale
    const BASE_EMISSIVE =
      PIECE_EMISSIVE[color].intensity / PIECE_HOVER_ANIM.emissiveScale
    const emissiveIntensityRef = React.useRef(BASE_EMISSIVE)
    const pulseTimeRef = React.useRef(0)

    // Load color-specific textures for white and black pieces
    const whiteTextures = useTexture({
      map: assetUrl('textures/Texture_White__Color.jpg'),
      normalMap: assetUrl('textures/Texture_White_NormalGL.jpg'),
      roughnessMap: assetUrl('textures/Texture_White_Roughness.jpg'),
      aoMap: assetUrl('textures/Texture_White_AmbientOcclusion.jpg'),
      displacementMap: assetUrl('textures/Texture_White_Displacement.jpg'),
    })
    const blackTextures = useTexture({
      map: assetUrl('textures/Texture_White__Color.jpg'),
      normalMap: assetUrl('textures/Texture_White_NormalGL.jpg'),
      roughnessMap: assetUrl('textures/Texture_White_Roughness.jpg'),
      aoMap: assetUrl('textures/Texture_White_AmbientOcclusion.jpg'),
      displacementMap: assetUrl('textures/Texture_White_Displacement.jpg'),
    })
    const pieceTextures = color === 'white' ? whiteTextures : blackTextures

    // Configure texture wrapping once (no-op after first call since same texture objects are reused by useTexture)
    React.useMemo(() => {
      ;[
        pieceTextures.map,
        pieceTextures.normalMap,
        pieceTextures.roughnessMap,
      ].forEach(tex => {
        if (tex.wrapS !== THREE.RepeatWrapping) {
          tex.wrapS = THREE.RepeatWrapping
          tex.wrapT = THREE.RepeatWrapping
          tex.repeat.set(
            PIECE_MATERIAL.textureRepeat,
            PIECE_MATERIAL.textureRepeat
          )
          tex.needsUpdate = true
        }
      })
    }, [pieceTextures])

    // Memoize color calculations
    const colorHash = React.useMemo(() => PIECE_COLOR_RGB[color], [color])

    // Clone and modify the loaded model with proper centering
    const { modifiedScene, outlineScene, centerOffset, yOffset } =
      React.useMemo(() => {
        if (!scene)
          return {
            modifiedScene: null,
            outlineScene: null,
            centerOffset: new THREE.Vector3(),
            yOffset: 0,
          }

        const clonedScene = scene.clone()
        clonedScene.scale.set(
          PIECE_SCALE * scale,
          PIECE_SCALE * scale,
          PIECE_SCALE * scale
        )

        clonedScene.traverse(child => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial

            // Clone material only (not textures) — share texture instances across all pieces
            const newMaterial = material.clone()
            newMaterial.map = pieceTextures.map
            newMaterial.normalMap = pieceTextures.normalMap
            newMaterial.roughnessMap = pieceTextures.roughnessMap
            newMaterial.emissive.set(PIECE_EMISSIVE[color].color)
            newMaterial.emissiveIntensity = PIECE_EMISSIVE[color].intensity
            newMaterial.displacementScale = PIECE_MATERIAL.displacementScale
            newMaterial.displacementMap = (
              pieceTextures as typeof whiteTextures
            ).displacementMap

            if (!newMaterial.userData.originalColor) {
              newMaterial.userData.originalColor = newMaterial.color.clone()
            }

            // Tint the wood texture with the piece color (values are 0-255 range, convert to 0-1)
            newMaterial.color.set(colorHash)

            newMaterial.metalness = PIECE_MATERIAL.metalness
            newMaterial.roughness = PIECE_MATERIAL.roughness

            child.material = newMaterial

            // Enable shadows on the mesh
            child.castShadow = shadowConfig
            child.receiveShadow = shadowConfig
            child.renderOrder = -1
          }
        })

        const box = new THREE.Box3().setFromObject(clonedScene)
        const center = box.getCenter(new THREE.Vector3())
        const centerOffset = new THREE.Vector3(-center.x, -center.y, -center.z)

        // Create a temporary group to calculate post-rotation bounds
        const tempGroup = new THREE.Group()
        const tempModel = clonedScene.clone()
        tempModel.position.copy(centerOffset)
        tempGroup.add(tempModel)
        tempGroup.rotation.x = -Math.PI / 2

        // Calculate how much to lift the piece so bottom touches y=0
        const rotatedBox = new THREE.Box3().setFromObject(tempGroup)
        const yOffset = -rotatedBox.min.y

        // Build inverted-hull outline geometry
        const outlineScene = buildOutlineHull(
          clonedScene,
          OUTLINE_COLOR[color],
          OUTLINE_THICKNESS
        )

        return {
          modifiedScene: clonedScene,
          outlineScene,
          centerOffset,
          yOffset,
        }
      }, [scene, colorHash, pieceTextures, color, scale])

    // Cleanup effect to dispose of cloned materials when component unmounts (shared textures are NOT disposed)
    React.useEffect(() => {
      return () => {
        if (modifiedScene) {
          modifiedScene.traverse(child => {
            if (child instanceof THREE.Mesh) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose())
              } else {
                child.material?.dispose()
              }
            }
          })
        }
        if (outlineScene) {
          outlineScene.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry?.dispose()
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose())
              } else {
                child.material?.dispose()
              }
            }
          })
        }
      }
    }, [modifiedScene, outlineScene])

    // Pulsing brightness loop while hovered, smooth fade-out when not
    useFrame((_, delta) => {
      if (!interactive || !modifiedScene) return

      let next: number
      if (hoveredRef.current) {
        pulseTimeRef.current += delta * PIECE_HOVER_ANIM.pulseSpeed
        next =
          PIECE_HOVER_ANIM.pulseMin +
          PIECE_HOVER_ANIM.pulseAmp *
            (0.5 +
              0.5 * Math.sin(pulseTimeRef.current * PIECE_HOVER_ANIM.sinFreq))
      } else {
        pulseTimeRef.current = 0
        const current = emissiveIntensityRef.current
        if (current === BASE_EMISSIVE) return
        next = THREE.MathUtils.lerp(
          current,
          BASE_EMISSIVE,
          1 - Math.exp(-PIECE_HOVER_ANIM.fadeSpeed * delta)
        )
        if (Math.abs(next - BASE_EMISSIVE) < PIECE_HOVER_ANIM.snapThreshold)
          next = BASE_EMISSIVE
      }
      emissiveIntensityRef.current = next
      modifiedScene.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissive.set(PIECE_EMISSIVE[color].color)
          mat.emissiveIntensity = next * PIECE_HOVER_ANIM.emissiveScale
        }
      })
    })

    // Calculate final positioning — yOffset is derived from model geometry
    const adjustedPosition = React.useMemo(() => {
      return [boardX, yOffset + BOARD.Y_OFFSET, boardZ] as [
        number,
        number,
        number,
      ]
    }, [boardX, boardZ, yOffset])

    if (!modifiedScene) return null

    return (
      <group
        ref={pieceRef}
        position={adjustedPosition}
        rotation={[-Math.PI / 2, 0, pieceRotation]}
        castShadow={shadowConfig}
        receiveShadow={shadowConfig}
        frustumCulled={true}
        userData={userData}
        onClick={handleClick ? e => handleClick(e) : undefined}
        onPointerOver={
          interactive
            ? e => {
                e.stopPropagation()
                hoveredRef.current = true
              }
            : undefined
        }
        onPointerLeave={
          interactive
            ? () => {
                hoveredRef.current = false
              }
            : undefined
        }
      >
        <group ref={modelRef} position={centerOffset}>
          <primitive object={modifiedScene} />
          {outlineScene && (
            <group ref={outlineGroupRef}>
              <primitive object={outlineScene} />
            </group>
          )}
        </group>
      </group>
    )
  }
)
