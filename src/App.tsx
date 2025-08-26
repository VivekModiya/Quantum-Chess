import { Game } from './components/Game';
import './App.css';
import { ChessProvider } from './components/provider/ChessContextProvide';

export const App = () => {
    return (
        <ChessProvider>
            <div className='App'>
                <Game />
            </div>
        </ChessProvider>
    );
};
