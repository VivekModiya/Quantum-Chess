import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import React, { useEffect } from 'react'
import { usePubSub } from '../../hooks'

export const AudioComponent: React.FC = () => {
  const { camera } = useThree()

  const soundRef = React.useRef<THREE.PositionalAudio | null>(null)
  const pubsub = usePubSub()

  React.useEffect(() => {
    const unsubscribe = pubsub.subscribe('make_sound', () => {
      soundRef.current?.play()
    })
    return unsubscribe
  }, [pubsub])

  useEffect(() => {
    // Create listener (only add once to camera)
    let listener = camera.children.find(
      c => c instanceof THREE.AudioListener
    ) as THREE.AudioListener

    if (!listener) {
      listener = new THREE.AudioListener()
      camera.add(listener)
    }

    // Create positional audio
    const sound = new THREE.PositionalAudio(listener)
    soundRef.current = sound

    // Load audio buffer
    const loader = new THREE.AudioLoader()
    loader.load('/audio/move.mp3', buffer => {
      sound.setBuffer(buffer)
      sound.setRefDistance(2)
      sound.setVolume(1.0)
    })

    return () => {
      if (sound.isPlaying) sound.stop()
    }
  }, [camera])

  return (
    <mesh position={[0, 0, 0]}>
      {/* Invisible mesh just to hold the sound in space */}
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} />
      {soundRef.current && <primitive object={soundRef.current} />}
    </mesh>
  )
}
