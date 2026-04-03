import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LobbyPage } from './pages/LobbyPage'
import { GamePage } from './pages/GamePage'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
