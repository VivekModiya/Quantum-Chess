import { LobbyScene } from '../../components/lobby/LobbyScene'
import { LobbyDialog } from '../../components/lobby/LobbyDialog'

export const LobbyPage = () => {
  return (
    <div>
      <LobbyScene />
      <LobbyDialog isVisible={true} />
    </div>
  )
}
