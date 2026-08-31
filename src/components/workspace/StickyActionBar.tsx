'use client';

import React from 'react';

interface StickyActionBarProps {
  children: React.ReactNode;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '0.85rem 1.5rem',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div className="content-container flex-align-center" style={{ justifyContent: 'space-between', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
