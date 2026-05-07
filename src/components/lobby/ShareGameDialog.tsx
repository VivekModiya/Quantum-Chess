import React from 'react'
import type { PlayerColor } from '../../../shared/socketEvents'
import styles from './index.module.scss'

export type ShareCopyState = 'idle' | 'copied' | 'failed'

interface ShareGameDialogProps {
  isOpen: boolean
  inviteUrl: string
  gameId: string
  assignedColor: PlayerColor
  copyState: ShareCopyState
  onCopy: () => void
  onJoin: () => void
  onBack: () => void
}

export const ShareGameDialog: React.FC<ShareGameDialogProps> = ({
  isOpen,
  inviteUrl,
  gameId,
  assignedColor,
  copyState,
  onCopy,
  onJoin,
  onBack,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isOpen || !inputRef.current) return

    inputRef.current.focus()
    inputRef.current.select()
  }, [inviteUrl, isOpen])

  if (!isOpen) return null

  const seatLabel = assignedColor === 'white' ? 'White pieces' : 'Black pieces'
  const helperText =
    copyState === 'copied'
      ? 'Invite link copied. Share it, then enter the room when ready.'
      : copyState === 'failed'
        ? 'Browser copy was blocked. The link is selected so you can press Cmd+C.'
        : 'Copy the invite link before taking your seat.'

  return (
    <div className={styles.modalScrim}>
      <div
        className={styles.shareDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-room-title"
      >
        <div className={styles.shareHeader}>
          <div>
            <p className={styles.shareEyebrow}>Room ready</p>
            <h2 id="share-room-title" className={styles.shareTitle}>
              Send the invite, then join the board
            </h2>
          </div>
          <div className={styles.shareMeta}>
            <span className={styles.shareMetaPill}>
              Room {gameId.slice(0, 8)}
            </span>
            <span className={styles.shareMetaPill}>{seatLabel}</span>
          </div>
        </div>

        <p className={styles.shareDescription}>{helperText}</p>

        <div className={styles.shareField}>
          <label className={styles.shareLabel} htmlFor="share-room-url">
            Invite URL
          </label>
          <div className={styles.shareInputGroup}>
            <input
              ref={inputRef}
              id="share-room-url"
              className={styles.shareInput}
              value={inviteUrl}
              readOnly
              onFocus={event => event.target.select()}
            />
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onCopy}
            >
              {copyState === 'copied' ? 'Copied' : 'Copy invite'}
            </button>
          </div>
        </div>

        <div className={styles.shareActions}>
          <button type="button" className={styles.ghostButton} onClick={onBack}>
            Back to setup
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onJoin}
          >
            Enter the game
          </button>
        </div>
      </div>
    </div>
  )
}
