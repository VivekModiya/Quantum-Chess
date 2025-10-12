import React from 'react'

import { SceneLighting } from './SceneLighting'
import { MovementControls } from './MovementControls'
import { Chess } from '../Scene'

interface SceneProps {
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
}

export const Scene: React.FC<SceneProps> = ({ isLocked, setIsLocked }) => {
  return (
    <>
      {/* Lighting setup */}
      <SceneLighting />

      {/* Scene objects */}
      <Chess />

      {/* Controls and interactions */}
      <MovementControls isLocked={isLocked} setIsLocked={setIsLocked} />
    </>
  )
}
