import React from 'react'
import { useNavigate } from 'react-router-dom'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { createGame, joinGame } from '../../api/gameApi'
import type { ColorChoice } from '../../../server/types/game'
import styles from './index.module.scss'

const TIME_OPTIONS = [
  { label: '1 min', value: 1, icon: '⚡' },
  { label: '3 min', value: 3, icon: '🔥' },
  { label: '10 min', value: 10, icon: '⭐' },
  { label: '30 min', value: 30, icon: '👑' },
]

const COLOR_OPTIONS: { label: string; value: ColorChoice; icon: string }[] = [
  { label: 'White', value: 'white', icon: '🤍' },
  { label: 'Random', value: 'random', icon: '🎲' },
  { label: 'Black', value: 'black', icon: '🖤' },
]

interface LobbyDialogProps {
  isVisible: boolean
  onClose?: () => void
}

export const LobbyDialog: React.FC<LobbyDialogProps> = ({ isVisible }) => {
  const navigate = useNavigate()

  const [timeControl, setTimeControl] = React.useState<number>(10)
  const [color, setColor] = React.useState<ColorChoice>('random')
  const [activeTab, setActiveTab] = React.useState<
    'create' | 'join' | 'spectate'
  >('create')

  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)

  const [joinId, setJoinId] = React.useState('')
  const [joining, setJoining] = React.useState(false)
  const [joinError, setJoinError] = React.useState<string | null>(null)

  const [spectateId, setSpectateId] = React.useState('')

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const result = await createGame(timeControl, color)
      localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
      localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)

      navigate(`/game/${result.gameId}`, {
        state: {
          playerId: result.playerId,
          assignedColor: result.assignedColor,
        },
      })
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create game'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    const trimmed = joinId.trim()
    if (!trimmed) return
    setJoining(true)
    setJoinError(null)
    try {
      const result = await joinGame(trimmed)
      localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
      localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)

      navigate(`/game/${result.gameId}`, {
        state: {
          playerId: result.playerId,
          assignedColor: result.assignedColor,
        },
      })
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join game')
    } finally {
      setJoining(false)
    }
  }

  const handleSpectate = () => {
    const trimmed = spectateId.trim()
    if (!trimmed) return
    navigate(`/game/${trimmed}`, {
      state: { spectator: true },
    })
  }

  if (!isVisible) return null

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.dialog} ${isVisible ? styles.show : ''}`}>
        {/* Playful header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>♔</span>
            <h1 className={styles.logoText}>3D Chess</h1>
          </div>
          <p className={styles.tagline}>Ready to play in style? ✨</p>
        </div>

        {/* Tab navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <span>🎮</span>
            Create Game
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'join' ? styles.active : ''}`}
            onClick={() => setActiveTab('join')}
          >
            <span>🤝</span>
            Join Game
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'spectate' ? styles.active : ''}`}
            onClick={() => setActiveTab('spectate')}
          >
            <span>👀</span>
            Watch
          </button>
        </div>

        {/* Content based on active tab */}
        <div className={styles.content}>
          {activeTab === 'create' && (
            <div className={styles.section}>
              <div className={styles.optionGroup}>
                <label className={styles.label}>⏰ Time Control</label>
                <ToggleGroup.Root
                  className={styles.toggleGroup}
                  type="single"
                  value={timeControl.toString()}
                  onValueChange={value =>
                    value && setTimeControl(parseInt(value))
                  }
                >
                  {TIME_OPTIONS.map(option => (
                    <ToggleGroup.Item
                      key={option.value}
                      className={styles.toggleItem}
                      value={option.value.toString()}
                    >
                      <span className={styles.toggleIcon}>{option.icon}</span>
                      {option.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.label}>🎨 Your Color</label>
                <ToggleGroup.Root
                  className={styles.toggleGroup}
                  type="single"
                  value={color}
                  onValueChange={value =>
                    value && setColor(value as ColorChoice)
                  }
                >
                  {COLOR_OPTIONS.map(option => (
                    <ToggleGroup.Item
                      key={option.value}
                      className={styles.toggleItem}
                      value={option.value}
                    >
                      <span className={styles.toggleIcon}>{option.icon}</span>
                      {option.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>

              {createError && <div className={styles.error}>{createError}</div>}

              <button
                className={styles.primaryButton}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Start Playing!
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'join' && (
            <div className={styles.section}>
              <label className={styles.label}>🎯 Game ID</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter game ID..."
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />

              {joinError && <div className={styles.error}>{joinError}</div>}

              <button
                className={styles.primaryButton}
                onClick={handleJoin}
                disabled={!joinId.trim() || joining}
              >
                {joining ? (
                  <>
                    <span className={styles.spinner}></span>
                    Joining...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Join Game!
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'spectate' && (
            <div className={styles.section}>
              <label className={styles.label}>👁️ Watch Game</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter game ID to spectate..."
                value={spectateId}
                onChange={e => setSpectateId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSpectate()}
              />

              <button
                className={styles.primaryButton}
                onClick={handleSpectate}
                disabled={!spectateId.trim()}
              >
                <span>🍿</span>
                Start Watching!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
