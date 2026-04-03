import React from 'react'
import * as THREE from 'three'

import { useGLTF, useTexture } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { useChess } from '../../../provider'
import { usePubSub } from '../../../hooks'
import { shadowConfig } from '../../../config'
import { PIECE_COLOR_RGB } from '../../../constants'
import { assetUrl } from '../../../utils'

interface PieceObjectProps {
  pieceId: string
  handleClick: (e: ThreeEvent<MouseEvent>) => void
  pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
}

const PIECE_SCALE = 1.4

export const PieceObject: React.FC<PieceObjectProps> = ({
  pieceId,
  handleClick,
  pieceRef,
}) => {
  const { chess } = useChess()
  const pieceData = chess.byId(pieceId)
  const { subscribe } = usePubSub()

  // Track the square we're currently rendering at (to prevent flicker during animation)
  const [renderSquare, setRenderSquare] = React.useState(
    pieceData?.square ?? ''
  )

  // Early return if piece doesn't exist
  if (!pieceData) return null

  const { color, piece, square } = pieceData

  // Listen for move completion to update render position
  React.useEffect(() => {
    const unsubscribe = subscribe(
      'move_completed',
      ({ pieceId: movedPieceId, toSquare }) => {
        if (movedPieceId === pieceId) {
          // Update render square only after animation completes
          setRenderSquare(toSquare)
        }
      }
    )
    return unsubscribe
  }, [pieceId, subscribe])

  // Initialize render square on first render
  React.useEffect(() => {
    if (renderSquare === '' && square) {
      setRenderSquare(square)
    }
  }, [square, renderSquare])

  const coords = chess.coords(renderSquare ?? '')
  const { file, rank } = coords ?? { file: 0, rank: 0 }
  const x = -(file - 1) * 10 + 35
  const z = (rank - 1) * 10 - 35

  const { scene } = useGLTF(assetUrl(`models/${piece}.glb`))
  const modelRef = React.useRef<THREE.Group>(null)
  const hoveredRef = React.useRef(false)
  const emissiveIntensityRef = React.useRef(0)
  const pulseTimeRef = React.useRef(0)

  // Load wood textures — configured once, shared across all pieces
  const woodTextures = useTexture({
    map: assetUrl('textures/WoodFloor064_1K-JPG_Color.jpg'),
    normalMap: assetUrl('textures/WoodFloor064_1K-JPG_NormalGL.jpg'),
    roughnessMap: assetUrl('textures/WoodFloor064_1K-JPG_Roughness.jpg'),
  })

  // Configure texture wrapping once (no-op after first call since same texture objects are reused by useTexture)
  React.useMemo(() => {
    ;[
      woodTextures.map,
      woodTextures.normalMap,
      woodTextures.roughnessMap,
    ].forEach(tex => {
      if (tex.wrapS !== THREE.RepeatWrapping) {
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(2, 2)
        tex.needsUpdate = true
      }
    })
  }, [woodTextures])

  // Memoize color calculations
  const colorHash = React.useMemo(() => PIECE_COLOR_RGB[color], [color])

  // Clone and modify the loaded model with proper centering
  const { modifiedScene, centerOffset, yOffset } = React.useMemo(() => {
    if (!scene)
      return {
        modifiedScene: null,
        centerOffset: new THREE.Vector3(),
        yOffset: 0,
      }

    const clonedScene = scene.clone()
    clonedScene.scale.set(
      0.2 + PIECE_SCALE * 0.8,
      0.2 + PIECE_SCALE,
      0.2 + PIECE_SCALE * 0.8
    )

    clonedScene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial

        // Clone material only (not textures) — share texture instances across all pieces
        const newMaterial = material.clone()
        newMaterial.map = woodTextures.map
        newMaterial.normalMap = woodTextures.normalMap
        newMaterial.roughnessMap = woodTextures.roughnessMap

        if (!newMaterial.userData.originalColor) {
          newMaterial.userData.originalColor = newMaterial.color.clone()
        }

        // Tint the wood texture with the piece color (values are 0-255 range, convert to 0-1)
        newMaterial.color.setRGB(
          colorHash[0] / 255,
          colorHash[1] / 255,
          colorHash[2] / 255
        )

        newMaterial.metalness = 0.1
        newMaterial.roughness = 0.7

        child.material = newMaterial

        // Enable shadows on the mesh
        child.castShadow = shadowConfig
        child.receiveShadow = shadowConfig
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

    return { modifiedScene: clonedScene, centerOffset, yOffset }
  }, [scene, colorHash, woodTextures])

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
    }
  }, [modifiedScene])

  // Pulsing brightness loop while hovered, smooth fade-out when not
  useFrame((_, delta) => {
    if (!modifiedScene) return
    let next: number
    if (hoveredRef.current) {
      pulseTimeRef.current += delta * 3
      next = 0.05 + 0.15 * (0.5 + 0.5 * Math.sin(pulseTimeRef.current))
    } else {
      pulseTimeRef.current = 0
      const current = emissiveIntensityRef.current
      next = THREE.MathUtils.lerp(current, 0, 1 - Math.exp(-6 * delta))
      if (next < 0.001) next = 0
    }
    if (Math.abs(next - emissiveIntensityRef.current) < 0.0005) return
    emissiveIntensityRef.current = next
    const emissiveColor = color === 'black' ? 0x997022 : 0xff9900
    modifiedScene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissive.set(emissiveColor)
        mat.emissiveIntensity = next * (color === 'black' ? 1 : 5)
      }
    })
  })

  // Calculate final positioning
  const adjustedPosition = React.useMemo(() => {
    return [
      x,
      yOffset + 2.55, // Lift to sit on floor
      z,
    ] as [number, number, number]
  }, [x, z, yOffset])

  if (!modifiedScene) return null

  const pieceRotation = React.useMemo(() => {
    if (color === 'black' && piece === 'knight') {
      return Math.PI
    } else if (piece === 'bishop') {
      return color === 'black' ? Math.PI / 2 : -Math.PI / 2
    }
    return 0
  }, [color, piece])

  return (
    <group
      ref={pieceRef}
      position={adjustedPosition}
      rotation={[-Math.PI / 2, 0, pieceRotation]}
      castShadow={shadowConfig}
      receiveShadow={shadowConfig}
      frustumCulled={true}
      userData={{
        piece,
        color,
        isPiece: true,
        pieceId,
        isSelected: false,
      }}
      onClick={e => handleClick(e)}
      onPointerOver={e => {
        e.stopPropagation()
        hoveredRef.current = true
      }}
      onPointerLeave={() => {
        hoveredRef.current = false
      }}
    >
      <group ref={modelRef} position={centerOffset}>
        <primitive object={modifiedScene} />
      </group>
    </group>
  )
}
