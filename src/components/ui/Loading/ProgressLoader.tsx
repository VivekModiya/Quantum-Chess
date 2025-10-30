import React from 'react'
import { Html } from '@react-three/drei'

export const Loader: React.FC = () => (
  <Html center>
    <div
      style={{
        color: 'white',
        fontSize: '18px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div>Loading Chess Scene...</div>
      <div
        style={{
          marginTop: '20px',
          width: '200px',
          height: '4px',
          backgroundColor: '#333',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#00ff88',
            animation: 'loading 2s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  </Html>
)
