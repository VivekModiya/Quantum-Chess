import React from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { SocketProvider } from '../../provider/SocketProvider'
import { App } from '../../app/App'
import { joinGame } from '../../api/gameApi'
import type { PlayerColor } from '../../../shared/socketEvents'

interface LocationState {
  playerId?: string
  assignedColor?: PlayerColor
  spectator?: boolean
}

interface ResolvedSession {
  playerId: string | null
  playerColor: PlayerColor | null
}

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const location = useLocation()
  const state = (location.state as LocationState) || {}

  // Check for existing session (route state or localStorage)
  const existingPlayerId =
    state.playerId ||
    (!state.spectator ? localStorage.getItem(`playerId_${gameId ?? ''}`) : null)

  const existingColor: PlayerColor | null =
    (state.assignedColor as PlayerColor) ||
    (!state.spectator
      ? (localStorage.getItem(
          `playerColor_${gameId ?? ''}`
        ) as PlayerColor | null)
      : null)

  const hasSession = !!existingPlayerId || !!state.spectator

  const [loading, setLoading] = React.useState(!hasSession)
  const [session, setSession] = React.useState<ResolvedSession>({
    playerId: existingPlayerId ?? null,
    playerColor: existingColor,
  })

  // Auto-join as opponent when visiting a game URL without session
  React.useEffect(() => {
    if (hasSession || !gameId) return

    let cancelled = false

    joinGame(gameId)
      .then(result => {
        if (cancelled) return
        // Persist session for reconnection
        localStorage.setItem(`playerId_${gameId}`, result.playerId)
        localStorage.setItem(`playerColor_${gameId}`, result.assignedColor)
        setSession({
          playerId: result.playerId,
          playerColor: result.assignedColor,
        })
      })
      .catch(() => {
        // Game is full or not found — join as spectator
        if (!cancelled) {
          setSession({ playerId: null, playerColor: null })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [gameId, hasSession])

  if (!gameId) {
    return <div style={{ color: '#fff', padding: 40 }}>Missing game ID</div>
  }

  if (loading) {
    return (
      <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>
        Joining game…
      </div>
    )
  }

  return (
    <SocketProvider
      gameId={gameId}
      playerId={session.playerId}
      playerColor={session.playerColor}
    >
      <App />
    </SocketProvider>
  )
}
