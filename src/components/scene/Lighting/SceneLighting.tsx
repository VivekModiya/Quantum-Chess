import { lightingConfig } from '../../../config'

export const SceneLighting: React.FC = () => {
  return (
    <group>
      {/* Ambient light */}
      <ambientLight
        color={lightingConfig.ambient.color}
        intensity={lightingConfig.ambient.intensity}
      />

      {/* Primary spotlight for chess board */}
      <spotLight
        position={lightingConfig.primarySpotlight.position}
        target-position={[0, 0, 0]}
        color={lightingConfig.primarySpotlight.color}
        intensity={lightingConfig.primarySpotlight.intensity}
        angle={lightingConfig.primarySpotlight.angle}
        penumbra={lightingConfig.primarySpotlight.penumbra}
        distance={lightingConfig.primarySpotlight.distance}
        decay={lightingConfig.primarySpotlight.decay}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={5}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
      />

      {/* Chess board directional light */}
      <directionalLight
        position={lightingConfig.chessBoardDirectional.position}
        target-position={[0, 0, 0]}
        color={lightingConfig.chessBoardDirectional.color}
        intensity={lightingConfig.chessBoardDirectional.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={8}
        shadow-camera-far={25}
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
