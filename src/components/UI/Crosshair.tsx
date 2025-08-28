import Src from '../../assets/crosshair/crosshair.webp'

export function Crosshair() {
  return (
    <img
      src={Src}
      alt="crosshair"
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 40, // adjust size
        height: 40,
        pointerEvents: 'none', // don’t block clicks
        zIndex: 9999,
        userSelect: 'none',
      }}
    />
  )
}
