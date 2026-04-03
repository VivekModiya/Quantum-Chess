import { useParams, useLocation } from 'react-router-dom'
import { SocketProvider } from '../../provider/SocketProvider'
import { App } from '../../app/App'
import type { PlayerColor } from '../../../shared/socketEvents'

interface LocationState {
  playerId?: string
  assignedColor?: PlayerColor
  spectator?: boolean
}

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const location = useLocation()
  const state = (location.state as LocationState) || {}

  if (!gameId) {
    return <div style={{ color: '#fff', padding: 40 }}>Missing game ID</div>
  }

  // Try route state first, then localStorage for reconnection
  const playerId =
    state.playerId ||
    (!state.spectator ? localStorage.getItem(`playerId_${gameId}`) : null)

  const playerColor: PlayerColor | null =
    (state.assignedColor as PlayerColor) ||
    (!state.spectator
      ? (localStorage.getItem(`playerColor_${gameId}`) as PlayerColor | null)
      : null)

  const isSpectator = state.spectator || !playerId

  return (
    <SocketProvider
      gameId={gameId}
      playerId={isSpectator ? null : playerId}
      playerColor={isSpectator ? null : playerColor}
    >
      <App />
    </SocketProvider>
  )
}
