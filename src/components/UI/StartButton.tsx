import React from 'react';
import type { UIProps } from '../../types';

interface StartButtonProps extends UIProps {
    onStart: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ isLocked, onStart }) => {
    if (isLocked) return null;

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.style.background = '#00e69a';
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.currentTarget.style.background = '#00ffae';
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    return (
        <button
            onClick={onStart}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '15px 30px',
                background: '#00ffae',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                zIndex: 1000,
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0, 255, 174, 0.3)',
                transition: 'all 0.3s ease',
            }}
        >
            Click to Enter Room
        </button>
    );
};

export default StartButton;
