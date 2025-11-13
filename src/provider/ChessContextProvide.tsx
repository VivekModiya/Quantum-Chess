import React, { createContext, useContext, ReactNode } from 'react'
import { useChessEngine } from '../hooks'

interface ChessContextType extends ReturnType<typeof useChessEngine> {}

const ChessContext = createContext<ChessContextType | null>(null)

interface ChessProviderProps {
  children: ReactNode
}

export const ChessProvider: React.FC<ChessProviderProps> = ({ children }) => {
  const chessEngine = useChessEngine()

  return (
    <ChessContext.Provider value={chessEngine}>
      {children}
    </ChessContext.Provider>
  )
}

export const useChess = (): ChessContextType => {
  const context = useContext(ChessContext)
  if (!context) {
    throw new Error('useChess must be used within a ChessProvider')
  }
  return context
}
