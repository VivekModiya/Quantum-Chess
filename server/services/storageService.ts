import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { GameRecord } from '../types/game.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GAMES_DIR = path.resolve(__dirname, '../data/games')

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
  fs.mkdirSync(GAMES_DIR, { recursive: true })
  fs.writeFileSync(gamePath(game.id), JSON.stringify(game, null, 2), 'utf-8')
}

export function gameExists(gameId: string): boolean {
  return fs.existsSync(gamePath(gameId))
}
