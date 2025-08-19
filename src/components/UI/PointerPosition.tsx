import React from 'react';
import type { UIProps } from '../../types';

const PointerPosition: React.FC<UIProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div
            id='tooltip'
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '10px',
                borderRadius: '5px',
                zIndex: 100,
                fontSize: '14px',
                minWidth: '100px',
                minHeight: '50px',
            }}
        ></div>
    );
};

export default PointerPosition;
