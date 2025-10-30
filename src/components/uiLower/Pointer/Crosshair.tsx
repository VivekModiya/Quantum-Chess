interface CrosshairProps {
  isVisible?: boolean
}

export function Crosshair(props: CrosshairProps) {
  if (props.isVisible === false) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 16,
        height: 16,
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer black border for visibility on any background */}
        <path
          d="M0 0 L0 6 L2 6 L2 2 L6 2 L6 0 Z M10 0 L10 2 L14 2 L14 6 L16 6 L16 0 Z M16 10 L14 10 L14 14 L10 14 L10 16 L16 16 Z M6 16 L6 14 L2 14 L2 10 L0 10 L0 16 Z"
          fill="black"
        />
        {/* White inner cursor */}
        <path
          d="M1 1 L1 5 L3 5 L3 3 L5 3 L5 1 Z M11 1 L11 3 L13 3 L13 5 L15 5 L15 1 Z M15 11 L13 11 L13 13 L11 13 L11 15 L15 15 Z M5 15 L5 13 L3 13 L3 11 L1 11 L1 15 Z"
          fill="white"
        />
      </svg>
    </div>
  )
}
