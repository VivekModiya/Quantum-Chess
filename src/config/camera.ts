export type CameraRole = 'white' | 'black' | 'spectator'

const CAMERA_POSITIONS: Record<CameraRole, [number, number, number]> = {
  white: [0, 150, -130],
  black: [0, 150, 130],
  spectator: [150, 150, 0],
}

export function getCameraPosition(role: CameraRole): [number, number, number] {
  return CAMERA_POSITIONS[role]
}
