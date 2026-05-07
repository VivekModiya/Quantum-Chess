import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import gameRouter from './routes/game.js'
import { setupSocketHandler } from './socket/socketHandler.js'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../shared/socketEvents.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/games', gameRouter)

app.use(express.static(distDir))

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000']

const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
})

setupSocketHandler(io)

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
