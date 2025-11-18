import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { lightingConfig } from '../../../config'

export const SceneLighting: React.FC = () => {
  const { camera } = useThree()
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  // Update light position to follow camera orientation
  useFrame(() => {
    if (directionalLightRef.current && targetRef.current) {
      // Get camera direction
      const cameraDir = new THREE.Vector3()
      camera.getWorldDirection(cameraDir)

      // Position light above and slightly offset based on camera view
      // Adjusted for longer shadows at an angle
      const lightOffset = new THREE.Vector3()
      lightOffset.copy(cameraDir)
      lightOffset.multiplyScalar(-50) // Further behind for longer shadows
      lightOffset.x += 40 // Side offset for angled shadows
      lightOffset.y = 70 // Higher for longer shadow projection

      directionalLightRef.current.position.copy(lightOffset)

      // Always target the board center
      targetRef.current.position.set(0, 2.5, 0)
    }
  })

  return (
    <group>
      {/* Target for directional light */}
      <object3D ref={targetRef} position={[0, 2.5, 0]} />

      {/* Ambient light */}
      <ambientLight
        color={lightingConfig.ambient.color}
        intensity={lightingConfig.ambient.intensity}
      />

      {/* Primary spotlight for chess board */}
      <spotLight
        position={lightingConfig.primarySpotlight.position}
        target-position={[0, 2.5, 0]}
        color={lightingConfig.primarySpotlight.color}
        intensity={lightingConfig.primarySpotlight.intensity}
        angle={lightingConfig.primarySpotlight.angle}
        penumbra={0.5}
        distance={lightingConfig.primarySpotlight.distance}
        decay={lightingConfig.primarySpotlight.decay}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={30}
        shadow-camera-far={150}
        shadow-bias={-0.00001}
        shadow-normalBias={10} // Larger = softer/lighter
        shadow-radius={8}
      />

      {/* Chess board directional light - follows camera */}
      <directionalLight
        ref={directionalLightRef}
        position={lightingConfig.chessBoardDirectional.position}
        target={targetRef.current || undefined}
        color={lightingConfig.chessBoardDirectional.color}
        intensity={lightingConfig.chessBoardDirectional.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={5}
        shadow-camera-far={120}
        shadow-bias={-0.00005}
        shadow-normalBias={0.08}
        shadow-radius={6}
      />

      {/* Piece detail light */}
      <pointLight
        position={lightingConfig.pieceDetail.position}
        color={lightingConfig.pieceDetail.color}
        intensity={lightingConfig.pieceDetail.intensity}
        distance={lightingConfig.pieceDetail.distance}
        decay={1.5}
      />

      {/* Room general lighting */}
      <directionalLight
        position={lightingConfig.roomGeneral.position}
        target-position={[0, 0, 0]}
        color={lightingConfig.roomGeneral.color}
        intensity={lightingConfig.roomGeneral.intensity}
      />

      {/* Accent lights */}
      {lightingConfig.accentLights.map((config, index) => (
        <pointLight
          key={index}
          position={config.position}
          color={config.color}
          intensity={config.intensity}
          distance={12}
          decay={1.8}
        />
      ))}

      {/* Hemisphere light */}
      <hemisphereLight
        color={lightingConfig.hemisphere.skyColor}
        groundColor={lightingConfig.hemisphere.groundColor}
        intensity={lightingConfig.hemisphere.intensity}
        position={[0, 20, 0]}
      />
    </group>
  )
}
