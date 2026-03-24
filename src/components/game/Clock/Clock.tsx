import { Digits } from './Digits'

export interface ClockProps {}

export const Clock = () => {
  return (
    <>
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
          value="12:34"
          size={8}
          height={0.05}
          position={[0.15, 3.5, -15]}
        />
      </mesh>
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
          value="12:34"
          size={8}
          height={0.05}
          position={[0.15, 3.5, -15]}
        />
      </mesh>
    </>
  )
}
