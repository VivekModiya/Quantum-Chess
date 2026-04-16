import React from 'react'
import { OnboardingShowcase } from '../../components/onboarding/OnboardingShowcase'
import { LobbyDialog } from '../../components/lobby/LobbyDialog'

export const LobbyPage = () => {
  const [showcaseComplete, setShowcaseComplete] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)

  const handleShowcaseComplete = () => {
    setShowcaseComplete(true)
    // Small delay to allow showcase fade out
    setTimeout(() => {
      setDialogVisible(true)
    }, 100)
  }

  return (
    <div>
      {/* 3D Chess Showcase */}
      {!showcaseComplete && (
        <OnboardingShowcase onShowcaseComplete={handleShowcaseComplete} />
      )}

      {/* Lobby Dialog Overlay */}
      {showcaseComplete && (
        <>
          {/* Keep showcase scene in background */}
          <OnboardingShowcase onShowcaseComplete={() => {}} />
          <LobbyDialog
            isVisible={dialogVisible}
            onClose={() => setDialogVisible(false)}
          />
        </>
      )}
    </div>
  )
}
