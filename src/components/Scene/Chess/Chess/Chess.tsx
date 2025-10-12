import { useGLTF } from '@react-three/drei'

import { Board } from '../Board'
import { Pieces } from '../Pieces'
import React from 'react'

export const Chess: React.FC = () => {
  React.useEffect(() => {
    ;['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'].forEach(piece => {
      useGLTF.preload(`/src/assets/pieces/${piece}.glb`)
    })
  }, [])

  return (
    <group>
      {/* <Room position={[0, 50, 0]} scale={10} /> */}
      <Board position={[0, 0, 0]} />
      <Pieces />
    </group>
  )
}
