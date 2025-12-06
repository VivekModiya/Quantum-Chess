export const shadowConfig = true // Enable shadows with default settings (PCFSoftShadowMap)

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
    intensity: 5.0,
    position: [35, 60, 40] as [number, number, number], // Angled for directional shadows
  },
  pieceDetail: {
    color: 0xfff8dc,
    intensity: 1.2, // Increased to add more fill light
    position: [-2, 8, 2] as [number, number, number],
    distance: 15,
  },
  roomGeneral: {
    color: 0xb3d9ff,
    intensity: 0.4,
    position: [8, 12, 6] as [number, number, number],
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
    skyColor: '#623200',
    groundColor: '#63441e',
    intensity: 2,
  },
} as const
