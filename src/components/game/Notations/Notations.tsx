import { useMemo } from 'react'
import * as THREE from 'three'
import { Text3D } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8]

const BOARD_CONFIG = {
  size: 80,
  squareSize: 10,
  textSize: 2,
  textHeight: 0.05,
  textY: 2.2,
  offset: 3.5,
}

const TEXT_CONFIG = {
  bevelEnabled: true,
  bevelSize: 0.1,
  bevelSegments: 5,
  bevelThickness: 0.5,
}

const ROTATIONS = {
  flat: new THREE.Euler(-Math.PI / 2, 0, 0),
  flatReverse: new THREE.Euler(-Math.PI / 2, 0, Math.PI),
}

export function BoardCoordinates() {
  const { size, squareSize, textSize, textHeight, textY, offset } = BOARD_CONFIG
  const halfBoard = size / 2
  const halfText = textSize / 2
  const quarterText = textSize / 4

  // Create material
  const texture = useLoader(THREE.TextureLoader, '/textures/fontTexture.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        color: new THREE.Color(0.25, 0.15, 0.15),
        roughness: 10,
      }),
    [texture]
  )

  // Calculate positions
  const positions = useMemo(() => {
    const filePositions = FILES.map((_, i) => i * squareSize - 35 - halfText)
    const rankPositions = RANKS.map((_, i) => i * squareSize - 35 + halfText)

    return {
      files: filePositions,
      ranks: rankPositions,
      boundaries: {
        south: halfBoard + quarterText + offset,
        north: -halfBoard - offset - quarterText,
        west: -halfBoard - offset - quarterText,
        east: halfBoard + offset + quarterText,
      },
    }
  }, [size, squareSize, textSize, offset])

  // @ts-ignore
  const createText3D = (content, position, rotation, key) => (
    <Text3D
      key={key}
      // @ts-ignore
      font="/fonts/font.json"
      size={textSize}
      height={textHeight}
      position={position}
      rotation={rotation}
      material={material}
      castShadow
      receiveShadow
      {...TEXT_CONFIG}
    >
      {content}
    </Text3D>
  )

  return (
    <group>
      {/* Files (letters) */}
      {/* South side - normal order */}
      {positions.files
        .slice()
        .reverse()
        .map((x, i) =>
          createText3D(
            FILES[i],
            [x, textY, positions.boundaries.south],
            ROTATIONS.flat,
            `file-south-${i}`
          )
        )}

      {/* North side - reversed order */}
      {positions.files.map((x, i) =>
        createText3D(
          FILES[7 - i],
          [x + textSize - quarterText, textY, positions.boundaries.north],
          ROTATIONS.flatReverse,
          `file-north-${i}`
        )
      )}

      {/* Ranks (numbers) */}
      {/* West side */}
      {positions.ranks.map((z, i) =>
        createText3D(
          String(RANKS[i]),
          [positions.boundaries.west, textY, z],
          ROTATIONS.flat,
          `rank-west-${i}`
        )
      )}

      {/* East side */}
      {positions.ranks
        .slice()
        .reverse()
        .map((z, i) =>
          createText3D(
            String(RANKS[7 - i]),
            [positions.boundaries.east, textY, z - halfText],
            ROTATIONS.flatReverse,
            `rank-east-${i}`
          )
        )}
    </group>
  )
}
