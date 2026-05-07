import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assetUrl } from '../../../utils'
import { createGame } from '../../../api/gameApi'
import { useSocket } from '../../../provider/SocketProvider'
import styles from './index.module.scss'

export const GameOverDialog = () => {
  const [isCreatingGame, setIsCreatingGame] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()
  const {
    playerColor,
    gameResult,
    gameMode,
    rematchStatus,
    doRematchRequest,
    doAcceptRematch,
    doDeclineRematch,
  } = useSocket()

  const isDialogOpen = Boolean(gameResult) && !dismissed

  const handleClose = () => {
    setDismissed(true)
  }

  const handleBackToLobby = () => {
    navigate('/')
  }

  const handleNewGame = async () => {
    setIsCreatingGame(true)
    try {
      const result = await createGame(10, 'random')
      localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
      localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)
      navigate(`/game/${result.gameId}`, {
        state: {
          playerId: result.playerId,
          assignedColor: result.assignedColor,
        },
      })
    } catch (err) {
      console.error('Failed to create new game:', err)
      handleBackToLobby()
    } finally {
      setIsCreatingGame(false)
    }
  }

  const getTitle = () => {
    if (!gameResult) return ''

    if (gameResult.type === 'win') {
      return gameResult.winner === 'white' ? 'White Wins!' : 'Black Wins!'
    } else if (gameResult.type === 'stalemate') {
      return 'Stalemate'
    } else if (gameResult.type === 'draw') {
      return 'Draw'
    } else if (gameResult.type === 'aborted') {
      return 'Game Aborted'
    }

    return ''
  }

  const getSubTitle = () => {
    if (!gameResult) return ''

    if (gameResult.type === 'win') {
      const reasons: Record<string, string> = {
        checkmate: 'by checkmate',
        timeout: 'on time',
        resignation: 'by resignation',
        abandoned: 'by abandonment',
      }
      return reasons[gameResult.reason] || ''
    } else if (gameResult.type === 'stalemate') {
      return 'by stalemate'
    } else if (gameResult.type === 'draw') {
      const reasons: Record<string, string> = {
        agreement: 'by agreement',
        repetition: 'by threefold repetition',
        '50 moves': 'by fifty-move rule',
        'insufficient material': 'by insufficient material',
      }
      return reasons[gameResult.reason] || ''
    } else if (gameResult.type === 'aborted') {
      return 'game ended without moves'
    }
    return ''
  }

  const getEmoji = () => {
    if (!gameResult) return ''

    if (gameResult.type === 'win') {
      const didIWin = gameResult.winner === playerColor
      return didIWin ? '🎉' : '😔'
    } else if (gameResult.type === 'draw' || gameResult.type === 'stalemate') {
      return '🤝'
    } else {
      return '🚫'
    }
  }

  const renderRematchButton = () => {
    if (gameMode === 'spectator') return null

    if (rematchStatus === 'sent') {
      return (
        <button className={styles.rematchButton} disabled>
          <span className={styles.spinner}></span>
          Waiting for opponent...
        </button>
      )
    }

    if (rematchStatus === 'received') {
      return (
        <div className={styles.rematchActions}>
          <button
            className={styles.acceptRematchButton}
            onClick={doAcceptRematch}
          >
            Accept Rematch
          </button>
          <button
            className={styles.declineRematchButton}
            onClick={doDeclineRematch}
          >
            Decline
          </button>
        </div>
      )
    }

    if (rematchStatus === 'declined') {
      return (
        <button className={styles.rematchButton} disabled>
          Rematch Declined
        </button>
      )
    }

    return (
      <button className={styles.rematchButton} onClick={doRematchRequest}>
        Rematch
      </button>
    )
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
          {gameResult?.type === 'win' && (
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
          {renderRematchButton()}

          <button
            className={styles.playAgainButton}
            onClick={handleNewGame}
            disabled={isCreatingGame}
          >
            {isCreatingGame ? (
              <>
                <span className={styles.spinner}></span>
                Creating...
              </>
            ) : (
              'New Game'
            )}
          </button>

          <button
            className={styles.backToLobbyButton}
            onClick={handleBackToLobby}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </dialog>
  )
}
