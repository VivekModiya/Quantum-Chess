import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type {
  GameStateData,
  MoveData,
  TimerData,
  GameResult,
  PlayerColor,
  BoardSnapshot,
} from '../../shared/socketEvents'
import {
  connectToGame,
  spectateGame,
  disconnectSocket,
  sendMove,
  sendResign,
  sendDrawOffer,
  sendAcceptDraw,
  sendDeclineDraw,
  sendAbort,
  sendRematchRequest,
  sendAcceptRematch,
  sendDeclineRematch,
} from '../services/socketService'

export type GameMode = 'player' | 'spectator'

export type RematchStatus = 'idle' | 'sent' | 'received' | 'declined'

interface SocketContextType {
  connected: boolean
  gameState: GameStateData | null
  playerColor: PlayerColor | null
  gameMode: GameMode
  opponentConnected: boolean
  drawOffered: PlayerColor | null
  timers: TimerData | null
  gameResult: GameResult | null
  pgn: string
  rematchStatus: RematchStatus
  // Actions
  doSendMove: (move: MoveData, snapshot?: BoardSnapshot) => void
  doResign: () => void
  doDrawOffer: () => void
  doAcceptDraw: () => void
  doDeclineDraw: () => void
  doAbort: () => void
  doRematchRequest: () => void
  doAcceptRematch: () => void
  doDeclineRematch: () => void
  // Move received from opponent
  lastOpponentMove: MoveData | null
  clearLastOpponentMove: () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

interface SocketProviderProps {
  gameId: string
  playerId: string | null
  playerColor: PlayerColor | null
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  gameId,
  playerId,
  playerColor,
  children,
}) => {
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameStateData | null>(null)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [drawOffered, setDrawOffered] = useState<PlayerColor | null>(null)
  const [timers, setTimers] = useState<TimerData | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [pgn, setPgn] = useState('')
  const [lastOpponentMove, setLastOpponentMove] = useState<MoveData | null>(
    null
  )
  const [rematchStatus, setRematchStatus] = useState<RematchStatus>('idle')

  const gameMode: GameMode = playerId ? 'player' : 'spectator'
  const playerColorRef = useRef(playerColor)
  playerColorRef.current = playerColor
  const sockRef = useRef<ReturnType<typeof connectToGame> | null>(null)

  useEffect(() => {
    let sock: ReturnType<typeof connectToGame>

    if (playerId) {
      sock = connectToGame(gameId, playerId)
    } else {
      sock = spectateGame(gameId)
    }
    sockRef.current = sock

    sock.on('connect', () => setConnected(true))
    sock.on('disconnect', () => setConnected(false))

    sock.on('game_state', state => {
      setGameState(state)
      setTimers(state.timers)
      setDrawOffered(state.drawOffer?.from ?? null)
      setGameResult(state.result)
      setPgn(state.pgn ?? '')

      // Determine opponent connection status
      if (playerColorRef.current) {
        const opponentColor =
          playerColorRef.current === 'white' ? 'black' : 'white'
        const opponentData = state.players[opponentColor]
        setOpponentConnected(opponentData?.connected ?? false)
      }
    })

    sock.on(
      'move_made',
      ({ move, currentTurn, timers: newTimers, snapshot, pgn: newPgn }) => {
        setTimers(newTimers)
        if (newPgn != null) setPgn(newPgn)
        setGameState(prev =>
          prev
            ? {
                ...prev,
                currentTurn,
                timers: newTimers,
                moves: [...prev.moves, move],
                snapshot: snapshot ?? prev.snapshot,
              }
            : prev
        )

        // If move is from opponent, set it for the chess engine to apply
        // The sender's client already applied the move locally, so we only
        // need to apply it for the other players/spectators
        if (playerColorRef.current && currentTurn === playerColorRef.current) {
          // Current turn switched to us, meaning the opponent just moved
          setLastOpponentMove(move)
        } else if (!playerColorRef.current) {
          // Spectator — always apply the move
          setLastOpponentMove(move)
        }
      }
    )

    sock.on('timer_update', newTimers => {
      setTimers(newTimers)
    })

    sock.on('game_over', result => {
      setGameResult(result)
      setGameState(prev =>
        prev ? { ...prev, status: 'completed', result } : prev
      )
    })

    sock.on('player_joined', ({ color }) => {
      if (playerColorRef.current && color !== playerColorRef.current) {
        setOpponentConnected(true)
      }
    })

    sock.on('player_disconnected', ({ color }) => {
      if (playerColorRef.current && color !== playerColorRef.current) {
        setOpponentConnected(false)
      }
    })

    sock.on('player_reconnected', ({ color }) => {
      if (playerColorRef.current && color !== playerColorRef.current) {
        setOpponentConnected(true)
      }
    })

    sock.on('draw_offered', ({ from }) => {
      setDrawOffered(from)
    })

    sock.on('draw_declined', () => {
      setDrawOffered(null)
    })

    sock.on('rematch_requested', () => {
      setRematchStatus('received')
    })

    sock.on(
      'rematch_accepted',
      ({ newGameId, playerId: newPlayerId, assignedColor }) => {
        // Store session for the new game
        localStorage.setItem(`playerId_${newGameId}`, newPlayerId)
        localStorage.setItem(`playerColor_${newGameId}`, assignedColor)
        // Navigate will be handled by the component reading this
        setRematchStatus('idle')
        // Use window.location for a clean navigation to the new game
        window.location.href = `/game/${newGameId}`
      }
    )

    sock.on('rematch_declined', () => {
      setRematchStatus('declined')
    })

    return () => {
      if (sockRef.current) {
        sockRef.current.removeAllListeners()
        sockRef.current.disconnect()
        sockRef.current = null
      }
      disconnectSocket()
    }
  }, [gameId, playerId])

  const clearLastOpponentMove = useCallback(() => {
    setLastOpponentMove(null)
  }, [])

  const value: SocketContextType = useMemo(
    () => ({
      connected,
      gameState,
      playerColor: playerColor ?? null,
      gameMode,
      opponentConnected,
      drawOffered,
      timers,
      gameResult,
      pgn,
      rematchStatus,
      doSendMove: sendMove,
      doResign: sendResign,
      doDrawOffer: sendDrawOffer,
      doAcceptDraw: sendAcceptDraw,
      doDeclineDraw: sendDeclineDraw,
      doAbort: sendAbort,
      doRematchRequest: () => {
        sendRematchRequest()
        setRematchStatus('sent')
      },
      doAcceptRematch: () => {
        sendAcceptRematch()
      },
      doDeclineRematch: () => {
        sendDeclineRematch()
        setRematchStatus('idle')
      },
      lastOpponentMove,
      clearLastOpponentMove,
    }),
    [
      connected,
      gameState,
      playerColor,
      gameMode,
      opponentConnected,
      drawOffered,
      timers,
      gameResult,
      pgn,
      rematchStatus,
      lastOpponentMove,
      clearLastOpponentMove,
    ]
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
