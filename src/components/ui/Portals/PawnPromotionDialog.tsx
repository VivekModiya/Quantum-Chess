import React from 'react'
import { PieceColor } from '../../../types'
import styles from './index.module.scss'

interface PawnPromotionDialogProps {
  open: boolean
  color: PieceColor
}

export const PawnPromotionDialog = (props: PawnPromotionDialogProps) => {
  const { color, open } = props
  const promotablePieces = ['queen', 'rook', 'bishop', 'knight']

  const [show, setShow] = React.useState(false)

  React.useEffect(() => setShow(true), [])

  return (
    open && (
      <dialog open={open} className={styles.dialog}>
        <div className={`${styles.container} ${show ? styles.show : ''}`}>
          {promotablePieces.map(piece => (
            <img
              src={`/textures/${color}_${piece}.png`}
              className={`${styles.pieceImage} ${styles[color]}`}
            />
          ))}
        </div>
      </dialog>
    )
  )
}
