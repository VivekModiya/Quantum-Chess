import { LIGHTING_CONFIG } from '../constants';

export const SceneLighting: React.FC = () => {
    return (
        <group>
            {/* Ambient light */}
            <ambientLight
                color={LIGHTING_CONFIG.ambient.color}
                intensity={LIGHTING_CONFIG.ambient.intensity}
            />

            {/* Primary spotlight for chess board */}
            <spotLight
                position={LIGHTING_CONFIG.primarySpotlight.position}
                target-position={[0, 0, 0]}
                color={LIGHTING_CONFIG.primarySpotlight.color}
                intensity={LIGHTING_CONFIG.primarySpotlight.intensity}
                angle={LIGHTING_CONFIG.primarySpotlight.angle}
                penumbra={LIGHTING_CONFIG.primarySpotlight.penumbra}
                distance={LIGHTING_CONFIG.primarySpotlight.distance}
                decay={LIGHTING_CONFIG.primarySpotlight.decay}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={5}
                shadow-camera-far={20}
                shadow-bias={-0.0005}
            />

            {/* Chess board directional light */}
            <directionalLight
                position={LIGHTING_CONFIG.chessBoardDirectional.position}
                target-position={[0, 0, 0]}
                color={LIGHTING_CONFIG.chessBoardDirectional.color}
                intensity={LIGHTING_CONFIG.chessBoardDirectional.intensity}
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
                position={LIGHTING_CONFIG.pieceDetail.position}
                color={LIGHTING_CONFIG.pieceDetail.color}
                intensity={LIGHTING_CONFIG.pieceDetail.intensity}
                distance={LIGHTING_CONFIG.pieceDetail.distance}
                decay={1.5}
            />

            {/* Room general lighting */}
            <directionalLight
                position={LIGHTING_CONFIG.roomGeneral.position}
                target-position={[0, 0, 0]}
                color={LIGHTING_CONFIG.roomGeneral.color}
                intensity={LIGHTING_CONFIG.roomGeneral.intensity}
            />

            {/* Accent lights */}
            {LIGHTING_CONFIG.accentLights.map((config, index) => (
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
                color={LIGHTING_CONFIG.hemisphere.skyColor}
                groundColor={LIGHTING_CONFIG.hemisphere.groundColor}
                intensity={LIGHTING_CONFIG.hemisphere.intensity}
                position={[0, 20, 0]}
            />
        </group>
    );
};
