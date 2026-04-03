import type { GameRecord } from '../types/game.js'
import {
  readGame as diskRead,
  writeGame as diskWrite,
} from './storageService.js'

/**
 * In-memory LRU cache for active games.
 * Ensures all server code (timer, game room) references the SAME object,
 * eliminating stale-reference bugs when the timer reads currentTurn/timers.
 */
const MAX_CACHE_SIZE = 200
const cache = new Map<string, GameRecord>()

/** Evict oldest entries when cache exceeds max size. Map iteration order = insertion order. */
function enforceCacheLimit(): void {
  while (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
}

/** Get game from cache, falling back to disk. Returns the SAME object on repeated calls. */
export function getGame(gameId: string): GameRecord | null {
  const cached = cache.get(gameId)
  if (cached) {
    // Move to end for LRU ordering
    cache.delete(gameId)
    cache.set(gameId, cached)
    return cached
  }

  const fromDisk = diskRead(gameId)
  if (fromDisk) {
    cache.set(gameId, fromDisk)
    enforceCacheLimit()
  }
  return fromDisk
}

/** Persist the cached game to disk. Call after every mutation. */
export function persistGame(game: GameRecord): void {
  cache.set(game.id, game)
  enforceCacheLimit()
  diskWrite(game)
}

/** Remove game from cache (e.g. after completion). */
export function evictGame(gameId: string): void {
  cache.delete(gameId)
}
