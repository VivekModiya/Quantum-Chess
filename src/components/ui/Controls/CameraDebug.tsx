import React from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useControls, button, folder } from 'leva'
import * as THREE from 'three'

export const CameraDebug: React.FC = () => {
  const { camera } = useThree()
  // Stable refs — avoids stale closures in useFrame callbacks
  const controlsRef = React.useRef<any>(null)
  const activeRef = React.useRef(false)
  const valRef = React.useRef({
    posX: 0,
    posY: 1200,
    posZ: -800,
    fov: 50,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0,
  })

  const [{ active, posX, posY, posZ, fov, lookAtX, lookAtY, lookAtZ }, set] =
    useControls('📷 Camera Debug', () => ({
      active: {
        value: false,
        label: 'Override Active',
        hint: 'Disables free camera controls while active',
      },
      position: folder({
        posX: { value: 0, min: -3000, max: 3000, step: 1, label: 'X' },
        posY: { value: 1200, min: -500, max: 3000, step: 1, label: 'Y' },
        posZ: { value: -800, min: -3000, max: 3000, step: 1, label: 'Z' },
      }),
      fov: { value: 50, min: 5, max: 150, step: 1, label: 'FOV' },
      lookAt: folder({
        lookAtX: { value: 0, min: -1000, max: 1000, step: 1, label: 'X' },
        lookAtY: { value: 0, min: -1000, max: 1000, step: 1, label: 'Y' },
        lookAtZ: { value: 0, min: -1000, max: 1000, step: 1, label: 'Z' },
      }),
      '⟳ Sync from Camera': button(() => {
        const perspCam = camera as THREE.PerspectiveCamera
        const target = controlsRef.current?.target as THREE.Vector3 | undefined
        set({
          posX: Math.round(camera.position.x),
          posY: Math.round(camera.position.y),
          posZ: Math.round(camera.position.z),
          fov: Math.round(perspCam.fov),
          // Sync orbit target so lookAt sliders match what you're actually seeing
          ...(target && {
            lookAtX: Math.round(target.x),
            lookAtY: Math.round(target.y),
            lookAtZ: Math.round(target.z),
          }),
        })
      }),
      '📋 Log Config': button(() => {
        const perspCam = camera as THREE.PerspectiveCamera
        const pos = camera.position
        const target = controlsRef.current?.target as THREE.Vector3 | undefined
        console.log(
          '%c📷 Camera Config',
          'color:#4caf50;font-weight:bold;font-size:14px'
        )
        console.log(
          `position: [${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}]`
        )
        console.log(`fov: ${Math.round(perspCam.fov)}`)
        if (target) {
          console.log(
            `orbitTarget: [${Math.round(target.x)}, ${Math.round(target.y)}, ${Math.round(target.z)}]`
          )
        }
        console.log(
          '--- copy into config/camera.ts ---\n' +
            `position: [${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}] as [number, number, number],\n` +
            `fov: ${Math.round(perspCam.fov)},`
        )
      }),
    }))

  // Keep refs in sync with latest leva values every render
  React.useEffect(() => {
    activeRef.current = active
  }, [active])
  React.useEffect(() => {
    valRef.current = { posX, posY, posZ, fov, lookAtX, lookAtY, lookAtZ }
  }, [posX, posY, posZ, fov, lookAtX, lookAtY, lookAtZ])

  // Keep controlsRef current; enable/disable OrbitControls to prevent the
  // frame-order fight that causes flickering when Override Active is on.
  useFrame(({ controls }) => {
    if (controls) {
      controlsRef.current = controls
      // Disable OrbitControls while overriding — eliminates flickering
      ;(controls as any).enabled = !activeRef.current
    }

    if (!activeRef.current) return

    const v = valRef.current
    camera.position.set(v.posX, v.posY, v.posZ)

    const perspCam = camera as THREE.PerspectiveCamera
    perspCam.fov = v.fov
    perspCam.updateProjectionMatrix()

    if (controlsRef.current?.target) {
      controlsRef.current.target.set(v.lookAtX, v.lookAtY, v.lookAtZ)
    }

    camera.lookAt(v.lookAtX, v.lookAtY, v.lookAtZ)
  })

  return null
}
