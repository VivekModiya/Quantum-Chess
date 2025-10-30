import { Game } from './components/Game'
import { ChessProvider } from './provider'

export const App = () => {
  return (
    <ChessProvider>
      <div className="App">
        <Game />
      </div>
    </ChessProvider>
  )
}
