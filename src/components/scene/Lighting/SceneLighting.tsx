import { useRef } from 'react'
import { lightingConfig, shadowConfig } from '../../../config'

export const SceneLighting: React.FC = () => {
  const targetRef = useRef<THREE.Object3D>(null)

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
        castShadow={shadowConfig}
        shadow-mapSize={[1048, 1048]}
        shadow-camera-near={30}
        shadow-camera-far={150}
        shadow-bias={-0.00001}
        shadow-normalBias={10}
        shadow-radius={8}
      />

      {/* Chess board directional light - static position */}
      <directionalLight
        position={lightingConfig.chessBoardDirectional.position}
        target={targetRef.current || undefined}
        color={lightingConfig.chessBoardDirectional.color}
        intensity={lightingConfig.chessBoardDirectional.intensity}
        castShadow={shadowConfig}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={5}
        shadow-camera-far={120}
        shadow-bias={-0.00005}
        shadow-normalBias={0.08}
        shadow-radius={8}
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
