import { Canvas } from '@react-three/fiber'
import styles from './index.module.scss'
export const PawnPromotionDialog = () => {
  return (
    <dialog open={true} className={styles.dialog}>
      <div className={styles.container}>
        <Canvas
          camera={{ position: [3, 3, 3], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 2, 2]} intensity={0.8} />
        </Canvas>
      </div>
    </dialog>
  )
}
