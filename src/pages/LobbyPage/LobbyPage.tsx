import React from 'react'
import { useNavigate } from 'react-router-dom'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import * as Separator from '@radix-ui/react-separator'
import { createGame, joinGame } from '../../api/gameApi'
import type { ColorChoice } from '../../../server/types/game'
import styles from './index.module.scss'

const TIME_OPTIONS = [
  { label: '1 min', value: 1 },
  { label: '3 min', value: 3 },
  { label: '10 min', value: 10 },
  { label: '30 min', value: 30 },
]

const COLOR_OPTIONS: { label: string; value: ColorChoice }[] = [
  { label: 'White', value: 'white' },
  { label: 'Random', value: 'random' },
  { label: 'Black', value: 'black' },
]

export const LobbyPage = () => {
  const navigate = useNavigate()

  const [timeControl, setTimeControl] = React.useState<number>(10)
  const [color, setColor] = React.useState<ColorChoice>('random')

  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [createdGameId, setCreatedGameId] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const [joinId, setJoinId] = React.useState('')
  const [joining, setJoining] = React.useState(false)
  const [joinError, setJoinError] = React.useState<string | null>(null)

  const [spectateId, setSpectateId] = React.useState('')

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const result = await createGame(timeControl, color)
      // Store playerId in localStorage for reconnection
      localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
      localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)

      // Show the gameId so user can share it
      setCreatedGameId(result.gameId)

      // Navigate to game page
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
      // Store playerId in localStorage for reconnection
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

  const handleCopyGameId = () => {
    if (!createdGameId) return
    navigator.clipboard.writeText(createdGameId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.logo}>
          <h1>3D Chess</h1>
          <p>Play chess in a fully 3D environment</p>
        </div>

        {/* Time control */}
        <div className={styles.section}>
          <div className={styles.label}>Time Control</div>
          <ToggleGroup.Root
            type="single"
            value={String(timeControl)}
            onValueChange={val => {
              if (val) setTimeControl(Number(val))
            }}
            className={styles.chipGroup}
          >
            {TIME_OPTIONS.map(opt => (
              <ToggleGroup.Item key={opt.value} value={String(opt.value)}>
                {opt.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        {/* Color selection */}
        <div className={styles.section}>
          <div className={styles.label}>Play As</div>
          <ToggleGroup.Root
            type="single"
            value={color}
            onValueChange={val => {
              if (val) setColor(val as ColorChoice)
            }}
            className={styles.colorGroup}
          >
            {COLOR_OPTIONS.map(opt => (
              <ToggleGroup.Item key={opt.value} value={opt.value}>
                <span
                  className={`${styles.colorSwatch} ${styles[opt.value]}`}
                />
                {opt.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        {/* Create button */}
        <button
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? 'Creating…' : 'Create Game'}
        </button>

        {createError && <div className={styles.error}>{createError}</div>}

        {/* Show created game ID for sharing */}
        {createdGameId && (
          <div
            className={styles.gameIdBox}
            onClick={handleCopyGameId}
            title="Click to copy"
          >
            <div className={styles.label}>Share this Game ID</div>
            <div className={styles.gameIdValue}>{createdGameId}</div>
            <div className={styles.copyHint}>
              {copied ? 'Copied!' : 'Click to copy'}
            </div>
          </div>
        )}

        {/* Separator */}
        <Separator.Root className={styles.separator} />

        {/* Join section */}
        <div className={styles.section}>
          <div className={styles.label}>Join a Game</div>
          <div className={styles.joinRow}>
            <input
              className={styles.joinInput}
              placeholder="Paste game ID…"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              className={styles.joinBtn}
              onClick={handleJoin}
              disabled={joining || !joinId.trim()}
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>
          {joinError && <div className={styles.error}>{joinError}</div>}
        </div>

        {/* Separator */}
        <Separator.Root className={styles.separator} />

        {/* Spectate section */}
        <div className={styles.section}>
          <div className={styles.label}>Spectate a Game</div>
          <div className={styles.joinRow}>
            <input
              className={styles.joinInput}
              placeholder="Paste game ID…"
              value={spectateId}
              onChange={e => setSpectateId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSpectate()}
            />
            <button
              className={styles.joinBtn}
              onClick={handleSpectate}
              disabled={!spectateId.trim()}
            >
              Spectate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
