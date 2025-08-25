import React from 'react';
import type { UIProps } from '../../types';

export const Instructions: React.FC<UIProps> = ({ isVisible }) => {
    if (!isVisible) return null;

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
            <div>WASD / Arrow Keys - Move around</div>
            <div>Q/E - Move up/down</div>
            <div>Mouse - Look around</div>
            <div>ESC - Exit pointer lock</div>
        </div>
    );
};
