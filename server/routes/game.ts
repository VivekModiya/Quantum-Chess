import { Router } from 'express'
import {
  handleCreateGame,
  handleJoinGame,
} from '../controllers/gameController.js'

const router = Router()

// POST /api/games — create a new game
router.post('/add', handleCreateGame)

// POST /api/games/:gameId/join — join an existing game
router.post('/:gameId/join', handleJoinGame)

export default router
