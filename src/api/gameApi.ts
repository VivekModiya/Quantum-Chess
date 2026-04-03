import type {
  ColorChoice,
  CreateGameResponse,
  JoinGameResponse,
} from '../../server/types/game'

const API_BASE = '/api'

export async function createGame(
  timeControl: number,
  color: ColorChoice
): Promise<CreateGameResponse> {
  const res = await fetch(`${API_BASE}/games/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeControl, color }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<CreateGameResponse>
}

export async function joinGame(gameId: string): Promise<JoinGameResponse> {
  const res = await fetch(
    `${API_BASE}/games/${encodeURIComponent(gameId)}/join`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<JoinGameResponse>
}
