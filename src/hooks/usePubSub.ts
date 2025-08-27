import { useCallback } from 'react'

// Event types
export interface EventProps {
  piece_selected: {
    pieceId: string
    pieceRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>> | null
  }
  calculate_legal_moves: { square?: string | null }
  legal_move_calculated: { moves: string[] }
  make_move: { toSquare: string }
  piece_moved: {
    from: string
    to: string
    pieceId: string
  }
  game_reset: {}
  move_undone: {}
  make_sound: undefined
}

export type EventKey = keyof EventProps
export type Callback<T = any> = (payload: T) => void

// Global listeners object shared across all hook instances
const globalListeners = {} as {
  [K in EventKey]: Callback<EventProps[K]>[]
}

export const usePubSub = () => {
  const subscribe = useCallback(
    <K extends EventKey>(
      event: K,
      callback: Callback<EventProps[K]>
    ): (() => void) => {
      if (!globalListeners[event]) {
        globalListeners[event] = []
      }

      globalListeners[event].push(callback)

      // Return unsubscribe function
      return () => {
        if (globalListeners[event]) {
          // @ts-ignore
          globalListeners[event] = globalListeners[event].filter(
            cb => cb !== callback
          )
        }
      }
    },
    []
  )

  const publish = useCallback(
    <K extends EventKey>(event: K, payload: EventProps[K]): void => {
      const listeners = globalListeners[event] || []
      listeners.forEach(callback => callback(payload))
    },
    []
  )

  const unsubscribeAll = useCallback((event?: EventKey) => {
    if (event) {
      globalListeners[event] = []
    } else {
      // Reset all listeners
      Object.keys(globalListeners).forEach(key => {
        globalListeners[key as EventKey] = []
      })
    }
  }, [])

  return {
    subscribe,
    publish,
    unsubscribeAll,
  }
}
