import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { GameRecord } from '../types/game.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GAMES_DIR = path.resolve(__dirname, '../data/games')

// Ensure directory exists once at startup
fs.mkdirSync(GAMES_DIR, { recursive: true })

function gamePath(gameId: string): string {
  return path.join(GAMES_DIR, `${gameId}.json`)
}

export function readGame(gameId: string): GameRecord | null {
  const filePath = gamePath(gameId)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as GameRecord
}

export function writeGame(game: GameRecord): void {
  // Use async write to avoid blocking the event loop on every move
  fs.promises
    .writeFile(gamePath(game.id), JSON.stringify(game, null, 2), 'utf-8')
    .catch(err => console.error('Failed to persist game', game.id, err))
}

export function gameExists(gameId: string): boolean {
  return fs.existsSync(gamePath(gameId))
}
