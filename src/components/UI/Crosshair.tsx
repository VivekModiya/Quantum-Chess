import React from 'react';
import type { UIProps } from '../../types';

export const Crosshair: React.FC<UIProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '4px',
                background: 'white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                pointerEvents: 'none',
            }}
        />
    );
};
