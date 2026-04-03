import type { PlayerColor } from '../types/game.js'
import type { GameResult, TimerData } from '../../shared/socketEvents.js'
import { getGame } from './gameCache.js'

interface ActiveTimer {
  gameId: string
  intervalId: ReturnType<typeof setInterval>
}

const activeTimers = new Map<string, ActiveTimer>()

/**
 * Start the clock for a game. Looks up the game from cache each tick
 * so it always reads current currentTurn / timers values.
 */
export function startTimer(
  gameId: string,
  onTick: (timers: TimerData) => void,
  onTimeout: (result: GameResult) => void
): void {
  if (activeTimers.has(gameId)) return

  const game = getGame(gameId)
  if (!game) return
  game.lastMoveTimestamp = Date.now()

  const intervalId = setInterval(() => {
    try {
      const g = getGame(gameId)
      if (!g || !g.lastMoveTimestamp) return

      const elapsed = Date.now() - g.lastMoveTimestamp
      const activeSide = g.currentTurn
      const remaining = g.timers[activeSide] - elapsed

      if (remaining <= 0) {
        g.timers[activeSide] = 0
        stopTimer(gameId)

        const winner: PlayerColor = activeSide === 'white' ? 'black' : 'white'
        const result: GameResult = { type: 'win', winner, reason: 'timeout' }
        onTimeout(result)
        return
      }

      const timers: TimerData = {
        white: activeSide === 'white' ? remaining : g.timers.white,
        black: activeSide === 'black' ? remaining : g.timers.black,
      }
      onTick(timers)
    } catch (err) {
      console.error('Timer error for game', gameId, err)
      stopTimer(gameId)
    }
  }, 1000)

  activeTimers.set(gameId, { gameId, intervalId })
}

/**
 * Called after a move: deducts elapsed time from the player who just moved
 * and records the new timestamp. The game object is mutated in-place
 * (caller must persist afterward).
 */
export function switchTimer(gameId: string): void {
  const game = getGame(gameId)
  if (!game) return
  if (game.lastMoveTimestamp) {
    const elapsed = Date.now() - game.lastMoveTimestamp
    game.timers[game.currentTurn] = Math.max(
      0,
      game.timers[game.currentTurn] - elapsed
    )
  }
  game.lastMoveTimestamp = Date.now()
}

export function stopTimer(gameId: string): void {
  const timer = activeTimers.get(gameId)
  if (timer) {
    clearInterval(timer.intervalId)
    activeTimers.delete(gameId)
  }
}

export function isTimerRunning(gameId: string): boolean {
  return activeTimers.has(gameId)
}
