import React, { useEffect, useRef, useState } from 'react'
import { PieceType, PromotablePiece } from '../../../types'
import { usePubSub } from '../../../hooks'
import { useChess } from '../../../provider'
import styles from './index.module.scss'

const PROMOTABLE_PIECES: PieceType[] = ['queen', 'rook', 'bishop', 'knight']

interface PromotionData {
  toSquare: string
  pieceId: string
}

export const PawnPromotionDialog = () => {
  const [promotionData, setPromotionData] = useState<PromotionData | null>(null)

  const firstElementRef = useRef<HTMLImageElement | null>(null)
  const lastElementRef = useRef<HTMLImageElement | null>(null)
  const focusedElement = useRef<HTMLImageElement | null>(null)

  const pubSub = usePubSub()
  const { chess } = useChess()

  const pieceColor = chess.byId(promotionData?.pieceId ?? '')?.color ?? ''
  const isDialogOpen = Boolean(promotionData)

  const handlePieceClick = (piece: PromotablePiece) => {
    if (!promotionData) return

    pubSub.publish('promotion_piece_selected', {
      piece,
      pieceId: promotionData.pieceId,
      toSquare: promotionData.toSquare,
    })
    setPromotionData(null)
  }

  const handleFirstFocusTrap = (e: React.FocusEvent) => {
    if (e.relatedTarget) {
      lastElementRef.current?.focus()
    }
  }

  const handleLastFocusTrap = () => {
    firstElementRef.current?.focus()
  }

  const handleImageRef = (element: HTMLImageElement | null, index: number) => {
    if (index === 0) {
      firstElementRef.current = element
    } else if (index === PROMOTABLE_PIECES.length - 1) {
      lastElementRef.current = element
    }
  }

  const handleImageFocus = (e: React.FocusEvent) => {
    if (focusedElement.current === null) {
      focusedElement.current = e.target as HTMLImageElement
    }
  }

  useEffect(() => {
    const unsubscribe = pubSub.subscribe(
      'open_promotion_dialog',
      ({ pieceId, toSquare }: PromotionData) => {
        setPromotionData({ pieceId, toSquare })
      }
    )

    return unsubscribe
  }, [pubSub])

  const dialogClassName = `${styles.dialog} ${isDialogOpen ? styles.showDialog : ''}`
  const containerClassName = `${styles.container} ${isDialogOpen ? styles.show : ''} ${styles[`container-${pieceColor}`]}`

  return (
    <dialog open className={dialogClassName}>
      <div className={containerClassName}>
        <div
          tabIndex={focusedElement.current ? 0 : -1}
          onFocus={handleFirstFocusTrap}
        />

        {PROMOTABLE_PIECES.map((piece, index) => (
          <img
            key={piece}
            tabIndex={0}
            ref={element => handleImageRef(element, index)}
            onFocus={handleImageFocus}
            src={`/textures/${pieceColor}_${piece}.png`}
            className={`${styles.pieceImage} ${styles[pieceColor]}`}
            onClick={() => handlePieceClick(piece as PromotablePiece)}
          />
        ))}

        <div tabIndex={0} onFocus={handleLastFocusTrap} />
      </div>
    </dialog>
  )
}
