import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePubSub } from '../../../hooks'
import { assetUrl } from '../../../utils'
import { createGame } from '../../../api/gameApi'
import { useSocket } from '../../../provider/SocketProvider'
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
  const [isCreatingRematch, setIsCreatingRematch] = useState(false)
  const pubSub = usePubSub()
  const navigate = useNavigate()
  const { playerColor } = useSocket()

  const isDialogOpen = Boolean(gameOverData)

  const handleClose = () => {
    setGameOverData(null)
  }

  const handleBackToLobby = () => {
    handleClose()
    navigate('/')
  }

  const handlePlayAgain = async () => {
    setIsCreatingRematch(true)
    try {
      // Create new game with same settings (10 min, random color for simplicity)
      const result = await createGame(10, 'random')
      localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
      localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)

      // Navigate to new game
      navigate(`/game/${result.gameId}`, {
        state: {
          playerId: result.playerId,
          assignedColor: result.assignedColor,
        },
      })
    } catch (err) {
      console.error('Failed to create new game:', err)
      // If play again fails, go back to lobby
      handleBackToLobby()
    } finally {
      setIsCreatingRematch(false)
    }
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

  const getSubTitle = () => {
    if (!gameOverData) return ''

    const subtitles: Record<string, string> = {
      'win-checkmate': 'by checkmate',
      'win-resignation': 'by resignation',
      'win-abandoned': 'by abandonment',
      'stalemate-stalemate': 'by stalemate',
      'draw-agreement': 'by agreement',
      'draw-repetition': 'by threefold repetition',
      'draw-50 moves': 'by fifty-move rule',
      'draw-insufficient material': 'by insufficient material',
      'aborted-aborted': 'game ended without moves',
    }

    return subtitles[`${gameOverData.type}-${gameOverData.subType}`] || ''
  }

  const getEmoji = () => {
    if (!gameOverData) return ''

    if (gameOverData.type === 'win') {
      // Check if current player won
      const didIWin = gameOverData.winner === playerColor
      return didIWin ? '🎉' : '😔'
    } else if (
      gameOverData.type === 'draw' ||
      gameOverData.type === 'stalemate'
    ) {
      return '🤝'
    } else {
      return '🚫'
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
          <div className={styles.emojiIcon}>{getEmoji()}</div>
          {gameOverData?.type === 'win' && (
            <img
              src={assetUrl('images/trophy-icon.webp')}
              alt="Trophy"
              className={styles.trophyIcon}
            />
          )}
          <div className={styles.titleContainer}>
            <h2 className={styles.gameOverTitle}>{getTitle()}</h2>
            <div className={styles.resultType}>{getSubTitle()}</div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.playAgainButton}
            onClick={handlePlayAgain}
            disabled={isCreatingRematch}
          >
            {isCreatingRematch ? (
              <>
                <span className={styles.spinner}></span>
                Creating...
              </>
            ) : (
              <>
                <span>🚀</span>
                Play Again
              </>
            )}
          </button>

          <button
            className={styles.backToLobbyButton}
            onClick={handleBackToLobby}
          >
            <span>🏠</span>
            Back to Lobby
          </button>
        </div>
      </div>
    </dialog>
  )
}
