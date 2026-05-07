import React from 'react'
import { Html } from '@react-three/drei'
import { CubeLoader } from './CubeLoader'

export const Loader: React.FC = () => (
  <Html fullscreen>
    <CubeLoader />
  </Html>
)
