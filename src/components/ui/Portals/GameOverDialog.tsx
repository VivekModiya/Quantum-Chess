import { useEffect, useState } from 'react'
import { usePubSub } from '../../../hooks'
import styles from './index.module.scss'

type GameOverType = 'checkmate' | 'stalemate' | 'draw'

interface GameOverData {
  type: GameOverType
  winner?: 'white' | 'black'
}

export const GameOverDialog = () => {
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null)
  const pubSub = usePubSub()

  const isDialogOpen = Boolean(gameOverData)

  const handleNewGame = () => {
    pubSub.publish('game_reset', {})
    setGameOverData(null)
  }

  const handleClose = () => {
    setGameOverData(null)
  }

  useEffect(() => {
    const unsubscribe = pubSub.subscribe('game_over', (data: GameOverData) => {
      setGameOverData(data)
    })

    return unsubscribe
  }, [pubSub])

  const getTitle = () => {
    if (!gameOverData) return ''

    if (gameOverData.type === 'checkmate') {
      return gameOverData.winner === 'white' ? 'White Wins!' : 'Black Wins!'
    } else if (gameOverData.type === 'stalemate') {
      return 'Stalemate'
    } else {
      return 'Draw'
    }
  }

  const dialogClassName = `${styles.gameOverDialog} ${isDialogOpen ? styles.showDialog : ''}`
  const containerClassName = `${styles.gameOverContainer} ${isDialogOpen ? styles.show : ''}`

  return (
    <dialog open className={dialogClassName}>
      <div className={containerClassName}>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close dialog"
        >
          ✕
        </button>
        <div className={styles.headerContainer}>
          {gameOverData?.type === 'checkmate' && (
            <img
              src="/images/trophy-icon.webp"
              alt="Trophy"
              className={styles.trophyIcon}
            />
          )}
          <div className={styles.titleContainer}>
            <h2 className={styles.gameOverTitle}>{getTitle()}</h2>
            <div className={styles.resultType}>
              {gameOverData?.type === 'checkmate' && 'by checkmate'}
              {gameOverData?.type === 'stalemate' && 'by stalemate'}
              {gameOverData?.type === 'draw' && 'by agreement'}
            </div>
          </div>
        </div>
        <button className={styles.reviewButton} onClick={() => {}}>
          Rematch
        </button>
        <button className={styles.newGameButton} onClick={() => {}} autoFocus>
          View Board
        </button>
      </div>
    </dialog>
  )
}
