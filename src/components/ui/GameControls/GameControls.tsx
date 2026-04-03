import React, { useState } from 'react'
import { useSocket } from '../../../provider/SocketProvider'

export const GameControls: React.FC = () => {
  const {
    gameMode,
    gameState,
    playerColor,
    drawOffered,
    doResign,
    doDrawOffer,
    doAcceptDraw,
    doDeclineDraw,
    doAbort,
    opponentConnected,
    connected,
    gameResult,
  } = useSocket()

  const [showResignConfirm, setShowResignConfirm] = useState(false)

  // Don't show controls for spectators or if game is over
  if (gameMode === 'spectator' || gameResult) return null

  const totalMoves = gameState?.moves.length ?? 0
  const canAbort = totalMoves < 2
  const isWaitingForOpponent = gameState?.status === 'waiting'
  const isDrawPending = drawOffered != null && drawOffered !== playerColor

  const handleResign = () => {
    doResign()
    setShowResignConfirm(false)
  }

  return (
    <div style={styles.container}>
      {/* Connection status */}
      <div style={styles.statusRow}>
        <span
          style={{
            ...styles.dot,
            background: connected ? '#4caf50' : '#f44336',
          }}
        />
        <span style={styles.statusText}>
          {connected ? 'Connected' : 'Reconnecting...'}
        </span>
        {!isWaitingForOpponent && (
          <>
            <span style={{ marginLeft: 12 }} />
            <span
              style={{
                ...styles.dot,
                background: opponentConnected ? '#4caf50' : '#ff9800',
              }}
            />
            <span style={styles.statusText}>
              {opponentConnected ? 'Opponent online' : 'Opponent disconnected'}
            </span>
          </>
        )}
      </div>

      {isWaitingForOpponent && (
        <div style={styles.waitingBanner}>Waiting for opponent to join...</div>
      )}

      {/* Draw offer received */}
      {isDrawPending && (
        <div style={styles.drawOffer}>
          <span>Opponent offers a draw</span>
          <div style={styles.drawButtons}>
            <button style={styles.acceptBtn} onClick={doAcceptDraw}>
              Accept
            </button>
            <button style={styles.declineBtn} onClick={doDeclineDraw}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isWaitingForOpponent && (
        <div style={styles.buttonRow}>
          {canAbort ? (
            <button style={styles.actionBtn} onClick={doAbort}>
              Abort
            </button>
          ) : (
            <>
              {!showResignConfirm ? (
                <button
                  style={styles.actionBtn}
                  onClick={() => setShowResignConfirm(true)}
                >
                  Resign
                </button>
              ) : (
                <div style={styles.confirmRow}>
                  <span style={styles.confirmText}>Resign?</span>
                  <button style={styles.confirmYes} onClick={handleResign}>
                    Yes
                  </button>
                  <button
                    style={styles.confirmNo}
                    onClick={() => setShowResignConfirm(false)}
                  >
                    No
                  </button>
                </div>
              )}
              {!drawOffered ? (
                <button style={styles.actionBtn} onClick={doDrawOffer}>
                  Offer Draw
                </button>
              ) : drawOffered === playerColor ? (
                <button style={{ ...styles.actionBtn, opacity: 0.5 }} disabled>
                  Draw offered...
                </button>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 16,
    left: 16,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontFamily: 'system-ui, sans-serif',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    backdropFilter: 'blur(8px)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  waitingBanner: {
    padding: '10px 16px',
    background: 'rgba(91,106,240,0.25)',
    border: '1px solid rgba(91,106,240,0.4)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    textAlign: 'center' as const,
  },
  drawOffer: {
    padding: '10px 16px',
    background: 'rgba(255,152,0,0.2)',
    border: '1px solid rgba(255,152,0,0.4)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  drawButtons: {
    display: 'flex',
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#4caf50',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  declineBtn: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#f44336',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
  },
  actionBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
  },
  confirmYes: {
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    background: '#f44336',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmNo: {
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
