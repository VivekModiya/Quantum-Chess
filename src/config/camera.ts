import { CameraProps } from '@react-three/fiber'

export type CameraRole = 'white' | 'black' | 'spectator'

const CAMERA_POSITIONS: Record<CameraRole, [number, number, number]> = {
  white: [0, 900, -900],
  black: [0, 900, 900],
  spectator: [900, 900, 0],
}

export function getCameraPosition(role: CameraRole): [number, number, number] {
  return CAMERA_POSITIONS[role]
}

export const cameraConfig: CameraProps = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: [0, 900, -900], // Default, overridden per player
}
