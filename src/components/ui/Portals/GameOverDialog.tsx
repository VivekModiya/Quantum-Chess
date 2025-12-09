import { useEffect, useState } from 'react'
import { usePubSub } from '../../../hooks'
import styles from './index.module.scss'

type GameOverData =
  | {
      type: 'win'
      subType: 'resignation' | 'checkmate' | 'abandoned'
      winner: 'white' | 'black'
    }
  | {
      type: 'stalemate'
      subType: 'stalemate'
    }
  | {
      type: 'draw'
      subType: 'agreement' | 'repetition' | '50 moves' | 'insufficient material'
    }
  | {
      type: 'aborted'
      subType: 'aborted'
    }

export const GameOverDialog = () => {
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null)
  const pubSub = usePubSub()

  const isDialogOpen = Boolean(gameOverData)

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

    if (gameOverData.type === 'win' && gameOverData.subType === 'checkmate') {
      return gameOverData.winner === 'white' ? 'White Wins!' : 'Black Wins!'
    } else if (
      gameOverData.type === 'win' &&
      gameOverData.subType === 'resignation'
    ) {
      return gameOverData.winner === 'white' ? 'White Wins!' : 'Black Wins!'
    } else if (
      gameOverData.type === 'win' &&
      gameOverData.subType === 'abandoned'
    ) {
      return gameOverData.winner === 'white' ? 'White Wins!' : 'Black Wins!'
    } else if (gameOverData.type === 'stalemate') {
      return 'Stalemate'
    } else if (gameOverData.type === 'draw') {
      return 'Draw'
    } else if (gameOverData.type === 'aborted') {
      return 'Game Aborted'
    }

    return ''
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
          {gameOverData?.type === 'win' && (
            <img
              src="/images/trophy-icon.webp"
              alt="Trophy"
              className={styles.trophyIcon}
            />
          )}
          <div className={styles.titleContainer}>
            <h2 className={styles.gameOverTitle}>{getTitle()}</h2>
            <div className={styles.resultType}>
              {gameOverData?.type === 'win' &&
                gameOverData?.subType === 'checkmate' &&
                'by checkmate'}
              {gameOverData?.type === 'win' &&
                gameOverData?.subType === 'resignation' &&
                'by resignation'}
              {gameOverData?.type === 'win' &&
                gameOverData?.subType === 'abandoned' &&
                'by abandonment'}
              {gameOverData?.type === 'stalemate' && 'by stalemate'}
              {gameOverData?.type === 'draw' &&
                gameOverData?.subType === 'agreement' &&
                'by agreement'}
              {gameOverData?.type === 'draw' &&
                gameOverData?.subType === 'repetition' &&
                'by threefold repetition'}
              {gameOverData?.type === 'draw' &&
                gameOverData?.subType === '50 moves' &&
                'by fifty-move rule'}
              {gameOverData?.type === 'draw' &&
                gameOverData?.subType === 'insufficient material' &&
                'by insufficient material'}
              {gameOverData?.type === 'aborted' && 'game ended without moves'}
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
