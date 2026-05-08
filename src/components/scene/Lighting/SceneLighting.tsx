import { useRef } from 'react'
import { lightingConfig, shadowConfig } from '../../../config'

export const SceneLighting: React.FC = () => {
  const targetRef = useRef<THREE.Object3D>(null)

  return (
    <group>
      {/* Target for directional light */}
      <object3D ref={targetRef} position={[0, 2.5, 0]} />

      {/* Ambient light */}
      <ambientLight color={'#ffffff'} intensity={0.0} />

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
      />

      {/* Chess board directional light - static position */}
      <directionalLight
        position={lightingConfig.chessBoardDirectional.position}
        target={targetRef.current || undefined}
        color={lightingConfig.chessBoardDirectional.color}
        intensity={lightingConfig.chessBoardDirectional.intensity}
        castShadow={shadowConfig}
      />

      {/* Piece detail light */}
      <pointLight
        position={lightingConfig.pieceDetail.position}
        color={lightingConfig.pieceDetail.color}
        intensity={lightingConfig.pieceDetail.intensity}
        distance={lightingConfig.pieceDetail.distance}
        decay={1.5}
      />

      {/* Under board directional light */}
      <directionalLight
        position={lightingConfig.underBoardDirectional.position}
        color={lightingConfig.underBoardDirectional.color}
        intensity={lightingConfig.underBoardDirectional.intensity}
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

      {/* Soft sunrise directional light from the side */}
      <directionalLight
        position={lightingConfig.sunriseSideLight.position}
        color={lightingConfig.sunriseSideLight.color}
        intensity={lightingConfig.sunriseSideLight.intensity}
      />

      {/* Hemisphere light */}
      <hemisphereLight
        color={'#000000'}
        groundColor={'#0033ff'}
        intensity={2}
        position={[0, 400, 0]}
      />
    </group>
  )
}
