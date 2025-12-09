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
        width: 10,
        height: 10,
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Black border */}
        <circle cx="5" cy="5" r="4.5" fill="#ffffffff" />
        {/* Red dot */}
        <circle cx="5" cy="5" r="4" fill="#ff0000" />
      </svg>
    </div>
  )
}
