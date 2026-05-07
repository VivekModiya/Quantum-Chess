import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface GameIntroAnimationProps {
  initialPosition: [number, number, number]
  onComplete: () => void
}

export const GameIntroAnimation: React.FC<GameIntroAnimationProps> = ({
  initialPosition,
  onComplete,
}) => {
  const { camera } = useThree()
  const startTime = useRef<number | null>(null)
  const done = useRef(false)

  // Captured on the very first frame from the actual camera position
  const startAngleRef = useRef<number | null>(null)

  const DURATION = 4 // seconds

  useFrame(() => {
    if (done.current) return

    if (startTime.current === null) {
      // Capture real camera state on first frame — playerColor may not have
      // been known at mount time so initialPosition could differ from where
      // the camera actually is right now.
      startTime.current = performance.now()
      startAngleRef.current = Math.atan2(camera.position.z, camera.position.x)
    }

    const elapsed = (performance.now() - startTime.current) / 1000
    const raw = Math.min(elapsed / DURATION, 1)

    // Cubic ease-in-out
    const t =
      raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2

    const endVec = new THREE.Vector3(...initialPosition)
    const endAngle = Math.atan2(endVec.z, endVec.x)
    // Use only the horizontal (XZ) radius — Y is handled separately
    const horizontalRadius = Math.sqrt(
      endVec.x * endVec.x + endVec.z * endVec.z
    )
    const startAngle = startAngleRef.current!

    // Sweep a full circle and land exactly on endAngle:
    //   at t=0 → startAngle, at t=1 → startAngle + 2π + (endAngle - startAngle)
    //              = 2π + endAngle  ≡  endAngle (mod 2π)
    const angle = startAngle + t * (Math.PI * 2 + (endAngle - startAngle))

    camera.position.set(
      Math.cos(angle) * horizontalRadius,
      endVec.y,
      Math.sin(angle) * horizontalRadius
    )
    camera.lookAt(0, 0, 0)

    if (raw >= 1) {
      done.current = true
      onComplete()
    }
  })

  return null
}
