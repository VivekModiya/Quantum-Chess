import React from 'react'

interface InstructionsProps {
  isVisible?: boolean
  isFPPMode?: boolean
  onResetView?: () => void
}

export const Instructions: React.FC<InstructionsProps> = ({
  isVisible = true,
  isFPPMode = false,
  onResetView,
}) => {
  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 100,
        fontSize: '14px',
      }}
    >
      {isFPPMode ? (
        <>
          <div>WASD / Arrow Keys - Move around</div>
          <div>Q/E - Move up/down</div>
          <div>Mouse - Look around</div>
          <div>Shift - Exit FPP mode</div>
        </>
      ) : (
        <>
          <div>Left Click + Drag - Rotate view</div>
          <div>Right Click + Drag - Pan view</div>
          <div>Scroll - Zoom in/out</div>
          <div>Shift - Enter FPP mode</div>
          {onResetView && (
            <button
              onClick={onResetView}
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Reset View
            </button>
          )}
        </>
      )}
    </div>
  )
}
