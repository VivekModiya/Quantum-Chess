import React from 'react'
import styles from './CubeLoader.module.scss'

export const CubeLoader: React.FC = () => (
  <div className={styles.overlay}>
    <div className={styles.scene}>
      <div className={styles.cubeWrapper}>
        <div className={styles.cube}>
          <div className={styles.cubeFaces}>
            <div className={`${styles.cubeFace} ${styles.shadow}`} />
            <div className={`${styles.cubeFace} ${styles.bottom}`} />
            <div className={`${styles.cubeFace} ${styles.top}`} />
            <div className={`${styles.cubeFace} ${styles.left}`} />
            <div className={`${styles.cubeFace} ${styles.right}`} />
            <div className={`${styles.cubeFace} ${styles.back}`} />
            <div className={`${styles.cubeFace} ${styles.front}`} />
          </div>
        </div>
      </div>
      <h1 style={{ color: 'white', fontSize: 20, marginTop: 50 }}>
        Loading . . . . .
      </h1>
    </div>
  </div>
)
