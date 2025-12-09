import { useState, useCallback } from 'react'
import PointerLockControls from '../../utils/PointerLockControls'

interface UsePointerLockReturn {
  isLocked: boolean
  error: string | null
  initializePointerLock: (controls: PointerLockControls) => (() => void) | void
}

const usePointerLock = (): UsePointerLockReturn => {
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initializePointerLock = useCallback(
    (controls: PointerLockControls): (() => void) | void => {
      if (!controls) return

      // Set up pointer lock callbacks
      controls.onLockChange = (locked: boolean): void => {
        setIsLocked(locked)
        if (locked) {
          setError(null)
        }
      }

      controls.onLockError = (): void => {
        setError(
          'Pointer lock failed. Make sure you clicked the button and your browser supports pointer lock.'
        )
        setIsLocked(false)
      }

      return (): void => {
        if (controls.dispose) {
          controls.dispose()
        }
      }
    },
    [isLocked]
  )

  return {
    isLocked,
    error,
    initializePointerLock,
  }
}

export default usePointerLock
