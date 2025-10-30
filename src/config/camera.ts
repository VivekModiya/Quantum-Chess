import { CameraProps } from '@react-three/fiber'

export const cameraConfig: CameraProps = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: [0, 900, -900], // Initial camera position
}
