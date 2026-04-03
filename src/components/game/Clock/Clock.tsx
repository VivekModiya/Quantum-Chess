import { Digits } from './Digits'

export interface ClockProps {
  whiteTime?: number // remaining ms
  blackTime?: number // remaining ms
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const Clock = ({ whiteTime, blackTime }: ClockProps) => {
  const whiteDisplay = whiteTime != null ? formatTime(whiteTime) : '--:--'
  const blackDisplay = blackTime != null ? formatTime(blackTime) : '--:--'

  return (
    <>
      {/* White clock (negative Z side) */}
      <mesh
        position={[50, 10, -20]}
        rotation={[0, 0, Math.PI / 1.3]}
        renderOrder={100}
      >
        <boxGeometry args={[0.2, 15, 30]} />
        <meshStandardMaterial
          color={'#192761'}
          emissive={'#000000'}
          emissiveIntensity={0.3}
          opacity={0.5}
          transparent={true}
          depthWrite={false}
        />
        <Digits
          value={whiteDisplay}
          size={8}
          height={0.05}
          position={[0.15, 0, 0]}
        />
      </mesh>
      {/* Black clock (positive Z side) */}
      <mesh
        position={[50, 10, 20]}
        rotation={[0, 0, Math.PI / 1.3]}
        renderOrder={100}
      >
        <boxGeometry args={[0.2, 15, 30]} />
        <meshStandardMaterial
          color={'#192761'}
          emissive={'#000000'}
          emissiveIntensity={0.3}
          opacity={0.5}
          transparent={true}
          depthWrite={false}
        />
        <Digits
          value={blackDisplay}
          size={8}
          height={0.05}
          position={[0.15, 0, 0]}
        />
      </mesh>
    </>
  )
}
