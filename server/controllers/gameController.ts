import type { Request, Response } from 'express'
import { createGame, joinGame } from '../services/gameService.js'
import type { ColorChoice, CreateGameRequest } from '../types/game.js'

const VALID_COLORS: ColorChoice[] = ['white', 'black', 'random']

export function handleCreateGame(req: Request, res: Response): void {
  const { timeControl, color } = req.body as Partial<CreateGameRequest>

  if (typeof timeControl !== 'number' || timeControl <= 0) {
    res
      .status(400)
      .json({ error: 'timeControl must be a positive number (minutes)' })
    return
  }

  if (!color || !VALID_COLORS.includes(color)) {
    res
      .status(400)
      .json({ error: `color must be one of: ${VALID_COLORS.join(', ')}` })
    return
  }

  const result = createGame({ timeControl, color })
  res.status(201).json(result)
}

export function handleJoinGame(req: Request, res: Response): void {
  const gameId = req.params['gameId'] as string

  if (!gameId) {
    res.status(400).json({ error: 'gameId is required' })
    return
  }

  const result = joinGame(gameId)

  if ('code' in result) {
    if (result.code === 'NOT_FOUND') {
      res.status(404).json({ error: 'Game not found' })
    } else {
      res.status(409).json({ error: 'Game is already full or in progress' })
    }
    return
  }

  res.status(200).json(result)
}
