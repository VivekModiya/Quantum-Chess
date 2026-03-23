export const shadowConfig = false // Enable shadows with default settings (PCFSoftShadowMap)

export const lightingConfig = {
  ambient: { color: 0x050505, intensity: 1 }, // Increased to lighten shadows
  primarySpotlight: {
    color: 0xffffff,
    intensity: 10,
    position: [30, 80, 30] as [number, number, number], // Angled position for directional shadows
    angle: Math.PI / 3,
    penumbra: 0.2,
    distance: 150,
    decay: 1.5,
  },
  chessBoardDirectional: {
    color: 0xffffff,
    intensity: 4,
    position: [0, 100, 0] as [number, number, number], // Angled for directional shadows
  },
  pieceDetail: {
    color: 0xfff8dc,
    intensity: 1.2, // Increased to add more fill light
    position: [-2, 8, 2] as [number, number, number],
    distance: 15,
  },
  accentLights: [
    {
      position: [-6, 6, -6] as [number, number, number],
      color: 0xff9966,
      intensity: 0.3,
    },
    {
      position: [6, 6, 6] as [number, number, number],
      color: 0x66aaff,
      intensity: 0.28,
    },
  ],
  hemisphere: {
    skyColor: '#87CEEB', // Sky blue to match the procedural sky
    intensity: 2,
  },
} as const
