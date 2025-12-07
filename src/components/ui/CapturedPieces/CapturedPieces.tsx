import { useChess } from '../../../provider'
import { BoardPiece, PieceType } from '../../../types'
import styles from './index.module.scss'
import { useState } from 'react'

export const CapturedPieces = () => {
  const { capturedPieces } = useChess()
  const [whiteScrollIndex, setWhiteScrollIndex] = useState(0)
  const [blackScrollIndex, setBlackScrollIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Group captured pieces by the player who captured them
  // If a white piece is captured, black captured it
  const whiteCaptured: BoardPiece[] = []
  const blackCaptured: BoardPiece[] = []

  capturedPieces.forEach(piece => {
    if (piece.color === 'white') {
      // White piece was captured by black
      blackCaptured.push(piece)
    } else {
      // Black piece was captured by white
      whiteCaptured.push(piece)
    }
  })

  const order: PieceType[] = ['pawn', 'bishop', 'knight', 'rook', 'queen']

  const handleWhitePrev = () =>
    setWhiteScrollIndex(prev => Math.max(0, prev - 1))
  const handleWhiteNext = () =>
    setWhiteScrollIndex(prev => Math.min(whiteCaptured.length - 1, prev + 1))
  const handleBlackPrev = () =>
    setBlackScrollIndex(prev => Math.max(0, prev - 1))
  const handleBlackNext = () =>
    setBlackScrollIndex(prev => Math.min(blackCaptured.length - 1, prev + 1))

  const toggleMenu = () => setIsMenuOpen(prev => !prev)

  return (
    <div className={styles.mainContainer}>
      <div className={styles.capturedPiecesContainer}>
        <div className={styles.capturedRow}>
          <span className={styles.playerLabel}>White Captured</span>
          <div className={styles.piecesInline}>
            {whiteCaptured
              .sort((a, b) => order.indexOf(a.piece) - order.indexOf(b.piece))
              .map((piece, index, arr) => {
                const isPrevPieceSame = arr[index - 1]?.piece === piece.piece

                return (
                  <img
                    key={`${piece.piece}-${index}`}
                    src={`/textures/black_${piece.piece}.png`}
                    alt={piece.piece}
                    className={`${styles.capturedPiece} ${styles.black} ${isPrevPieceSame ? styles.shiftPiece : ''}`}
                  />
                )
              })}
          </div>
        </div>
        <div className={styles.capturedRow}>
          <span className={styles.playerLabel}>Black Captured</span>
          <div className={styles.piecesInline}>
            {blackCaptured
              .sort((a, b) => order.indexOf(a.piece) - order.indexOf(b.piece))
              .map((piece, index, arr) => {
                const isPrevPieceSame = arr[index - 1]?.piece === piece.piece
                return (
                  <img
                    key={`${piece.piece}-${index}`}
                    src={`/textures/white_${piece.piece}.png`}
                    alt={piece.piece}
                    className={`${styles.capturedPiece} ${styles.white} ${isPrevPieceSame ? styles.shiftPiece : ''}`}
                  />
                )
              })}
          </div>
        </div>
      </div>
      <div className={styles.controlButtons}>
        <button className={styles.burgerBtn} onClick={toggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12H21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 6H21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 18H21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {isMenuOpen && (
          <div className={styles.menuDropdown}>
            <button className={styles.menuItem}>Resign</button>
            <button className={styles.menuItem}>Draw</button>
          </div>
        )}
        <div className={styles.chevronButtons}>
          <button
            className={`${styles.chevronBtn} ${styles.left}`}
            onClick={handleBlackPrev}
          >
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={`${styles.chevronBtn} ${styles.right}`}
            onClick={handleBlackNext}
          >
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
