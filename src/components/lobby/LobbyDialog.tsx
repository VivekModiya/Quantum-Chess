import React from 'react'
import { useNavigate } from 'react-router-dom'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { createGame, joinGame } from '../../api/gameApi'
import type {
  ColorChoice,
  CreateGameResponse,
} from '../../../server/types/game'
import { ShareGameDialog, type ShareCopyState } from './ShareGameDialog'
import styles from './index.module.scss'

const TIME_OPTIONS = [
  { label: 'Bullet', value: 1, detail: '1 min' },
  { label: 'Blitz', value: 3, detail: '3 min' },
  { label: 'Rapid', value: 10, detail: '10 min' },
  { label: 'Classic', value: 30, detail: '30 min' },
]

const COLOR_OPTIONS: { label: string; value: ColorChoice }[] = [
  { label: 'White', value: 'white' },
  { label: 'Random', value: 'random' },
  { label: 'Black', value: 'black' },
]

const TAB_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'join', label: 'Join' },
  { value: 'spectate', label: 'Spectate' },
] as const

type LobbyTab = (typeof TAB_OPTIONS)[number]['value']

interface PendingGame extends CreateGameResponse {
  inviteUrl: string
}

function buildInviteUrl(gameId: string): string {
  return `${window.location.origin}/game/${gameId}`
}

function normalizeGameId(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const match = parsed.pathname.match(/\/game\/([^/]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : trimmed
  } catch {
    return trimmed
  }
}

function persistPlayerSession(result: CreateGameResponse): void {
  localStorage.setItem(`playerId_${result.gameId}`, result.playerId)
  localStorage.setItem(`playerColor_${result.gameId}`, result.assignedColor)
}

const SurfaceTab: React.FC<{
  label: string
  isActive: boolean
  onClick: () => void
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    className={`${styles.tab} ${isActive ? styles.active : ''}`}
    onClick={onClick}
  >
    <span className={styles.tabLabel}>{label}</span>
  </button>
)

interface LobbyDialogProps {
  isVisible: boolean
}

export const LobbyDialog: React.FC<LobbyDialogProps> = ({ isVisible }) => {
  const navigate = useNavigate()

  const [timeControl, setTimeControl] = React.useState<number>(10)
  const [color, setColor] = React.useState<ColorChoice>('random')
  const [activeTab, setActiveTab] = React.useState<LobbyTab>('create')

  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [pendingGame, setPendingGame] = React.useState<PendingGame | null>(null)
  const [copyState, setCopyState] = React.useState<ShareCopyState>('idle')

  const [joinId, setJoinId] = React.useState('')
  const [joining, setJoining] = React.useState(false)
  const [joinError, setJoinError] = React.useState<string | null>(null)

  const [spectateId, setSpectateId] = React.useState('')

  const handleCopyInvite = React.useCallback(async (inviteUrl: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }

      await navigator.clipboard.writeText(inviteUrl)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }, [])

  const enterGame = React.useCallback(
    (result: CreateGameResponse) => {
      navigate(`/game/${result.gameId}`, {
        state: {
          playerId: result.playerId,
          assignedColor: result.assignedColor,
        },
      })
    },
    [navigate]
  )

  const handleCreate = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const result = await createGame(timeControl, color)
      const inviteUrl = buildInviteUrl(result.gameId)

      persistPlayerSession(result)
      setPendingGame({ ...result, inviteUrl })
      setCopyState('idle')
      void handleCopyInvite(inviteUrl)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create game'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    const trimmed = normalizeGameId(joinId)
    if (!trimmed) return
    setJoining(true)
    setJoinError(null)
    try {
      const result = await joinGame(trimmed)
      persistPlayerSession(result)
      enterGame(result)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join game')
    } finally {
      setJoining(false)
    }
  }

  const handleSpectate = () => {
    const trimmed = normalizeGameId(spectateId)
    if (!trimmed) return
    navigate(`/game/${trimmed}`, {
      state: { spectator: true },
    })
  }

  const handleJoinPendingGame = () => {
    if (!pendingGame) return

    enterGame(pendingGame)
  }

  if (!isVisible) return null

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.dialog} ${isVisible ? styles.show : ''}`}>
        <section className={styles.workspacePanel}>
          <div className={styles.tabs}>
            {TAB_OPTIONS.map(option => (
              <SurfaceTab
                key={option.value}
                label={option.label}
                isActive={activeTab === option.value}
                onClick={() => setActiveTab(option.value)}
              />
            ))}
          </div>

          <div className={styles.content}>
            {activeTab === 'create' && (
              <div className={styles.section}>
                <div className={styles.optionGroup}>
                  <label className={styles.label}>Time control</label>
                  <ToggleGroup.Root
                    className={styles.toggleGroup}
                    type="single"
                    value={timeControl.toString()}
                    onValueChange={value =>
                      value && setTimeControl(parseInt(value, 10))
                    }
                  >
                    {TIME_OPTIONS.map(option => (
                      <ToggleGroup.Item
                        key={option.value}
                        className={styles.toggleItem}
                        value={option.value.toString()}
                      >
                        <span className={styles.toggleLabel}>
                          {option.label}
                        </span>
                        <span className={styles.toggleDetail}>
                          {option.detail}
                        </span>
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup.Root>
                </div>

                <div className={styles.optionGroup}>
                  <label className={styles.label}>Play as</label>
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
                        <span className={styles.toggleLabel}>
                          {option.label}
                        </span>
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup.Root>
                </div>

                {createError && (
                  <div className={styles.error}>{createError}</div>
                )}

                <button
                  type="button"
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
                    'Create room'
                  )}
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className={styles.section}>
                <label className={styles.label}>Invite URL or room code</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Paste invite URL or room code"
                  value={joinId}
                  onChange={e => setJoinId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />

                {joinError && <div className={styles.error}>{joinError}</div>}

                <button
                  type="button"
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
                    'Join room'
                  )}
                </button>
              </div>
            )}

            {activeTab === 'spectate' && (
              <div className={styles.section}>
                <label className={styles.label}>Invite URL or room code</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Paste invite URL or room code"
                  value={spectateId}
                  onChange={e => setSpectateId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSpectate()}
                />

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSpectate}
                  disabled={!spectateId.trim()}
                >
                  Watch room
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <ShareGameDialog
        isOpen={Boolean(pendingGame)}
        inviteUrl={pendingGame?.inviteUrl ?? ''}
        gameId={pendingGame?.gameId ?? ''}
        assignedColor={pendingGame?.assignedColor ?? 'white'}
        copyState={copyState}
        onCopy={() =>
          pendingGame && void handleCopyInvite(pendingGame.inviteUrl)
        }
        onJoin={handleJoinPendingGame}
        onBack={() => setPendingGame(null)}
      />
    </div>
  )
}
