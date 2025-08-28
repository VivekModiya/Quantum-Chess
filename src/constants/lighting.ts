export const LIGHTING_CONFIG = {
  ambient: { color: 0x404040, intensity: 1 },
  primarySpotlight: {
    color: 0xffffff,
    intensity: 10,
    position: [0, 100, 0] as [number, number, number],
    angle: Math.PI / 4,
    penumbra: 0.2,
    distance: 150,
    decay: 1.5,
  },
  chessBoardDirectional: {
    color: 0xffffff,
    intensity: 5.0,
    position: [0, 50, 0] as [number, number, number],
  },
  pieceDetail: {
    color: 0xfff8dc,
    intensity: 0.8,
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
    skyColor: 0x87ceeb,
    groundColor: 0x2d1b0f,
    intensity: 0.2,
  },
} as const
