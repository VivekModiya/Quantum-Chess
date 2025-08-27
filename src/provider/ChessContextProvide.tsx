import React, { createContext, useContext, ReactNode } from 'react';
import { useChessEngine } from '../hooks';

// Context type - just the hook result + pubsub
interface ChessContextType extends ReturnType<typeof useChessEngine> {}
// Create context
const ChessContext = createContext<ChessContextType | null>(null);

// Provider props
interface ChessProviderProps {
    children: ReactNode;
}

// Minimal provider - just wraps the hook
export const ChessProvider: React.FC<ChessProviderProps> = ({ children }) => {
    const chessEngine = useChessEngine();

    return (
        <ChessContext.Provider value={chessEngine}>
            {children}
        </ChessContext.Provider>
    );
};

// Main hook to access chess context
export const useChess = (): ChessContextType => {
    const context = useContext(ChessContext);
    if (!context) {
        throw new Error('useChess must be used within a ChessProvider');
    }
    return context;
};

// Convenience hooks that use context
